# TRD — Real-Time Chatting App

## 1. Recommended Architecture

### Frontend
- Next.js with App Router and TypeScript.
- Tailwind CSS.
- shadcn/ui where useful.
- React Bits-inspired components and effects.
- Motion.dev for animation orchestration.
- Three.js with React Three Fiber only for optional decorative 3D.
- Clerk React/Next.js integration.

### Backend
Recommended MVP options:
- Next.js Route Handlers for standard API endpoints.
- A dedicated WebSocket/realtime provider or service for messaging, presence, and typing.
- WebRTC for media transport.
- WebSocket signaling server or a managed real-time service for call negotiation.

Do not assume Next.js serverless functions alone provide durable WebSocket connections. Use a dedicated realtime layer if the deployment platform does not support persistent sockets.

### Database
- PostgreSQL.
- Prisma ORM.
- Clerk user ID stored as the external identity key.
- Object storage for voice-message files.
- Redis or managed presence infrastructure if required by scale.

## 2. Core Data Model

### UserProfile
- id: UUID
- clerkUserId: string, unique
- username: string, unique
- displayName: string
- avatarUrl: string nullable
- bio: string nullable
- createdAt: datetime
- updatedAt: datetime
- lastSeenAt: datetime nullable

### Conversation
- id: UUID
- type: enum(DIRECT, GROUP)
- createdAt: datetime
- updatedAt: datetime

### ConversationMember
- conversationId: UUID
- userId: UUID
- role: enum(MEMBER, ADMIN)
- joinedAt: datetime
- lastReadMessageId: UUID nullable

Unique constraint: conversationId + userId.

### Message
- id: UUID
- conversationId: UUID
- senderId: UUID
- type: enum(TEXT, VOICE, SYSTEM, CALL_EVENT)
- body: text nullable
- replyToMessageId: UUID nullable
- editedAt: datetime nullable
- deletedAt: datetime nullable
- createdAt: datetime
- updatedAt: datetime

### MediaAsset
- id: UUID
- ownerId: UUID
- storageKey: string
- mimeType: string
- sizeBytes: integer
- durationMs: integer nullable
- status: enum(PENDING, READY, FAILED)
- createdAt: datetime

### VoiceMessage
- messageId: UUID
- mediaAssetId: UUID
- waveformJson: JSON nullable

### MessageReaction
- messageId: UUID
- userId: UUID
- emoji: string
- createdAt: datetime

Unique constraint: messageId + userId + emoji.

### CallSession
- id: UUID
- conversationId: UUID
- initiatedById: UUID
- type: enum(AUDIO, VIDEO)
- status: enum(RINGING, CONNECTING, ACTIVE, ENDED, FAILED, MISSED)
- startedAt: datetime nullable
- endedAt: datetime nullable
- createdAt: datetime

## 3. API Requirements

### Auth
- All protected endpoints validate the Clerk session server-side.
- Never trust a user ID sent by the client.
- Resolve the authenticated Clerk user to an internal profile.

### Conversations
- GET /api/conversations
- POST /api/conversations/direct
- GET /api/conversations/:id
- POST /api/conversations/:id/read

### Messages
- GET /api/conversations/:id/messages?cursor=
- POST /api/conversations/:id/messages
- PATCH /api/messages/:id
- DELETE /api/messages/:id
- POST /api/messages/:id/reactions
- DELETE /api/messages/:id/reactions/:emoji

### Media
- POST /api/media/upload-url
- POST /api/media/complete
- GET /api/media/:id/access

Use signed URLs or equivalent controlled access. Do not expose unrestricted storage buckets.

### Calls
- POST /api/calls
- POST /api/calls/:id/end
- GET /api/calls/history

## 4. Realtime Events

Suggested event names:
- conversation:message_created
- conversation:message_updated
- conversation:message_deleted
- conversation:typing_started
- conversation:typing_stopped
- presence:updated
- message:read
- call:incoming
- call:accepted
- call:rejected
- call:ended
- call:signaling

Every event must be authorized against the authenticated user's conversation membership.

## 5. WebRTC Design
- Use WebRTC for audio/video media.
- Use a signaling channel for SDP offers, SDP answers, and ICE candidates.
- Configure STUN servers.
- Add TURN infrastructure for reliable connectivity in restrictive networks.
- Do not send raw media through the application server.
- Handle reconnection and call termination.
- Stop all media tracks when a call ends.
- Show permission and device errors clearly.

## 6. Security Requirements
- Server-side authorization for every conversation, message, media, and call operation.
- Validate all request bodies with Zod or equivalent.
- Rate-limit message creation, upload initialization, and call creation.
- Restrict upload MIME types and file sizes.
- Scan or validate uploaded files where practical.
- Escape or safely render user-generated text.
- Protect against IDOR by checking membership on every resource access.
- Store secrets only in environment variables.
- Log security-relevant failures without logging message contents or tokens.
- Add CSRF protections where applicable to the chosen architecture.

## 7. Performance
- Cursor-based pagination.
- Virtualize long message lists if necessary.
- Compress or optimize avatars.
- Lazy-load 3D assets.
- Disable or simplify 3D effects for reduced-motion and low-power devices.
- Use optimistic UI only with deterministic rollback.
- Avoid rerendering the entire conversation on every realtime event.

## 8. Testing
- Unit tests for validation and permission functions.
- Integration tests for conversations and messages.
- Authorization tests for cross-user access.
- Realtime event tests.
- WebRTC manual test matrix across browsers and networks.
- Mobile responsive testing.
- Accessibility testing with keyboard navigation and reduced motion.

## 9. Environment Variables
Example names:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- DATABASE_URL
- REALTIME_SERVER_URL or provider-specific variables
- STORAGE_ENDPOINT
- STORAGE_BUCKET
- STORAGE_ACCESS_KEY
- STORAGE_SECRET_KEY
- TURN_SERVER_URL
- TURN_USERNAME
- TURN_CREDENTIAL

Never commit real values.
