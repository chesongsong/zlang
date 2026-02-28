import type { ZTable } from "@z-lang/interpreter";

export interface Disposable {
  dispose(): void;
}

export interface ComponentRenderer<T> {
  render(value: T, container: HTMLElement): Disposable;
}

export interface ComponentFactory {
  createTableRenderer(): ComponentRenderer<ZTable>;
  createMarkdownRenderer(): ComponentRenderer<string>;
}
