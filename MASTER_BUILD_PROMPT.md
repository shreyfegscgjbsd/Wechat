You are a senior full-stack engineer, product designer, UX architect, and QA engineer. Build a production-oriented real-time chatting application named **PulseChat** for private communication between friends.

## Product Requirements
Implement:
- Clerk authentication and protected routes.
- User profiles and search.
- One-to-one real-time text chat.
- Typing indicators, online presence, delivery/read states.
- Replies, emoji reactions, edit/delete, and retry states.
- Voice-message recording, preview, upload, playback, and failure handling.
- One-to-one audio and video calls using WebRTC.
- Signaling for SDP offers, answers, and ICE candidates.
- Call states: incoming, ringing, connecting, active, failed, missed, ended.
- Responsive desktop and mobile layouts.
- Light and dark themes.
- Accessible keyboard navigation and reduced-motion support.

## Visual Requirements
Use:
- React Bits-style high-quality UI patterns where technically appropriate.
- Motion.dev for purposeful transitions and micro-interactions.
- Optional React Three Fiber/Three.js 3D animation on the landing page or as a very lightweight decorative element.
- A CSS fallback when 3D is disabled or unsupported.
- A premium interface with restrained glassmorphism, clear spacing, strong typography, and excellent empty/loading/error states.

Do not sacrifice usability for visual effects. Do not put heavy 3D effects behind dense chat content. Respect prefers-reduced-motion.

## Recommended Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk
- PostgreSQL
- Prisma
- Zod
- Motion.dev
- React Bits-inspired components
- React Three Fiber/Three.js for optional 3D
- WebRTC for calls
- Dedicated realtime layer/WebSocket service for chat and signaling
- Object storage with signed URLs for voice messages

## Engineering Rules
1. First inspect the existing repository and explain its current state.
2. Do not overwrite working code without checking it.
3. Create a clear folder structure.
4. Use strict TypeScript.
5. Validate all input on the server.
6. Authenticate and authorize every protected operation server-side.
7. Never trust client-supplied user IDs.
8. Check conversation membership on every message, media, and call request.
9. Keep secrets in environment variables.
10. Never expose Clerk secret keys, storage secrets, TURN credentials, or database credentials to the browser.
11. Use cursor pagination for messages.
12. Use optimistic UI only with rollback on failure.
13. Handle browser microphone/camera permission denial.
14. Include STUN and plan for TURN for real-world WebRTC reliability.
15. Clean up media tracks and listeners when calls end or components unmount.
16. Add loading, empty, offline, permission-denied, and error states.
17. Build reusable components instead of one huge page.
18. Avoid fake success states and fake realtime behavior.
19. Add tests for authorization, message creation, and critical validation.
20. Keep the UI responsive at 320px and above.

## Required Development Order
Phase 1: Repository audit, architecture, environment variables, Clerk setup, database schema.
Phase 2: Protected app shell, profile synchronization, user search, conversation creation.
Phase 3: Real-time text messaging, typing, presence, read state, reactions, replies.
Phase 4: Voice recording/upload/playback.
Phase 5: WebRTC audio/video calls and signaling.
Phase 6: Responsive polish, accessibility, performance, security review, tests, deployment instructions.

## Required Deliverables
Create and maintain:
- PRD.md
- TRD.md
- UI_UX_SPEC.md
- README.md
- .env.example
- Database schema and migrations
- API documentation
- Test plan
- Deployment instructions

## Interaction and Reporting
Before changing files:
- Inspect the repository.
- List assumptions and missing credentials/services.
- Identify risks that could block implementation.

During implementation:
- Work in small verifiable steps.
- Run type checks, linting, tests, and builds where available.
- Report exact errors instead of claiming completion.
- Do not invent API keys, service responses, or successful call connections.
- If a service requires user configuration, provide the exact environment variable name and setup step.

At the end of each phase:
- Summarize files changed.
- Report commands executed and their results.
- List remaining blockers.
- Give the next concrete implementation step.

Start by auditing the repository and generating the initial architecture plan. Do not begin by blindly writing the entire application.
