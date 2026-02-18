"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (response.success) {
        // setAuth({
        //   accessToken: response.data.tokens.AccessToken,
        //   refreshToken: response.data.tokens.RefreshToken,
        //   adminId: response.data.admin_id,
        //   email: response.data.email,
        // });
        // setAuth({
        //   accessToken: response.data.tokens.access_token,
        //   refreshToken: response.data.tokens.refresh_token,
        //   adminId: response.data.admin_id,
        //   email: response.data.email,
        // });
        router.push("/login");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-poppins">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/boat.jpg"
          alt="Ocean Background"
          fill
          className="object-cover"
          priority
        />
        {/* Blackish Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create an Account
          </h1>
          <p className="text-sm text-gray-500">
            Sign up to realize the full potential of SailMind
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block text-left">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block text-left">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              Password
            </label>
            <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 mt-4 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#1B6486] font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
