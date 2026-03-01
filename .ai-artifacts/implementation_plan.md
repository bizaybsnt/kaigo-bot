# Implement STT on Mobile Record View

The mobile navigation bar features a prominent audio button that launches a full-screen recording interface (`/record`). Currently, this page uses a dummy `setInterval` hook to simulate transcription.

We will replace this fake behaviour with the real Agora STT integration by porting the logic implemented on the desktop dashboard into this mobile view.

## Proposed Changes

### Frontend Configuration

#### [MODIFY] src/app/(dashboard)/record/page.tsx
- **Imports**: Add required imports `useRef` and types `IAgoraRTCClient`, `ILocalAudioTrack` from `agora-rtc-sdk-ng`.
- **State & Refs**: Add the tracking variables (`clientRef`, `micRef`, `transcriptRef`, `sttTaskIdRef`, etc.) required for Agora session management and TEN Framework message parsing.
- **Agora Logic**: Integrate `startAgora`, `stopAgora`, `startAgoraSTT`, and `stopAgoraSTT` helper functions parsing base64 stream messaging data directly into the component.
- **Transcription Action**: Modify the `toggleRecording` (previously `simulateKaigoBotResponse`) to hook into these real functions, stripping away the `useEffect` that fakes the transcript.
- **Transcript Display**: The actual STT texts will replace the fake words arrays and dynamically update the `<p>` container under the _Live Transcript Box_.

## Verification Plan

### Manual Verification
1. Open the project in a browser.
2. Use Chrome DevTools Device Mode (or a small window) to trigger the `sm:hidden` CSS media queries and reveal the mobile bottom nav.
3. Tap the central Microphone Action Button to navigate to the `/record` page.
4. Tap the massive "Tap to start recording" button.
5. Speak, verify that real-time transcription appears.
6. Tap the button again to stop. Ensure the fake loading state and final "Report Logged!" interface is preserved.
