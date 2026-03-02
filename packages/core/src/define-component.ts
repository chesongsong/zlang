import type { Disposable, ComponentRenderer } from "@z-lang/render";
import { defineRenderable } from "./define-renderable.js";
import type {
  RenderableDefinition,
  RenderableHandler,
  AdvancedRenderableHandler,
  RenderableContext,
} from "./define-renderable.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { RenderableContext };

export type SimpleSetup<T = unknown> = (
  args: unknown[],
  named: Record<string, unknown>,
) => T;

export interface AdvancedSetup<T = unknown> {
  execute(ctx: RenderableContext): T;
}

export type RenderFn<T = unknown> = (
  data: T,
  container: HTMLElement,
) => Disposable;

export interface ComponentDefinition<T = unknown> {
  readonly name: string;
  readonly renderable: RenderableDefinition;
  readonly createRenderer: () => ComponentRenderer<T>;
}

// ---------------------------------------------------------------------------
// Overloaded options
// ---------------------------------------------------------------------------

export interface SimpleComponentOptions<T> {
  setup: SimpleSetup<T>;
  render: RenderFn<T>;
}

export interface AdvancedComponentOptions<T> {
  setup: AdvancedSetup<T>;
  render: RenderFn<T>;
}

export type ComponentOptions<T> =
  | SimpleComponentOptions<T>
  | AdvancedComponentOptions<T>;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

function isAdvancedSetup<T>(
  setup: SimpleSetup<T> | AdvancedSetup<T>,
): setup is AdvancedSetup<T> {
  return typeof setup === "object" && setup !== null && "execute" in setup;
}

/**
 * Define a self-contained component — combines data processing (setup)
 * and UI rendering (render) into a single definition.
 *
 * Simple mode:
 * ```ts
 * defineComponent("tlink", {
 *   setup: (args) => ({ text: args[0], url: args[1] }),
 *   render(data, el) {
 *     const a = document.createElement("a");
 *     a.href = data.url; a.textContent = data.text;
 *     el.appendChild(a);
 *     return { dispose: () => a.remove() };
 *   },
 * });
 * ```
 *
 * Advanced mode (lazy evaluation, custom scoping):
 * ```ts
 * defineComponent("rtable", {
 *   setup: { execute(ctx) { return tableData; } },
 *   render(data, el) { ... },
 * });
 * ```
 */
export function defineComponent<T>(
  name: string,
  options: ComponentOptions<T>,
): ComponentDefinition<T> {
  const handler: RenderableHandler | AdvancedRenderableHandler =
    isAdvancedSetup(options.setup)
      ? options.setup
      : (options.setup as RenderableHandler);

  const renderable = defineRenderable(name, handler);
  const renderFn = options.render;

  return {
    name,
    renderable,
    createRenderer: () => ({ render: renderFn }),
  };
}
