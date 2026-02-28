import type { ComponentFactory, ComponentRenderer } from "@z-lang/render";
import type { ZTable } from "@z-lang/render";
import { HtmlTableRenderer } from "./html-table-renderer.js";
import { HtmlMarkdownRenderer } from "./html-markdown-renderer.js";

export class HtmlComponentFactory implements ComponentFactory {
  createTableRenderer(): ComponentRenderer<ZTable> {
    return new HtmlTableRenderer();
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return new HtmlMarkdownRenderer();
  }
}
