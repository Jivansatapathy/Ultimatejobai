import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BookmarkPlus, DollarSign, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmployerJobDescription, getEmployerJobOptions, getJobTemplates, getSalaryBenchmark, saveJobTemplate } from "@/services/employerService";
import { JobPosting, JobStatus, JobTemplate, SalaryBenchmark } from "@/types/employer";

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
      title: "",
      description: "",
      salary: "",
      location: "",
      city: "",
      region: "",
      country: "",
      department: "",
      employment_type: "",
      workplace_type: "",
      is_remote: "no",
      quick_apply_enabled: "yes",
      quick_apply_questions: "",
      skills: "",
      deadline: "",
      status: "published",
    },
  });
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState<string[]>([]);
  const [workplaceTypeOptions, setWorkplaceTypeOptions] = useState<string[]>([]);
  const [suggestingDescription, setSuggestingDescription] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmark, setBenchmark] = useState<SalaryBenchmark | null>(null);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateInput, setShowTemplateInput] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const loadOptions = async () => {
      const options = await getEmployerJobOptions();
      setDepartmentOptions(options.departments);
      setEmploymentTypeOptions(["Full-time", "Part-time", "Contract", "Internship"]);
      setWorkplaceTypeOptions(["On-site", "Hybrid", "Remote"]);

      // Load templates
      try {
        const templateList = await getJobTemplates();
        setTemplates(templateList);
      } catch {
        setTemplates([]);
      }
    };
    loadOptions();
    setBenchmark(null);
  }, [open]);

  useEffect(() => {
    if (initialJob) {
      form.reset({
        title: initialJob.title,
        description: initialJob.description,
        salary: initialJob.salary,
        location: initialJob.location,
        city: initialJob.city || "",
        region: initialJob.region || "",
        country: initialJob.country || "",
        department: initialJob.department || "",
        employment_type: initialJob.employment_type || "",
        workplace_type: initialJob.workplace_type || "",
        is_remote: initialJob.is_remote ? "yes" : "no",
        quick_apply_enabled: initialJob.quick_apply_enabled === false ? "no" : "yes",
        quick_apply_questions: (initialJob.quick_apply_questions || []).join("\n"),
        skills: initialJob.skills.join(", "),
        deadline: initialJob.deadline || "",
        status: initialJob.employer_status,
      });
      return;
    }
    form.reset({
      title: "",
      description: "",
      salary: "",
      location: "",
      city: "",
      region: "",
      country: "",
      department: "",
      employment_type: "",
      workplace_type: "",
      is_remote: "no",
      quick_apply_enabled: "yes",
      quick_apply_questions: "",
      skills: "",
      deadline: "",
      status: "published",
    });
  }, [form, initialJob, open]);

  const handleGenerateDescription = async () => {
    const values = form.getValues();
    const title = values.title.trim();
    if (title.length < 3) {
      form.setError("title", { message: "Add a role title before generating AI content" });
      return;
    }

    try {
      setSuggestingDescription(true);
      const suggestion = await generateEmployerJobDescription({
        title,
        department: values.department,
        employment_type: values.employment_type,
        workplace_type: values.workplace_type,
        location: values.location,
        skills: values.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      form.setValue("description", suggestion.description, { shouldDirty: true, shouldValidate: true });
      const existingSkills = values.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
      const mergedSkills = Array.from(new Set([...existingSkills, ...suggestion.suggested_skills])).join(", ");
      form.setValue("skills", mergedSkills, { shouldDirty: true, shouldValidate: true });
      toast.success("AI job description generated with auto-tagged skills.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to generate AI description right now.");
    } finally {
      setSuggestingDescription(false);
    }
  };

  const handleSalaryBenchmark = async () => {
    const values = form.getValues();
    const title = values.title.trim();
    if (title.length < 3) {
      toast.error("Enter a job title first to get salary benchmarks.");
      return;
    }
    try {
      setBenchmarking(true);
      const result = await getSalaryBenchmark({
        title,
        location: values.location.trim() || undefined,
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setBenchmark(result);
      if (result.formatted_range && !values.salary) {
        form.setValue("salary", result.formatted_range, { shouldDirty: true });
      }
      toast.success(`Salary benchmark: ${result.formatted_range}`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch salary benchmark right now.");
    } finally {
      setBenchmarking(false);
    }
  };

  const handleLoadTemplate = (template: JobTemplate) => {
    form.reset({
      title: template.title,
      description: template.description,
      salary: template.salary,
      location: template.location,
      department: template.department || "",
      employment_type: template.employment_type || "",
      workplace_type: template.workplace_type || "",
      is_remote: "no",
      quick_apply_enabled: "yes",
      quick_apply_questions: "",
      skills: template.skills.join(", "),
      deadline: "",
      status: "published",
      city: "",
      region: "",
      country: "",
    });
    toast.success(`Loaded template: ${template.name}`);
  };

  const handleSaveAsTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      toast.error("Enter a template name.");
      return;
    }
    const values = form.getValues();
    try {
      setSavingTemplate(true);
      const template = await saveJobTemplate({
        name,
        title: values.title.trim(),
        description: values.description.trim(),
        salary: values.salary?.trim() || "",
        location: values.location.trim(),
        department: values.department?.trim(),
        employment_type: values.employment_type?.trim(),
        workplace_type: values.workplace_type?.trim(),
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setTemplates((current) => [...current, template]);
      setShowTemplateInput(false);
      setTemplateName("");
      toast.success("Job template saved for reuse.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-border/70 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialJob ? "Edit Job" : "Create Job Posting"}</DialogTitle>
          <DialogDescription>
            Add hiring details, validate inputs, and save updates directly through the Django employer API.
          </DialogDescription>
        </DialogHeader>

        {/* Template bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/50 p-3">
          {templates.length ? (
            <Select onValueChange={(value) => {
              const template = templates.find((t) => t.id === value);
              if (template) handleLoadTemplate(template);
            }}>
              <SelectTrigger className="h-9 w-auto min-w-[180px] rounded-xl">
                <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Load from template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground">No saved templates yet</span>
          )}
          {showTemplateInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="h-9 w-40 rounded-xl text-sm"
              />
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleSaveAsTemplate} disabled={savingTemplate}>
                {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowTemplateInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="rounded-xl gap-1.5" onClick={() => setShowTemplateInput(true)}>
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save as template
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Product Designer" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    💡 Type a role like "React Developer" then click AI Suggest to auto-fill skills, description &amp; salary
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Salary</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 rounded-lg text-xs"
                      onClick={handleSalaryBenchmark}
                      disabled={benchmarking}
                    >
                      {benchmarking ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
                      Benchmark
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder="$95k - $120k" {...field} />
                  </FormControl>
                  {benchmark ? (
                    <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs">
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">
                        💰 {benchmark.formatted_range}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        Median: ${benchmark.median_salary?.toLocaleString()} • Source: {benchmark.source || "AI estimate"}
                      </p>
                    </div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Remote / San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Bengaluru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region / State</FormLabel>
                  <FormControl>
                    <Input placeholder="Karnataka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value as JobStatus)}>
                    <FormControl>
                      <SelectTrigger>
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
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input list="employer-job-department-options" placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment type</FormLabel>
                  <FormControl>
                    <Input list="employer-job-employment-options" placeholder="Full-time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workplace_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace type</FormLabel>
                  <FormControl>
                    <Input list="employer-job-workplace-options" placeholder="Hybrid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quick_apply_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quick apply mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose quick apply mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Enable existing auto apply</SelectItem>
                      <SelectItem value="no">Use employer quick apply form</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_remote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remote friendly</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose remote option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("quick_apply_enabled") === "no" ? (
              <FormField
                control={form.control}
                name="quick_apply_questions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Employer quick apply questions</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={"Add one question per line.\nWhy are you a good fit?\nCurrent notice period?\nPortfolio or LinkedIn URL?"}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Leave this empty if you only want seekers to choose or upload a resume before applying.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="React, Firebase, Tailwind CSS" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Auto-tagged when you use AI Suggest</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleGenerateDescription} disabled={loading || suggestingDescription}>
                      {suggestingDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      AI Suggest
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea rows={7} placeholder="Describe responsibilities, impact, and expectations..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {initialJob ? "Save changes" : "Publish job"}
              </Button>
            </div>
          </form>
        </Form>
        <datalist id="employer-job-department-options">
          {departmentOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="employer-job-employment-options">
          {employmentTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="employer-job-workplace-options">
          {workplaceTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </DialogContent>
    </Dialog>
  );
}
