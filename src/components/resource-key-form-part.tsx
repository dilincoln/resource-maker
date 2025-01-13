import type { ResourceKey } from "@/schemas/resourceSchema"
import { useFormContext } from "react-hook-form"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
  Check,
  Copy,
  EyeIcon,
  EyeOffIcon,
  LanguagesIcon,
  Loader2Icon,
  TrashIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { translate } from "@/server-actions/translate"
import { toast } from "sonner"
import { capitalize } from "@/util/capitalize"

interface ResourceKeyFormPartProps {
  index: number
  onRemove?: () => void
}

export function ResourceKeyFormPart({
  index,
  onRemove,
}: ResourceKeyFormPartProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [canTranslate, setCanTranslate] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [resourceKeyPreview, setResourceKeyPreview] = useState("")
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false)
  const { formState, watch, register, setValue } = useFormContext<{
    keys: ResourceKey[]
  }>()

  const nameFormControlName = `keys.${index}.name` as const
  const nameFormControlErrors = formState.errors.keys?.[index]?.name
  const descriptionFormControlName = `keys.${index}.description` as const
  const descriptionFormControlErrors =
    formState.errors.keys?.[index]?.description
  const ptBRFormControlName = `keys.${index}.ptBR` as const
  const ptBRFormControlErrors = formState.errors.keys?.[index]?.ptBR
  const esFormControlName = `keys.${index}.es` as const
  const esFormControlErrors = formState.errors.keys?.[index]?.es

  useEffect(() => {
    const { unsubscribe } = watch((value) => {
      const resourceGroupKey = (value as { name: string }).name
        .replace(/ /g, "")
        .trim()
      const resourceKey = capitalize(
        `${value.keys?.[index]?.name?.replace(/ /g, "")}`
      ).trim()

      if (resourceGroupKey && resourceKey) {
        setResourceKeyPreview(
          `${resourceGroupKey}.${resourceGroupKey}${resourceKey}`
        )
      } else {
        setResourceKeyPreview("")
      }

      setCanTranslate(`${value.keys?.[index]?.ptBR}`)
    })

    return () => unsubscribe()
  }, [watch, index])

  const handleTranslate = async () => {
    if (isLoadingTranslation) {
      return
    }

    setIsLoadingTranslation(true)

    const result = await translate({
      text: canTranslate,
      from: null,
      to: "es",
    })

    toast.success(`Tradução feita com sucesso!`)

    setValue(esFormControlName, result, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    setIsLoadingTranslation(false)
  }

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const isCTRLPressed = e.ctrlKey || e.metaKey

    if (isCTRLPressed) {
      onRemove?.()

      return
    }

    const hasAccepted = confirm(
      "Tem certeza que deseja remover este Resource Key?"
    )

    if (hasAccepted) {
      onRemove?.()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resourceKeyPreview)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed}>
      <Card
        className={cn({
          "border-red-500":
            Object.values(formState.errors.keys?.[index] || {}).length > 0,
        })}
      >
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 items-center">
                <Label
                  className="text-lg font-semibold"
                  htmlFor={`keys.${index}.name`}
                >
                  Resource #{index + 1}
                </Label>

                {resourceKeyPreview && (
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleCopy}
                    variant="outline"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-2 size-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 size-4" />
                        {resourceKeyPreview}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    {isCollapsed ? <EyeIcon /> : <EyeOffIcon />}
                  </Button>
                </CollapsibleTrigger>

                {onRemove && (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemove}
                        >
                          <TrashIcon className="size-4" />
                          Remover
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="select-none">
                        Clique com <kbd>CTRL</kbd> remover sem confirmação
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CollapsibleContent className="p-4 pt-0">
            <div className="space-y-4 p-4 border rounded-md">
              <div>
                <Label htmlFor={nameFormControlName}>
                  Nome da Chave (Resource key){" "}
                  {nameFormControlErrors && (
                    <span className="text-red-500">
                      {nameFormControlErrors.message}
                    </span>
                  )}
                </Label>
                <Input
                  placeholder="Ex: catalogChooseCombo"
                  {...register(nameFormControlName)}
                  id={nameFormControlName}
                />
              </div>
              <div>
                <Label htmlFor={descriptionFormControlName}>
                  Descrição{" "}
                  {descriptionFormControlErrors && (
                    <span className="text-red-500">
                      {descriptionFormControlErrors.message}
                    </span>
                  )}
                </Label>
                <Input
                  placeholder="Ex: Label do botão de escolher combo"
                  {...register(descriptionFormControlName)}
                  id={descriptionFormControlName}
                />
              </div>
              <div>
                <Label htmlFor={ptBRFormControlName}>
                  Texto em Português (pt-BR){" "}
                  {ptBRFormControlErrors && (
                    <p className="text-red-500">
                      {ptBRFormControlErrors.message}
                    </p>
                  )}
                </Label>
                <Input
                  placeholder="Ex: Escolher combo"
                  {...register(ptBRFormControlName)}
                  id={ptBRFormControlName}
                />
              </div>
              <div>
                <Label htmlFor={esFormControlName}>
                  Texto em Espanhol (es)
                </Label>
                <div className="flex items-center gap-2 border rounded-md">
                  {isLoadingTranslation && (
                    <Loader2Icon className="ml-2 opacity-50 z-10 -mr-4 animate-spin" />
                  )}

                  <Input
                    placeholder="Ex: Elegir combinación"
                    className="border-none focus:!ring-0 focus:!ring-offset-0"
                    {...register(esFormControlName)}
                    id={esFormControlName}
                    disabled={isLoadingTranslation}
                  />

                  {Object.values(ptBRFormControlErrors || {}).length === 0 &&
                    !!canTranslate && (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <LanguagesIcon
                              onClick={() => handleTranslate()}
                              className="mr-2 size-5 cursor-pointer"
                            />
                          </TooltipTrigger>
                          <TooltipContent className="select-none">
                            Clique para traduzir para o idioma Espanhol
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                </div>
                {esFormControlErrors && (
                  <p className="text-red-500">{esFormControlErrors.message}</p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}
