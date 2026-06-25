import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  BookmarkPlus, Briefcase, Building2, Calendar, DollarSign,
  FileText, Globe, Loader2, MapPin, Sparkles, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateEmployerJobDescription, getEmployerJobOptions, getJobTemplates,
  getSalaryBenchmark, saveJobTemplate,
} from "@/services/employerService";
import { JobPosting, JobStatus, JobTemplate, SalaryBenchmark } from "@/types/employer";

// ─── Schema ────────────────────────────────────────────────────────────────────
const jobSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  salary: z.string().optional().default(""),
  location: z.string().min(2, "Location is required"),
  city: z.string().optional().default(""),
  region: z.string().optional().default(""),
  country: z.string().optional().default(""),
  department: z.string().optional().default(""),
  employment_type: z.string().optional().default(""),
  workplace_type: z.string().optional().default(""),
  is_remote: z.enum(["yes", "no"]).default("no"),
  quick_apply_enabled: z.enum(["yes", "no"]).default("yes"),
  quick_apply_questions: z.string().optional().default(""),
  skills: z.string().min(2, "Add at least one skill"),
  deadline: z.string().optional().default(""),
  status: z.enum(["draft", "published", "closed"]),
});

type JobFormValues = z.infer<typeof jobSchema>;

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 md:col-span-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
        <Icon className="h-3.5 w-3.5 text-blue-600" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold text-gray-700">{children}</span>;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function JobFormDialog({
  open,
  onOpenChange,
  initialJob,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialJob?: JobPosting | null;
  loading: boolean;
  onSubmit: (values: JobFormValues) => Promise<void>;
}) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "", description: "", salary: "", location: "",
      city: "", region: "", country: "", department: "",
      employment_type: "", workplace_type: "",
      is_remote: "no", quick_apply_enabled: "yes",
      quick_apply_questions: "", skills: "", deadline: "", status: "published",
    },
  });

  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [employmentTypeOptions] = useState(["Full-time", "Part-time", "Contract", "Internship"]);
  const [workplaceTypeOptions] = useState(["On-site", "Hybrid", "Remote"]);
  const [suggestingDescription, setSuggestingDescription] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmark, setBenchmark] = useState<SalaryBenchmark | null>(null);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateInput, setShowTemplateInput] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadOptions = async () => {
      const options = await getEmployerJobOptions();
      setDepartmentOptions(options.departments);
      try {
        const templateList = await getJobTemplates();
        setTemplates(templateList);
      } catch { setTemplates([]); }
    };
    loadOptions();
    setBenchmark(null);
  }, [open]);

  useEffect(() => {
    if (initialJob) {
      form.reset({
        title: initialJob.title, description: initialJob.description,
        salary: initialJob.salary, location: initialJob.location,
        city: initialJob.city || "", region: initialJob.region || "",
        country: initialJob.country || "", department: initialJob.department || "",
        employment_type: initialJob.employment_type || "",
        workplace_type: initialJob.workplace_type || "",
        is_remote: initialJob.is_remote ? "yes" : "no",
        quick_apply_enabled: initialJob.quick_apply_enabled === false ? "no" : "yes",
        quick_apply_questions: (initialJob.quick_apply_questions || []).join("\n"),
        skills: initialJob.skills.join(", "),
        deadline: initialJob.deadline || "", status: initialJob.employer_status,
      });
      return;
    }
    form.reset({
      title: "", description: "", salary: "", location: "",
      city: "", region: "", country: "", department: "",
      employment_type: "", workplace_type: "",
      is_remote: "no", quick_apply_enabled: "yes",
      quick_apply_questions: "", skills: "", deadline: "", status: "published",
    });
  }, [form, initialJob, open]);

  const handleGenerateDescription = async () => {
    const values = form.getValues();
    if (values.title.trim().length < 3) {
      form.setError("title", { message: "Add a role title before generating AI content" });
      return;
    }
    try {
      setSuggestingDescription(true);
      const suggestion = await generateEmployerJobDescription({
        title: values.title.trim(), department: values.department,
        employment_type: values.employment_type, workplace_type: values.workplace_type,
        location: values.location, skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      form.setValue("description", suggestion.description, { shouldDirty: true, shouldValidate: true });
      const existing = values.skills.split(",").map(s => s.trim()).filter(Boolean);
      form.setValue("skills", Array.from(new Set([...existing, ...suggestion.suggested_skills])).join(", "), { shouldDirty: true, shouldValidate: true });
      toast.success("AI description generated.");
    } catch { toast.error("Unable to generate AI description right now."); }
    finally { setSuggestingDescription(false); }
  };

  const handleSalaryBenchmark = async () => {
    const values = form.getValues();
    if (values.title.trim().length < 3) { toast.error("Enter a job title first."); return; }
    try {
      setBenchmarking(true);
      const result = await getSalaryBenchmark({
        title: values.title.trim(), location: values.location.trim() || undefined,
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setBenchmark(result);
      if (result.formatted_range && !values.salary) form.setValue("salary", result.formatted_range, { shouldDirty: true });
      toast.success(`Salary benchmark: ${result.formatted_range}`);
    } catch { toast.error("Unable to fetch salary benchmark right now."); }
    finally { setBenchmarking(false); }
  };

  const handleLoadTemplate = (template: JobTemplate) => {
    form.reset({
      title: template.title, description: template.description, salary: template.salary,
      location: template.location, department: template.department || "",
      employment_type: template.employment_type || "", workplace_type: template.workplace_type || "",
      is_remote: "no", quick_apply_enabled: "yes", quick_apply_questions: "",
      skills: template.skills.join(", "), deadline: "", status: "published",
      city: "", region: "", country: "",
    });
    toast.success(`Loaded template: ${template.name}`);
  };

  const handleSaveAsTemplate = async () => {
    const name = templateName.trim();
    if (!name) { toast.error("Enter a template name."); return; }
    const values = form.getValues();
    try {
      setSavingTemplate(true);
      const template = await saveJobTemplate({
        name, title: values.title.trim(), description: values.description.trim(),
        salary: values.salary?.trim() || "", location: values.location.trim(),
        department: values.department?.trim(), employment_type: values.employment_type?.trim(),
        workplace_type: values.workplace_type?.trim(),
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setTemplates(c => [...c, template]);
      setShowTemplateInput(false);
      setTemplateName("");
      toast.success("Template saved.");
    } catch { toast.error("Unable to save template."); }
    finally { setSavingTemplate(false); }
  };

  const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors";
  const selectTriggerCls = "h-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-0 sm:max-w-3xl gap-0 [&>button]:hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-500/20">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                {initialJob ? "Edit Posting" : "New Posting"}
              </p>
              <h2 className="text-base font-black text-gray-900">
                {initialJob ? "Edit Job" : "Create Job Posting"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Template bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 bg-blue-50 border-b border-blue-100 px-6 py-3">
          <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-semibold text-blue-600 mr-1">Templates:</span>
          {templates.length > 0 ? (
            <Select onValueChange={(value) => {
              const template = templates.find(t => t.id === value);
              if (template) handleLoadTemplate(template);
            }}>
              <SelectTrigger className="h-8 w-auto min-w-[160px] rounded-lg border border-blue-200 bg-white text-xs text-gray-700 focus:ring-blue-500/20">
                <SelectValue placeholder="Load a template…" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-blue-400 italic">No templates yet</span>
          )}
          {showTemplateInput ? (
            <div className="flex items-center gap-2 ml-auto">
              <input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="h-8 w-36 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
              <button type="button" onClick={handleSaveAsTemplate} disabled={savingTemplate}
                className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors">
                {savingTemplate ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </button>
              <button type="button" onClick={() => setShowTemplateInput(false)}
                className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowTemplateInput(true)}
              className="ml-auto flex items-center gap-1.5 h-8 px-3 rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save as template
            </button>
          )}
        </div>

        {/* ── Form ────────────────────────────────────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 grid gap-4 md:grid-cols-2">

            {/* Section 1 — Basic Info */}
            <SectionHeader icon={Briefcase} label="Basic Information" />

            {/* Title (full width) */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel><FieldLabel>Job Title</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="e.g. Senior Product Designer" {...field} />
                </FormControl>
                <p className="text-xs text-gray-400">
                  💡 Type a title then click <span className="text-blue-600 font-semibold">AI Suggest</span> to auto-fill skills, description &amp; salary
                </p>
                <FormMessage />
              </FormItem>
            )} />

            {/* Skills (full width) */}
            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel><FieldLabel>Required Skills</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="React, Node.js, TypeScript (comma-separated)" {...field} />
                </FormControl>
                <p className="text-xs text-gray-400">Auto-tagged when you use AI Suggest</p>
                <FormMessage />
              </FormItem>
            )} />

            {/* Salary */}
            <FormField control={form.control} name="salary" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel><FieldLabel>Salary Range</FieldLabel></FormLabel>
                  <button type="button" onClick={handleSalaryBenchmark} disabled={benchmarking}
                    className="flex items-center gap-1 h-6 px-2 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
                    {benchmarking ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
                    Benchmark
                  </button>
                </div>
                <FormControl>
                  <input className={inputCls} placeholder="$95k – $120k" {...field} />
                </FormControl>
                {benchmark && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                    <p className="font-bold text-emerald-700">💰 {benchmark.formatted_range}</p>
                    <p className="text-gray-500 mt-0.5">
                      Median: ${benchmark.median_salary?.toLocaleString()} · Source: {benchmark.source || "AI estimate"}
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />

            {/* Status */}
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Status</FieldLabel></FormLabel>
                <Select value={field.value} onValueChange={v => field.onChange(v as JobStatus)}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Section 2 — Location */}
            <SectionHeader icon={MapPin} label="Location" />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel><FieldLabel>Full Location</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="Remote / San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>City</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="Bengaluru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="region" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Region / State</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="Karnataka" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Country</FieldLabel></FormLabel>
                <FormControl>
                  <input className={inputCls} placeholder="India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Section 3 — Job Details */}
            <SectionHeader icon={Globe} label="Job Details" />

            <FormField control={form.control} name="department" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Department</FieldLabel></FormLabel>
                <FormControl>
                  <input list="employer-job-department-options" className={inputCls} placeholder="Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="employment_type" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Employment Type</FieldLabel></FormLabel>
                <FormControl>
                  <input list="employer-job-employment-options" className={inputCls} placeholder="Full-time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="workplace_type" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Workplace Type</FieldLabel></FormLabel>
                <FormControl>
                  <input list="employer-job-workplace-options" className={inputCls} placeholder="Hybrid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="is_remote" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Remote Friendly</FieldLabel></FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="Remote option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Section 4 — Scheduling & Apply */}
            <SectionHeader icon={Calendar} label="Schedule & Apply" />

            <FormField control={form.control} name="deadline" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Application Deadline</FieldLabel></FormLabel>
                <FormControl>
                  <input type="date" className={inputCls} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="quick_apply_enabled" render={({ field }) => (
              <FormItem>
                <FormLabel><FieldLabel>Quick Apply Mode</FieldLabel></FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="Quick apply mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Enable existing auto apply</SelectItem>
                    <SelectItem value="no">Use employer quick apply form</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {form.watch("quick_apply_enabled") === "no" && (
              <FormField control={form.control} name="quick_apply_questions" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel><FieldLabel>Employer Quick Apply Questions</FieldLabel></FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={"One question per line:\nWhy are you a good fit?\nCurrent notice period?\nPortfolio or LinkedIn URL?"}
                      className="rounded-xl border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400">Leave empty if you only want candidates to attach a resume.</p>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {/* Section 5 — Description */}
            <SectionHeader icon={Building2} label="Job Description" />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <FormLabel><FieldLabel>Description</FieldLabel></FormLabel>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={loading || suggestingDescription}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {suggestingDescription
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Sparkles className="h-3 w-3" />}
                    AI Suggest
                  </button>
                </div>
                <FormControl>
                  <Textarea
                    rows={8}
                    placeholder="Describe responsibilities, required experience, impact, and expectations…"
                    className="rounded-xl border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── Footer buttons ─────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 md:col-span-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {initialJob ? "Save Changes" : "Publish Job"}
              </button>
            </div>

          </form>
        </Form>

        {/* datalists for browser autocomplete */}
        <datalist id="employer-job-department-options">
          {departmentOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <datalist id="employer-job-employment-options">
          {employmentTypeOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <datalist id="employer-job-workplace-options">
          {workplaceTypeOptions.map(o => <option key={o} value={o} />)}
        </datalist>

      </DialogContent>
    </Dialog>
  );
}
