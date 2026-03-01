# Agora TEN Framework RT STT Integration

We have adapted the Agora speech-to-text integration to work specifically with the TEN Framework's backend approach.

## Changes Made

1. **Protobuf Removal**:
   - The TEN Framework approach does not use raw Protobuf (`agora.rtc.Text` via `SttMessage.proto`) for its UI-facing transcription. 
   - `protobufjs` was uninstalled and `public/SttMessage.proto` was deleted.

2. **TEN Framework Chunk Decoder**:
   - The `TEN` backend agent publishes voice transcriptions directly back to the Agora RTC `stream-message` event channel.
   - However, it sends them as **pipe-separated chunks** containing base64 encoded JSON (e.g. `message_id|part_index|total_parts|base64_content`).
   - We implemented the exact chunk caching and reconstruction logic used in the TEN real-time voice assistant example inside `page.tsx`.
   - Now, when `stream-message` arrives, `page.tsx`:
     1. Reconstructs all parts of a chunk.
     2. Decodes the completely combined base64 text into a utf-8 JSON string.
     3. Parses the text and the `is_final` flag from the JSON.
     4. Dynamically appends the results to the `transcript` UI state.

## Validating The Fix
To test this, start your Next.js application:
```bash
bun run dev
```
Join the channel by clicking "Tap to Speak", ensure the TEN Framework Agent has joined the same channel, and speak into your microphone. You should see the transcripts updating flawlessly!
