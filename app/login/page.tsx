"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Check if already logged in on page load
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.access_token) router.push("/dashboard");
    }

    checkSession();

    // 🔹 Listen for login after magic link click
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) router.push("/journal");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Magic link sent! Check your email.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* App Name */}
        <h1
          className="text-4xl font-black text-black font-extrabold text-center mb-6"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Reflekt
        </h1>

        <h2 className="text-xl font-black text-black font-semibold text-center mb-4">
          Sign in with Magic Link
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}