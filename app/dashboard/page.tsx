"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export default function DashboardPage() {
  const [entry, setEntry] = useState("");
  const [message, setMessage] = useState("");

  async function submitEntry() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
      alert("You are not logged in.");
      return;
    }

    const token = session.access_token;

    const res = await fetch("/api/submit-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ entry }),
    });

    const data = await res.json();
    setMessage(JSON.stringify(data));
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your journal entry..."
        rows={5}
        cols={40}
      />

      <br />
      <button onClick={submitEntry}>Save Entry</button>

      <p>{message}</p>
    </div>
  );
}