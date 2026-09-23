# UI/UX Specification — PulseChat

## 1. Design Direction
A premium, friendly, modern chat interface with a calm visual hierarchy. Use motion and 3D as supporting details rather than as constant decoration.

Visual keywords:
- Soft depth
- Clear hierarchy
- Responsive
- Fast
- Private
- Playful but not childish
- Accessible

## 2. Design System

### Color
Define semantic tokens instead of hardcoding colors:
- background
- surface
- surface-elevated
- border
- text-primary
- text-secondary
- accent
- success
- warning
- danger
- incoming-message
- outgoing-message

Provide both light and dark themes. Maintain contrast suitable for WCAG AA where applicable.

### Typography
- Use a clean sans-serif font.
- Use larger weight contrast for conversation names and page headings.
- Keep message text highly readable.
- Avoid excessive uppercase labels.

### Shape and Depth
- Rounded cards and message bubbles.
- Moderate blur and transparency.
- Shadows should indicate hierarchy, not decorate every element.
- Use consistent spacing based on a 4px or 8px rhythm.

## 3. Main Screens

### A. Landing Page
Purpose: explain the app and guide the user to authentication.

Components:
- Animated hero headline.
- Short product description.
- Sign-in and sign-up CTAs connected to Clerk.
- Abstract animated background.
- Optional lightweight 3D orb or particles.
- Feature cards for messaging, voice messages, and calls.

Animation:
- Staggered entrance using Motion.dev.
- Subtle floating effect.
- Respect prefers-reduced-motion.

### B. Authentication
Use Clerk's prebuilt components or customized Clerk elements.

Requirements:
- Clear sign-in/sign-up states.
- Passwordless/social methods only if configured.
- Visible loading and error states.
- Responsive layout.
- Do not recreate authentication security logic manually.

### C. Chat Dashboard
Desktop layout:
1. Left sidebar: profile, search, conversations, settings.
2. Center panel: active conversation.
3. Optional right panel: conversation details, members, shared media.

Mobile layout:
- Conversation list becomes a route/screen.
- Active conversation takes full width.
- Details open in a sheet or separate route.
- Composer remains reachable above the keyboard.

### D. Conversation Header
Contains:
- Avatar and display name.
- Online/last-seen indicator.
- Audio call button.
- Video call button.
- Search within conversation.
- More actions menu.

States:
- Online.
- Offline.
- Connecting.
- Call in progress.
- Muted notifications.

### E. Message Area
Requirements:
- Date separators.
- Group consecutive messages from the same sender.
- Incoming and outgoing visual distinction.
- Timestamp on hover or tap.
- Read/delivery state.
- Reply preview.
- Reactions.
- Context menu.
- Empty state for new conversations.
- Loading skeleton.
- Retry control for failed messages.

Avoid:
- Excessively large bubbles.
- Overuse of gradients.
- Animations that move existing text unexpectedly.
- Hiding critical actions behind hover-only controls on mobile.

### F. Composer
Components:
- Text input.
- Emoji picker.
- Attachment button.
- Microphone button.
- Send button.
- Reply preview when replying.
- Recording mode with timer, waveform, pause, cancel, and send.

Keyboard:
- Enter sends.
- Shift+Enter inserts a newline.
- Escape cancels reply or recording preview where appropriate.

### G. Voice Message Player
Display:
- Play/pause.
- Waveform or progress line.
- Duration.
- Playback progress.
- Sender avatar or compact context.
- Download should not be required for playback.

States:
- Uploading.
- Processing.
- Ready.
- Failed.
- Expired/unauthorized.

### H. Incoming Call UI
Use a prominent but non-blocking call surface:
- Caller avatar and name.
- Audio/video call label.
- Accept.
- Decline.
- Optional minimize action.

### I. Active Call UI
Controls:
- Mute.
- Camera toggle.
- Switch camera/device where supported.
- Speaker/output selection where supported.
- Screen share only if explicitly implemented.
- End call.

Show:
- Connection quality indicator.
- Participant name.
- Local preview for video.
- Clear ended/failed states.

### J. Settings
Sections:
- Profile.
- Appearance.
- Notifications.
- Privacy.
- Audio/video devices.
- Account controls through Clerk.

## 4. Motion Guidelines
Use Motion.dev for:
- Route transitions.
- Sidebar and sheet transitions.
- Message insertion.
- Toasts.
- Modal opening/closing.
- Recording state transitions.
- Call status transitions.

Rules:
- Prefer opacity and transform.
- Avoid animating layout-heavy properties unnecessarily.
- Keep micro-interactions short.
- Do not animate every message continuously.
- Respect reduced-motion preferences.

## 5. 3D Guidelines
Possible implementation:
- React Three Fiber with a small scene on the landing page.
- Soft animated orb, particles, or depth field.
- No 3D background behind dense message text.
- Lazy-load the 3D scene.
- Pause rendering when the tab is hidden if possible.
- Provide a CSS-only fallback.
- Disable 3D effects on low-power devices or reduced-motion settings.

## 6. Accessibility
- Keyboard navigation across all primary controls.
- Visible focus states.
- Accessible labels for icon-only buttons.
- Screen-reader announcements for new messages and call status.
- Do not rely only on color for delivery or online state.
- Captions/transcripts are optional future features, not implied by voice messages.
- Respect reduced motion and contrast settings.

## 7. Responsive Breakpoints
- Small mobile: 320–479px.
- Large mobile/tablet: 480–1023px.
- Desktop: 1024px and above.

Test:
- Narrow mobile portrait.
- Mobile landscape.
- Tablet.
- Laptop.
- Large monitor.

## 8. Component Naming
Suggested components:
- AppShell
- Sidebar
- ConversationList
- ConversationListItem
- ChatHeader
- MessageList
- MessageBubble
- MessageActions
- ReplyPreview
- MessageComposer
- VoiceRecorder
- VoiceMessagePlayer
- IncomingCallDialog
- ActiveCallView
- PresenceIndicator
- TypingIndicator
- UserSearch
- SettingsPanel
- ThreeBackground

## 9. UX Acceptance Checklist
- User always knows which conversation is active.
- Sending states are visible.
- Failed messages can be retried.
- Recording can be cancelled without sending.
- Permission errors explain how to recover.
- Calls clearly show connection state.
- Navigation works without hover.
- Motion never blocks core actions.
- The interface remains usable with 200+ messages.
