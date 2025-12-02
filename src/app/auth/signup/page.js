"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth(); 

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Trim all values
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      addresses: [{
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country || "India"
      }]
    };

    // STEP 1: SIGNUP
    const signupRes = await fetch(`${API}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!signupRes.ok) {
      let msg = "Signup failed";
      if (signupRes.status === 429) {
        msg = "Too many attempts. Please wait 1 minute and try again.";
      } else {
        try {
          const err = await signupRes.json();
          msg = err.message || msg;
        } catch {
          msg = await signupRes.text() || msg;
        }
      }
      throw new Error(msg);
    }

    toast.success(`Namaste ${firstName}! Account created successfully!`);

    // STEP 2: AUTO LOGIN (100% reliable way)
    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: email || phone,
        password,
      }),
    });

    if (!loginRes.ok) {
      toast.success("Account created! Please login to continue.");
      router.push("/auth/login");
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token;

    if (!token) {
      toast.success("Account created! Logging you in...");
      router.push("/auth/login");
      return;
    }

    // Save token
    localStorage.setItem("token", token);

    if (typeof login === "function") {
      try { await login(email || phone, password); } catch {}
    }

    // FINAL SUCCESS
    toast.success("Welcome back! Redirecting to home...");
    router.push("/");

  } catch (err) {
    console.error("Signup/Login Error:", err);
    toast.error(err.message || "Something went wrong. Please try again.");
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 py-2"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1727257050264-33a4f5f0982a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1287')",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-xl border border-gray-200">
        <button
          onClick={() => router.push("/")}
          className="absolute top-2 left-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="text-center mt-2 mb-4">
          <h1 className="text-4xl font-bold mb-2 text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create Account
          </h1>
          <p className="text-gray-600">Get started with your new account.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="John" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="Doe" required disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email address <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="you@example.com" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="9876543210" required disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address <span className="text-red-500">*</span></label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="123 Main Street" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode <span className="text-red-500">*</span></label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="110004" required disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="Delhi" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="Delhi" required disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="India" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" required disabled={loading} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white h-10 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-700 mt-1">
            Already have an account?{" "}
            <button type="button" onClick={() => router.push("/auth/login")} className="text-blue-600 font-semibold hover:underline">
              Log in
            </button>
          </p>
        </form>
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