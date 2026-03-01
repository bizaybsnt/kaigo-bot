import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert Japanese elderly care (kaigo) documentation assistant.
Extract structured care information from the caregiver's voice transcript and return ONLY a valid JSON object.
Be specific — include actual numbers, quantities, and names when mentioned.
Use null for any field not mentioned in the transcript.

Return JSON in this EXACT format (no markdown, no code blocks, raw JSON only):
{
  "foodIntake": "description of food consumption e.g. 'Ate 100% of breakfast: rice porridge, miso soup, grilled fish'",
  "hydration": "fluid intake description or null",
  "medication": "medication details e.g. 'Morning blood pressure and diabetes pills administered' or null",
  "vitalSigns": "any vital signs mentioned e.g. 'BP 130/80, Pulse 72, Temp 36.5°C' or null",
  "mobility": "physical activity or mobility e.g. 'Walked 10 minutes in garden with assistance' or null",
  "mood": "emotional/mental state e.g. 'Cheerful and cooperative, engaged in conversation' or null",
  "skinCondition": "skin observations e.g. 'No redness or bedsores noted' or null",
  "toileting": "toileting/elimination details or null",
  "observations": "overall summary of the care visit with key events (required, never null)",
  "followUp": "required follow-up actions or concerns to escalate or null"
}`;

function extractJson(raw: string): Record<string, string | null> | null {
    // Try direct parse
    try {
        return JSON.parse(raw);
    } catch {}

    // Try extracting from markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
        try {
            return JSON.parse(match[1].trim());
        } catch {}
    }

    // Try finding a JSON object by braces
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
        try {
            return JSON.parse(raw.slice(start, end + 1));
        } catch {}
    }

    return null;
}

export async function POST(req: Request) {
    try {
        const { transcript, patientName, patientRoom } = await req.json();

        // Support both MINMAX_TOKEN (already in .env) and MINIMAX_API_KEY
        const apiKey = process.env.MINMAX_TOKEN ?? process.env.MINIMAX_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "MINMAX_TOKEN not set in .env" }, { status: 500 });
        }

        const model = process.env.MINIMAX_MODEL ?? "MiniMax-Text-01";

        const userMessage = [
            `Patient: ${patientName ?? "Unknown"}`,
            patientRoom ? `Room: ${patientRoom}` : null,
            ``,
            `Caregiver transcript:`,
            transcript || "(no transcript — generate a placeholder report)",
        ]
            .filter(Boolean)
            .join("\n");

        const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 1024,
            }),
        });

        const raw = await response.text();
        console.log("[MiniMax] status:", response.status);
        console.log("[MiniMax] body:", raw);

        if (!response.ok) {
            return NextResponse.json({ error: "MiniMax API error", details: raw }, { status: response.status });
        }

        const json = JSON.parse(raw);
        const content: string = json?.choices?.[0]?.message?.content ?? "";

        const parsed = extractJson(content);

        if (!parsed) {
            console.warn("[MiniMax] could not parse structured JSON, using fallback");
            return NextResponse.json({
                foodIntake: null,
                hydration: null,
                medication: null,
                vitalSigns: null,
                mobility: null,
                mood: null,
                skinCondition: null,
                toileting: null,
                observations: content || transcript || "No information available.",
                followUp: null,
            });
        }

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error("[MiniMax] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
