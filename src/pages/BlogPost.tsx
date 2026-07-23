import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ArrowLeft, ChevronRight, Folder } from "lucide-react";
import { fetchPostBySlug, BlogPostDetail } from "@/services/blogService";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { RichHtml } from "@/components/blog/RichHtml";
import { BlogToc } from "@/components/blog/BlogToc";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { ContentBlockRenderer } from "@/components/blog/ContentBlockRenderer";
import { extractHeadings } from "@/components/blog/extractHeadings";
import { stripHtml } from "@/lib/sanitize";

function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchPostBySlug(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const contentRef = useRef<HTMLDivElement>(null);

  // Generate Table of Contents items from blocks or html content
  const tocItems = useMemo(() => {
    if (!post) return [];
    return extractHeadings(post.content_blocks, post.content);
  }, [post]);

  // The TOC's ids are computed from the same source HTML the content renders
  // from, in the same order — so the i-th heading found in the live DOM after
  // render is always the i-th tocItems entry. Assigning ids here (rather than
  // baking them into the HTML before render) works regardless of how many
  // rich_text blocks a heading is nested inside.
  useEffect(() => {
    if (!contentRef.current || tocItems.length === 0) return;
    const headingEls = contentRef.current.querySelectorAll("h2, h3, h4");
    headingEls.forEach((el, i) => {
      if (tocItems[i]) el.id = tocItems[i].id;
    });
  }, [tocItems, post]);

  if (loading) {
    return (
      <>
        <NavbarV2 />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <FooterV2 />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <NavbarV2 />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
        <FooterV2 />
      </>
    );
  }

  const hasBlocks = (post.content_blocks ?? []).length > 0;
  const showToc = tocItems.length > 1;

  // Build Schema.org BlogPosting
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: stripHtml(post.meta_title || post.title),
    description: stripHtml(post.meta_description || post.excerpt),
    image: post.cover_image_url || undefined,
    author: { "@type": "Person", name: stripHtml(post.author_name) },
    datePublished: post.published_at || post.date || post.created_at,
    dateModified: post.updated_at,
    publisher: {
      "@type": "Organization",
      name: "Hizorex",
      url: "https://hizorex.com",
    },
    articleSection: post.category?.name,
  };

  return (
    <>
      {/* Article Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <NavbarV2 />
      <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {/* Cover Hero Image */}
        {post.cover_image_url && (
          <div
            className={`w-full overflow-hidden bg-gray-100 dark:bg-gray-900 ${
              post.image_fit === "fit" ? "max-h-[450px] py-6 flex justify-center" : "h-72 sm:h-96"
            }`}
          >
            <img
              src={post.cover_image_url}
              alt={stripHtml(post.title)}
              className={`w-full ${
                post.image_fit === "fit"
                  ? "max-h-[400px] w-auto object-contain"
                  : "h-full object-cover"
              }`}
            />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            {post.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to={`/blog?category=${post.category.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{stripHtml(post.title)}</span>
          </nav>

          {/* Main Grid: Left Article Content, Right Sticky TOC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`lg:col-span-${showToc ? "8" : "12"}`}
            >
              {/* Category & Tags Header */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.category && (
                  <Link
                    to={`/blog?category=${post.category.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                  >
                    <Folder className="h-3 w-3" /> {post.category.name}
                  </Link>
                )}
                {(post.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full"
                  >
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>

              {/* Title & Subtitle */}
              <RichHtml
                as="h1"
                html={post.title}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
              />

              {post.subtitle && (
                <RichHtml
                  as="h2"
                  html={post.subtitle}
                  className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-4 leading-relaxed"
                />
              )}

              {post.excerpt && !post.subtitle && (
                <RichHtml
                  as="p"
                  html={post.excerpt}
                  className="text-xl text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
                />
              )}

              {/* Author & Date Meta */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400 pb-8 border-b border-gray-100 dark:border-gray-800 mb-8">
                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4 text-blue-600" />
                  <RichHtml as="span" html={post.author_name} />
                </span>
                {(post.date || post.published_at) && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {formatDate(post.date || post.published_at)}
                  </span>
                )}
              </div>

              {/* Mobile TOC Accordion */}
              {showToc && (
                <div className="block lg:hidden mb-8">
                  <BlogToc items={tocItems} />
                </div>
              )}

              {/* Content Body: Render Block-Based or Fallback Classic Content */}
              <div ref={contentRef}>
                {hasBlocks ? (
                  <ContentBlockRenderer blocks={post.content_blocks!} />
                ) : (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <RichHtml html={post.content} />
                  </div>
                )}
              </div>

              {/* FAQ Accordion Section (if present at post root) */}
              {(post.faq ?? []).length > 0 && <BlogFaq items={post.faq!} />}

              {/* Back to blog link */}
              <div className="mt-14 pt-8 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to all posts
                </Link>
              </div>
            </motion.article>

            {/* Desktop Sticky Table of Contents Sidebar */}
            {showToc && (
              <aside className="hidden lg:block lg:col-span-4">
                <div className="sticky top-28 space-y-6">
                  <BlogToc items={tocItems} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <FooterV2 />
    </>
  );
};

export default BlogPost;
