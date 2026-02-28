import { openai } from "./openai";
import {
  AggregateSignals,
  RecurringEntry,
  DailyInsight,
} from "./types";
import { z } from "zod";

const InsightSchema = z.object({
  summary: z.string(),
  recommendation: z.string(),
  mood_trend: z.string(),
  dominant_themes: z.array(z.string()),
});

export async function generateDailyInsight(
  aggregate: AggregateSignals,
  recurring: RecurringEntry[]
): Promise<DailyInsight> {

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are an emotionally supportive reflection assistant for a journaling app called Reflekt.

IMPORTANT SAFEGUARDS:

- Do NOT provide medical or psychiatric diagnosis.
- Do NOT label the user with disorders.
- Do NOT make absolute statements about their personality.
- Do NOT give clinical treatment advice.
- Avoid deterministic language ("you always", "you never").
- Use reflective, supportive tone.
- Frame insights as observations, not facts.
- If emotional distress appears high (very low mood or very high stress),
  gently suggest considering external support without urgency escalation.

The goal is reflective self-awareness, not therapy.
Return JSON only.
Return format:
{
  summary: string,
  recommendation: string,
  mood_trend: string,
  dominant_themes: string[]
}
        `,
      },
      {
        role: "user",
        content: JSON.stringify({
          aggregate,
          recurring_patterns: recurring,
        }),
      },
    ],
  });

  const raw = response.choices[0].message.content || "{}";
  const parsed = InsightSchema.parse(JSON.parse(raw));

  return parsed;
}