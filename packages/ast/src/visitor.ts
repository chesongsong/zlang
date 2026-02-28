import type {
  Program,
  ScopeBlock,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryExpression,
  UnaryExpression,
  AssignmentExpression,
  CallExpression,
  MemberExpression,
  IndexExpression,
  ArrayExpression,
  ObjectExpression,
  ArrowFunctionExpression,
} from "@z-lang/types";

export interface ASTVisitor<R = void> {
  visitProgram(node: Program): R;
  visitScopeBlock(node: ScopeBlock): R;

  visitVariableDeclaration(node: VariableDeclaration): R;
  visitFunctionDeclaration(node: FunctionDeclaration): R;
  visitIfStatement(node: IfStatement): R;
  visitWhileStatement(node: WhileStatement): R;
  visitForStatement(node: ForStatement): R;
  visitReturnStatement(node: ReturnStatement): R;
  visitExpressionStatement(node: ExpressionStatement): R;
  visitBlockStatement(node: BlockStatement): R;

  visitNumberLiteral(node: NumberLiteral): R;
  visitStringLiteral(node: StringLiteral): R;
  visitBooleanLiteral(node: BooleanLiteral): R;
  visitNullLiteral(node: NullLiteral): R;
  visitIdentifier(node: Identifier): R;
  visitBinaryExpression(node: BinaryExpression): R;
  visitUnaryExpression(node: UnaryExpression): R;
  visitAssignmentExpression(node: AssignmentExpression): R;
  visitCallExpression(node: CallExpression): R;
  visitMemberExpression(node: MemberExpression): R;
  visitIndexExpression(node: IndexExpression): R;
  visitArrayExpression(node: ArrayExpression): R;
  visitObjectExpression(node: ObjectExpression): R;
  visitArrowFunctionExpression(node: ArrowFunctionExpression): R;
}

export function visitNode<R>(
  node: { readonly type: string },
  visitor: ASTVisitor<R>,
): R {
  switch (node.type) {
    case "Program":
      return visitor.visitProgram(node as Program);
    case "ScopeBlock":
      return visitor.visitScopeBlock(node as ScopeBlock);
    case "VariableDeclaration":
      return visitor.visitVariableDeclaration(node as VariableDeclaration);
    case "FunctionDeclaration":
      return visitor.visitFunctionDeclaration(node as FunctionDeclaration);
    case "IfStatement":
      return visitor.visitIfStatement(node as IfStatement);
    case "WhileStatement":
      return visitor.visitWhileStatement(node as WhileStatement);
    case "ForStatement":
      return visitor.visitForStatement(node as ForStatement);
    case "ReturnStatement":
      return visitor.visitReturnStatement(node as ReturnStatement);
    case "ExpressionStatement":
      return visitor.visitExpressionStatement(node as ExpressionStatement);
    case "BlockStatement":
      return visitor.visitBlockStatement(node as BlockStatement);
    case "NumberLiteral":
      return visitor.visitNumberLiteral(node as NumberLiteral);
    case "StringLiteral":
      return visitor.visitStringLiteral(node as StringLiteral);
    case "BooleanLiteral":
      return visitor.visitBooleanLiteral(node as BooleanLiteral);
    case "NullLiteral":
      return visitor.visitNullLiteral(node as NullLiteral);
    case "Identifier":
      return visitor.visitIdentifier(node as Identifier);
    case "BinaryExpression":
      return visitor.visitBinaryExpression(node as BinaryExpression);
    case "UnaryExpression":
      return visitor.visitUnaryExpression(node as UnaryExpression);
    case "AssignmentExpression":
      return visitor.visitAssignmentExpression(node as AssignmentExpression);
    case "CallExpression":
      return visitor.visitCallExpression(node as CallExpression);
    case "MemberExpression":
      return visitor.visitMemberExpression(node as MemberExpression);
    case "IndexExpression":
      return visitor.visitIndexExpression(node as IndexExpression);
    case "ArrayExpression":
      return visitor.visitArrayExpression(node as ArrayExpression);
    case "ObjectExpression":
      return visitor.visitObjectExpression(node as ObjectExpression);
    case "ArrowFunctionExpression":
      return visitor.visitArrowFunctionExpression(node as ArrowFunctionExpression);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}
