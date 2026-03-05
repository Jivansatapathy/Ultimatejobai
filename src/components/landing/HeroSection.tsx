import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-background">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">AI-Powered Career Intelligence</span>
            <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">Beta</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground"
          >
            Your Career,{" "}
            <span className="text-accent">Supercharged</span>
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
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Zap, text: "ATS Score Optimization" },
              { icon: TrendingUp, text: "Smart Job Matching" },
              { icon: Shield, text: "Privacy-First Design" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm"
              >
                <feature.icon className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="p-2 rounded-2xl border border-border bg-card shadow-lg">
            <div className="rounded-xl overflow-hidden border border-border">
              {/* Mock Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                    app.careerai.com/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview Content */}
              <div className="p-6 space-y-4 bg-background">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Resume Score", value: "94", color: "text-success" },
                    { label: "Jobs Applied", value: "127", color: "text-foreground" },
                    { label: "Interviews", value: "23", color: "text-foreground" },
                    { label: "Response Rate", value: "32%", color: "text-accent" },
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
                        <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-4 h-32">
                    <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
                    <div className="space-y-2">
                      {["React", "TypeScript", "Node.js"].map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-secondary flex-1">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${90 - i * 15}%` }} />
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
