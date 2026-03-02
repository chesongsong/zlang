import type { Expression, CallArgument } from "@z-lang/types";
import type { BuiltinFunction, Evaluator } from "@z-lang/interpreter";
import { ZRenderCustom } from "@z-lang/interpreter";
import type { ZValue } from "@z-lang/interpreter";
import { Environment, box } from "@z-lang/interpreter";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RenderableDefinition {
  readonly name: string;
  readonly builtin: BuiltinFunction;
}

/**
 * Simple mode handler — receives already-evaluated, unboxed JS values.
 */
export type RenderableHandler = (
  args: unknown[],
  named: Record<string, unknown>,
) => unknown;

/**
 * Context provided to advanced-mode handlers, exposing the interpreter's
 * evaluation capabilities for lazy evaluation, custom scoping, etc.
 */
export interface RenderableContext {
  readonly args: readonly CallArgument[];
  readonly env: Environment;
  evaluate(expr: Expression, env?: Environment): ZValue;
  createChildEnv(parent?: Environment): Environment;
  box(value: unknown): ZValue;
}

/**
 * Advanced mode handler — receives a context with full access to
 * raw AST arguments, the evaluator, and the environment.
 */
export interface AdvancedRenderableHandler {
  execute(ctx: RenderableContext): unknown;
}

// ---------------------------------------------------------------------------
// Internal implementations
// ---------------------------------------------------------------------------

function isAdvancedHandler(
  h: RenderableHandler | AdvancedRenderableHandler,
): h is AdvancedRenderableHandler {
  return typeof h === "object" && h !== null && "execute" in h;
}

class SimpleRenderableBuiltin implements BuiltinFunction {
  constructor(
    private readonly renderKind: string,
    private readonly handler: RenderableHandler,
  ) {}

  execute(
    args: readonly CallArgument[],
    env: Environment,
    evaluator: Evaluator,
  ): ZValue {
    const positional: unknown[] = [];
    const named: Record<string, unknown> = {};

    for (const arg of args) {
      if (arg.type === "NamedArgument") {
        const val = evaluator.evaluate(arg.value, env);
        named[arg.name] = val.unbox();
      } else {
        const val = evaluator.evaluate(arg, env);
        positional.push(val.unbox());
      }
    }

    const data = this.handler(positional, named);
    return new ZRenderCustom(this.renderKind, data);
  }
}

class AdvancedRenderableBuiltin implements BuiltinFunction {
  constructor(
    private readonly renderKind: string,
    private readonly handler: AdvancedRenderableHandler,
  ) {}

  execute(
    args: readonly CallArgument[],
    env: Environment,
    evaluator: Evaluator,
  ): ZValue {
    const ctx: RenderableContext = {
      args,
      env,
      evaluate(expr: Expression, customEnv?: Environment): ZValue {
        return evaluator.evaluate(expr, customEnv ?? env);
      },
      createChildEnv(parent?: Environment): Environment {
        return new Environment(parent ?? env);
      },
      box,
    };

    const data = this.handler.execute(ctx);
    return new ZRenderCustom(this.renderKind, data);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Define a custom renderable keyword.
 *
 * Simple mode — handler receives evaluated, unboxed JS values:
 * ```ts
 * defineRenderable("tlink", (args, named) => ({
 *   text: args[0], url: args[1],
 * }));
 * ```
 *
 * Advanced mode — handler receives a context with full evaluator access:
 * ```ts
 * defineRenderable("rtable", {
 *   execute(ctx) {
 *     const data = ctx.evaluate(ctx.args[0]!);
 *     // lazy evaluation, custom env, etc.
 *     return tableData;
 *   },
 * });
 * ```
 */
export function defineRenderable(
  name: string,
  handler: RenderableHandler | AdvancedRenderableHandler,
): RenderableDefinition {
  const builtin = isAdvancedHandler(handler)
    ? new AdvancedRenderableBuiltin(name, handler)
    : new SimpleRenderableBuiltin(name, handler);

  return { name, builtin };
}
