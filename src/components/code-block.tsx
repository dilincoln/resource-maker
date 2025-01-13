import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
  language?: string
  sql: string
}

export function CodeBlock({ language = "sql", sql }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={dracula}
      showLineNumbers
      customStyle={{
        marginTop: "-10px",
        marginLeft: "-25px",
        marginBottom: "5px",
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
      }}
    >
      {sql}
    </SyntaxHighlighter>
  )
}
