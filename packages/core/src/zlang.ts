import {
  parse as parseCST,
  tokenize as lexTokenize,
} from "@z-lang/parser";
import type { TokenInfo } from "@z-lang/parser";
import { ASTBuilder, ScopeResolver } from "@z-lang/ast";
import { execute } from "@z-lang/interpreter";
import type { OutputSegment } from "@z-lang/interpreter";
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
  readonly segments: readonly OutputSegment[];
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

function splitSource(source: string): Array<{ type: "markdown"; content: string } | { type: "code"; content: string }> {
  const fence = "```";
  const parts = source.split(fence);
  const segments: Array<{ type: "markdown"; content: string } | { type: "code"; content: string }> = [];

  for (let i = 0; i < parts.length; i++) {
    const content = parts[i]!;
    if (i % 2 === 0) {
      const trimmed = content.trim();
      if (trimmed) {
        segments.push({ type: "markdown", content: trimmed });
      }
    } else {
      segments.push({ type: "code", content });
    }
  }

  return segments;
}

export function run(source: string, _options?: ParseOptions): RunOutput {
  const rawSegments = splitSource(source);
  const outputSegments: OutputSegment[] = [];
  const allErrors: ParseError[] = [];
  let scopeIndex = 0;

  for (const seg of rawSegments) {
    if (seg.type === "markdown") {
      outputSegments.push({ type: "markdown", content: seg.content });
      continue;
    }

    const wrappedSource = "```" + seg.content + "```";
    const { ast, errors } = parse(wrappedSource, _options);

    if (errors.length > 0) {
      allErrors.push(...errors);
      continue;
    }

    const scopeResults = execute(ast);
    for (const result of scopeResults) {
      outputSegments.push({
        type: "scope",
        result: { ...result, index: scopeIndex++ },
      });
    }
  }

  return { segments: outputSegments, errors: allErrors };
}

export function tokenize(source: string): readonly TokenInfo[] {
  return lexTokenize(source);
}
