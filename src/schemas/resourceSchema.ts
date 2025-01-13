import { z } from "zod"

export const resourceKeySchema = z.object({
  name: z
    .string()
    .min(1, "Nome da chave é obrigatório")
    .max(100, "Digite no máximo 100 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Espaços não são permitidos"),
  description: z
    .string()
    .min(1, "Descrição da chave é obrigatória")
    .max(100, "Digite no máximo 100 caracteres"),
  ptBR: z.string().min(1, "Tradução em português é obrigatória"),
  es: z.string().min(1, "Tradução em espanhol é obrigatória"),
})

export const resourceSchema = z.object({
  fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
  name: z
    .string()
    .min(1, "Nome do Grupo de resource é obrigatório")
    .max(100, "Digite no máximo 100 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Espaços não são permitidos"),
  description: z
    .string()
    .min(1, "Descrição do resource é obrigatória")
    .max(100, "Digite no máximo 100 caracteres"),
  keys: z
    .array(resourceKeySchema)
    .min(1, "Digite no mínimo 1 resource")
    .superRefine((keys, ctx) => {
      const keyNames = new Set()

      keys.forEach((key, index) => {
        if (keyNames.has(key.name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Já existe uma chave(resource key) com o mesmo nome",
            path: [index, "name"],
          })
        } else {
          keyNames.add(key.name)
        }
      })
    }),
})

export type Resource = z.infer<typeof resourceSchema>
export type ResourceKey = z.infer<typeof resourceKeySchema>
