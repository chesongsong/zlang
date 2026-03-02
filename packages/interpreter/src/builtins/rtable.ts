import type { CallArgument, NamedArgument } from "@z-lang/types";
import type { ZValue } from "../values/base.js";
import { ZArray } from "../values/array.js";
import { ZObject } from "../values/object.js";
import { ZRenderTable } from "../renderables/table.js";
import type { TableColumn } from "../renderables/table.js";
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

    const columnArgs = args.slice(1);

    if (columnArgs.length === 0) {
      return new ZRenderTable(this.inferColumns(recordsVal));
    }

    const columns = this.resolveColumns(columnArgs, recordsVal, env, evaluator);
    return new ZRenderTable(columns);
  }

  private inferColumns(records: ZArray): TableColumn[] {
    const keySet = new Set<string>();
    const keyOrder: string[] = [];

    for (const record of records.elements) {
      if (record instanceof ZObject) {
        for (const key of Object.keys(record.entries)) {
          if (!keySet.has(key)) {
            keySet.add(key);
            keyOrder.push(key);
          }
        }
      }
    }

    return keyOrder.map((key) => ({
      name: key,
      values: records.elements.map((record) =>
        record instanceof ZObject ? record.get(key) : record,
      ),
    }));
  }

  private resolveColumns(
    columnArgs: readonly CallArgument[],
    records: ZArray,
    env: Environment,
    evaluator: Evaluator,
  ): TableColumn[] {
    return columnArgs.map((arg) => {
      if (arg.type === "NamedArgument") {
        return this.resolveNamedColumn(arg, records, env, evaluator);
      }

      if (arg.type === "Identifier") {
        return this.resolveFieldColumn(arg.name, records);
      }

      throw new Error(
        "rtable column must be a field name or named argument (name = expression)",
      );
    });
  }

  private resolveNamedColumn(
    na: NamedArgument,
    records: ZArray,
    env: Environment,
    evaluator: Evaluator,
  ): TableColumn {
    const values: ZValue[] = records.elements.map((record) => {
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
  }

  private resolveFieldColumn(name: string, records: ZArray): TableColumn {
    return {
      name,
      values: records.elements.map((record) =>
        record instanceof ZObject ? record.get(name) : record,
      ),
    };
  }
}
