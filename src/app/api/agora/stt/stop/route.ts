import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { taskId } = await req.json();
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const customerId = process.env.AGORA_CUSTOMER_ID;
        const customerSecret = process.env.AGORA_CUSTOMER_CERTIFICATE;

        if (!appId || !customerId || !customerSecret) {
            return NextResponse.json({ error: 'Missing Agora credentials in env' }, { status: 500 });
        }

        const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;

        // Agora STT v7 Leave Endpoint
        const stopRes = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/agents/${taskId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        if (!stopRes.ok) {
            const errorText = await stopRes.text();
            return NextResponse.json({ error: 'Failed to stop task', details: errorText }, { status: stopRes.status });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
