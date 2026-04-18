import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSidebarProps {
    onSelectRole: (role: string) => void;
    selectedRole?: string;
}

const roleCategories = [
    {
        title: "Executive Roles",
        icon: <Star className="h-4 w-4 text-accent" />,
        roles: ["CEO", "CMO", "CFO", "CTO", "COO", "VP of Engineering", "Director"]
    },
    {
        title: "Entry Level",
        icon: <GraduationCap className="h-4 w-4 text-accent" />,
        roles: ["Junior Developer", "Intern", "Associate", "Graduate Trainee"]
    }
];

export function JobSidebar({ onSelectRole, selectedRole }: JobSidebarProps) {
    return (
        <div className="w-full lg:w-64 space-y-6">
            {roleCategories.map((category, idx) => (
                <motion.div
                    key={category.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="glass-card p-4"
                >
                    <div className="flex items-center gap-2 mb-4">
                        {category.icon}
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            {category.title}
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {category.roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => onSelectRole(role)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedRole === role
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span>{role}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${selectedRole === role ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                    }`} />
                            </button>
                        ))}
                    </div>
                </motion.div>
            ))}

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-4 bg-accent/5 border-accent/20"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-accent" />
                    <h3 className="font-semibold text-sm">Career Growth</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    AI analyzes your profile to match you with roles that accelerate your career trajectory.
                </p>
            </motion.div>
        </div>
    );
}
