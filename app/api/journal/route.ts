// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase-server";
// import { supabaseAdmin } from "@/lib/supabase-admin";
// import { extractSignals } from "@/lib/extract-signals";

// export async function POST(req: Request) {
// const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { content } = await req.json();

//   if (!content) {
//     return NextResponse.json({ error: "No content provided" }, { status: 400 });
//   }

//   try {
//     // 1️⃣ Extract structured signals
//     const signals = await extractSignals(content);

//     // 2️⃣ Save journal entry
//     const { data: entry, error } = await supabaseAdmin
//       .from("journal_entries")
//       .insert({
//         user_id: user.id,
//         content,
//         sentiment_score: signals.sentiment_score,
//         intensity: signals.intensity,
//         themes: signals.themes,
//         is_sensitive: signals.is_sensitive,
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     // 3️⃣ Trigger insight generation (we'll build next)
//     // Placeholder for now:
//     return NextResponse.json({
//       success: true,
//       entry,
//     });

//   } catch (err: unknown) {
//   const message =
//     err instanceof Error ? err.message : "Unexpected error";

//   return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateSignals } from "@/lib/extract-signals";
import { generateDailyInsight } from "@/lib/insight-engine";

export async function POST(req: Request) {
  // 🔐 1. Read Authorization header
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized - Missing Bearer token" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  // 🔐 2. Verify token using Supabase
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }
  
  // 📦 3. Parse request body
  const { content } = await req.json();

  if (!content) {
    return NextResponse.json(
      { error: "No content provided" },
      { status: 400 }
    );
  }

  try {
    // 🧠 4. Extract structured signals
    const signals = await generateSignals(content);

    // 💾 5. Insert journal entry
    const { data: entry, error } = await supabaseAdmin
      .from("journal_entries")
      .insert({
        user_id: user.id,
        content,
        mood_score: signals.mood_score,
        energy_level: signals.energy_level,
        themes: signals.themes,
        stress_level: signals.stress_level,
        sentiment: signals.sentiment
      })
      .select()
      .single();
    const { data: todayEntries, error: fetchError } = await supabaseAdmin
  .from("journal_entries")
  .select("*")
  .eq("user_id", user.id)
  .gte(
    "created_at",
    new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  );

if (fetchError) throw fetchError;

const insight = await generateDailyInsight(todayEntries || []);
    return NextResponse.json({success: true, 
      entry,
      insight,});  
    if (error) throw error;

    return NextResponse.json({
      success: true,
      entry,
    })
    ;

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error";

    return NextResponse.json({ error: message }, { status: 500 });
  } 
}
