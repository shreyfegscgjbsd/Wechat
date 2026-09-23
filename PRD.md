# PRD — Real-Time Chatting App

## 1. Product Overview
A private, modern, real-time communication app for two or more authenticated users. The first target use case is two friends communicating through text, voice messages, and audio/video calls.

Working name: **PulseChat**

## 2. Goals
- Provide fast, reliable private messaging.
- Support text messages, emoji, replies, reactions, edits, deletion, and message status.
- Support recording and sending voice messages.
- Support one-to-one audio and video calls.
- Deliver a polished interface with React Bits components, Motion.dev animations, and optional lightweight 3D visuals.
- Use Clerk for authentication and account management.
- Make the application responsive across desktop and mobile.

## 3. Non-Goals for MVP
- Public social feed.
- Large-scale livestreaming.
- Payments or subscriptions.
- End-to-end encryption claims unless implemented and audited.
- Complex enterprise administration.

## 4. Target Users
- Friends and small private groups.
- Users who want a visually polished alternative to basic chat interfaces.

## 5. Core User Flows

### Authentication
1. User opens the app.
2. User signs up or signs in with Clerk.
3. Clerk handles sessions, account security, and profile basics.
4. User is redirected to the chat dashboard.

### Starting a Conversation
1. User searches for another registered user.
2. User sends a chat request or opens an existing conversation.
3. The conversation appears in the sidebar.
4. Messages update in real time.

### Sending a Message
1. User types text.
2. User presses Enter or taps Send.
3. Client validates the message.
4. Server persists the message.
5. Recipients receive the message in real time.
6. Delivery/read status updates when supported.

### Sending a Voice Message
1. User holds or clicks the microphone button.
2. Browser requests microphone permission.
3. User records, previews, cancels, or sends.
4. Audio is uploaded to object storage.
5. Server stores the asset reference and message metadata.
6. Recipient sees an audio player with duration and waveform.

### Audio/Video Call
1. User clicks the call button.
2. Server creates or authorizes a call session.
3. WebRTC establishes peer media where possible.
4. Signaling handles offer, answer, and ICE candidates.
5. UI shows connection status, mute, camera toggle, speaker/output controls, and hang up.
6. Call history is stored as metadata only.

## 6. MVP Features

### Authentication and Profiles
- Clerk sign-in/sign-up.
- Protected routes.
- User avatar, display name, username, online status.
- Sign-out and account settings.

### Messaging
- One-to-one conversations.
- Text messages.
- Timestamps.
- Optimistic sending with rollback on failure.
- Typing indicator.
- Online/offline presence.
- Delivered/read indicators.
- Reply to message.
- Emoji reactions.
- Edit and delete own messages.
- Infinite scroll or cursor pagination.
- Empty, loading, error, and offline states.

### Voice Messages
- Record, pause, resume, cancel, preview, send.
- Duration and playback progress.
- Upload progress.
- Permission-denied handling.
- File size/type validation.
- Secure media access.

### Calls
- One-to-one audio calls.
- One-to-one video calls.
- Incoming call screen.
- Ringing, connecting, connected, failed, and ended states.
- Mute/unmute.
- Camera on/off.
- End call.
- Call history.
- Permission and network failure handling.

### Visual Experience
- Dark and light themes.
- Glassmorphism used selectively.
- React Bits-inspired animated surfaces.
- Motion.dev page and component transitions.
- Optional Three.js/R3F background accent that is disabled on low-power devices.
- Reduced-motion accessibility mode.

## 7. Success Criteria
- A new user can authenticate and reach the dashboard.
- Two users can exchange messages in real time.
- A user can send and play a voice message.
- Two users can establish an audio/video call under supported network conditions.
- The app remains usable on mobile widths.
- Errors are visible and recoverable.
- No secret keys are exposed in frontend code.

## 8. Risks
- WebRTC connectivity may fail behind restrictive NATs without TURN.
- Audio uploads can become expensive or slow.
- Real-time presence can create scaling and battery costs.
- 3D effects may reduce performance.
- Browser permissions may be denied.
- Message and media authorization must be enforced server-side.

## 9. MVP Release Plan
### Phase 1
Authentication, database schema, protected layout, user profiles.

### Phase 2
Conversation list, real-time text messaging, typing and presence.

### Phase 3
Voice messages, uploads, playback, validation.

### Phase 4
Audio/video calls, signaling, call states, call history.

### Phase 5
Accessibility, responsive polish, performance, security testing, deployment.
