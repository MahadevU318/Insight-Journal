"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("SUPABASE_TOKEN");
    if (!token) return alert("Please log in first");

    try {
      setLoading(true);

      const res = await fetch("/api/submit-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      // 🔥 Route Based on Backend Decision
      if (data.type === "support") {
        router.push(
          `/support?message=${encodeURIComponent(data.message)}`
        );
      } else if (data.type === "not_enough_data") {
        router.push("/not-enough-data");
      } else if (data.type === "success") {
        router.push("/insights");
      }

    } catch (error) {
      alert("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-teal-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        {/* App Name */}
        <h1
          className="text-4xl font-extrabold text-center mb-6"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Reflekt
        </h1>

        <h2 className="text-xl font-semibold mb-4">
          Write Your Journal
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full p-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your day?"
            required
          />

          <button
            className="py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}