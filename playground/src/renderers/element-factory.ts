import type { ComponentFactory, ComponentRenderer, RenderTable } from "@z-lang/render";
import { ElementTableRenderer } from "./element-table-renderer.js";
import { HtmlMarkdownRenderer } from "./html-markdown-renderer.js";

export class ElementComponentFactory implements ComponentFactory {
  createTableRenderer(): ComponentRenderer<RenderTable> {
    return new ElementTableRenderer();
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return new HtmlMarkdownRenderer();
  }
}
