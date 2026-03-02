import {
  defineRenderable,
  ZArray,
  ZObject,
} from "@z-lang/core";
import type { RenderableContext } from "@z-lang/core";

export interface RenderTableData {
  readonly columns: readonly RenderTableColumn[];
}

export interface RenderTableColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

function inferColumns(records: ZArray): RenderTableData {
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

  return {
    columns: keyOrder.map((key) => ({
      name: key,
      values: records.elements.map((record) =>
        record instanceof ZObject ? record.get(key).unbox() : null,
      ),
    })),
  };
}

function resolveColumns(
  ctx: RenderableContext,
  records: ZArray,
): RenderTableData {
  const columnArgs = ctx.args.slice(1);

  const columns: RenderTableColumn[] = columnArgs.map((arg) => {
    if (arg.type === "NamedArgument") {
      const values = records.elements.map((record) => {
        const childEnv = ctx.createChildEnv();
        if (record instanceof ZObject) {
          for (const [key, val] of Object.entries(record.entries)) {
            childEnv.define(key, val);
          }
          childEnv.define("自己", record);
        }
        return ctx.evaluate(arg.value, childEnv).unbox();
      });
      return { name: arg.name, values };
    }

    if (arg.type === "Identifier") {
      return {
        name: arg.name,
        values: records.elements.map((record) =>
          record instanceof ZObject ? record.get(arg.name).unbox() : null,
        ),
      };
    }

    throw new Error(
      "rtable column must be a field name or named argument (name = expression)",
    );
  });

  return { columns };
}

export const rtable = defineRenderable("rtable", {
  execute(ctx: RenderableContext): RenderTableData {
    if (ctx.args.length < 1) {
      throw new Error("rtable requires at least 1 argument (data source)");
    }

    const firstArg = ctx.args[0]!;
    if (firstArg.type === "NamedArgument") {
      throw new Error(
        "rtable first argument must be a data source, not a named argument",
      );
    }

    const recordsVal = ctx.evaluate(firstArg);
    if (!(recordsVal instanceof ZArray)) {
      throw new Error("rtable first argument must be an array");
    }

    if (ctx.args.length === 1) {
      return inferColumns(recordsVal);
    }

    return resolveColumns(ctx, recordsVal);
  },
});
