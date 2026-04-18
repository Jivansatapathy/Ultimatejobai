import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Search, User, UserSearch } from "lucide-react";
import { toast } from "sonner";

import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { LoadingState } from "@/components/employer/LoadingState";
import { EmptyState } from "@/components/employer/EmptyState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { subscribeEmployerConversations } from "@/services/chatService";
import { FirestoreConversation } from "@/types/chat";

export default function EmployerMessages() {
  const { user, profile, isEmployer } = useEmployerAuth();
  const [conversations, setConversations] = useState<FirestoreConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const employerEmail = (user?.email || profile?.contact_email || "").toLowerCase();
    if (!employerEmail || !isEmployer) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeEmployerConversations(employerEmail, (items) => {
      setConversations(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.contact_email, user?.email, isEmployer]);

  const filteredConversations = conversations.filter((c) =>
    c.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    c.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConversation = conversations.find((c) => c.applicationId === selectedId);
  const formatConversationTime = (value: string | null) => {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString() === new Date().toLocaleDateString()
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingState label="Loading your conversations..." />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
      <PageHeader
        eyebrow="Messages"
        title="Candidate Inbox"
        description="Manage all your active conversations with candidates across different job postings."
      />

      <div className="flex-1 flex overflow-hidden rounded-3xl border border-border/70 bg-card/50 shadow-sm">
        {/* Sidebar */}
        <div className="w-80 border-r border-border/70 flex flex-col bg-background/50">
          <div className="p-4 border-b border-border/70">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-border/50">
                {filteredConversations.map((c) => (
                  <button
                    key={c.applicationId}
                    onClick={() => setSelectedId(c.applicationId)}
                    className={`w-full p-4 text-left transition-colors hover:bg-accent/5 ${selectedId === c.applicationId ? "bg-accent/10 border-l-4 border-l-accent" : ""
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">{c.candidateName}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatConversationTime(c.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-accent font-medium truncate mt-0.5">{c.jobTitle}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {c.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background/20 relative">
          <AnimatePresence mode="wait">
            {selectedConversation ? (
              <motion.div
                key={selectedConversation.applicationId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                <div className="p-4 border-b border-border/70 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold">{selectedConversation.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{selectedConversation.jobTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  <ConversationPanel
                    conversation={selectedConversation}
                    currentUser={{
                      email: (user?.email || profile?.contact_email || ""),
                      name: profile?.full_name || profile?.contact_name || "Employer",
                      role: "employer",
                    }}
                    emptyLabel="Start the conversation with this candidate."
                  />
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center h-full">
                <div>
                  <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Select a conversation</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                    Choose a candidate from the list on the left to view the chat history and send messages.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
