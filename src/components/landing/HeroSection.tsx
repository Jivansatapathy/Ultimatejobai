import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Search, Star, MapPin, Building2, Briefcase } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [heroFilters, setHeroFilters] = useState({
    title: "",
    city: "",
    country: "",
  });

  const navigateToJobs = (overrides?: Partial<typeof heroFilters>) => {
    const nextFilters = { ...heroFilters, ...overrides };
    const params = new URLSearchParams();

    if (nextFilters.title.trim()) {
      params.set("title", nextFilters.title.trim());
      params.set("search", nextFilters.title.trim());
    }
    if (nextFilters.city.trim()) {
      params.set("city", nextFilters.city.trim());
    }
    if (nextFilters.country.trim()) {
      params.set("country", nextFilters.country.trim());
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 bg-white">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 text-sm mb-8 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-teal-500" />
            <span className="text-muted-foreground">AI-Powered Career Intelligence</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-semibold">New</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-navy-900"
          >
            Your Career,{" "}
            <span className="gradient-text">Supercharged</span>
            <br />
            by AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Transform fragmented job-seeking into a streamlined, intelligent career pipeline. 
            ATS-optimized resumes, smart job matching, and automated applications.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                Explore Jobs
              </Button>
            </Link>
            <Link to="/plans">
              <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-2xl">
                View Plans
              </Button>
            </Link>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <form
              className="glass-card p-2 flex flex-col md:flex-row gap-2 shadow-xl border-teal-100 bg-white/90 backdrop-blur-sm"
              onSubmit={(e) => {
                e.preventDefault();
                navigateToJobs();
              }}
            >
              <div className="flex-[2] relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Job position"
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                  value={heroFilters.title}
                  onChange={(e) => setHeroFilters((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="flex-1 relative md:border-l border-border/50">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="City"
                  className="w-full pl-9 pr-4 py-3 bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
                  value={heroFilters.city}
                  onChange={(e) => setHeroFilters((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="flex-1 relative md:border-l border-border/50">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full pl-9 pr-4 py-3 bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
                  value={heroFilters.country}
                  onChange={(e) => setHeroFilters((prev) => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <Button 
                variant="hero" 
                type="submit"
                className="md:w-auto w-full px-8 py-6 rounded-xl"
              >
                Find Jobs
              </Button>
            </form>
            
            {/* Prefiltered Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground mr-2">Prefiltered:</span>
              {[
                { label: "Remote", color: "bg-blue-500/10 text-blue-500", query: "is_remote=true" },
                { label: "Full-time", color: "bg-green-500/10 text-green-500", query: "employment_type=full-time" },
                { label: "High Salary", color: "bg-amber-500/10 text-amber-500", query: "ordering=-salary_min" },
                { label: "AI & ML", color: "bg-purple-500/10 text-purple-500", query: "search=AI" }
              ].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/jobs?${tag.query}`)}
                  className={`px-3 py-1 rounded-full text-xs font-medium hover:brightness-125 transition-all ${tag.color}`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-center mb-12">
            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 md:w-2/3"
            >
              {[
                { icon: Zap, text: "ATS Score Optimization" },
                { icon: TrendingUp, text: "Smart Job Matching" },
                { icon: Shield, text: "Privacy-First Design" },
                { icon: Sparkles, text: "AI Resume Builder" },
                { icon: Search, text: "Global Opportunity Network" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 border border-teal-100 text-sm shadow-sm backdrop-blur-sm hover:border-teal-300 transition-colors"
                >
                  <feature.icon className="h-4 w-4 text-teal-500" />
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Executive Roles Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="w-full max-w-sm"
            >
              <div className="rounded-2xl border border-teal-100 bg-white/90 backdrop-blur-md shadow-xl overflow-hidden text-left">
                <div className="p-4 border-b border-teal-100 bg-teal-50/50 flex items-center gap-2">
                  <Star className="h-5 w-5 text-teal-500 fill-teal-500" />
                  <h3 className="font-bold text-sm tracking-widest uppercase text-teal-700">EXECUTIVE ROLES</h3>
                </div>
                <div className="flex flex-col">
                  {[
                    "CEO", "CMO", "CFO", "CTO", "COO", "VP of Engineering", "Director"
                  ].map((role, i) => (
                    <button
                      key={i}
                      onClick={() => navigateToJobs({ title: role })}
                      className="px-6 py-3 text-left hover:bg-teal-50 transition-colors border-b border-teal-50 last:border-0 text-muted-foreground font-medium text-sm group"
                    >
                      <span className="group-hover:text-teal-700 transition-colors">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="p-2 rounded-2xl border border-teal-100 bg-white/90 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl overflow-hidden border border-teal-50">
              {/* Mock Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-teal-50 bg-teal-50/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-teal-400/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-teal-50 text-xs text-teal-600 font-medium">
                    app.careerai.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Preview Content */}
              <div className="p-6 space-y-4 bg-background">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Resume Score", value: "94", color: "text-teal-600" },
                    { label: "Jobs Applied", value: "127", color: "text-foreground" },
                    { label: "Interviews", value: "23", color: "text-foreground" },
                    { label: "Response Rate", value: "32%", color: "text-teal-600" },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 glass-card p-4 h-32">
                    <p className="text-xs text-muted-foreground mb-2">Application Activity</p>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t opacity-80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-4 h-32">
                    <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
                    <div className="space-y-2">
                      {["React", "TypeScript", "Node.js"].map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-teal-50 flex-1">
                            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: `${90 - i * 15}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
