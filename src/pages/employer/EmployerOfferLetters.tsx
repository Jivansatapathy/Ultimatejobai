import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Mail, Plus, Printer, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import {
  generateOfferLetter,
  getEmployerCandidates,
  getOfferLetters,
  getOfferTemplates,
  sendOfferLetter,
} from "@/services/employerService";
import { CandidateApplication, OfferLetter, OfferTemplate } from "@/types/employer";

const statusColors: Record<string, string> = {
  draft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  sent: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const defaultTemplate = `Dear {{candidate_name}},

We are pleased to offer you the position of {{job_title}} at {{company_name}}.

Compensation: {{salary}}
Start Date: {{start_date}}

This offer is contingent upon the completion of any pre-employment requirements. Please confirm your acceptance by responding to this letter within 7 business days.

We are excited about the possibility of you joining our team and look forward to working with you.

Best regards,
{{employer_name}}
{{company_name}}`;

export default function EmployerOfferLetters() {
  const { user, isEmployer, profile } = useEmployerAuth();
  const [offers, setOffers] = useState<OfferLetter[]>([]);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<OfferLetter | null>(null);

  // form state
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [customContent, setCustomContent] = useState("");

  useEffect(() => {
    if (!user || !isEmployer) {
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [offerList, templateList, candidateList] = await Promise.all([
          getOfferLetters().catch(() => []),
          getOfferTemplates().catch(() => []),
          getEmployerCandidates({ status: "offer" }).catch(() => []),
        ]);
        setOffers(offerList);
        setTemplates(templateList);
        setCandidates(candidateList);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEmployer, user]);

  const handleGenerate = async () => {
    if (!selectedCandidate) {
      toast.error("Select a candidate first.");
      return;
    }
    if (!salary.trim()) {
      toast.error("Enter a salary.");
      return;
    }
    if (!startDate) {
      toast.error("Select a start date.");
      return;
    }
    try {
      setGenerating(true);
      const offer = await generateOfferLetter({
        application_id: selectedCandidate,
        template_id: selectedTemplate || undefined,
        salary: salary.trim(),
        start_date: startDate,
        custom_content: customContent.trim() || undefined,
      });
      setOffers((current) => [offer, ...current]);
      setDialogOpen(false);
      resetForm();
      toast.success("Offer letter generated.");
    } catch {
      toast.error("Unable to generate offer letter.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (offer: OfferLetter) => {
    try {
      setSending(offer.id);
      const updated = await sendOfferLetter(offer.id);
      setOffers((current) => current.map((o) => (o.id === updated.id ? updated : o)));
      toast.success("Offer letter sent to candidate.");
    } catch {
      toast.error("Unable to send offer letter.");
    } finally {
      setSending("");
    }
  };

  const handlePrint = (offer: OfferLetter) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offer Letter - ${offer.candidate_name}</title>
          <style>
            body { font-family: 'Georgia', serif; max-width: 700px; margin: 60px auto; padding: 40px; line-height: 1.8; color: #1a1a1a; }
            h1 { font-size: 20px; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 24px; }
            .meta { font-size: 13px; color: #666; margin-bottom: 32px; }
            .content { white-space: pre-wrap; font-size: 15px; }
            .footer { margin-top: 48px; font-size: 12px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 16px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>Offer Letter</h1>
          <div class="meta">
            <strong>Candidate:</strong> ${offer.candidate_name} (${offer.candidate_email})<br>
            <strong>Position:</strong> ${offer.job_title}<br>
            <strong>Salary:</strong> ${offer.salary}<br>
            <strong>Start Date:</strong> ${offer.start_date}<br>
            <strong>Status:</strong> ${offer.status}
          </div>
          <div class="content">${offer.content}</div>
          <div class="footer">Generated by UltimateJobAI Employer Platform</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setSelectedCandidate("");
    setSelectedTemplate("");
    setSalary("");
    setStartDate("");
    setCustomContent("");
  };

  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      let content = template.content;
      content = content.replace("{{company_name}}", profile?.company_name || "");
      content = content.replace("{{employer_name}}", profile?.full_name || "");
      setCustomContent(content);
    }
  };

  if (loading) {
    return <LoadingState label="Loading offer letters..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Offer Letters"
        title="Offer Letter Generator"
        description="Create professional offer letters from templates, preview them, and send directly to candidates."
        actions={(
          <Button className="rounded-2xl" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New offer letter
          </Button>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total Offers</p>
            <p className="mt-2 text-3xl font-bold">{offers.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sent</p>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {offers.filter((o) => o.status === "sent").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Accepted</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {offers.filter((o) => o.status === "accepted").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Offer letter list */}
      {offers.length ? (
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="rounded-3xl border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{offer.candidate_name}</h3>
                        <Badge className={`rounded-full capitalize ${statusColors[offer.status] || ""}`}>
                          {offer.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Mail className="mr-1 inline h-3.5 w-3.5" />
                        {offer.candidate_email}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Position: {offer.job_title}</span>
                        <span>Salary: {offer.salary}</span>
                        <span>Start: {offer.start_date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setPreviewOffer(offer)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handlePrint(offer)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      {offer.status === "draft" ? (
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleSend(offer)}
                          disabled={sending === offer.id}
                        >
                          {sending === offer.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Created {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : "recently"}
                    {offer.sent_at ? ` • Sent ${new Date(offer.sent_at).toLocaleDateString()}` : ""}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No offer letters"
          description="Generate offer letters for candidates in the offer stage from here."
        />
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-border/70 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Offer Letter</DialogTitle>
            <DialogDescription>
              Select a candidate, choose a template, and customize the offer details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Candidate</label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a candidate in offer stage" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Salary</label>
                <Input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="$120,000/year"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Letter content</label>
              <Textarea
                rows={12}
                value={customContent || defaultTemplate}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write or edit the offer letter content..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use placeholders: {"{{candidate_name}}"}, {"{{job_title}}"}, {"{{salary}}"}, {"{{start_date}}"}, {"{{company_name}}"}, {"{{employer_name}}"}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate offer letter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewOffer} onOpenChange={(open) => { if (!open) setPreviewOffer(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-border/70 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offer Letter Preview</DialogTitle>
            <DialogDescription>
              {previewOffer?.candidate_name} — {previewOffer?.job_title}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border/70 bg-background p-6">
            <div className="mb-6 grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Candidate</span><span className="font-medium">{previewOffer?.candidate_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{previewOffer?.candidate_email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span className="font-medium">{previewOffer?.job_title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span className="font-medium">{previewOffer?.salary}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start date</span><span className="font-medium">{previewOffer?.start_date}</span></div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7">
              {previewOffer?.content}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            {previewOffer ? (
              <>
                <Button variant="outline" className="rounded-2xl" onClick={() => handlePrint(previewOffer)}>
                  <Printer className="h-4 w-4" />
                  Print / PDF
                </Button>
                {previewOffer.status === "draft" ? (
                  <Button className="rounded-2xl" onClick={() => { handleSend(previewOffer); setPreviewOffer(null); }}>
                    <Send className="h-4 w-4" />
                    Send to candidate
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
