import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

interface FeedbackBody {
  insight_id?: string;
  helpful?: boolean;
}

export async function POST(req: Request) {
  try {
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

    const body = (await req.json()) as FeedbackBody;

    if (!body.insight_id || typeof body.helpful !== "boolean") {
      return NextResponse.json(
        { error: "insight_id and helpful are required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseClient
      .from("daily_insights")
      .update({ helpful: body.helpful })
      .eq("id", body.insight_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Insight feedback update error:", error);
      return NextResponse.json(
        { error: "Unable to update feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Insight feedback route error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
