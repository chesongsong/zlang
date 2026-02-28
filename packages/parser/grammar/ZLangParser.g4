parser grammar ZLangParser;

options { tokenVocab = ZLangLexer; }

// =========================================================================
// Program
// =========================================================================

program
    : statement* EOF
    ;

// =========================================================================
// Statements
// =========================================================================

statement
    : variableDeclaration
    | functionDeclaration
    | ifStatement
    | whileStatement
    | forStatement
    | returnStatement
    | breakStatement
    | continueStatement
    | expressionStatement
    | block
    ;

variableDeclaration
    : (LET | CONST) IDENTIFIER (COLON typeAnnotation)? ASSIGN expression SEMI
    ;

functionDeclaration
    : FN IDENTIFIER LPAREN parameterList? RPAREN (COLON typeAnnotation)? block
    ;

parameterList
    : parameter (COMMA parameter)*
    ;

parameter
    : IDENTIFIER (COLON typeAnnotation)?
    ;

typeAnnotation
    : baseType (LBRACKET RBRACKET)*
    ;

baseType
    : TYPE_NUMBER
    | TYPE_STRING
    | TYPE_BOOLEAN
    | TYPE_VOID
    | IDENTIFIER
    ;

ifStatement
    : IF LPAREN expression RPAREN block (ELSE (ifStatement | block))?
    ;

whileStatement
    : WHILE LPAREN expression RPAREN block
    ;

forStatement
    : FOR LPAREN forInit SEMI expression SEMI expression RPAREN block
    ;

forInit
    : (LET | CONST) IDENTIFIER (COLON typeAnnotation)? ASSIGN expression
    | expression
    ;

returnStatement
    : RETURN expression? SEMI
    ;

breakStatement
    : BREAK SEMI
    ;

continueStatement
    : CONTINUE SEMI
    ;

expressionStatement
    : expression SEMI
    ;

block
    : LBRACE statement* RBRACE
    ;

// =========================================================================
// Expressions (ordered by ascending precedence)
// =========================================================================

expression
    : assignmentExpression
    ;

assignmentExpression
    : logicalOrExpression
      ( (ASSIGN | PLUS_ASSIGN | MINUS_ASSIGN | STAR_ASSIGN | SLASH_ASSIGN)
        assignmentExpression
      )?
    ;

logicalOrExpression
    : logicalAndExpression (OR logicalAndExpression)*
    ;

logicalAndExpression
    : equalityExpression (AND equalityExpression)*
    ;

equalityExpression
    : relationalExpression ((EQ | NEQ) relationalExpression)*
    ;

relationalExpression
    : additiveExpression ((LT | GT | LTE | GTE) additiveExpression)*
    ;

additiveExpression
    : multiplicativeExpression ((PLUS | MINUS) multiplicativeExpression)*
    ;

multiplicativeExpression
    : unaryExpression ((STAR | SLASH | PERCENT) unaryExpression)*
    ;

unaryExpression
    : (NOT | MINUS | TYPEOF) unaryExpression
    | postfixExpression
    ;

postfixExpression
    : primaryExpression postfixOp*
    ;

postfixOp
    : DOT IDENTIFIER
    | LBRACKET expression RBRACKET
    | LPAREN argumentList? RPAREN
    ;

argumentList
    : expression (COMMA expression)*
    ;

// =========================================================================
// Primary expressions
// =========================================================================

primaryExpression
    : NUMBER                                                 # numberLiteral
    | STRING                                                 # stringLiteral
    | TRUE                                                   # trueLiteral
    | FALSE                                                  # falseLiteral
    | NULL                                                   # nullLiteral
    | IDENTIFIER                                             # identifierExpr
    | arrayLiteral                                           # arrayExpr
    | objectLiteral                                          # objectExpr
    | arrowFunction                                          # arrowFunctionExpr
    | LPAREN expression RPAREN                               # parenExpr
    ;

arrayLiteral
    : LBRACKET (expression (COMMA expression)*)? RBRACKET
    ;

objectLiteral
    : LBRACE (property (COMMA property)*)? RBRACE
    ;

property
    : propertyKey COLON expression
    ;

propertyKey
    : IDENTIFIER
    | STRING
    ;

arrowFunction
    : FN LPAREN parameterList? RPAREN (COLON typeAnnotation)? ARROW
      ( expression
      | block
      )
    ;
