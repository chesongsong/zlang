// High-level API
export { parse, tokenize } from "./zlang.js";
export type { ParseOptions, ParseOutput } from "./zlang.js";

// AST builder & visitor
export { ASTBuilder } from "@z-lang/ast";
export { type ASTVisitor, visitNode } from "@z-lang/ast";

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
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
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
