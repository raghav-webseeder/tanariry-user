
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function LostPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

const handleReset = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setIsSubmitted(true); 
  } catch (err) {
    console.log(err);
    alert("Something went wrong!");
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1727257050264-33a4f5f0982a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1287')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-200">
        {/* Back to Home */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="text-center mt-8 mb-8">
          <h1
            className="text-4xl font-bold mb-2 text-[#172554]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Reset Password
          </h1>
          <p className="text-gray-600">
            We'll send a recovery link to your email.
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                Check your email
              </p>
              <p className="text-sm text-gray-500 mt-1">
                If <span className="font-medium">{email}</span> is registered, we've sent a reset link.
              </p>
            </div>
            
            {/* NO REFRESH */}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* Form */
          <form className="space-y-6" onSubmit={handleReset}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white h-12 rounded-md font-medium hover:bg-gray-800 transition"
            >
              Send Recovery Link
            </button>

            {/* NO REFRESH: router.push */}
            <p className="text-center text-sm text-gray-700 mt-6">
              Remembered?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-4 left-4 text-white text-xs font-medium z-20 drop-shadow-md">
        © TANARIRI 2025, ALL RIGHTS RESERVED
      </div>
      <div className="absolute bottom-4 right-4 text-white text-xs font-medium z-20 drop-shadow-md text-right">
        DESIGNED BY <span className="font-bold">WEBSEEDER TECHNOLOGIES</span>
      </div>
    </div>
  );
}