# Test Plan

## Unit Tests
- Validation schemas (Zod)
- Utility functions (formatting, color generation)
- Auth helpers (membership checks)

## Integration Tests
- Conversation creation and retrieval
- Message send/receive
- Media upload flow
- Call session lifecycle

## Authorization Tests
- Cross-user conversation access denied
- Cross-user message edit/delete denied
- Cross-user media access denied

## Realtime Tests
- Message broadcast to conversation members
- Typing indicator propagation
- Presence updates

## E2E Tests
- Sign up → sign in → send message flow
- Voice message recording and playback
- Audio call initiation and termination

## Test Commands
```bash
npm run test          # Run all tests
npm run typecheck     # TypeScript type checking
```