import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { channelName } = await req.json();
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const customerId = process.env.AGORA_CUSTOMER_ID;
        const customerSecret = process.env.AGORA_CUSTOMER_CERTIFICATE;

        if (!appId || !customerId || !customerSecret) {
            return NextResponse.json({ error: 'Missing Agora credentials in env' }, { status: 500 });
        }

        const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;

        // Agora STT v7 Start Endpoint
        const startRes = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: `stt-${channelName}`,
                languages: ["en-US"],
                maxIdleTime: 60,
                rtcConfig: {
                    channelName: channelName,
                    subBotUid: "101",
                    pubBotUid: "102"
                }
            })
        });

        if (!startRes.ok) {
            const errorText = await startRes.text();
            return NextResponse.json({ error: 'Failed to start task', details: errorText }, { status: startRes.status });
        }

        const startData = await startRes.json();
        // v7 API returns agent_id
        const taskId = startData.agent_id;

        return NextResponse.json({ taskId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
