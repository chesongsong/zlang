// High-level API
export { parse, run, tokenize } from "./zlang.js";
export type { ParseOptions, ParseOutput, RunOutput } from "./zlang.js";

// AST builder, scope resolver & visitor
export { ASTBuilder, ScopeResolver } from "@z-lang/ast";
export { type ASTVisitor, visitNode } from "@z-lang/ast";

// Interpreter
export { Interpreter, execute, formatValue, isZTable } from "@z-lang/interpreter";
export type { ZValue, ZObject, ZFunction, ZArrowFunction, ZTable, TableColumn, ScopeResult, OutputSegment, MarkdownSegment, ScopeSegment } from "@z-lang/interpreter";

// All types
export type {
  Position,
  SourceLocation,
  TypeAnnotation,
  TypeAnnotationKind,
  SimpleTypeAnnotation,
  ArrayTypeAnnotation,
  CustomTypeAnnotation,
  TypeAnnotationNode,
  Parameter,
  Property,
  BaseNode,
  Program,
  ScopeBlock,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  ExpressionStatement,
  BlockStatement,
  Statement,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryOperator,
  BinaryExpression,
  UnaryOperator,
  UnaryExpression,
  AssignmentOperator,
  AssignmentExpression,
  NamedArgument,
  CallArgument,
  CallExpression,
  MemberExpression,
  IndexExpression,
  ArrayExpression,
  ObjectExpression,
  ArrowFunctionExpression,
  Expression,
  Node,
} from "@z-lang/types";

// Errors
export {
  ZLangError,
  LexerError,
  ParseError,
  ASTBuildError,
} from "@z-lang/types";

// Low-level parser access
export {
  ZLangLexer,
  ZLangParser,
  createLexer,
  parse as parseCST,
  tokenize as tokenizeRaw,
  locationFromToken,
} from "@z-lang/parser";
export type { ParseResult, TokenInfo } from "@z-lang/parser";
