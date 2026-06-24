import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Mail, Plus, Printer, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const statusStyle: Record<string, string> = {
  draft:    "bg-amber-50 text-amber-700 border-amber-200",
  sent:     "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
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

  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [customContent, setCustomContent] = useState("");

  const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  useEffect(() => {
    if (!user || !isEmployer) return;
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
      } finally { setLoading(false); }
    };
    load();
  }, [isEmployer, user]);

  const handleGenerate = async () => {
    if (!selectedCandidate) { toast.error("Select a candidate first."); return; }
    if (!salary.trim()) { toast.error("Enter a salary."); return; }
    if (!startDate) { toast.error("Select a start date."); return; }
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
    } catch { toast.error("Unable to generate offer letter."); }
    finally { setGenerating(false); }
  };

  const handleSend = async (offer: OfferLetter) => {
    try {
      setSending(offer.id);
      const updated = await sendOfferLetter(offer.id);
      setOffers((current) => current.map((o) => (o.id === updated.id ? updated : o)));
      toast.success("Offer letter sent to candidate.");
    } catch { toast.error("Unable to send offer letter."); }
    finally { setSending(""); }
  };

  const handlePrint = (offer: OfferLetter) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Offer Letter - ${offer.candidate_name}</title><style>body{font-family:'Georgia',serif;max-width:700px;margin:60px auto;padding:40px;line-height:1.8;color:#1a1a1a}h1{font-size:20px;border-bottom:2px solid #e5e5e5;padding-bottom:12px;margin-bottom:24px}.meta{font-size:13px;color:#666;margin-bottom:32px}.content{white-space:pre-wrap;font-size:15px}.footer{margin-top:48px;font-size:12px;color:#999;border-top:1px solid #e5e5e5;padding-top:16px}@media print{body{margin:20px}}</style></head><body><h1>Offer Letter</h1><div class="meta"><strong>Candidate:</strong> ${offer.candidate_name} (${offer.candidate_email})<br><strong>Position:</strong> ${offer.job_title}<br><strong>Salary:</strong> ${offer.salary}<br><strong>Start Date:</strong> ${offer.start_date}<br><strong>Status:</strong> ${offer.status}</div><div class="content">${offer.content}</div><div class="footer">Generated by Hizorex Employer Platform</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => { setSelectedCandidate(""); setSelectedTemplate(""); setSalary(""); setStartDate(""); setCustomContent(""); };

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

  if (loading) return <LoadingState label="Loading offer letters..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Offer Letters"
        title="Offer Letter Generator"
        description="Create professional offer letters from templates, preview them, and send directly to candidates."
        actions={(
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New offer letter
          </button>
        )}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Offers", value: offers.length,                                             color: "text-gray-900" },
          { label: "Sent",         value: offers.filter((o) => o.status === "sent").length,     color: "text-blue-600" },
          { label: "Accepted",     value: offers.filter((o) => o.status === "accepted").length, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Offer list */}
      {offers.length ? (
        <div className="space-y-3">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-gray-900">{offer.candidate_name}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle[offer.status] || ""}`}>
                        {offer.status}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      {offer.candidate_email}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Position: <span className="font-medium text-gray-700">{offer.job_title}</span></span>
                      <span>Salary: <span className="font-medium text-gray-700">{offer.salary}</span></span>
                      <span>Start: <span className="font-medium text-gray-700">{offer.start_date}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOffer(offer)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrint(offer)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" /> PDF
                    </button>
                    {offer.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => handleSend(offer)}
                        disabled={sending === offer.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {sending === offer.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Send
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Created {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : "recently"}
                  {offer.sent_at ? ` · Sent ${new Date(offer.sent_at).toLocaleDateString()}` : ""}
                </p>
              </div>
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
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-gray-200 bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Generate Offer Letter</DialogTitle>
            <DialogDescription className="text-gray-500">
              Select a candidate, choose a template, and customize the offer details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Candidate</label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 rounded-xl">
                  <SelectValue placeholder="Choose a candidate in offer stage" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.job_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Template (optional)</label>
              <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 rounded-xl">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Salary</label>
                <input aria-label="Salary" className={inputCls} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="$120,000/year" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start date</label>
                <input aria-label="Start date" type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Letter content</label>
              <Textarea
                rows={12}
                value={customContent || defaultTemplate}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write or edit the offer letter content..."
                className="font-mono text-sm bg-white border-gray-200 text-gray-900"
              />
              <p className="text-xs text-gray-400">
                Use placeholders: {"{{candidate_name}}"}, {"{{job_title}}"}, {"{{salary}}"}, {"{{start_date}}"}, {"{{company_name}}"}, {"{{employer_name}}"}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate offer letter
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewOffer} onOpenChange={(open) => { if (!open) setPreviewOffer(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-gray-200 bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Offer Letter Preview</DialogTitle>
            <DialogDescription className="text-gray-500">
              {previewOffer?.candidate_name} — {previewOffer?.job_title}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="mb-6 space-y-2 text-sm border-b border-gray-200 pb-4">
              {[
                ["Candidate", previewOffer?.candidate_name],
                ["Email",     previewOffer?.candidate_email],
                ["Position",  previewOffer?.job_title],
                ["Salary",    previewOffer?.salary],
                ["Start date",previewOffer?.start_date],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-400 shrink-0">{k}</span>
                  <span className="font-semibold text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{previewOffer?.content}</div>
          </div>
          <div className="flex justify-end gap-3">
            {previewOffer ? (
              <>
                <button type="button" onClick={() => handlePrint(previewOffer)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 transition-colors">
                  <Printer className="h-4 w-4" /> Print / PDF
                </button>
                {previewOffer.status === "draft" ? (
                  <button type="button" onClick={() => { handleSend(previewOffer); setPreviewOffer(null); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors shadow-sm">
                    <Send className="h-4 w-4" /> Send to candidate
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
