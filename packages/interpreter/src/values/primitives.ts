import { ZValue } from "./base.js";

export class ZNumber extends ZValue {
  readonly value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  get kind(): string {
    return "number";
  }

  unbox(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  isTruthy(): boolean {
    return this.value !== 0;
  }

  toNumber(): number {
    return this.value;
  }
}

export class ZString extends ZValue {
  readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  get kind(): string {
    return "string";
  }

  unbox(): string {
    return this.value;
  }

  toString(): string {
    return `"${this.value}"`;
  }

  isTruthy(): boolean {
    return this.value !== "";
  }

  toNumber(): number {
    const n = Number(this.value);
    return isNaN(n) ? 0 : n;
  }
}

export class ZBoolean extends ZValue {
  readonly value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }

  get kind(): string {
    return "boolean";
  }

  unbox(): boolean {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  isTruthy(): boolean {
    return this.value;
  }

  toNumber(): number {
    return this.value ? 1 : 0;
  }
}

const NULL_SINGLETON = Symbol("ZNull");

export class ZNull extends ZValue {
  static readonly instance = new ZNull(NULL_SINGLETON);

  private constructor(_token: typeof NULL_SINGLETON) {
    super();
  }

  get kind(): string {
    return "null";
  }

  unbox(): null {
    return null;
  }

  toString(): string {
    return "null";
  }

  isTruthy(): boolean {
    return false;
  }
}
