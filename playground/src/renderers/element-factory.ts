import type { ComponentFactory, ComponentRenderer } from "@z-lang/render";
import type { ZTable } from "@z-lang/render";
import { ElementTableRenderer } from "./element-table-renderer.js";
import { HtmlMarkdownRenderer } from "./html-markdown-renderer.js";

export class ElementComponentFactory implements ComponentFactory {
  createTableRenderer(): ComponentRenderer<ZTable> {
    return new ElementTableRenderer();
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return new HtmlMarkdownRenderer();
  }
}
