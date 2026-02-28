import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function findSimilarEntriesRolling(
  userId: string,
  embedding: number[],
  daysWindow: number = 7
) {
  const { data, error } = await supabase.rpc(
    "match_journal_entries_rolling",
    {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 5,
      user_id_input: userId,
      days_window: daysWindow,
    }
  );

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}