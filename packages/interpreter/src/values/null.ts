import { ZValue } from "./base.js";

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
