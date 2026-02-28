import { ZValue } from "../values/base.js";

export abstract class ZRenderable extends ZValue {
  abstract get renderData(): unknown;

  unbox(): unknown {
    return this.renderData;
  }

  isTruthy(): boolean {
    return true;
  }
}
