import type { ComponentFactory, ComponentRenderer } from "@z-lang/render";
import { MarkdownRenderer } from "./markdown-renderer.js";
import { ElementTableRenderer } from "./element-table-renderer.js";

const renderers: Record<string, () => ComponentRenderer> = {
  rtable: () => new ElementTableRenderer(),
};

export class ElementComponentFactory implements ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string> {
    return new MarkdownRenderer();
  }

  createRenderer(type: string): ComponentRenderer | null {
    const factory = renderers[type];
    return factory ? factory() : null;
  }
}
