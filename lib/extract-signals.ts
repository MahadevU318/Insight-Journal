import { openai } from "./openai";
import { StructuredSignals } from "./types";
import { z } from "zod";

const SignalSchema = z.object({
  mood_score: z.number().min(1).max(10),
  stress_level: z.number().min(1).max(10),
  energy_level: z.number().min(1).max(10),
  themes: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),

  risk_flag: z.boolean(),
  risk_type: z
    .enum(["self_harm", "suicidal", "severe_distress"])
    .optional(),
  supportive_response: z.string().optional(),
});

export async function generateSignals(
  entry: string
): Promise<StructuredSignals> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You analyze journal entries into structured emotional signals.

You MUST ALWAYS return structured signals.

STEP 1 — Evaluate Risk:
If the entry contains:
- Self-harm intent
- Suicidal ideation
- Statements about wanting to disappear or not exist
- Explicit hopelessness with intent
- Severe breakdown signals

Then:
- Set risk_flag = true
- Set risk_type appropriately
- Provide a calm, supportive_response encouraging external support
- Do NOT provide medical advice
- Do NOT escalate dramatically

STEP 2 — If NO risk detected:
- Set risk_flag = false
- Do NOT include risk_type
- Do NOT include supportive_response

STEP 3 — Regardless of risk:
Always generate:
- mood_score (1–10)
- stress_level (1–10)
- energy_level (1–10)
- themes (array of emotional or situational themes)
- sentiment (positive | neutral | negative)

Return JSON only.
        `,
      },
      {
        role: "user",
        content: entry,
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";
  return SignalSchema.parse(JSON.parse(raw));
}