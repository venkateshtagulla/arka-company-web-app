"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/* ---------- password validation ---------- */
const validatePassword = (password: string) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // old / temp password
  const [newPassword, setNewPassword] = useState(""); // first login only

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isFirstLogin && !validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response = isFirstLogin
        ? await authApi.login(email, password, newPassword)
        : await authApi.login(email, password);
      const raw = response;

      const parsed =
        typeof raw.body === "string"
          ? JSON.parse(raw.body)
          : raw.body;

      if (!parsed.success) {
        setError(response.message || "Login failed");
        return;
      }
      const { redirect_url, tokens, admin_id, email: userEmail } = parsed.data;
      console.log("response data--------",response.data)
      if (redirect_url) {
        window.open(redirect_url, "_blank");
        //window.location.href = redirect_url;
        return;
      }
      // setAuth({
      //   accessToken: tokens.AccessToken,
      //   refreshToken: tokens.RefreshToken,
      //   adminId: admin_id,
      //   email: userEmail,
      // });

      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
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
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isFirstLogin ? "Change Your Password" : "Sign in to your Account"}
          </h1>
          <p className="text-sm text-gray-500">
            {isFirstLogin
              ? "You must update your password to continue"
              : "Enter your email and password to get started"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Old / Temp Password */}
          {!isFirstLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block text-left">
                Password
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          )}

          {/* New Password (first login only) */}
          {isFirstLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block text-left">
                New Password
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1B6486] transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 mt-4 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            {loading
              ? "Processing..."
              : isFirstLogin
              ? "Update Password"
              : "Sign In"}
          </button>
        </form>

        {!isFirstLogin && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#1B6486] font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
