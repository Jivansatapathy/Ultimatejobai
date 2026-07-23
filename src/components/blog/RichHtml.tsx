import { sanitizeHtml } from "@/lib/sanitize";

interface RichHtmlProps {
  html: string;
  id?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/** Renders sanitized rich-text HTML. Shared by the admin Live Preview and the
 * public blog page so both render CKEditor output identically — and so the
 * `id` prop (needed for heading scroll-anchors) always lands on the actual
 * rendered element rather than being dropped. */
export function RichHtml({ html, id, className, as: Tag = "div" }: RichHtmlProps) {
  if (!html) return null;
  const Component = Tag as any;
  return (
    <Component
      id={id}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
