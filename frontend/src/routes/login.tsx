import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { validateEmail } from "@/lib/inputValidation";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ግባ — RABBI Digital" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email, t("emailLabel"));
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password) {
      setError(t("passwordRequired"));
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
      setError(err.message || t("loginFailed"));
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
          {t("loginPageHeading")}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
          <span>{t("noAccountPrefix")}</span>
          <Link
            to="/register"
            className="text-[15px] font-semibold text-gold group-hover:text-yellow-300 dark:text-yellow-400 underline underline-offset-4 decoration-yellow-400/70 hover:decoration-yellow-600 transition-colors cursor-pointer"
          >
            {t("signUpHereText")}
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
                {t("emailLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                {t("passwordLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="block w-full rounded-lg border border-navy/20 px-3.5 py-2.5 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep shadow transition-all hover:bg-gold/90 focus:outline-none disabled:opacity-50"
            >
              {loading ? t("signingIn") : t("signInBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
