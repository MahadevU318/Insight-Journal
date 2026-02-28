"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

interface DailyInsight {
  summary: string;
  recommendation: string;
  mood_trend: string;
  dominant_themes: string[];
}

export default function InsightsPage() {
  const [insight, setInsight] = useState<DailyInsight | null>(null);

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
      </div>
    </div>
  );
}