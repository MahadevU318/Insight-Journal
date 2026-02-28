"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

interface DailyInsight {
  id: string;
  summary: string;
  recommendation: string;
  mood_trend: string;
  dominant_themes: string[];
  helpful: boolean | null;
}

export default function InsightsPage() {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const submitFeedback = async (isHelpful: boolean) => {
    if (!insight || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);

    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/insights/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          insight_id: insight.id,
          helpful: isHelpful,
        }),
      });

      if (!res.ok) return;

      setInsight((prev) => (prev ? { ...prev, helpful: isHelpful } : prev));
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchInsight = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/insights/latest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setInsight(data);
    };

    fetchInsight();
  }, []);

  if (!insight) return <p className="min-h-screen flex items-center justify-center">Loading insight...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100 to-orange-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        {/* App Name */}
        <h1 className="text-4xl font-black font-extrabold text-center mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Reflekt
        </h1>

        <h2 className="text-xl font-black font-semibold mb-4 text-center">Today&apos;s Insight</h2>
        <div className="space-y-3">
          <p><strong>Summary:</strong> {insight.summary}</p>
          <p><strong>Recommendation:</strong> {insight.recommendation}</p>
          <p><strong>Mood Trend:</strong> {insight.mood_trend}</p>
          <p><strong>Dominant Themes:</strong> {insight.dominant_themes.join(", ")}</p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => submitFeedback(true)}
            disabled={isSubmittingFeedback}
            className="rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            👍 Helpful
          </button>
          <button
            type="button"
            onClick={() => submitFeedback(false)}
            disabled={isSubmittingFeedback}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            👎 Not helpful
          </button>
        </div>
      </div>
    </div>
  );
}
