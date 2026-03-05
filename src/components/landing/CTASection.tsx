import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "No credit card required",
  "14-day free trial",
  "Cancel anytime",
  "Full feature access",
];

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your{" "}
            <span className="text-accent">Career Journey?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have accelerated their job search 
            and landed their dream roles with CareerAI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                Explore Platform
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
