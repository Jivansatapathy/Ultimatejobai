import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FirestoreConversation, FirestoreConversationMessage } from "@/types/chat";
import { markConversationRead, sendConversationMessage, subscribeConversationMessages } from "@/services/chatService";

interface ConversationPanelProps {
  conversation: FirestoreConversation;
  currentUser: {
    email: string;
    name: string;
    role: "employer" | "candidate";
  };
  emptyLabel?: string;
}

export function ConversationPanel({ conversation, currentUser, emptyLabel = "No messages yet." }: ConversationPanelProps) {
  const [messages, setMessages] = useState<FirestoreConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeConversationMessages(conversation.id, (items) => {
      setMessages(items);
    });

    markConversationRead(conversation.id, currentUser.role).catch(() => null);
    return unsubscribe;
  }, [conversation.id, currentUser.role]);

  const handleSend = async () => {
    if (!draft.trim()) {
      return;
    }

    setSending(true);
    try {
      await sendConversationMessage({
        conversationId: conversation.id,
        text: draft,
        senderEmail: currentUser.email,
        senderName: currentUser.name,
        senderRole: currentUser.role,
      });
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="max-h-72 min-h-40 overflow-y-auto rounded-2xl border border-border/60 bg-background/70 p-3">
        {messages.length ? (
          <div className="space-y-3">
            {messages.map((message) => {
              const mine = message.senderEmail?.toLowerCase() === currentUser.email.toLowerCase();
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                      {mine ? "You" : message.senderName}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-6">{message.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-32 items-center justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {emptyLabel}
            </div>
          </div>
        )}
      </div>

      <Textarea
        className="min-h-24 rounded-2xl"
        placeholder="Write a message..."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="flex justify-end">
        <Button className="rounded-2xl" onClick={handleSend} disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>
    </div>
  );
}
