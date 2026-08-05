import { useMemo } from "react";
import { Calendar, User, Tag, Folder, Eye } from "lucide-react";
import { RichHtml } from "./RichHtml";
import { BlogToc } from "./BlogToc";
import { BlogFaq } from "./BlogFaq";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { extractHeadings } from "./extractHeadings";
import { Category } from "@/services/blogService";
import type { FormState } from "@/pages/BlogAdmin";

interface BlogPreviewProps {
  form: FormState;
  categories: Category[];
}

function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Renders the in-progress form state exactly the way BlogPost.tsx renders a
 * saved post — same child components, so "what you see here" and "what goes
 * live" can't drift apart. Nothing here is fetched or saved; it's a pure
 * read-only view of local form state. */
export function BlogPreview({ form, categories }: BlogPreviewProps) {
  const category = useMemo(
    () => categories.find((c) => c.id === form.category_id) || null,
    [categories, form.category_id]
  );

  const tocItems = useMemo(
    () => extractHeadings(form.content_blocks, form.content),
    [form.content_blocks, form.content]
  );

  const hasBlocks = (form.content_blocks ?? []).length > 0;
  const showToc = tocItems.length > 1;

  return (
    <div className="rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
        <Eye className="h-3.5 w-3.5" /> Live Preview — not saved yet
      </div>

      <main>
        {form.cover_image_url && (
          <div
            className={`w-full overflow-hidden bg-gray-100 dark:bg-gray-900 ${
              form.image_fit === "fit" ? "max-h-[450px] py-6 flex justify-center" : "h-72 sm:h-96"
            }`}
          >
            <img
              src={form.cover_image_url}
              alt=""
              className={`w-full ${
                form.image_fit === "fit" ? "max-h-[400px] w-auto object-contain" : "h-full object-cover"
              }`}
            />
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <article className={showToc ? "lg:col-span-8" : "lg:col-span-12"}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                    <Folder className="h-3 w-3" /> {category.name}
                  </span>
                )}
                {(form.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full"
                  >
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>

              {form.title ? (
                <RichHtml
                  as="h1"
                  html={form.title}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
                />
              ) : (
                <p className="text-gray-400 italic mb-4">(no title yet)</p>
              )}

              {form.subtitle && (
                <RichHtml
                  as="h2"
                  html={form.subtitle}
                  className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-4 leading-relaxed"
                />
              )}

              {!form.subtitle && form.excerpt && (
                <RichHtml
                  as="p"
                  html={form.excerpt}
                  className="text-xl text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
                />
              )}

              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400 pb-8 border-b border-gray-100 dark:border-gray-800 mb-8">
                {form.author_name && (
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4 text-blue-600" />
                    <RichHtml as="span" html={form.author_name} />
                  </span>
                )}
                {form.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {formatDate(form.date)}
                  </span>
                )}
              </div>

              {showToc && (
                <div className="block lg:hidden mb-8">
                  <BlogToc items={tocItems} />
                </div>
              )}

              {hasBlocks ? (
                <ContentBlockRenderer blocks={form.content_blocks} />
              ) : form.content ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <RichHtml html={form.content} />
                </div>
              ) : (
                <p className="text-gray-400 italic">(no content yet — add a block below)</p>
              )}

              {(form.faq ?? []).length > 0 && <BlogFaq items={form.faq} />}
            </article>

            {showToc && (
              <aside className="hidden lg:block lg:col-span-4">
                <div className="sticky top-28">
                  <BlogToc items={tocItems} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
