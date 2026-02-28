import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

async function getLatestInsight(req: Request) {
  try {
    /*
    ----------------------------------------------------
    STEP 0 — Extract User From Token
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
    STEP 1 — Fetch Most Recent Insight
    ----------------------------------------------------
    */

    const { data: insight, error } = await supabaseClient
      .from("daily_insights")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !insight) {
      return NextResponse.json(
        { error: "No insights available." },
        { status: 404 }
      );
    }

    /*
    ----------------------------------------------------
    STEP 2 — Return Insight
    ----------------------------------------------------
    */

    return NextResponse.json(insight);
  } catch (err) {
    console.error("Latest insight error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return getLatestInsight(req);
}

export async function POST(req: Request) {
  return getLatestInsight(req);
}
