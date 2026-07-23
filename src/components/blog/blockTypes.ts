export interface HeadingBlock {
  type: "heading";
  level: "h2" | "h3";
  html: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  html: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  caption?: string;
  fit: "fill" | "fit";
}

export interface ListBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

export interface VideoBlock {
  type: "video";
  url: string;
}

export interface LinkBlock {
  type: "link";
  url: string;
  label: string;
}

export interface SlideshowBlock {
  type: "slideshow";
  images: string[];
}

export interface LegacyBlock {
  type: "legacy";
  html: string;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock
  | VideoBlock
  | LinkBlock
  | SlideshowBlock
  | LegacyBlock;

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Heading {
  level: "h2" | "h3";
  text: string;
  id: string;
}

export const BLOCK_TYPE_LABELS: Record<ContentBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  image: "Image",
  list: "List",
  video: "Video",
  link: "Link",
  slideshow: "Image Slideshow",
  legacy: "Legacy (read-only)",
};

export function blankBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "heading":
      return { type: "heading", level: "h2", html: "" };
    case "paragraph":
      return { type: "paragraph", html: "" };
    case "image":
      return { type: "image", src: "", caption: "", fit: "fill" };
    case "list":
      return { type: "list", ordered: false, items: [""] };
    case "video":
      return { type: "video", url: "" };
    case "link":
      return { type: "link", url: "", label: "" };
    case "slideshow":
      return { type: "slideshow", images: [] };
    case "legacy":
      return { type: "legacy", html: "" };
  }
}
