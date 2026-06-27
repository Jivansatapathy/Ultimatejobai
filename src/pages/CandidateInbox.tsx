import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MessageSquare, Search } from "lucide-react";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { useAuth } from "@/context/AuthContext";
import { subscribeCandidateConversations } from "@/services/chatService";
import type { FirestoreConversation } from "@/types/chat";

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

  useEffect(() => {
    const email = (userEmail || "").toLowerCase();
    if (!email) { setLoading(false); return; }
    const unsubscribe = subscribeCandidateConversations(email, (items) => {
      setConversations(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userEmail]);

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
          <p className="text-sm text-gray-500 mt-1">Interview invites and updates sent to you by hiring teams.</p>
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
