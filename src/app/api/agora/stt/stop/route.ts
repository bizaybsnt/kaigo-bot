import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { taskId } = await req.json();

        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
        }

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const customerId = process.env.AGORA_CUSTOMER_ID;
        const customerSecret = process.env.AGORA_CUSTOMER_SECRET ?? process.env.AGORA_CUSTOMER_CERTIFICATE;

        if (!appId || !customerId || !customerSecret) {
            return NextResponse.json({ error: 'Missing Agora credentials in env' }, { status: 500 });
        }

        const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;

        // Agora Real-Time STT v7 — Leave/stop endpoint
        // Docs: https://docs.agora.io/en/real-time-stt/rest-api/v7.x/join
        const stopRes = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/agents/${taskId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const responseText = await stopRes.text();
        console.log('[Agora STT] Stop response status:', stopRes.status);
        console.log('[Agora STT] Stop response body:', responseText);

        if (!stopRes.ok) {
            return NextResponse.json(
                { error: 'Failed to stop STT task', details: responseText },
                { status: stopRes.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Agora STT] Stop error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
