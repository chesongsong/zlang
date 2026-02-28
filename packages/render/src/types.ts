export interface Disposable {
  dispose(): void;
}

export interface ComponentRenderer<T = unknown> {
  render(value: T, container: HTMLElement): Disposable;
}

export interface ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string>;
  createRenderer(type: string): ComponentRenderer | null;
}
