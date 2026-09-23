import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  body: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message too long"),
  replyToMessageId: z.string().uuid().optional(),
});

export const editMessageSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message too long"),
});

export const createDirectConversationSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(32, "Username too long"),
});

export const markReadSchema = z.object({
  lastReadMessageId: z.string().uuid("Invalid message ID"),
});

export const startCallSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  type: z.enum(["AUDIO", "VIDEO"]),
});

export const completeUploadSchema = z.object({
  mediaId: z.string().uuid("Invalid media ID"),
  durationMs: z.number().int().positive().optional(),
  waveformJson: z.array(z.number()).optional(),
});

export const uploadUrlSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  mimeType: z.string().max(255),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024, "Max file size is 25MB"),
});

export const reactionSchema = z.object({
  emoji: z.string().min(1).max(8),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type StartCallInput = z.infer<typeof startCallSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
];

export const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_RECORDING_DURATION_MS = 5 * 60 * 1000; // 5 minutes