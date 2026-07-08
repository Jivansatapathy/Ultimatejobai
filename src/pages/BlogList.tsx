import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ChevronRight, BookOpen } from "lucide-react";
import { fetchPublishedPosts, BlogPost } from "@/services/blogService";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Hizorex Blog",
            description: "Insights on executive hiring, salary guides, and career advice for C-suite professionals.",
            url: "https://hizorex.com/blog",
          }),
        }}
      />
      <NavbarV2 />
      <main className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-950 to-blue-800 py-16 px-4">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-4 py-1.5 text-xs font-semibold text-blue-200 mb-4">
              <BookOpen className="h-3.5 w-3.5" /> Hizorex Insights
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Executive Career Blog
            </h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Salary guides, hiring trends, and career advice for C-suite and senior executives.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-14">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No posts published yet.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-12"
                >
                  <Link to={`/blog/${featured.slug}`} className="group block rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {featured.cover_image_url && (
                      <div className="h-64 sm:h-80 overflow-hidden bg-gray-100">
                        <img
                          src={featured.cover_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(featured.tags ?? []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors mb-3">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-500 text-base line-clamp-3 mb-4">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{featured.author_name}</span>
                        {featured.published_at && (
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(featured.published_at)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {post.cover_image_url ? (
                          <div className="h-44 overflow-hidden bg-gray-100">
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-blue-200" />
                          </div>
                        )}
                        <div className="flex flex-col flex-1 p-5">
                          {(post.tags ?? []).length > 0 && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Tag className="h-3 w-3 text-gray-300" />
                              <span className="text-xs text-gray-400">{post.tags[0]}</span>
                            </div>
                          )}
                          <h3 className="font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors text-base mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.excerpt}</p>
                          )}
                          <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                            <span>{post.author_name}</span>
                            {post.published_at && <span>{formatDate(post.published_at)}</span>}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <FooterV2 />
    </>
  );
};

export default BlogList;
