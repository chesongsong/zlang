import {
  CharStream,
  CommonTokenStream,
  type Token,
} from "antlr4ng";
import { ZLangLexer } from "./generated/ZLangLexer.js";
import { ZLangParser } from "./generated/ZLangParser.js";
import type { ProgramContext } from "./generated/ZLangParser.js";
import { LexerError, ParseError } from "@z-lang/types";
import type { SourceLocation } from "@z-lang/types";
import { ZLangErrorListener } from "./error-listener.js";

export { ZLangLexer } from "./generated/ZLangLexer.js";
export { ZLangParser } from "./generated/ZLangParser.js";
export type { ProgramContext } from "./generated/ZLangParser.js";

export interface ParseResult {
  readonly tree: ProgramContext;
  readonly tokens: CommonTokenStream;
  readonly errors: readonly ParseError[];
}

export interface TokenInfo {
  readonly type: number;
  readonly text: string;
  readonly line: number;
  readonly column: number;
  readonly channel: number;
}

export function createLexer(source: string, sourceName?: string): ZLangLexer {
  const chars = CharStream.fromString(source);
  const lexer = new ZLangLexer(chars);
  return lexer;
}

export function tokenize(source: string): readonly TokenInfo[] {
  const lexer = createLexer(source);
  const errorListener = new ZLangErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);

  const stream = new CommonTokenStream(lexer);
  stream.fill();

  if (errorListener.errors.length > 0) {
    throw new LexerError(
      errorListener.errors.map((e) => e.message).join("\n"),
    );
  }

  const tokens: TokenInfo[] = [];
  for (const token of stream.getTokens()) {
    if (token.type === ZLangLexer.EOF) break;
    tokens.push({
      type: token.type,
      text: token.text ?? "",
      line: token.line,
      column: token.column,
      channel: token.channel,
    });
  }
  return tokens;
}

export function parse(source: string): ParseResult {
  const lexer = createLexer(source);
  const lexerErrorListener = new ZLangErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerErrorListener);

  const tokens = new CommonTokenStream(lexer);
  const parser = new ZLangParser(tokens);

  const parserErrorListener = new ZLangErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parserErrorListener);

  const tree = parser.program();

  const errors = [
    ...lexerErrorListener.errors,
    ...parserErrorListener.errors,
  ];

  return { tree, tokens, errors };
}

export function locationFromToken(token: Token): SourceLocation {
  return {
    start: {
      line: token.line,
      column: token.column,
      offset: token.start,
    },
    end: {
      line: token.line,
      column: token.column + (token.text?.length ?? 0),
      offset: token.stop + 1,
    },
  };
}
