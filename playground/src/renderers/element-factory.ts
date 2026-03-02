import type { ComponentFactory, ComponentRenderer, CodeBlockData } from "@z-lang/render";
import { MarkdownRenderer } from "./markdown-renderer.js";
import { CodeBlockRenderer } from "./code-block-renderer.js";
import { ElementTableRenderer } from "./element-table-renderer.js";

const renderableRenderers: Record<string, () => ComponentRenderer> = {
  rtable: () => new ElementTableRenderer(),
};

export class ElementComponentFactory implements ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string> {
    return new MarkdownRenderer();
  }

  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData> {
    return new CodeBlockRenderer();
  }

  createRenderer(type: string): ComponentRenderer | null {
    const factory = renderableRenderers[type];
    return factory ? factory() : null;
  }
}
