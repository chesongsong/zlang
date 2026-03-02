import type {
  ComponentFactory,
  ComponentRenderer,
  CodeBlockData,
  PendingData,
} from "@z-lang/render";
import { RenderEngine } from "@z-lang/render";
import { run } from "./zlang.js";
import type { ComponentDefinition } from "./define-component.js";

// ---------------------------------------------------------------------------
// Internal: Decorator over user-supplied base factory that auto-registers
// component renderers added via app.use()
// ---------------------------------------------------------------------------

class AppComponentFactory implements ComponentFactory {
  private readonly renderers = new Map<string, () => ComponentRenderer>();

  constructor(private readonly base: ComponentFactory) {}

  register(name: string, factory: () => ComponentRenderer): void {
    this.renderers.set(name, factory);
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return this.base.createMarkdownRenderer();
  }

  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData> {
    return this.base.createCodeBlockRenderer();
  }

  createPendingRenderer(): ComponentRenderer<PendingData> {
    return this.base.createPendingRenderer();
  }

  createRenderer(type: string): ComponentRenderer | null {
    const fn = this.renderers.get(type);
    if (fn) return fn();
    return this.base.createRenderer(type);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Application facade that unifies component registration, execution,
 * and rendering into a single cohesive API.
 *
 * ```ts
 * const app = new ZLangApp(new ElementComponentFactory());
 * app.use(rtable);
 * app.use(button);
 * app.provide({ 用户列表: [...] });
 * app.run(source, outputContainer);
 * ```
 */
export class ZLangApp {
  private readonly components: ComponentDefinition[] = [];
  private readonly factory: AppComponentFactory;
  private readonly engine: RenderEngine;
  private vars: Record<string, unknown> = {};

  constructor(baseFactory: ComponentFactory) {
    this.factory = new AppComponentFactory(baseFactory);
    this.engine = new RenderEngine(this.factory);
  }

  use(component: ComponentDefinition): this {
    this.components.push(component);
    this.factory.register(
      component.name,
      component.createRenderer as () => ComponentRenderer,
    );
    return this;
  }

  provide(variables: Record<string, unknown>): this {
    Object.assign(this.vars, variables);
    return this;
  }

  run(source: string, container: HTMLElement): void {
    const builtins = this.components.map((c) => c.renderable);
    const { segments, errors } = run(source, {
      variables: this.vars,
      builtins,
    });
    this.engine.renderSegments(segments, errors, container);
  }
}
