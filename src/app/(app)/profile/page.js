"use client";

import { useState, useEffect } from "react";
import StayInspired from "@/components/home/StayInspired";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", pincode: "", city: "", state: "", country: "India",
    currentPassword: "", newPassword: "", confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    if (user) {
      const addresses = Array.isArray(user.addresses) ? user.addresses : [];
      const primary = addresses[0] || {};

      setFormData({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        address: primary.address || "",
        pincode: primary.pincode || "",
        city: primary.city || "",
        state: primary.state || "",
        country: primary.country || "India",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = localStorage.getItem('token');

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addresses: [{
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        }],
      };
  if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch(`${API}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updatedUser = {
        ...user,
        firstName: data.customer?.firstName || formData.firstName,
        lastName: data.customer?.lastName || formData.lastName,
        email: data.customer?.email || formData.email,
        phone: data.customer?.phone || formData.phone,
        addresses: Array.isArray(data.customer?.addresses) ? data.customer.addresses : payload.addresses,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile updated successfully!");

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordOnlySubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    setPassLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");

      toast.success("Password changed successfully!");
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" size={40} /></div>;
  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="mx-auto">
           <div className="relative inline-block pb-4 mb-6">
            <h1 className="text-5xl text-[#172554]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              My Profile
            </h1>
            <div className="absolute left-0 bottom-0 h-1 bg-[#172554] rounded-full w-full overflow-hidden">
              <div className="absolute inset-0 bg-pink-500 animate-shimmer"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">

            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 ">
              <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                Account Details
              </h2>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email address <span className="text-red-500">*</span></label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" /></div>
                </div>

                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                    <input name="address" type="text" value={formData.address} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" /></div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input name="pincode" placeholder="Pincode *" value={formData.pincode} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                    <input name="city" placeholder="City *" value={formData.city} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                    <input name="state" placeholder="State *" value={formData.state} onChange={handleChange} required disabled={loading}
                      className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                    <input value={formData.country} disabled className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-200" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? <>Saving...</> : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#172554] rounded-2xl shadow-xl p-8 lg:p-10 text-white flex flex-col h-full">

              <div className="mb-6">
                <p className="text-white/90 text-lg leading-relaxed">
                  Secure your account with a new password
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Keep your Tanariri account safe and protected
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                Change Password
              </h2>

              <form onSubmit={handlePasswordOnlySubmit} className="space-y-5 mt-auto">
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="Current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />

                <button
                  type="submit"
                  disabled={passLoading || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                  className="w-full bg-white text-[#1E3A8A] font-bold py-4 rounded-xl hover:bg-gray-100 transition transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {passLoading ? "Updating Password..." : "Update Password"}
                </button>

                <p className="text-center text-white/70 text-sm">
                  Leave blank if you don't want to change
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>

      <StayInspired />
    </>
  );
}