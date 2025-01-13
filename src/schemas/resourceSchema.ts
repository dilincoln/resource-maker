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
  ptBR: z
    .string()
    .min(1, "Tradução em português é obrigatória")
    .max(100, "Digite no máximo 100 caracteres"),
  es: z
    .string()
    .min(1, "Tradução em espanhol é obrigatória")
    .max(100, "Digite no máximo 100 caracteres"),
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
  keys: z.array(resourceKeySchema).min(1, "Digite no mínimo 1 resource"),
})

export type Resource = z.infer<typeof resourceSchema>
export type ResourceKey = z.infer<typeof resourceKeySchema>
