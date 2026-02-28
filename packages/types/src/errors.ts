import type { SourceLocation } from "./common.js";

export class ZLangError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly loc?: SourceLocation,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LexerError extends ZLangError {
  constructor(
    message: string,
    loc?: SourceLocation,
    cause?: Error,
  ) {
    super(message, "LEXER_ERROR", loc, cause);
  }
}

export class ParseError extends ZLangError {
  constructor(
    message: string,
    loc?: SourceLocation,
    cause?: Error,
  ) {
    super(message, "PARSE_ERROR", loc, cause);
  }
}

export class ASTBuildError extends ZLangError {
  constructor(
    message: string,
    loc?: SourceLocation,
    cause?: Error,
  ) {
    super(message, "AST_BUILD_ERROR", loc, cause);
  }
}
