import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { channelName, userUid } = await req.json();
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const customerId = process.env.AGORA_CUSTOMER_ID;
        // Agora console calls this "Customer Secret" (not App Certificate)
        const customerSecret = process.env.AGORA_CUSTOMER_SECRET ?? process.env.AGORA_CUSTOMER_CERTIFICATE;

        if (!appId || !customerId || !customerSecret) {
            return NextResponse.json(
                { error: 'Missing Agora credentials. Set NEXT_PUBLIC_AGORA_APP_ID, AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET in .env.local' },
                { status: 500 }
            );
        }

        const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;

        // Use timestamp suffix so re-starts don't collide on the same name
        const agentName = `stt-${channelName}-${Date.now()}`;

        // If this project uses App Certificate (token auth), the STT bots need a token too.
        // pubBotToken must be a token generated for pubBotUid (or for UID=0 which is a wildcard).
        // Set AGORA_BOT_TOKEN in .env to a token generated with UID=0 and the same channel.
        // If not set, falls back to the app token (works when token was generated for UID=0).
        const botToken = process.env.AGORA_BOT_TOKEN ?? process.env.NEXT_PUBLIC_AGORA_TOKEN;

        const rtcConfig: Record<string, unknown> = {
            channelName: channelName,
            subBotUid: "10001",  // bot that subscribes to audio in the channel
            pubBotUid: "10002",  // bot that publishes transcript stream messages
            // v7 API requires explicit digit-string UIDs — pass the actual user UID
            subscribeAudioUids: [userUid],
        };

        // Include tokens only when App Certificate is in use
        if (botToken) {
            rtcConfig.pubBotToken = botToken;
        }

        // Agora Real-Time STT v7 — Start endpoint
        // Docs: https://docs.agora.io/en/real-time-stt/rest-api/v7.x/join
        const startRes = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: agentName,
                languages: ["en-US", "ja-JP"],
                maxIdleTime: 60,
                rtcConfig,
            }),
        });

        const responseText = await startRes.text();
        console.log('[Agora STT] Start response status:', startRes.status);
        console.log('[Agora STT] Start response body:', responseText);

        if (!startRes.ok) {
            return NextResponse.json(
                { error: 'Failed to start STT task', details: responseText },
                { status: startRes.status }
            );
        }

        const startData = JSON.parse(responseText);
        // v7 API returns agent_id
        const taskId = startData.agent_id ?? startData.taskId ?? startData.task_id;

        if (!taskId) {
            console.error('[Agora STT] No taskId in response:', startData);
            return NextResponse.json(
                { error: 'STT started but no taskId returned', details: JSON.stringify(startData) },
                { status: 500 }
            );
        }

        console.log('[Agora STT] Started successfully, taskId:', taskId);
        return NextResponse.json({ taskId });
    } catch (error: any) {
        console.error('[Agora STT] Start error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
