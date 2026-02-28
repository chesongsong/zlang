import type { ComponentFactory, ComponentRenderer } from "@z-lang/render";
import { MarkdownRenderer } from "./markdown-renderer.js";

export class ElementComponentFactory implements ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string> {
    return new MarkdownRenderer();
  }
}
