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
  createMarkdownRenderer(): ComponentRenderer<string> {
    return new MarkdownRenderer();
  }

  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData> {
    return new CodeBlockRenderer();
  }

  createPendingRenderer(): ComponentRenderer<PendingData> {
    return new PendingRenderer();
  }

  createRenderer(): ComponentRenderer | null {
    return null;
  }
}
