import type {
  ComponentFactory,
  ComponentRenderer,
  CodeBlockData,
  PendingData,
} from "@z-lang/render";
import { MarkdownRenderer } from "./markdown-renderer.js";
import { CodeBlockRenderer } from "./code-block-renderer.js";
import { PendingRenderer } from "./pending-renderer.js";
export class ElementComponentFactory implements ComponentFactory {
  private readonly renderers = new Map<string, () => ComponentRenderer>();

  registerRenderer(type: string, factory: () => ComponentRenderer): void {
    this.renderers.set(type, factory);
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return new MarkdownRenderer();
  }

  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData> {
    return new CodeBlockRenderer();
  }

  createPendingRenderer(): ComponentRenderer<PendingData> {
    return new PendingRenderer();
  }

  createRenderer(type: string): ComponentRenderer | null {
    const factory = this.renderers.get(type);
    return factory ? factory() : null;
  }
}
