export interface Disposable {
  dispose(): void;
}

export interface ComponentRenderer<T> {
  render(value: T, container: HTMLElement): Disposable;
}

export interface ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string>;
}
