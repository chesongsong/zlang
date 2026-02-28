import type {
  SourceLocation,
  Parameter,
  Property,
  TypeAnnotationNode,
} from "./common.js";

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export interface BaseNode {
  readonly type: string;
  readonly loc: SourceLocation;
}

// ---------------------------------------------------------------------------
// Program & Scope
// ---------------------------------------------------------------------------

export interface Program extends BaseNode {
  readonly type: "Program";
  readonly body: readonly ScopeBlock[];
}

export interface ScopeBlock extends BaseNode {
  readonly type: "ScopeBlock";
  readonly body: readonly Statement[];
}

// ---------------------------------------------------------------------------
// Statements
// ---------------------------------------------------------------------------

export interface VariableDeclaration extends BaseNode {
  readonly type: "VariableDeclaration";
  readonly name: string;
  readonly typeAnnotation?: TypeAnnotationNode;
  readonly init: Expression;
}

export interface FunctionDeclaration extends BaseNode {
  readonly type: "FunctionDeclaration";
  readonly name: string;
  readonly params: readonly Parameter[];
  readonly returnType?: TypeAnnotationNode;
  readonly body: BlockStatement;
}

export interface IfStatement extends BaseNode {
  readonly type: "IfStatement";
  readonly test: Expression;
  readonly consequent: BlockStatement;
  readonly alternate?: BlockStatement | IfStatement;
}

export interface WhileStatement extends BaseNode {
  readonly type: "WhileStatement";
  readonly test: Expression;
  readonly body: BlockStatement;
}

export interface ForStatement extends BaseNode {
  readonly type: "ForStatement";
  readonly init: Expression;
  readonly test: Expression;
  readonly update: Expression;
  readonly body: BlockStatement;
}

export interface ReturnStatement extends BaseNode {
  readonly type: "ReturnStatement";
  readonly argument?: Expression;
}

export interface ExpressionStatement extends BaseNode {
  readonly type: "ExpressionStatement";
  readonly expression: Expression;
}

export interface BlockStatement extends BaseNode {
  readonly type: "BlockStatement";
  readonly body: readonly Statement[];
}

export type Statement =
  | VariableDeclaration
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForStatement
  | ReturnStatement
  | ExpressionStatement
  | BlockStatement;

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------

export interface NumberLiteral extends BaseNode {
  readonly type: "NumberLiteral";
  readonly value: number;
  readonly raw: string;
}

export interface StringLiteral extends BaseNode {
  readonly type: "StringLiteral";
  readonly value: string;
  readonly raw: string;
}

export interface BooleanLiteral extends BaseNode {
  readonly type: "BooleanLiteral";
  readonly value: boolean;
}

export interface NullLiteral extends BaseNode {
  readonly type: "NullLiteral";
}

export interface Identifier extends BaseNode {
  readonly type: "Identifier";
  readonly name: string;
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "&&"
  | "||";

export interface BinaryExpression extends BaseNode {
  readonly type: "BinaryExpression";
  readonly operator: BinaryOperator;
  readonly left: Expression;
  readonly right: Expression;
}

export type UnaryOperator = "!" | "-";

export interface UnaryExpression extends BaseNode {
  readonly type: "UnaryExpression";
  readonly operator: UnaryOperator;
  readonly argument: Expression;
}

export type AssignmentOperator = "=" | "+=" | "-=";

export interface AssignmentExpression extends BaseNode {
  readonly type: "AssignmentExpression";
  readonly operator: AssignmentOperator;
  readonly target: Identifier | MemberExpression | IndexExpression;
  readonly value: Expression;
}

export interface CallExpression extends BaseNode {
  readonly type: "CallExpression";
  readonly callee: Expression;
  readonly arguments: readonly Expression[];
}

export interface MemberExpression extends BaseNode {
  readonly type: "MemberExpression";
  readonly object: Expression;
  readonly property: string;
}

export interface IndexExpression extends BaseNode {
  readonly type: "IndexExpression";
  readonly object: Expression;
  readonly index: Expression;
}

export interface ArrayExpression extends BaseNode {
  readonly type: "ArrayExpression";
  readonly elements: readonly Expression[];
}

export interface ObjectExpression extends BaseNode {
  readonly type: "ObjectExpression";
  readonly properties: readonly Property[];
}

export interface ArrowFunctionExpression extends BaseNode {
  readonly type: "ArrowFunctionExpression";
  readonly params: readonly Parameter[];
  readonly returnType?: TypeAnnotationNode;
  readonly body: Expression | BlockStatement;
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | CallExpression
  | MemberExpression
  | IndexExpression
  | ArrayExpression
  | ObjectExpression
  | ArrowFunctionExpression;

// ---------------------------------------------------------------------------
// Union of all AST nodes
// ---------------------------------------------------------------------------

export type Node = Program | ScopeBlock | Statement | Expression;
