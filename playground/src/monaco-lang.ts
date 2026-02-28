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
  monaco.editor.defineTheme("zlang-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "0550AE", fontStyle: "bold" },
      { token: "keyword.fence", foreground: "0969DA", fontStyle: "bold" },
      { token: "type", foreground: "0550AE" },
      { token: "identifier", foreground: "24292F" },
      { token: "number", foreground: "953800" },
      { token: "string", foreground: "0A3069" },
      { token: "comment", foreground: "6E7781", fontStyle: "italic" },
      { token: "comment.content", foreground: "8C959F" },
      { token: "operator", foreground: "CF222E" },
      { token: "delimiter", foreground: "6E7781" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292f",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editorCursor.foreground": "#0969da",
      "editor.selectionBackground": "#0969da20",
      "editor.inactiveSelectionBackground": "#0969da10",
      "editorLineNumber.foreground": "#8c959f",
      "editorLineNumber.activeForeground": "#24292f",
      "editorIndentGuide.background": "#e1e4e8",
      "editorIndentGuide.activeBackground": "#d0d7de",
    },
  });
}
