export type FirestoreConversationRole = "employer" | "candidate";

export interface FirestoreConversation {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  employerEmail: string;
  employerName: string;
  employerCompany: string;
  candidateEmail: string;
  candidateName: string;
  initiatedBy: "employer";
  lastMessage: string;
  lastMessageSenderRole: FirestoreConversationRole;
  lastMessageAt: string | null;
  employerLastReadAt?: string | null;
  candidateLastReadAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FirestoreConversationMessage {
  id: string;
  conversationId: string;
  text: string;
  senderEmail: string;
  senderName: string;
  senderRole: FirestoreConversationRole;
  createdAt: string | null;
}
