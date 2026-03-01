# TEN Framework Agora STT Integration

- [ ] Plan and understand TEN framework integration method
- [x] Remove previous Protobuf implementation
  - [x] Delete `public/SttMessage.proto`
  - [x] Remove `protobufjs` from `package.json`
- [x] Implement TEN Framework RTC Message Parser
  - [x] Add chunk caching and reconstruction logic in `page.tsx`
  - [x] Handle `base64` decode and `JSON.parse` sequence
  - [x] Append parsed texts to the `transcript` UI state
