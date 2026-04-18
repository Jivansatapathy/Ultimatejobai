import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Building2
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const features = [
  "AI-powered resume optimization",
  "Smart job matching algorithms",
  "Automated application tracking",
  "Enterprise-grade security",
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  const [formData, setFormData] = useState({
    name: "",
    email: !isSignUp && isLocalhost ? "admin@jobai.local" : "",
    password: !isSignUp && isLocalhost ? "AdminJobAI2026!" : "",
  });

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let firebaseUser;
      if (isSignUp) {
        // Sign Up with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUser = userCredential.user;
        await updateProfile(firebaseUser, { displayName: formData.name });
        toast.success("Account created successfully!");
      } else {
        // Sign In with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUser = userCredential.user;
      }

      // Exchange Firebase ID Token for Backend JWT
      const token = await firebaseUser.getIdToken();
      const response = await api.post("/api/auth/firebase-login/", { token });

      const { access, refresh, is_new_user, is_admin } = response.data;
      login(access, refresh, is_admin, response.data.email || formData.email);
      
      if (!isSignUp) toast.success("Welcome back!");

      if (is_new_user) {
        navigate("/plans?select=1&welcome=1");
      } else {
        const savedResumes = localStorage.getItem('resumes');
        if (!savedResumes || JSON.parse(savedResumes).length === 0) {
          navigate("/resume");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error(`${isSignUp ? "Sign up" : "Login"} failed:`, error);
      let errorMsg = "An error occurred. Please try again.";

      if (typeof error?.code === "string") {
        switch (error.code) {
          case "auth/network-request-failed":
            errorMsg = "Authentication network error. Check your internet connection and disable ad-blocking/privacy extensions for localhost.";
            break;
          case "auth/email-already-in-use":
            errorMsg = "This email is already registered. Try logging in instead.";
            break;
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMsg = "Invalid email or password.";
            break;
          case "auth/weak-password":
            errorMsg = "Password is too weak. Use at least 6 characters.";
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          default:
            errorMsg = error.message || errorMsg;
        }
      } else if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object') {
          // Flatten field-specific errors (e.g., { email: ["already exists"], username: ["too short"] })
          const fields = Object.keys(data);
          if (fields.length > 0) {
            const firstField = fields[0];
            const content = data[firstField];
            errorMsg = Array.isArray(content) ? `${firstField}: ${content[0]}` : `${firstField}: ${content}`;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              Career<span className="text-accent">AI</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Start your AI-powered career journey today"
                : "Sign in to access your career dashboard"}
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isSignUp ? "Signing up as an employer?" : "Need employer access?"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use the employer workspace to post jobs, manage candidates, and stay inside the hiring console.
                  </p>
                </div>
                <Link to={`/employer/auth${isSignUp ? "" : ""}`}>
                  <Button type="button" variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                    <Building2 className="h-4 w-4" />
                    {isSignUp ? "Employer Signup" : "Employer Login"}
                  </Button>
                </Link>
              </div>
            </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                      required
                    />
                  </div>
                </div>

              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border bg-secondary text-accent focus:ring-accent/50" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm text-accent hover:underline">Forgot password?</a>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-secondary relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <h2 className="text-3xl font-bold mb-4">
            Accelerate Your{" "}
            <span className="text-accent">Career Growth</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of professionals who have transformed their job search
            with our AI-powered career intelligence platform.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-1 rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <span className="text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 glass-card p-6 bg-background">
            <p className="text-sm text-muted-foreground italic mb-4">
              "CareerAI helped me land my dream job at a top tech company.
              The ATS optimization alone increased my callback rate by 300%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary" />
              <div>
                <p className="font-medium text-sm">Sarah Chen</p>
                <p className="text-xs text-muted-foreground">Senior Engineer at Meta</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
