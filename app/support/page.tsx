"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SupportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const message = searchParams.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-teal-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center">
        
        {/* App Name */}
        <h1
          className="text-4xl font-extrabold mb-6"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Reflekt
        </h1>

        <h2 className="text-2xl font-semibold mb-4 text-red-600">
          We’re Here For You 💚
        </h2>

        <p className="text-gray-700 mb-6">
          {message || 
            "It seems like you may be going through a difficult time. Please consider reaching out to someone you trust or a professional for support."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/journal")}
            className="py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
          >
            Continue Journaling
          </button>

          <button
            onClick={() => router.push("/")}
            className="py-3 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}