import type { ZValue } from "./values/base.js";

export class ReturnSignal {
  constructor(public readonly value: ZValue) {}
}

export class BreakSignal {}

export class ContinueSignal {}
