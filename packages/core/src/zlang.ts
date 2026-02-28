import {
  parse as parseCST,
  tokenize as lexTokenize,
} from "@z-lang/parser";
import type { TokenInfo } from "@z-lang/parser";
import { ASTBuilder, ScopeResolver } from "@z-lang/ast";
import { execute } from "@z-lang/interpreter";
import type { ScopeResult } from "@z-lang/interpreter";
import type { Program } from "@z-lang/types";
import { ParseError } from "@z-lang/types";

export interface ParseOptions {
  readonly sourceName?: string;
}

export interface ParseOutput {
  readonly ast: Program;
  readonly errors: readonly ParseError[];
}

export interface RunOutput {
  readonly scopeResults: readonly ScopeResult[];
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
  const rawAst = builder.buildProgram(tree);

  const resolver = new ScopeResolver();
  const ast = resolver.resolve(rawAst);

  return { ast, errors: [] };
}

export function run(source: string, _options?: ParseOptions): RunOutput {
  const { ast, errors } = parse(source, _options);
  if (errors.length > 0) {
    return { scopeResults: [], errors };
  }
  const scopeResults = execute(ast);
  return { scopeResults, errors: [] };
}

export function tokenize(source: string): readonly TokenInfo[] {
  return lexTokenize(source);
}
