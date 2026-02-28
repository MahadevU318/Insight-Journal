"use client";

import { useRouter } from "next/navigation";

export default function NotEnoughDataPage() {
  const router = useRouter();

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

        <h2 className="text-2xl font-semibold mb-4">
          Not Enough Data Yet
        </h2>

        <p className="text-gray-600 mb-6">
          Keep journaling consistently so we can generate meaningful insights
          about your patterns and emotions.
        </p>

        <button
          onClick={() => router.push("/journal")}
          className="py-3 px-6 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
        >
          Back to Journal
        </button>
      </div>
    </div>
  );
}