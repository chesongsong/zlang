import type { CallArgument, NamedArgument } from "@z-lang/types";
import type { ZValue } from "../values/base.js";
import { ZArray } from "../values/zarray.js";
import { ZObject } from "../values/zobject.js";
import { ZTable } from "../values/ztable.js";
import type { TableColumn } from "../values/ztable.js";
import { Environment } from "../environment.js";
import type { BuiltinFunction, Evaluator } from "./registry.js";

export class RtableBuiltin implements BuiltinFunction {
  execute(
    args: readonly CallArgument[],
    env: Environment,
    evaluator: Evaluator,
  ): ZValue {
    if (args.length < 1) {
      throw new Error("rtable requires at least 1 argument (data source)");
    }

    const firstArg = args[0]!;
    if (firstArg.type === "NamedArgument") {
      throw new Error(
        "rtable first argument must be a data source, not a named argument",
      );
    }

    const recordsVal = evaluator.evaluate(firstArg, env);
    if (!(recordsVal instanceof ZArray)) {
      throw new Error("rtable first argument must be an array");
    }

    const namedArgs: NamedArgument[] = [];
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]!;
      if (arg.type !== "NamedArgument") {
        throw new Error(
          "rtable column definitions must be named arguments (name = expression)",
        );
      }
      namedArgs.push(arg);
    }

    const columns: TableColumn[] = namedArgs.map((na) => {
      const values: ZValue[] = recordsVal.elements.map((record) => {
        const recordEnv = new Environment(env);

        if (record instanceof ZObject) {
          for (const [key, val] of Object.entries(record.entries)) {
            recordEnv.define(key, val);
          }
          recordEnv.define("自己", record);
        }

        return evaluator.evaluate(na.value, recordEnv);
      });

      return { name: na.name, values };
    });

    return new ZTable(columns);
  }
}
