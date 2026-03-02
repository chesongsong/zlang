export interface Disposable {
  dispose(): void;
}

export interface ComponentRenderer<T = unknown> {
  render(value: T, container: HTMLElement): Disposable;
}

export interface CodeBlockData {
  readonly language: string;
  readonly content: string;
}

export interface PendingData {
  readonly language: string;
  readonly content: string;
}

export interface ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string>;
  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData>;
  createPendingRenderer(): ComponentRenderer<PendingData>;
  createRenderer(type: string): ComponentRenderer | null;
}
