export type ImageFitMode = "fill" | "fit";
export type CalloutStyle = "info" | "warning" | "success" | "tip";

interface BaseBlock {
  id: string;
}

export interface RichTextBlock extends BaseBlock {
  type: "rich_text";
  html: string;
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  title?: string;
  items: FaqItem[];
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  caption?: string;
  alt?: string;
  image_fit?: ImageFitMode;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;
  caption?: string;
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  text: string;
  style?: CalloutStyle;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  author?: string;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  code: string;
  language?: string;
}

export interface TocBlock extends BaseBlock {
  type: "toc";
  title?: string;
}

export type ContentBlock =
  | RichTextBlock
  | FaqBlock
  | ImageBlock
  | VideoBlock
  | CalloutBlock
  | QuoteBlock
  | CodeBlock
  | TocBlock;

export interface FaqItem {
  question: string;
  answer: string;
}
