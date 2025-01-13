import { Translator } from "deepl-node"

const authKey = process.env.DEEPL_API_KEY as string

export const translator = new Translator(authKey)
