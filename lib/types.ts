export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type CallStatus = "RINGING" | "CONNECTING" | "ACTIVE" | "ENDED" | "FAILED" | "MISSED";

export type PresenceStatus = "online" | "offline" | "idle";

export type DateTime = string | Date;

export interface UserProfile {
  id: string;
  clerkUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  lastSeenAt: DateTime | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  createdAt: DateTime;
  updatedAt: DateTime;
  lastMessage: Message | null;
  members: ConversationMember[];
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  role: "MEMBER" | "ADMIN";
  lastReadMessageId: string | null;
  user: UserProfile;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "VOICE" | "SYSTEM" | "CALL_EVENT";
  body: string | null;
  replyToMessageId: string | null;
  editedAt: DateTime | null;
  deletedAt: DateTime | null;
  createdAt: DateTime;
  updatedAt: DateTime;
  sender: UserProfile;
  replyTo: Message | null;
  reactions: MessageReaction[];
  voice: VoiceMessage | null;
}

export interface VoiceMessage {
  messageId: string;
  mediaAssetId: string;
  waveformJson: number[] | null;
}

export interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: DateTime;
  user: UserProfile;
}

export interface CallSession {
  id: string;
  conversationId: string;
  initiatedById: string;
  type: "AUDIO" | "VIDEO";
  status: CallStatus;
  startedAt: DateTime | null;
  endedAt: DateTime | null;
  createdAt: DateTime;
  conversation?: {
    id: string;
    members: Array<{ userId: string; user: UserProfile }>;
  };
}

export interface RealtimeEvent {
  type: string;
  conversationId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface TypingState {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresenceState {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: string | null;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  mediaId: string;
  storageKey: string;
  headers?: Record<string, string>;
}

export interface CompleteUploadRequest {
  mediaId: string;
  durationMs?: number;
  waveformJson?: number[];
}

export interface SendMessageRequest {
  conversationId: string;
  body: string;
  replyToMessageId?: string;
}

export interface EditMessageRequest {
  body: string;
}

export interface CreateDirectConversationRequest {
  username: string;
}

export interface MarkReadRequest {
  lastReadMessageId: string;
}

export interface StartCallRequest {
  conversationId: string;
  type: "AUDIO" | "VIDEO";
}

export interface SignalingMessage {
  type: "offer" | "answer" | "ice_candidate" | "call_end";
  callId: string;
  fromUserId: string;
  toUserId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface CallSignalPayload {
  callId: string;
  type: "offer" | "answer" | "ice_candidate" | "call_end";
  fromUserId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}