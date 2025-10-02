"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), { ssr: false })
const MonacoDiff = dynamic(() => import("@monaco-editor/react").then((m) => m.DiffEditor), { ssr: false })

type BaseProps = {
  language?: string
  height?: number | string
  theme?: string
}

type EditorProps = BaseProps & {
  value: string
  onChange?: (v: string) => void
  onMount?: (editor: any, monaco: any) => void
}

const THEME_DEFS: Record<string, any> = {
  "github-light": {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292e",
      "editorLineNumber.foreground": "#6e7781",
      "editorCursor.foreground": "#0969da",
      "editorIndentGuide.background": "#d0d7de",
      "editor.selectionBackground": "#add6ff",
    },
  },
  "github-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editorLineNumber.foreground": "#8b949e",
      "editorCursor.foreground": "#58a6ff",
      "editorIndentGuide.background": "#30363d",
      "editor.selectionBackground": "#264f78",
    },
  },
  dracula: {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editorCursor.foreground": "#50fa7b",
      "editorLineNumber.foreground": "#6272a4",
      "editor.selectionBackground": "#44475a",
    },
  },
  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editorCursor.foreground": "#f8f8f0",
      "editorLineNumber.foreground": "#75715e",
      "editor.selectionBackground": "#49483e",
    },
  },
  "one-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "editorCursor.foreground": "#528bff",
      "editorLineNumber.foreground": "#636d83",
      "editor.selectionBackground": "#3e4451",
    },
  },
  "solarized-light": {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#fdf6e3",
      "editor.foreground": "#586e75",
      "editorCursor.foreground": "#657b83",
      "editorLineNumber.foreground": "#93a1a1",
      "editor.selectionBackground": "#eee8d5",
    },
  },
  "solarized-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#002b36",
      "editor.foreground": "#839496",
      "editorCursor.foreground": "#93a1a1",
      "editorLineNumber.foreground": "#586e75",
      "editor.selectionBackground": "#073642",
    },
  },
}

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  javascript: [
    "function",
    "return",
    "const",
    "let",
    "var",
    "async",
    "await",
    "import",
    "export",
    "class",
    "extends",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "try",
    "catch",
  ],
  typescript: [
    "type",
    "interface",
    "enum",
    "implements",
    "readonly",
    "public",
    "private",
    "protected",
    "declare",
    "namespace",
    "abstract",
    "module",
    "as",
  ],
  python: [
    "def",
    "return",
    "import",
    "from",
    "class",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "try",
    "except",
    "with",
    "as",
    "lambda",
    "yield",
  ],
  go: [
    "func",
    "package",
    "import",
    "var",
    "const",
    "type",
    "struct",
    "interface",
    "if",
    "else",
    "for",
    "range",
    "go",
    "defer",
    "return",
  ],
  rust: [
    "fn",
    "let",
    "mut",
    "struct",
    "enum",
    "impl",
    "trait",
    "pub",
    "use",
    "mod",
    "match",
    "if",
    "else",
    "loop",
    "while",
    "for",
    "return",
  ],
  java: [
    "class",
    "interface",
    "enum",
    "public",
    "private",
    "protected",
    "static",
    "final",
    "abstract",
    "extends",
    "implements",
    "void",
    "new",
    "return",
  ],
  c: [
    "int",
    "char",
    "float",
    "double",
    "struct",
    "typedef",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "return",
    "const",
    "static",
  ],
  cpp: [
    "class",
    "struct",
    "template",
    "typename",
    "namespace",
    "using",
    "auto",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "return",
    "const",
    "static",
  ],
  lua: [
    "local",
    "function",
    "end",
    "nil",
    "then",
    "elseif",
    "else",
    "for",
    "in",
    "pairs",
    "ipairs",
    "while",
    "repeat",
    "until",
    "table",
    "string",
    "math",
    "require",
    "return",
  ],
  sql: [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "ORDER BY",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "LIMIT",
  ],
  json: ["true", "false", "null"],
  html: ["div", "span", "a", "img", "button", "input", "section", "header", "footer", "main", "article"],
  css: ["display", "flex", "grid", "position", "color", "background", "margin", "padding", "border", "font-size"],
}

export function Editor(props: EditorProps) {
  const language = props.language || "javascript"
  const theme = props.theme || "vs-dark"

  const monacoRef = useRef<any>(null)
  const editorRef = useRef<any>(null)
  const completionDisposablesRef = useRef<any[]>([])

  function handleMount(editor: any, monaco: any) {
    editorRef.current = editor
    monacoRef.current = monaco

    try {
      Object.entries(THEME_DEFS).forEach(([name, def]) => {
        monaco.editor.defineTheme(name, def)
      })
      monaco.editor.setTheme(theme)
    } catch (e) {
      console.log("[v0] theme registration error:", (e as Error).message)
    }

    try {
      const disposables: any[] = []
      const allLangs = Object.keys(LANGUAGE_KEYWORDS)
      allLangs.forEach((langId) => {
        const d = monaco.languages.registerCompletionItemProvider(langId, {
          triggerCharacters: [".", ":", "<", '"', "'", "/"],
          provideCompletionItems: () => {
            const suggestions =
              LANGUAGE_KEYWORDS[langId]?.map((label) => ({
                label,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: label,
              })) || []
            return { suggestions }
          },
        })
        disposables.push(d)
      })
      completionDisposablesRef.current = disposables
    } catch (e) {
      console.log("[v0] completion provider error:", (e as Error).message)
    }

    props.onMount?.(editor, monaco)
  }

  useEffect(() => {
    if (monacoRef.current) {
      try {
        monacoRef.current.editor.setTheme(theme)
      } catch (e) {
        console.log("[v0] theme switch error:", (e as Error).message)
      }
    }
  }, [theme])

  useEffect(() => {
    return () => {
      completionDisposablesRef.current.forEach((d) => {
        try {
          d.dispose?.()
        } catch {}
      })
      completionDisposablesRef.current = []
    }
  }, [])

  return (
    <div className="rounded-md border bg-background/70">
      <MonacoEditor
        height="60vh"
        theme={theme}
        language={language}
        value={props.value}
        onChange={(v) => props.onChange?.(v || "")}
        options={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 13,
          minimap: { enabled: false },
          smoothScrolling: true,
          wordWrap: "on",
          glyphMargin: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          wordBasedSuggestions: true,
          snippetSuggestions: "inline",
        }}
        onMount={handleMount}
      />
    </div>
  )
}

type DiffProps = BaseProps & {
  original: string
  modified: string
}

export function DiffEditor(props: DiffProps) {
  const language = props.language || "javascript"
  const theme = props.theme || "vs-dark"

  function handleDiffMount(editor: any, monaco: any) {
    try {
      Object.entries(THEME_DEFS).forEach(([name, def]) => {
        monaco.editor.defineTheme(name, def)
      })
      monaco.editor.setTheme(theme)
    } catch (e) {
      console.log("[v0] diff theme registration error:", (e as Error).message)
    }
  }

  return (
    <div className="rounded-md border bg-background/70">
      <MonacoDiff
        height="60vh"
        theme={theme}
        language={language}
        original={props.original}
        modified={props.modified}
        options={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 13,
          renderSideBySide: true,
          readOnly: true,
          automaticLayout: true,
        }}
        onMount={handleDiffMount}
      />
    </div>
  )
}
