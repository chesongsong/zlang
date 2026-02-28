import {
  CommonToken,
  type CharStream,
  type Token,
  type TokenFactory,
  type TokenSource,
} from "antlr4ng";
import { ZLangLexer } from "./generated/ZLangLexer.js";

const STATEMENT_ENDING_TOKENS = new Set([
  ZLangLexer.IDENTIFIER,
  ZLangLexer.NUMBER,
  ZLangLexer.STRING,
  ZLangLexer.TRUE,
  ZLangLexer.FALSE,
  ZLangLexer.NULL,
  ZLangLexer.RPAREN,
  ZLangLexer.RBRACE,
  ZLangLexer.RBRACKET,
  ZLangLexer.BREAK,
  ZLangLexer.CONTINUE,
  ZLangLexer.RETURN,
]);

export class AutoSemicolonTokenSource implements TokenSource {
  private lastNonNewlineToken: Token | null = null;
  private pending: Token | null = null;

  constructor(private readonly lexer: ZLangLexer) {}

  nextToken(): Token {
    if (this.pending) {
      const token = this.pending;
      this.pending = null;
      return token;
    }

    while (true) {
      const token = this.lexer.nextToken();

      if (token.type === ZLangLexer.EOF) {
        if (
          this.lastNonNewlineToken &&
          STATEMENT_ENDING_TOKENS.has(this.lastNonNewlineToken.type)
        ) {
          this.pending = token;
          this.lastNonNewlineToken = null;
          return this.createSemiToken(token);
        }
        return token;
      }

      if (token.type === ZLangLexer.NEWLINE) {
        if (
          this.lastNonNewlineToken &&
          STATEMENT_ENDING_TOKENS.has(this.lastNonNewlineToken.type)
        ) {
          return this.createSemiToken(token);
        }
        continue;
      }

      this.lastNonNewlineToken = token;
      return token;
    }
  }

  private createSemiToken(positionToken: Token): Token {
    const semi = CommonToken.fromType(ZLangLexer.SEMI, ";");
    semi.line = positionToken.line;
    semi.column = positionToken.column;
    semi.start = positionToken.start;
    semi.stop = positionToken.start;
    semi.tokenIndex = -1;
    return semi;
  }

  get line(): number {
    return this.lexer.line;
  }

  get column(): number {
    return this.lexer.column;
  }

  get inputStream(): CharStream | null {
    return this.lexer.inputStream;
  }

  get sourceName(): string {
    return this.lexer.sourceName;
  }

  set tokenFactory(factory: TokenFactory<Token>) {
    this.lexer.tokenFactory = factory;
  }

  get tokenFactory(): TokenFactory<Token> {
    return this.lexer.tokenFactory;
  }
}
