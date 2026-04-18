import api from "@/services/api";
import { FirestoreConversation, FirestoreConversationMessage, FirestoreConversationRole } from "@/types/chat";

const CONVERSATION_POLL_MS = 10000;
const MESSAGE_POLL_MS = 5000;

function sortConversations(items: FirestoreConversation[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
    const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

async function fetchConversations() {
  const response = await api.get<FirestoreConversation[]>("/api/employer/chat/conversations/");
  return sortConversations(Array.isArray(response.data) ? response.data : []);
}

async function fetchConversationMessages(conversationId: string) {
  const response = await api.get<FirestoreConversationMessage[]>(
    `/api/employer/chat/conversations/${conversationId}/messages/`,
  );
  return Array.isArray(response.data) ? response.data : [];
}

function createPollingSubscription<T>(
  loader: () => Promise<T>,
  callback: (items: T) => void,
  intervalMs: number,
) {
  let active = true;

  const run = async () => {
    try {
      const items = await loader();
      if (active) {
        callback(items);
      }
    } catch (error) {
      if (active) {
        console.error("Chat polling failed", error);
      }
    }
  };

  void run();
  const timer = window.setInterval(run, intervalMs);

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}

export function subscribeEmployerConversations(
  _employerEmail: string,
  callback: (items: FirestoreConversation[]) => void,
) {
  return createPollingSubscription(fetchConversations, callback, CONVERSATION_POLL_MS);
}

export function subscribeCandidateConversations(
  _candidateEmail: string,
  callback: (items: FirestoreConversation[]) => void,
) {
  return createPollingSubscription(fetchConversations, callback, CONVERSATION_POLL_MS);
}

export function subscribeConversationMessages(
  conversationId: string,
  callback: (items: FirestoreConversationMessage[]) => void,
) {
  return createPollingSubscription(
    () => fetchConversationMessages(conversationId),
    callback,
    MESSAGE_POLL_MS,
  );
}

export async function createEmployerConversation(input: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  employerEmail: string;
  employerName: string;
  employerCompany: string;
  candidateEmail: string;
  candidateName: string;
  initialMessage: string;
}) {
  const response = await api.post(`/api/employer/chat/conversations/${input.applicationId}/start/`, {
    initialMessage: input.initialMessage,
  });
  return response.data?.id || input.applicationId;
}

export async function sendConversationMessage(input: {
  conversationId: string;
  text: string;
  senderEmail: string;
  senderName: string;
  senderRole: FirestoreConversationRole;
}) {
  await api.post(`/api/employer/chat/conversations/${input.conversationId}/send/`, {
    text: input.text,
  });
}

export async function markConversationRead(conversationId: string, _role: FirestoreConversationRole) {
  await api.post(`/api/employer/chat/conversations/${conversationId}/read/`);
}
