import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Check, Download, FileText, Loader2, MessageSquare, Search, X } from "lucide-react";
import { toast } from "sonner";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { useAuth } from "@/context/AuthContext";
import { subscribeCandidateConversations } from "@/services/chatService";
import { getOfferLetterForApplication, respondToOfferLetter } from "@/services/employerService";
import type { FirestoreConversation } from "@/types/chat";
import type { OfferLetter } from "@/types/employer";

const offerStatusStyle: Record<string, string> = {
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString() === new Date().toLocaleDateString()
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString();
}

export default function CandidateInbox() {
  const { userEmail } = useAuth();
  const [conversations, setConversations] = useState<FirestoreConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [offer, setOffer] = useState<OfferLetter | null>(null);
  const [respondingAction, setRespondingAction] = useState<"accept" | "decline" | null>(null);

  useEffect(() => {
    const email = (userEmail || "").toLowerCase();
    if (!email) { setLoading(false); return; }
    const unsubscribe = subscribeCandidateConversations(email, (items) => {
      setConversations(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userEmail]);

  useEffect(() => {
    if (!selectedId) { setOffer(null); return; }
    let active = true;
    getOfferLetterForApplication(selectedId)
      .then((result) => { if (active) setOffer(result); })
      .catch(() => { if (active) setOffer(null); });
    return () => { active = false; };
  }, [selectedId]);

  const handleDownloadOffer = () => {
    if (!offer) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const doc = printWindow.document;
    doc.title = `Offer Letter - ${offer.candidate_name}`;

    const style = doc.createElement("style");
    // Values below come from a trusted stylesheet string, not user input.
    style.textContent = `
      body { font-family: 'Georgia', serif; max-width: 700px; margin: 60px auto; padding: 40px; line-height: 1.8; color: #1a1a1a; }
      h1 { font-size: 20px; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 24px; }
      .meta { font-size: 13px; color: #666; margin-bottom: 32px; }
      .meta div { margin-bottom: 4px; }
      .content { white-space: pre-wrap; font-size: 15px; }
      .footer { margin-top: 48px; font-size: 12px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 16px; }
      @media print { body { margin: 20px; } }
    `;
    doc.head.appendChild(style);

    const h1 = doc.createElement("h1");
    h1.textContent = "Offer Letter";

    const meta = doc.createElement("div");
    meta.className = "meta";
    // Built with textContent (not innerHTML) so the employer-authored offer
    // text can never be parsed as markup in the candidate's browser.
    [
      ["Candidate", `${offer.candidate_name} (${offer.candidate_email})`],
      ["Position", offer.job_title],
      ["Salary", offer.salary],
      ["Start Date", offer.start_date],
      ["Status", offer.status],
    ].forEach(([label, value]) => {
      const row = doc.createElement("div");
      const strong = doc.createElement("strong");
      strong.textContent = `${label}: `;
      row.appendChild(strong);
      row.appendChild(doc.createTextNode(value));
      meta.appendChild(row);
    });

    const content = doc.createElement("div");
    content.className = "content";
    content.textContent = offer.content;

    const footer = doc.createElement("div");
    footer.className = "footer";
    footer.textContent = "Downloaded from Hizorex";

    doc.body.append(h1, meta, content, footer);
    printWindow.print();
  };

  const handleRespond = async (action: "accept" | "decline") => {
    if (!offer) return;
    setRespondingAction(action);
    try {
      const updated = await respondToOfferLetter(offer.id, action);
      setOffer(updated);
      toast.success(action === "accept" ? "Offer accepted." : "Offer declined.");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Unable to submit your response.");
    } finally {
      setRespondingAction(null);
    }
  };

  const filtered = conversations.filter((c) =>
    c.employerCompany.toLowerCase().includes(search.toLowerCase()) ||
    c.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const selected = conversations.find((c) => c.applicationId === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-1">Inbox</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Messages from Employers</h1>
          <p className="text-sm text-gray-500 mt-1">Interview invites, offer letters, and updates sent to you by hiring teams.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-500">Loading your messages…</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 h-[calc(100dvh-220px)]">

            {/* Conversation list — full width on mobile, fixed sidebar on md+ */}
            <div className={`md:w-72 md:shrink-0 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${selectedId ? "hidden md:flex" : "flex"}`}>
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search companies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filtered.map((c) => (
                      <button
                        key={c.applicationId}
                        type="button"
                        onClick={() => setSelectedId(c.applicationId)}
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                          selectedId === c.applicationId
                            ? "bg-blue-50 border-l-2 border-l-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm text-gray-900 truncate">{c.employerCompany}</p>
                              <span className="text-[10px] text-gray-400 shrink-0">{formatTime(c.lastMessageAt)}</span>
                            </div>
                            <p className="text-xs font-medium text-blue-600 truncate mt-0.5">{c.jobTitle}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage || "No messages yet"}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Employers will reach you here when they're interested.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat area — full width on mobile when selected */}
            <div className={`flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col ${!selectedId ? "hidden md:flex" : "flex"}`}>
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.applicationId}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="flex flex-col h-full"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                      {/* Back button on mobile */}
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                        aria-label="Back to list"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                      </button>
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{selected.employerCompany}</p>
                        <p className="text-xs text-gray-500">{selected.jobTitle}</p>
                      </div>
                    </div>

                    {offer && (
                      <div className="border-b border-gray-100 bg-amber-50/60 p-4 shrink-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                            <p className="text-sm font-bold text-gray-900">Offer Letter</p>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${offerStatusStyle[offer.status] || ""}`}>
                              {offer.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleDownloadOffer}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-2.5 py-1.5 transition-colors shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                          <span>Salary: <span className="font-semibold text-gray-900">{offer.salary}</span></span>
                          <span>Start date: <span className="font-semibold text-gray-900">{offer.start_date}</span></span>
                        </div>
                        {offer.content && (
                          <div className="max-h-28 overflow-y-auto rounded-lg bg-white border border-gray-200 p-3 text-xs text-gray-600 whitespace-pre-wrap mb-3">
                            {offer.content}
                          </div>
                        )}
                        {offer.status === "sent" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRespond("accept")}
                              disabled={respondingAction !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              {respondingAction === "accept" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              Accept Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespond("decline")}
                              disabled={respondingAction !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 disabled:opacity-50 transition-colors"
                            >
                              {respondingAction === "decline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                              Decline
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            You {offer.status} this offer{offer.responded_at ? ` on ${new Date(offer.responded_at).toLocaleDateString()}` : ""}.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex-1 overflow-hidden p-4">
                      <ConversationPanel
                        conversation={selected}
                        currentUser={{
                          email: userEmail || "",
                          name: userEmail || "You",
                          role: "candidate",
                        }}
                        emptyLabel="No messages from this employer yet."
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center h-full">
                    <div>
                      <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Select a conversation</h3>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                        Choose a company from the list to read their messages and interview invites.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
