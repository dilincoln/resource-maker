"use server"

import { translator } from "@/lib/deepl"
import type { SourceLanguageCode, TargetLanguageCode } from "deepl-node"

interface TranslateProps {
  text: string
  from: SourceLanguageCode | null
  to: TargetLanguageCode
}

export async function translate({
  text,
  from,
  to,
}: TranslateProps): Promise<string> {
  const translation = await translator.translateText(text, from, to)

  return translation.text
}
