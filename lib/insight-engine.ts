import OpenAI from "openai";

/**
 * Journal entry shape from DB
 */
export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  sentiment_score: number;
  intensity: number;
  themes: string[];
  is_sensitive: boolean;
  created_at: string;
}

/**
 * Final daily insight shape returned to API
 */
export interface DailyInsight {
  summary: string;
  mood_trend: string;
  dominant_themes: string[];
  recommendation: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Extract dominant themes by frequency
 */
const extractThemes = (entries: JournalEntry[]): string[] => {
  const themeCounts: Record<string, number> = {};

  for (const entry of entries) {
    for (const theme of entry.themes) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }

  return Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 5); // top 5 themes
};

/**
 * Calculate mood trend
 */
const calculateMoodTrend = (entries: JournalEntry[]): string => {
  if (entries.length === 0) return "No data";

  const avg =
    entries.reduce((sum, e) => sum + e.sentiment_score, 0) /
    entries.length;

  if (avg > 0.4) return "Positive trend";
  if (avg < -0.4) return "Negative trend";
  return "Stable / Mixed";
};

/**
 * Main insight generator
 */
export const generateDailyInsight = async (
  entries: JournalEntry[]
): Promise<DailyInsight> => {
  if (entries.length === 0) {
    return {
      summary: "No journal entries yet today.",
      mood_trend: "No data",
      dominant_themes: [],
      recommendation: "Start by writing a short reflection about your day.",
    };
  }

  const dominantThemes = extractThemes(entries);
  const moodTrend = calculateMoodTrend(entries);

  const combinedContent = entries
    .map((e) => `- ${e.content}`)
    .join("\n");

  const prompt = `
You are an emotionally intelligent reflection assistant.

Based on these journal entries:

${combinedContent}

Dominant themes: ${dominantThemes.join(", ")}
Mood trend: ${moodTrend}

Write:
1. A short 2-3 sentence emotional summary
2. A supportive recommendation for tomorrow

Respond in JSON format:
{
  "summary": "...",
  "recommendation": "..."
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: "You are a thoughtful reflection coach." },
      { role: "user", content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  let parsed: { summary: string; recommendation: string };

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  return {
    summary: parsed.summary,
    recommendation: parsed.recommendation,
    mood_trend: moodTrend,
    dominant_themes: dominantThemes,
  };
};