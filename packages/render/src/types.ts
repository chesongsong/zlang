/**
 * Pure JS table structure — no z-lang internals.
 * Renderers only work with this type, never with ZValue/ZTable.
 */
export interface RenderTable {
  readonly columns: readonly RenderColumn[];
}

export interface RenderColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

export interface Disposable {
  dispose(): void;
}

export interface ComponentRenderer<T> {
  render(value: T, container: HTMLElement): Disposable;
}

/**
 * Consumers implement this interface to provide their own UI renderers.
 * All data passed to renderers is already unboxed — pure JS values.
 */
export interface ComponentFactory {
  createTableRenderer(): ComponentRenderer<RenderTable>;
  createMarkdownRenderer(): ComponentRenderer<string>;
}
