import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";
import { generateSignals } from "@/lib/extract-signals";
import { generateEmbedding } from "@/lib/generateEmbedding";

export async function POST(req: Request) {
  try {
    /*
    ----------------------------------------------------
    STEP 0 — Extract & Validate Supabase Auth Token
    ----------------------------------------------------
    */

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const user_id = user.id;

    /*
    ----------------------------------------------------
    STEP 1 — Get Entry Content
    ----------------------------------------------------
    */

    const { content } = await req.json();

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: "Entry must be at least 100 characters." },
        { status: 400 }
      );
    }

    /*
    ----------------------------------------------------
    STEP 2 — Generate Structured Signals + Embedding
    ----------------------------------------------------
    */

    const signals = await generateSignals(content);
    const embedding = await generateEmbedding(content);

    const { error: insertError } =
      await supabaseClient.from("structured_signals").insert({
        user_id,
        raw_text: content,
        mood_score: signals.mood_score,
        stress_level: signals.stress_level,
        energy_level: signals.energy_level,
        sentiment: signals.sentiment,
        themes: signals.themes,
        risk_flag: signals.risk_flag,
        risk_type: signals.risk_type ?? null,
        embedding,
      });

    if (insertError) {
      throw insertError;
    }

    /*
    ----------------------------------------------------
    STEP 3 — If Sensitive Content → Return Support Page
    ----------------------------------------------------
    */

    if (signals.risk_flag) {
      return NextResponse.json({
        type: "support",
        message: signals.supportive_response,
      });
    }

    /*
    ----------------------------------------------------
    STEP 4 — Check If Enough Data Exists (Last 7 Days)
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

    if (fetchError) {
      throw fetchError;
    }

    if (!last7Days || last7Days.length < 3) {
      // Require minimum 3 entries before insights
      return NextResponse.json({
        type: "not_enough_data",
      });
    }

    /*
    ----------------------------------------------------
    STEP 5 — Call generate.ts Internally
    ----------------------------------------------------
    */

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // pass same token forward
      },
      body: JSON.stringify({}),
    });

    /*
    ----------------------------------------------------
    STEP 6 — Success → Frontend Routes to Insights
    ----------------------------------------------------
    */

    return NextResponse.json({
      type: "success",
    });

  } catch (err) {
    console.error("Submit entry error:", err);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}