import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";
import { aggregateLastSevenDays } from "@/lib/aggregateSignals";
import { findSimilarEntriesRolling } from "@/lib/similarityEngine";
import { generateDailyInsight } from "@/lib/generateDailyInsight";

export async function POST(req: Request) {
  try {
    /*
    ----------------------------------------------------
    STEP 0 — Extract User From Supabase Token
    ----------------------------------------------------
    */

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user_id = user.id;

    /*
    ----------------------------------------------------
    STEP 1 — Fetch Last 7 Days Signals
    ----------------------------------------------------
    */

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: last7Days, error: fetchError } =
      await supabaseClient
        .from("structured_signals")
        .select("*")
        .eq("user_id", user_id)
        .gte("created_at", sevenDaysAgo.toISOString());

    if (fetchError) throw fetchError;

    if (!last7Days || last7Days.length < 3) {
      return NextResponse.json({ type: "not_enough_data" });
    }

    /*
    ----------------------------------------------------
    STEP 2 — Aggregate + Similarity
    ----------------------------------------------------
    */

    const aggregate = aggregateLastSevenDays(last7Days);

    // Get most recent entry embedding
    const latestEntry = last7Days.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

    const similarityClusters =
      await findSimilarEntriesRolling(
        user_id,
        latestEntry.embedding,
        7
      );

    /*
    ----------------------------------------------------
    STEP 3 — Store Summary Row
    ----------------------------------------------------
    */

    await supabaseClient
      .from("summary_structured_signals")
      .insert({
        user_id,
        avg_mood: aggregate.avg_mood,
        avg_stress: aggregate.avg_stress,
        avg_energy: aggregate.avg_energy,
        dominant_themes: aggregate.dominant_themes,
        similarity_clusters: similarityClusters,
      });

    /*
    ----------------------------------------------------
    STEP 4 — Generate Daily Insight
    ----------------------------------------------------
    */

    const insight = await generateDailyInsight(
      aggregate,
      similarityClusters
    );

    const { error: insightError } =
      await supabaseClient
        .from("daily_insights")
        .insert({
          user_id,
          summary: insight.summary,
          recommendation: insight.recommendation,
          mood_trend: insight.mood_trend,
          dominant_themes: insight.dominant_themes,
        });

    if (insightError) throw insightError;

    /*
    ----------------------------------------------------
    STEP 5 — Call latest.ts Internally
    ----------------------------------------------------
    */

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/insights/latest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({ type: "generated" });

  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}