import { motion } from "framer-motion";
import { 
  FileText, 
  Target, 
  Briefcase, 
  Send, 
  BarChart3, 
  Shield,
  Brain
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    description: "Create ATS-optimized resumes from scratch or rebuild existing ones with AI-powered suggestions and keyword optimization.",
  },
  {
    icon: Target,
    title: "ATS Score Analysis",
    description: "Real-time ATS compatibility scoring with explainable insights and actionable recommendations to improve your match rate.",
  },
  {
    icon: Briefcase,
    title: "Smart Job Discovery",
    description: "AI-driven job recommendations based on your resume, skills, and behavior. Quality over quantity approach to opportunities.",
  },
  {
    icon: Send,
    title: "Auto-Apply Automation",
    description: "Consent-driven automated applications with personalized cover letters sent to verified hiring contacts.",
  },
  {
    icon: BarChart3,
    title: "Career Analytics",
    description: "Track your job search momentum with detailed analytics on applications, responses, and interview conversion rates.",
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description: "Your data stays yours. Enterprise-grade encryption, GDPR compliance, and transparent data handling.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm mb-6"
          >
            <Brain className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Enterprise-Grade Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading mb-4"
          >
            Everything You Need to{" "}
            <span className="text-accent">Land Your Dream Job</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading mx-auto"
          >
            A complete career operations platform designed to optimize employability, 
            accelerate job discovery, and automate your application process.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card-hover p-6 group bg-background"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary mb-4">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-card p-8 rounded-2xl bg-background"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "2.5M", label: "Resumes Optimized" },
              { value: "89%", label: "Interview Rate" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
