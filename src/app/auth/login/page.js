"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/context/AuthContext';   
import toast from "react-hot-toast";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login: authLogin } = useAuth();  


  const { isEmail, isPhone } = useMemo(() => {
    const value = identifier ?? "";
    const trimmed = String(value).trim();

    return {
      isEmail: trimmed.includes('@') && trimmed.length > 0,
      isPhone: /^\d{10}$/.test(trimmed),
    };
  }, [identifier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authLogin(identifier, password);

      toast.success("Welcome back to TanaRiri!");

      router.push('/');
      router.refresh();  

    } catch (err) {
      toast.error(err.message || "Invalid credentials");
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
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
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-xl border border-gray-200">
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="text-center mt-8 mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Login
          </h1>
          <p className="text-gray-600">Use Email or Phone</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Phone or Email<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-12 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder={
                  isEmail
                    ? "you@example.com"
                    : isPhone
                    ? "9876543210"
                    : "Enter email or 10-digit phone"
                }
                required
                disabled={loading}
                autoComplete="username"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-all">
                {isEmail ? <Mail size={18} /> : isPhone ? <Phone size={18} /> : <Mail size={18} />}
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !identifier || !password}
            className="w-full bg-black text-white h-12 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-blue-600 text-sm font-medium hover:underline"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

        </form>

        <p className="text-center text-sm text-gray-700 mt-8">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>

      <div className="absolute bottom-4 left-4 text-white text-sm opacity-80">
        TANARIRI 2025, ALL RIGHTS RESERVED
      </div>
      <div className="absolute bottom-4 right-4 text-white text-sm opacity-80 text-right">
        DESIGNED BY <span className="font-semibold">WEBSEEDER TECHNOLOGIES</span>
      </div>
    </div>
  );
}