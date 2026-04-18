import { useState, useRef } from "react";
import { useResume } from "@/hooks/useResume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, GripVertical, X } from "lucide-react";

// Reusable bullet-point editor — renders each point as its own input row
function BulletPointEditor({
    points,
    onChange,
    placeholder = "Add a bullet point..."
}: {
    points: string[];
    onChange: (points: string[]) => void;
    placeholder?: string;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const updatePoint = (idx: number, value: string) => {
        const next = [...points];
        next[idx] = value;
        onChange(next);
    };

    const addPoint = () => {
        onChange([...points, ""]);
        // focus new input on next render
        setTimeout(() => {
            inputRefs.current[points.length]?.focus();
        }, 30);
    };

    const removePoint = (idx: number) => {
        onChange(points.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addPoint();
        } else if (e.key === "Backspace" && points[idx] === "" && points.length > 1) {
            e.preventDefault();
            removePoint(idx);
            setTimeout(() => inputRefs.current[idx - 1]?.focus(), 30);
        }
    };

    return (
        <div className="space-y-1.5">
            {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-muted-foreground text-sm select-none w-4 text-center flex-shrink-0">•</span>
                    <Input
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        value={pt}
                        onChange={(e) => updatePoint(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        placeholder={placeholder}
                        className="flex-1 h-8 text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => removePoint(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground pl-1"
                onClick={addPoint}
            >
                <Plus className="h-3 w-3" />
                Add Point
            </Button>
        </div>
    );
}

export function ResumeForm() {
    const {
        activeResume,
        updatePersonalDetails,
        updateSummary,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        updateSkills,
        updateSoftSkills,
        addProject,
        updateProject,
        deleteProject,
        addCertification,
        updateCertification,
        deleteCertification,
        addExtracurricular,
        updateExtracurricular,
        deleteExtracurricular,
        updateTargetJobRole,
        updateTargetJobDescription,
        optimizeWithAI,
        analyzeFileATS
    } = useResume();

    const [newSkill, setNewSkill] = useState("");
    const [newSoftSkill, setNewSoftSkill] = useState("");
    const [isOptimizing, setIsOptimizing] = useState(false);

    if (!activeResume) return null;

    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            await optimizeWithAI();
        } catch (error) {
            console.error("Optimization failed:", error);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePersonalDetails({
            ...activeResume.personalDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            updateSkills([...activeResume.skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const handleAddSoftSkill = () => {
        if (newSoftSkill.trim()) {
            updateSoftSkills([...activeResume.softSkills, newSoftSkill.trim()]);
            setNewSoftSkill("");
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Resume Editor Pro</h2>
                    <p className="text-sm text-muted-foreground">Upgraded with Hybrid AI Intelligence.</p>
                </div>
            </div>

            <Accordion type="multiple" defaultValue={["personal", "summary", "experience", "education", "skills", "projects"]} className="w-full">

                {/* Personal Details */}
                <AccordionItem value="personal">
                    <AccordionTrigger>Personal Details</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={activeResume.personalDetails.fullName}
                                    onChange={handlePersonalChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={activeResume.personalDetails.email}
                                    onChange={handlePersonalChange}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={activeResume.personalDetails.phone}
                                    onChange={handlePersonalChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={activeResume.personalDetails.location}
                                    onChange={handlePersonalChange}
                                    placeholder="New York, NY"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                                <Input
                                    id="linkedinUrl"
                                    name="linkedinUrl"
                                    value={activeResume.personalDetails.linkedinUrl || ""}
                                    onChange={handlePersonalChange}
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                                <Input
                                    id="portfolioUrl"
                                    name="portfolioUrl"
                                    value={activeResume.personalDetails.portfolioUrl || ""}
                                    onChange={handlePersonalChange}
                                    placeholder="johndoe.com"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Summary */}
                <AccordionItem value="summary">
                    <AccordionTrigger>Professional Summary</AccordionTrigger>
                    <AccordionContent>
                        <Textarea
                            value={activeResume.summary}
                            onChange={(e) => updateSummary(e.target.value)}
                            placeholder="Briefly describe your professional background and goals..."
                            className="h-32"
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Experience */}
                <AccordionItem value="experience">
                    <AccordionTrigger>Experience</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {activeResume.experience.map((exp) => (
                            <div key={exp.id} className="p-4 border rounded-lg space-y-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteExperience(exp.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Input
                                            value={exp.role}
                                            onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                                            placeholder="Senior Software Engineer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                            placeholder="Tech Corp"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Duration</Label>
                                        <Input
                                            value={exp.duration}
                                            onChange={(e) => updateExperience(exp.id, { duration: e.target.value })}
                                            placeholder="Jan 2020 - Present"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <BulletPointEditor
                                        points={Array.isArray(exp.description) && exp.description.length > 0 ? exp.description : [""]}
                                        onChange={(pts) => updateExperience(exp.id, { description: pts })}
                                        placeholder="e.g. Led a team of 5 to deliver..." 
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => addExperience({
                                role: "",
                                company: "",
                                duration: "",
                                description: []
                            })}
                        >
                            <Plus className="h-4 w-4" /> Add Experience
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                {/* Education */}
                <AccordionItem value="education">
                    <AccordionTrigger>Education</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {activeResume.education.map((edu) => (
                            <div key={edu.id} className="p-4 border rounded-lg space-y-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteEducation(edu.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>School</Label>
                                        <Input
                                            value={edu.school}
                                            onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                                            placeholder="University of Technology"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Degree</Label>
                                        <Input
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                            placeholder="B.S. in Computer Science"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Year</Label>
                                        <Input
                                            value={edu.year}
                                            onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                                            placeholder="2020"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => addEducation({
                                school: "",
                                degree: "",
                                year: ""
                            })}
                        >
                            <Plus className="h-4 w-4" /> Add Education
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                {/* Skills */}
                <AccordionItem value="skills">
                    <AccordionTrigger>Hard Skills</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                                    placeholder="Add a hard skill (e.g. React.js, Python)"
                                />
                                <Button onClick={handleAddSkill}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(activeResume.skills) && activeResume.skills.map((skill, index) => (
                                    <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {skill}
                                        <button onClick={() => updateSkills(activeResume.skills.filter(s => s !== skill))} className="hover:text-destructive">
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Soft Skills */}
                <AccordionItem value="softSkills">
                    <AccordionTrigger>Soft Skills</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newSoftSkill}
                                    onChange={(e) => setNewSoftSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSoftSkill()}
                                    placeholder="Add a soft skill (e.g. Leadership, Communication)"
                                />
                                <Button onClick={handleAddSoftSkill}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(activeResume.softSkills) && activeResume.softSkills.map((skill, index) => (
                                    <div key={index} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {skill}
                                        <button onClick={() => updateSoftSkills(activeResume.softSkills.filter(s => s !== skill))} className="hover:text-destructive">
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Projects */}
                <AccordionItem value="projects">
                    <AccordionTrigger>Projects</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {activeResume.projects.map((proj) => (
                            <div key={proj.id} className="p-4 border rounded-lg space-y-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteProject(proj.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Project Title</Label>
                                        <Input
                                            value={proj.title}
                                            onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                                            placeholder="AI Resume Builder"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL (Optional)</Label>
                                        <Input
                                            value={proj.link || ""}
                                            onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <BulletPointEditor
                                        points={Array.isArray(proj.description) && proj.description.length > 0 ? proj.description : [""]}
                                        onChange={(pts) => updateProject(proj.id, { description: pts })}
                                        placeholder="e.g. Built with React and Node.js..."
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => addProject({
                                title: "",
                                link: "",
                                description: []
                            })}
                        >
                            <Plus className="h-4 w-4" /> Add Project
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                {/* Certifications */}
                <AccordionItem value="certifications">
                    <AccordionTrigger>Certifications</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {activeResume.certifications.map((cert) => (
                            <div key={cert.id} className="p-4 border rounded-lg space-y-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteCertification(cert.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Certification Name</Label>
                                        <Input
                                            value={cert.name}
                                            onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                                            placeholder="AWS Certified Solutions Architect"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Issuer</Label>
                                        <Input
                                            value={cert.issuer}
                                            onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                                            placeholder="Amazon Web Services"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Year</Label>
                                        <Input
                                            value={cert.year}
                                            onChange={(e) => updateCertification(cert.id, { year: e.target.value })}
                                            placeholder="2023"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => addCertification({
                                name: "",
                                issuer: "",
                                year: ""
                            })}
                        >
                            <Plus className="h-4 w-4" /> Add Certification
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                {/* Extracurriculars */}
                <AccordionItem value="extracurriculars">
                    <AccordionTrigger>Extracurricular Activities</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {activeResume.extracurricularActivities.map((act) => (
                            <div key={act.id} className="p-4 border rounded-lg space-y-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteExtracurricular(act.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Input
                                            value={act.role}
                                            onChange={(e) => updateExtracurricular(act.id, { role: e.target.value })}
                                            placeholder="Volunteer Mentor"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Organization</Label>
                                        <Input
                                            value={act.organization}
                                            onChange={(e) => updateExtracurricular(act.id, { organization: e.target.value })}
                                            placeholder="Code for Good"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Duration</Label>
                                        <Input
                                            value={act.duration}
                                            onChange={(e) => updateExtracurricular(act.id, { duration: e.target.value })}
                                            placeholder="2021 - Present"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <BulletPointEditor
                                        points={Array.isArray(act.description) && act.description.length > 0 ? act.description : [""]}
                                        onChange={(pts) => updateExtracurricular(act.id, { description: pts })}
                                        placeholder="e.g. Mentored 10+ students in web development..."
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => addExtracurricular({
                                role: "",
                                organization: "",
                                duration: "",
                                description: []
                            })}
                        >
                            <Plus className="h-4 w-4" /> Add Activity
                        </Button>
                    </AccordionContent>
                </AccordionItem>


            </Accordion>
        </div>
    );
}
