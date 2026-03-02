export type RawSegmentType = "markdown" | "zlang" | "codeblock";

export interface RawSegment {
  readonly type: RawSegmentType;
  readonly content: string;
  readonly language?: string;
}

const ZLANG_LANGUAGES = new Set(["z-lang", "zlang", "z"]);

export class SourceSplitter {
  split(source: string): RawSegment[] {
    const segments: RawSegment[] = [];
    const fence = "```";
    const parts = source.split(fence);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;

      if (i % 2 === 0) {
        const trimmed = part.trim();
        if (trimmed) {
          segments.push({ type: "markdown", content: trimmed });
        }
      } else {
        const parsed = this.parseCodeBlock(part);
        segments.push(parsed);
      }
    }

    return segments;
  }

  private parseCodeBlock(content: string): RawSegment {
    const firstNewline = content.indexOf("\n");

    if (firstNewline === -1) {
      return this.classifyCodeBlock("", content.trim());
    }

    const firstLine = content.slice(0, firstNewline).trim();
    const codeContent = content.slice(firstNewline + 1);

    return this.classifyCodeBlock(firstLine, codeContent);
  }

  private classifyCodeBlock(langTag: string, content: string): RawSegment {
    const lang = langTag.toLowerCase();

    if (!lang || ZLANG_LANGUAGES.has(lang)) {
      return { type: "zlang", content };
    }

    return {
      type: "codeblock",
      language: langTag || "text",
      content,
    };
  }
}
