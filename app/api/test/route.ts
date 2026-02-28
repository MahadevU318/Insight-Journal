import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server API route using service key and token
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // Supabase service role key
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

 const { data, error } = await supabaseServer.auth.getUser(token);

if (error || !data.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const userId = data.user.id; 
return userId
}