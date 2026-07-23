import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, BookOpen, Search, Folder, Sparkles } from "lucide-react";
import { fetchPublishedPosts, fetchCategories, BlogPost, Category } from "@/services/blogService";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { stripHtml } from "@/lib/sanitize";

function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPublishedPosts(), fetchCategories()])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter posts by category & search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat = !selectedCategory || post.category?.slug === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        stripHtml(post.title).toLowerCase().includes(q) ||
        stripHtml(post.excerpt ?? "").toLowerCase().includes(q) ||
        stripHtml(post.subtitle ?? "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Featured post selection
  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || (posts.length > 0 ? posts[0] : null);
  }, [posts]);

  // Remaining posts list excluding featured item if displayed at top
  const gridPosts = useMemo(() => {
    if (!featuredPost || selectedCategory || searchQuery) return filteredPosts;
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost, selectedCategory, searchQuery]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Hizorex Career & Hiring Blog",
            description: "Insights on career growth, salary negotiation, resume optimization, and executive hiring.",
            url: "https://hizorex.com/blog",
          }),
        }}
      />
      <NavbarV2 />
      <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 py-16 px-4 relative overflow-hidden">
          <div className="mx-auto max-w-5xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 border border-blue-700/50 px-4 py-1.5 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Hizorex Career & Insights Blog
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Master Your Next Career Move
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Expert guides on resume building, AI interview preparation, salary negotiation, and executive recruitment trends.
            </p>

            {/* Search Input Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, guides, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories Filtering Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                !selectedCategory
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-xl font-medium">No articles found matching your criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                className="mt-4 text-sm text-blue-600 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured Post Card (only when on 'All' & no active search) */}
              {featuredPost && !selectedCategory && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-14"
                >
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="group grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="lg:col-span-7 h-64 sm:h-96 overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                      {featuredPost.cover_image_url ? (
                        <img
                          src={featuredPost.cover_image_url}
                          alt={stripHtml(featuredPost.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles className="h-3 w-3" /> Featured Story
                      </div>
                    </div>

                    <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center">
                      {featuredPost.category && (
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                          <Folder className="h-3 w-3" /> {featuredPost.category.name}
                        </span>
                      )}
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-3 leading-tight">
                        {stripHtml(featuredPost.title)}
                      </h2>
                      {(featuredPost.subtitle || featuredPost.excerpt) && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-3 mb-6 leading-relaxed">
                          {stripHtml(featuredPost.subtitle || featuredPost.excerpt || "")}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                          {stripHtml(featuredPost.author_name)}
                        </span>
                        {(featuredPost.date || featuredPost.published_at) && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            {formatDate(featuredPost.date || featuredPost.published_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Main Grid of Posts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={stripHtml(post.title)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-blue-500/40" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-2.5 py-1 rounded-md backdrop-blur-sm">
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-lg mb-2 line-clamp-2 leading-snug">
                          {stripHtml(post.title)}
                        </h3>
                        {(post.subtitle || post.excerpt) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                            {stripHtml(post.subtitle || post.excerpt || "")}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span>{stripHtml(post.author_name)}</span>
                          {(post.date || post.published_at) && (
                            <span>{formatDate(post.date || post.published_at)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <FooterV2 />
    </>
  );
};

export default BlogList;
