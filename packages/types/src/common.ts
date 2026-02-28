export interface Position {
  readonly line: number;
  readonly column: number;
  readonly offset: number;
}

export interface SourceLocation {
  readonly start: Position;
  readonly end: Position;
  readonly source?: string;
}

export interface TypeAnnotation {
  readonly kind: TypeAnnotationKind;
  readonly loc: SourceLocation;
}

export type TypeAnnotationKind =
  | "number"
  | "string"
  | "boolean"
  | "void"
  | "array"
  | "custom";

export interface SimpleTypeAnnotation extends TypeAnnotation {
  readonly kind: "number" | "string" | "boolean" | "void";
}

export interface ArrayTypeAnnotation extends TypeAnnotation {
  readonly kind: "array";
  readonly elementType: TypeAnnotation;
}

export interface CustomTypeAnnotation extends TypeAnnotation {
  readonly kind: "custom";
  readonly name: string;
}

export type TypeAnnotationNode =
  | SimpleTypeAnnotation
  | ArrayTypeAnnotation
  | CustomTypeAnnotation;

export interface Parameter {
  readonly name: string;
  readonly typeAnnotation?: TypeAnnotationNode;
  readonly loc: SourceLocation;
}

export interface Property {
  readonly key: string;
  readonly value: Expression;
  readonly loc: SourceLocation;
}

import type { Expression } from "./ast.js";
