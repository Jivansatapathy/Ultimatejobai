import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ArrowLeft, ChevronRight } from "lucide-react";
import { fetchPostBySlug, BlogPostDetail } from "@/services/blogService";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

function formatDate(d: string | null) {
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
          <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
        <FooterV2 />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image_url || undefined,
            author: { "@type": "Person", name: post.author_name },
            datePublished: post.published_at,
            dateModified: post.updated_at,
            publisher: {
              "@type": "Organization",
              name: "Hizorex",
              url: "https://hizorex.com",
            },
          }),
        }}
      />
      <NavbarV2 />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        {post.cover_image_url && (
          <div className="w-full h-72 sm:h-96 overflow-hidden bg-gray-100">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
          </nav>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Tags */}
            {(post.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-500 mb-6 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-5 text-sm text-gray-400 pb-8 border-b border-gray-100 mb-8">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author_name}</span>
              {post.published_at && (
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.published_at)}</span>
              )}
            </div>

            {/* Body */}
            <div
              className="prose prose-lg prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.article>

          {/* Back link */}
          <div className="mt-14 pt-8 border-t border-gray-100">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to all posts
            </Link>
          </div>
        </div>
      </main>
      <FooterV2 />
    </>
  );
};

export default BlogPost;
