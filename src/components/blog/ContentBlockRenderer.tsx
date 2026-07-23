import { RichHtml } from "./RichHtml";
import { BlogFaq } from "./BlogFaq";
import { ContentBlock } from "./blockTypes";
import { Info, AlertTriangle, CheckCircle, HelpCircle, Quote } from "lucide-react";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8 blog-content-blocks">
      {blocks.map((block) => {
        switch (block.type) {
          case "rich_text":
            return (
              <div key={block.id} className="prose prose-lg dark:prose-invert max-w-none">
                <RichHtml html={block.html} />
              </div>
            );

          case "faq":
            return <BlogFaq key={block.id} items={block.items} title={block.title} />;

          case "image":
            return (
              <figure key={block.id} className="my-8">
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 ${
                    block.image_fit === "fit" ? "max-h-[500px] flex items-center justify-center p-4" : "w-full"
                  }`}
                >
                  <img
                    src={block.url}
                    alt={block.alt || block.caption || "Blog image"}
                    className={`rounded-xl transition-opacity duration-300 ${
                      block.image_fit === "fit"
                        ? "max-h-[460px] w-auto object-contain"
                        : "w-full h-auto max-h-[600px] object-cover"
                    }`}
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "video":
            return (
              <div key={block.id} className="my-8">
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-gray-200 dark:border-gray-800">
                  <iframe
                    src={block.url}
                    title={block.caption || "Embedded video"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.caption && (
                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {block.caption}
                  </p>
                )}
              </div>
            );

          case "callout": {
            const styleMap = {
              info: {
                bg: "bg-blue-50/80 dark:bg-blue-950/30",
                border: "border-blue-200 dark:border-blue-800/50",
                text: "text-blue-900 dark:text-blue-200",
                icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />,
              },
              warning: {
                bg: "bg-amber-50/80 dark:bg-amber-950/30",
                border: "border-amber-200 dark:border-amber-800/50",
                text: "text-amber-900 dark:text-amber-200",
                icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />,
              },
              success: {
                bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
                border: "border-emerald-200 dark:border-emerald-800/50",
                text: "text-emerald-900 dark:text-emerald-200",
                icon: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />,
              },
              tip: {
                bg: "bg-purple-50/80 dark:bg-purple-950/30",
                border: "border-purple-200 dark:border-purple-800/50",
                text: "text-purple-900 dark:text-purple-200",
                icon: <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />,
              },
            };

            const style = styleMap[block.style || "info"];
            return (
              <div
                key={block.id}
                className={`my-6 flex items-start gap-4 rounded-2xl p-5 border ${style.bg} ${style.border} ${style.text}`}
              >
                {style.icon}
                <div className="flex-1 text-sm md:text-base leading-relaxed">{block.text}</div>
              </div>
            );
          }

          case "quote":
            return (
              <blockquote
                key={block.id}
                className="my-8 rounded-2xl border-l-4 border-blue-600 bg-gray-50/70 dark:bg-gray-900/50 p-6 md:p-8 italic text-gray-800 dark:text-gray-200 relative"
              >
                <Quote className="h-8 w-8 text-blue-200 dark:text-blue-900/50 absolute top-4 right-4 pointer-events-none" />
                <p className="text-lg md:text-xl font-medium leading-relaxed relative z-10">
                  "{block.text}"
                </p>
                {block.author && (
                  <footer className="mt-4 text-sm font-semibold not-italic text-gray-600 dark:text-gray-400">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );

          case "code":
            return (
              <div key={block.id} className="my-6 rounded-2xl overflow-hidden bg-gray-950 text-gray-100 border border-gray-800">
                {block.language && (
                  <div className="bg-gray-900 px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-800 uppercase tracking-wider">
                    {block.language}
                  </div>
                )}
                <pre className="p-5 font-mono text-sm overflow-x-auto leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
