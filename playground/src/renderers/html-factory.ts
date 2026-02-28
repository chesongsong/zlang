import type { ComponentFactory, ComponentRenderer, RenderTable } from "@z-lang/render";
import { HtmlTableRenderer } from "./html-table-renderer.js";
import { HtmlMarkdownRenderer } from "./html-markdown-renderer.js";

export class HtmlComponentFactory implements ComponentFactory {
  createTableRenderer(): ComponentRenderer<RenderTable> {
    return new HtmlTableRenderer();
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return new HtmlMarkdownRenderer();
  }
}
