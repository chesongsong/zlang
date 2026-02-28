import type { OutputSegment } from "@z-lang/interpreter";
import { ZValue } from "@z-lang/interpreter";
import type { ComponentFactory, Disposable, RenderTable } from "./types.js";

export class RenderEngine {
  private factory: ComponentFactory;
  private disposables: Disposable[] = [];

  constructor(factory: ComponentFactory) {
    this.factory = factory;
  }

  setFactory(factory: ComponentFactory): void {
    this.factory = factory;
  }

  renderSegments(
    segments: readonly OutputSegment[],
    errors: readonly { message: string }[],
    container: HTMLElement,
  ): void {
    this.disposeAll();
    container.innerHTML = "";

    if (errors.length > 0) {
      const errDiv = document.createElement("div");
      errDiv.className = "render-errors";
      for (const e of errors) {
        const item = document.createElement("div");
        item.className = "render-error-item";
        item.textContent = e.message;
        errDiv.appendChild(item);
      }
      container.appendChild(errDiv);
    }

    for (const segment of segments) {
      if (segment.type === "markdown") {
        this.renderMarkdownSegment(segment.content, container);
      } else {
        this.renderScopeSegment(segment.result, container);
      }
    }
  }

  private renderMarkdownSegment(content: string, container: HTMLElement): void {
    const wrapper = document.createElement("div");
    wrapper.className = "render-segment render-markdown";
    container.appendChild(wrapper);

    const renderer = this.factory.createMarkdownRenderer();
    const disposable = renderer.render(content, wrapper);
    this.disposables.push(disposable);
  }

  private renderScopeSegment(
    result: { value: ZValue; error?: string },
    container: HTMLElement,
  ): void {
    if (result.error) {
      const errDiv = document.createElement("div");
      errDiv.className = "render-segment render-error-item";
      errDiv.textContent = result.error;
      container.appendChild(errDiv);
      return;
    }

    const value = result.value;

    if (value.kind === "table") {
      const renderTable = value.unbox() as RenderTable;
      const wrapper = document.createElement("div");
      wrapper.className = "render-segment render-table";
      container.appendChild(wrapper);

      const renderer = this.factory.createTableRenderer();
      const disposable = renderer.render(renderTable, wrapper);
      this.disposables.push(disposable);
      return;
    }

    const formatted = value.toString();
    const wrapper = document.createElement("div");
    wrapper.className = "render-segment render-markdown";
    container.appendChild(wrapper);

    const renderer = this.factory.createMarkdownRenderer();
    const disposable = renderer.render(formatted, wrapper);
    this.disposables.push(disposable);
  }

  private disposeAll(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
