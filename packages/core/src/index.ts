// High-level API
export { parse, run, tokenize } from "./zlang.js";
export type { ParseOptions, RunOptions, ParseOutput, RunOutput } from "./zlang.js";

// Application facade
export { ZLangApp } from "./app.js";

// Component definition API (all-in-one: setup + render)
export { defineComponent } from "./define-component.js";
export type {
  ComponentDefinition,
  ComponentOptions,
  SimpleComponentOptions,
  AdvancedComponentOptions,
  SimpleSetup,
  AdvancedSetup,
  RenderFn,
} from "./define-component.js";

// Render types (re-export for convenience)
export type {
  Disposable,
  ComponentRenderer,
  ComponentFactory,
  CodeBlockData,
  PendingData,
} from "@z-lang/render";
export { RenderEngine } from "@z-lang/render";

// AST builder, scope resolver & visitor
export { ASTBuilder, ScopeResolver } from "@z-lang/ast";
export { type ASTVisitor, visitNode } from "@z-lang/ast";

// Value domain — basic types
export {
  ZValue,
  ZNumber,
  ZString,
  ZBool,
  ZNull,
  ZArray,
  ZObject,
  ZFunction,
  ZDate,
  box,
} from "@z-lang/interpreter";

// Renderables — UI-renderable value types
export { ZRenderable, ZRenderCustom } from "@z-lang/interpreter";

// Renderable definition API
export { defineRenderable } from "./define-renderable.js";
export type {
  RenderableDefinition,
  RenderableHandler,
  RenderableContext,
  AdvancedRenderableHandler,
} from "./define-renderable.js";

// Interpreter & execution
export { Interpreter, execute } from "@z-lang/interpreter";
export type {
  ExecuteOptions,
  ScopeResult,
  OutputSegment,
  MarkdownSegment,
  ScopeSegment,
} from "@z-lang/interpreter";

// Builtins
export { BuiltinRegistry } from "@z-lang/interpreter";
export type { BuiltinFunction, Evaluator } from "@z-lang/interpreter";

// Environment
export { Environment } from "@z-lang/interpreter";

// All AST types
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
