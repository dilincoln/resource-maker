"use client"

import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResourceKeyFormPart } from "./resource-key-form-part"
import {
  resourceSchema,
  Resource as ResourceFormType,
} from "../schemas/resourceSchema"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight, Loader2, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { generateSql } from "@/util/generate-sql"
import JSZip from "jszip"
import { saveAs } from "file-saver"

import { SQLPreview } from "./sql-preview"
import { getParsedTimestamp } from "@/util/get-parsed-timestamp"
import { toast } from "sonner"

export function ResourceForm() {
  const stickyRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const stickyElement = stickyRef.current
    if (!stickyElement) return

    const handleScroll = () => {
      const { top } = stickyElement.getBoundingClientRect()
      setIsSticky(top <= 0)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const form = useForm<ResourceFormType>({
    resolver: zodResolver(resourceSchema),
    mode: "all",
    defaultValues: {
      fileName: "",
      name: "",
      description: "",
      keys: [{ name: "", description: "", ptBR: "", es: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "keys",
  })

  const onSubmit = async (data: ResourceFormType) => {
    if (isLoading) {
      return
    }

    setIsLoading(true)

    const transactSQL = generateSql(data)

    try {
      const zip = new JSZip()

      const currentTime = new Date()
      const timestamp = getParsedTimestamp(currentTime)
      const parsedBaseFileName = data.fileName.replaceAll(" ", "_").trim()

      zip.file(`V${timestamp}__${parsedBaseFileName}.sql`, transactSQL.up)
      zip.file(
        `V${timestamp}__ROLLBACK_${parsedBaseFileName}.sql`,
        transactSQL.down
      )

      const zipFile = await zip.generateAsync({ type: "blob" })

      saveAs(zipFile, `${timestamp}__${parsedBaseFileName}.zip`)

      toast.success("Arquivo gerado com sucesso!")
    } catch (error) {
      console.error(error)

      toast.error("Ocorreu um erro ao gerar o arquivo!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8 w-full max-w-6xl px-5", {
          "pointer-events-none": isLoading,
        })}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between rounded-md border mb-2 overflow-hidden bg-primary-foreground/50">
            <CardTitle>Informações do Resource</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Grupo de resources (Group Name){" "}
                {form.formState.errors.name && (
                  <span className="text-red-500">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </Label>
              <Input
                placeholder="ex: comboLubricantOrders"
                {...form.register("name")}
                id="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição do Grupo de resources (Group Description){" "}
                {form.formState.errors.description && (
                  <span className="text-red-500">
                    {form.formState.errors.description.message}
                  </span>
                )}
              </Label>
              <Textarea
                placeholder="ex: Grupo de resources para combos de lubricantes"
                {...form.register("description")}
                id="description"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            id="sticky-and-style-me"
            ref={stickyRef}
            className={cn(
              "z-10 transition-all p-0 duration-300 ease-in-out",
              isSticky ? "sticky top-0 -mr-3 -ml-3" : "bg-transparent",
              isSticky && "backdrop-blur-md"
            )}
          >
            <div
              className={cn(
                "flex overflow-hidden border rounded-md p-5 gap-3 flex-col sm:flex-row items-center justify-between",
                isSticky && "shadow-lg mt-3"
              )}
            >
              <CardTitle>Resources</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: "", description: "", ptBR: "", es: "" })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar novo Resource ao grupo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {fields.map((field, index) => (
              <ResourceKeyFormPart
                key={field.id}
                index={index}
                onRemove={index > 0 ? () => remove(index) : undefined}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 shadow-lg sticky bottom-5 border bg-primary-foreground/50 backdrop-blur-sm p-5 mx-2 rounded-md">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Input
                  placeholder="Nome do arquivo. ex: resource combo lubricant orders"
                  {...form.register("fileName")}
                  id="fileName"
                />
              </TooltipTrigger>
              <TooltipContent className="select-none">
                <span>Espaços serão convertidos para underscores(_). </span>
                <span className="flex items-center gap-1">
                  <div className="flex items-end">
                    Ex: resources
                    <div className="bg-red-400 h-[1px] w-2" />
                    combo
                    <div className="bg-red-400 h-[1px] w-2" />
                    lubricant
                  </div>
                  <ArrowRight className="inline size-4" />
                  <div className="flex items-end">
                    V20250108.1626__resources
                    <div>
                      _<div className="bg-green-400 h-[1px] w-2" />
                    </div>
                    combo
                    <div>
                      _<div className="bg-green-400 h-[1px] w-2" />
                    </div>
                    lubricant
                  </div>
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SQLPreview resourceData={generateSql(form.getValues())} />

          <Button disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Gerar SQL
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
