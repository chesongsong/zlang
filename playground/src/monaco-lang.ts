import * as monaco from "monaco-editor";

export const ZLANG_ID = "zlang";

export function registerZLang(): void {
  monaco.languages.register({ id: ZLANG_ID });

  monaco.languages.setMonarchTokensProvider(ZLANG_ID, {
    keywords: [
      "fn",
      "return",
      "if",
      "else",
      "while",
      "for",
      "break",
      "continue",
      "true",
      "false",
      "null",
      "typeof",
    ],

    typeKeywords: ["number", "string", "boolean", "void"],

    operators: [
      "=",
      "+=",
      "-=",
      "*=",
      "/=",
      "==",
      "!=",
      "<",
      ">",
      "<=",
      ">=",
      "&&",
      "||",
      "!",
      "+",
      "-",
      "*",
      "/",
      "%",
      "=>",
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        [/```/, { token: "keyword.fence", next: "@zlangBlock" }],
        [/.*/, "comment.content"],
      ],

      zlangBlock: [
        [/```/, { token: "keyword.fence", next: "@pop" }],
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@blockComment"],

        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],

        [/\d+(\.\d+)?/, "number"],

        [
          /[a-zA-Z_$\u4e00-\u9fff\u3400-\u4dbf][a-zA-Z0-9_$\u4e00-\u9fff\u3400-\u4dbf]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "type",
              "@default": "identifier",
            },
          },
        ],

        [/[{}()\[\]]/, "@brackets"],
        [/[;,.:=>]/, "delimiter"],

        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],

        [/[ \t\r\n]+/, "white"],
      ],

      blockComment: [
        [/[^\/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(ZLANG_ID, {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string"] },
      { open: "```", close: "\n```" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /\{[^}"']*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });
}

export function createZLangTheme(): void {
  monaco.editor.defineTheme("zlang-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
      { token: "keyword.fence", foreground: "58A6FF", fontStyle: "bold" },
      { token: "type", foreground: "4EC9B0" },
      { token: "identifier", foreground: "E6EDF3" },
      { token: "number", foreground: "D29922" },
      { token: "string", foreground: "3FB950" },
      { token: "comment", foreground: "7D8590", fontStyle: "italic" },
      { token: "comment.content", foreground: "8B949E" },
      { token: "operator", foreground: "BC8CFF" },
      { token: "delimiter", foreground: "7D8590" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e6edf3",
      "editor.lineHighlightBackground": "#161b2280",
      "editorCursor.foreground": "#58a6ff",
      "editor.selectionBackground": "#264f7840",
      "editor.inactiveSelectionBackground": "#264f7820",
      "editorLineNumber.foreground": "#484f58",
      "editorLineNumber.activeForeground": "#7d8590",
      "editorIndentGuide.background": "#21262d",
      "editorIndentGuide.activeBackground": "#30363d",
    },
  });
}
