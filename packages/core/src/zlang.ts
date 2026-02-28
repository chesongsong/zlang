import {
  parse as parseCST,
  tokenize as lexTokenize,
} from "@z-lang/parser";
import type { TokenInfo } from "@z-lang/parser";
import { ASTBuilder } from "@z-lang/ast";
import type { Program } from "@z-lang/types";
import { ParseError } from "@z-lang/types";

export interface ParseOptions {
  readonly sourceName?: string;
}

export interface ParseOutput {
  readonly ast: Program;
  readonly errors: readonly ParseError[];
}

export function parse(source: string, _options?: ParseOptions): ParseOutput {
  const { tree, errors } = parseCST(source);

  if (errors.length > 0) {
    return {
      ast: { type: "Program", body: [], loc: { start: { line: 1, column: 0, offset: 0 }, end: { line: 1, column: 0, offset: 0 } } },
      errors,
    };
  }

  const builder = new ASTBuilder();
  const ast = builder.buildProgram(tree);

  return { ast, errors: [] };
}

export function tokenize(source: string): readonly TokenInfo[] {
  return lexTokenize(source);
}
