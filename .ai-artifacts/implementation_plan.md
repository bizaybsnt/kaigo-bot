# Fix Agora Gateway Server Error

The `CAN_NOT_GET_GATEWAY_SERVER` error (or general connection failure) in Agora usually occurs when the selected App ID has the "App Certificate" enabled, which mandates that a valid temporary or server-generated Token is provided when joining a channel. Currently, the token is hardcoded to `null` in `src/app/(dashboard)/page.tsx`.

Since you mentioned you can provide the token in the `.env` file, we will update the application to read the Token and Channel Name from environment variables.

## User Review Required

> [!IMPORTANT]
> Since we are using an environment variable for the token, you will need to generate a **Temporary Token** from your Agora Console (Project Management -> Generate Temp Token).
> Note that Temp Tokens expire in 24 hours. For production, a token server is required. But for a hackathon, pasting the temp token in the `.env` file works perfectly!

## Proposed Changes

### Frontend Configuration

#### [MODIFY] src/app/(dashboard)/page.tsx
- Read `NEXT_PUBLIC_AGORA_TOKEN` from `process.env`.
- Read `NEXT_PUBLIC_AGORA_CHANNEL` from `process.env` (defaulting to `"test"` if not provided, since tokens are tied to specific channels).
- Pass this dynamically loaded token to `clientRef.current.join()`.

### Environment Configuration

#### [MODIFY] .env
- Add `NEXT_PUBLIC_AGORA_TOKEN=` placeholder.
- Add `NEXT_PUBLIC_AGORA_CHANNEL="test"` placeholder.

## Verification Plan

### Manual Verification
1. I will apply these code changes.
2. I will prompt you to generate a Temporary Token from the Agora Console for the channel `"test"` and paste it as `NEXT_PUBLIC_AGORA_TOKEN` in your `.env` file.
3. You will check the web application and click the "Tap to Speak" button to verify that it successfully connects to the Agora channel without the `CAN_NOT_GET_GATEWAY_SERVER` error.
