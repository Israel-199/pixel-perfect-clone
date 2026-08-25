import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/rabbi/Logo";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"REQUEST" | "RESET">("REQUEST");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const data = await fetchApi<{ resetToken?: string; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setStep("RESET");
    } catch (err: any) {
      setError(err.message || "የይለፍ ቃል መልሶ ማግኛ ጥያቄ አልተሳካም።");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("አዲሶቹ የይለፍ ቃሎች አይመሳሰሉም።");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      setMessage(data.message);
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      setError(err.message || "የይለፍ ቃል መቀየር አልተሳካም።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in flex min-h-[75vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-navy">
          የይለፍ ቃል ለመቀየር
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ወደ መግቢያ ገጽ ለመመለስ{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            እዚህ ይጫኑ
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

          {message && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
              {message}
            </div>
          )}

          {step === "REQUEST" ? (
            <form className="space-y-5" onSubmit={handleRequestToken}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                  የተመዘገቡበት ኢሜይል አድራሻ
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

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg border border-transparent bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep shadow transition-all hover:bg-gold/90 focus:outline-none disabled:opacity-50"
              >
                {loading ? "በመላክ ላይ..." : "የማረጋገጫ ኮድ ላክ"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="resetToken" className="block text-sm font-medium text-navy mb-1">
                  የማረጋገጫ ኮድ (Reset Code)
                </label>
                <input
                  id="resetToken"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="6-digit code"
                  className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-navy mb-1">
                  አዲስ የይለፍ ቃል (New Password)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1">
                  አዲስ የይለፍ ቃል ማረጋገጫ (Confirm Password)
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
                {loading ? "በመቀየር ላይ..." : "የይለፍ ቃል ቀይር"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
