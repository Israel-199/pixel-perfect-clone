import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { validateEmail } from "@/lib/inputValidation";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email, "ኢሜይል (Email)");
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password) {
      setError("እባክዎ የይለፍ ቃልዎን ያስገቡ (Password is required).");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      login(data.token, data.user);
      if (data.user.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/my-books" });
      }
    } catch (err: any) {
      setError(err.message || "መግባት አልተሳካም። እባክዎ መረጃዎን ያረጋግጡ።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in flex min-h-[75vh] flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" variant="badge" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-navy">
          ወደ አካውንትዎ ይግቡ
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          አዲስ አካውንት የሎትም?{" "}
          <Link to="/register" className="font-medium text-gold hover:underline">
            እዚህ ይመዝገቡ
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow-card sm:rounded-xl sm:px-10 border border-gold/20">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                ኢሜይል አድራሻ <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                የይለፍ ቃል (Password) <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-medium text-gold hover:underline">
                የይለፍ ቃል ረሱ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep shadow transition-all hover:bg-gold/90 focus:outline-none disabled:opacity-50"
            >
              {loading ? "በመግባት ላይ..." : "ግባ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
