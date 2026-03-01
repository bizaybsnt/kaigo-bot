import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert Japanese elderly care (Kaigo) documentation AI. Your objective is to generate accurate, professional, and structured care reports based on real-time voice transcripts from caregivers.

### CONTEXT PROVIDED TO YOU:
1. Current Transcript: Real-time dictation of the caregiver's actions and observations.
2. Patient Information: Baseline health and demographic data.
3. Previous Logs: Historical data to help you identify trends, changes, or continuity.

### INSTRUCTIONS:
- Extract Specifics: Capture precise details from the transcript, including exact numbers, percentages (e.g., "ate 80%"), vital signs, and specific names of foods, activities, or medications.
- Synthesize Trends: Use previous logs to inform the "observations" and "followUp" fields. Explicitly note any improvements, declines, or recurring issues.
- Language & Tone: Output all JSON values in professional, respectful Japanese caregiving terminology (適切な介護記録の専門用語).
- Strict Grounding: Do NOT assume or invent information. If a data point is not explicitly mentioned or clearly implied in the current transcript, you MUST output `null` for that field.
- There can surronding noise and unwanted transcripted word, so assume considering patient info and previous logs to generate the report.

### OUTPUT FORMAT:
Return ONLY raw, valid JSON. You are strictly forbidden from using markdown formatting (do not use ```json or``` blocks), preambles, or postscripts. 

Use this EXACT schema:
{
  "foodIntake": "Description of food consumption (e.g., '昼食を8割摂取。お粥、味噌汁'). Use null if not mentioned.",
  "hydration": "Fluid intake description (e.g., 'お茶150ml'). Use null if not mentioned.",
  "medication": "Medication details (e.g., '昼の血圧薬と糖尿病薬を服用'). Use null if not mentioned.",
  "vitalSigns": "Vital signs (e.g., '体温36.5℃、血圧130/80、脈拍72'). Use null if not mentioned.",
  "mobility": "Physical activity/mobility (e.g., '歩行器で室内を5分歩行'). Use null if not mentioned.",
  "mood": "Emotional/mental state (e.g., '機嫌良く、会話に積極的に参加'). Use null if not mentioned.",
  "skinCondition": "Skin observations (e.g., '仙骨部に発赤なし'). Use null if not mentioned.",
  "toileting": "Toileting/elimination details (e.g., '排尿あり、異常なし'). Use null if not mentioned.",
  "observations": "Overall summary of this visit, noting any changes, trends, or continuity compared to previous logs. (REQUIRED, never null)",
  "followUp": "Required follow-up actions, concerns to escalate, or ongoing issues from previous logs. Use null if none."
}`;

function extractJson(raw: string): Record<string, string | null> | null {
    // Try direct parse
    try {
        return JSON.parse(raw);
    } catch { }

    // Try extracting from markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
        try {
            return JSON.parse(match[1].trim());
        } catch { }
    }

    // Try finding a JSON object by braces
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
        try {
            return JSON.parse(raw.slice(start, end + 1));
        } catch { }
    }

    return null;
}

export async function POST(req: Request) {
    try {
        const { transcript, patientName, patientRoom, previousReports } = await req.json();

        // Support both MINMAX_TOKEN (already in .env) and MINIMAX_API_KEY
        const apiKey = process.env.MINMAX_TOKEN ?? process.env.MINIMAX_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "MINMAX_TOKEN not set in .env" }, { status: 500 });
        }

        const model = process.env.MINIMAX_MODEL ?? "MiniMax-Text-01";

        // Build previous logs context block
        const historyBlock = Array.isArray(previousReports) && previousReports.length > 0
            ? [
                "=== PREVIOUS CARE LOGS (most recent first, use as context only) ===",
                ...previousReports.map((r: Record<string, string | null>, i: number) => {
                    const date = new Date(r.timestamp ?? "").toLocaleString([], {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                    });
                    const lines = [
                        `--- Log ${i + 1}: ${date} ---`,
                        r.foodIntake ? `Food: ${r.foodIntake}` : null,
                        r.hydration ? `Hydration: ${r.hydration}` : null,
                        r.medication ? `Medication: ${r.medication}` : null,
                        r.vitalSigns ? `Vitals: ${r.vitalSigns}` : null,
                        r.mobility ? `Mobility: ${r.mobility}` : null,
                        r.mood ? `Mood: ${r.mood}` : null,
                        r.skinCondition ? `Skin: ${r.skinCondition}` : null,
                        r.toileting ? `Toileting: ${r.toileting}` : null,
                        r.observations ? `Observations: ${r.observations}` : null,
                        r.followUp ? `Follow-up: ${r.followUp}` : null,
                    ].filter(Boolean);
                    return lines.join("\n");
                }),
                "=== END OF PREVIOUS LOGS ===",
                "",
            ].join("\n")
            : "";

        const userMessage = [
            `Patient: ${patientName ?? "Unknown"}`,
            patientRoom ? `Room: ${patientRoom}` : null,
            "",
            historyBlock,
            "=== CURRENT VISIT TRANSCRIPT ===",
            transcript || "(no transcript — generate a placeholder report based on context)",
            "=== END OF TRANSCRIPT ===",
        ]
            .filter(s => s !== null)
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
