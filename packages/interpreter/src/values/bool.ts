import { ZValue } from "./base.js";

export class ZBool extends ZValue {
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
