import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterRoute,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Input Validations
    if (!fullName.trim()) {
      setError("እባክዎ ሙሉ ስምዎን ያስገቡ (Full Name is required).");
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setError("እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ (Valid Phone Number is required).");
      return;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError("እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ (Valid Email is required).");
      return;
    }

    if (!password || password.length < 6) {
      setError("የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters).");
      return;
    }

    if (password !== confirmPassword) {
      setError("የይለፍ ቃሎቹ አይመሳሰሉም። እባክዎ እንደገና ያረጋግጡ (Passwords do not match).");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      login(data.token, data.user);
      navigate({ to: "/my-books" });
    } catch (err: any) {
      setError(err.message || "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in flex min-h-[80vh] flex-col justify-center px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" variant="badge" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-navy">
          አዲስ አካውንት ይፍጠሩ
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          አካውንት አለዎት?{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            እዚህ ይግቡ
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-navy mb-1">
                ሙሉ ስም (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ለምሳሌ፡ አበበ በቀለ"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
                ስልክ ቁጥር (Phone Number) <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911223344"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                ኢሜይል አድራሻ (Email Address) <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ቢያንስ 6 ፊደላት"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1">
                የይለፍ ቃል ማረጋገጫ (Confirm Password) <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full justify-center rounded-lg border border-transparent bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep shadow transition-all hover:bg-gold/90 focus:outline-none disabled:opacity-50"
            >
              {loading ? "በመመዝገብ ላይ..." : "ተመዝገብ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
