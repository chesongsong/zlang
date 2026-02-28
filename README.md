# z-lang

A JavaScript-like language built with ANTLR4 and TypeScript.

## Project Structure

```
packages/
├── types/    @z-lang/types   — AST node types, error classes, common types
├── parser/   @z-lang/parser  — ANTLR4 grammar, lexer, parser
├── ast/      @z-lang/ast     — CST→AST builder, AST visitor
└── core/     @z-lang/core    — Public API (parse, tokenize, re-exports everything)
```

## Quick Start

```bash
npm install
npm run build
```

## Usage

```typescript
import { parse, tokenize } from "@z-lang/core";

const { ast, errors } = parse(`
  fn add(a: number, b: number): number {
    return a + b;
  }

  let result = add(1, 2);
`);

console.log(ast.body); // [FunctionDeclaration, VariableDeclaration]
```

## Language Features

- Variable declarations: `let x = 5;` / `const y: string = "hello";`
- Functions: `fn name(params): returnType { body }`
- Arrow functions: `fn(x: number): number => x * 2`
- If/else: `if (cond) { } else { }`
- Loops: `while (cond) { }` / `for (let i = 0; i < n; i = i + 1) { }`
- Types: `number`, `string`, `boolean`, `void`, arrays (`number[]`)
- Operators: `+` `-` `*` `/` `%` `==` `!=` `<` `>` `<=` `>=` `&&` `||` `!`
- Assignment: `=` `+=` `-=` `*=` `/=`
- Literals: numbers, strings (single/double quotes), `true`, `false`, `null`
- Arrays: `[1, 2, 3]`
- Objects: `{ key: value }`
- Member access: `obj.field` / `arr[0]`
- Function calls: `fn(args)`
- Comments: `// single line` / `/* multi line */`

## Build Pipeline

1. `antlr-ng` generates TypeScript lexer/parser from `.g4` grammars
2. `tsc --build` compiles all packages via project references
3. `esbuild` bundles `@z-lang/core` into ESM (`.mjs`) and CJS (`.cjs`)
4. `tsc --emitDeclarationOnly` generates `.d.ts` declaration files
