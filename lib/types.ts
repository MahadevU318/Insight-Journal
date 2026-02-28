export interface StructuredSignals {
  mood_score: number;
  stress_level: number;
  energy_level: number;
  themes: string[];
  sentiment: "positive" | "neutral" | "negative";

  risk_flag: boolean;
  risk_type?: "self_harm" | "suicidal" | "severe_distress";
  supportive_response?: string;
}

export interface AggregateSignals {
  avg_mood: number;
  avg_stress: number;
  avg_energy: number;
  dominant_themes: string[];
}

export interface RecurringEntry {
  theme: string;
  frequency: number;
}

export interface DailyInsight {
  summary: string;
  recommendation: string;
  mood_trend: string;
  dominant_themes: string[];
}