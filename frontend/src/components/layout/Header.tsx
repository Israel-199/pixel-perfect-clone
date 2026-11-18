import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Search, User as UserIcon, LogOut, X, AlertTriangle, Globe, Menu } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";
import { useLanguage, Language } from "@/lib/language";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: t("navHome"), href: "/" },
    { label: t("navBooks"), href: "/books" },
    ...(user ? [{ label: t("navMyBooks"), href: "/my-books" }] : []),
    { label: t("navMedia"), href: "/media" },
    { label: t("navArticles"), href: "/articles" },
    { label: t("navPrayer"), href: "/prayer" },
    { label: t("navCourses"), href: "/courses" },
    { label: t("navAbout"), href: "/about" },
    ...(user?.role === "ADMIN" ? [{ label: t("navAdmin"), href: "/admin" }] : []),
  ];

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="bg-navy-deep sticky top-0 z-50 border-b border-gold/10 shadow-md">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 sm:gap-6 px-4 sm:px-6 py-3.5">
          <Logo />
          <nav className="ml-auto hidden items-center gap-5 lg:flex">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-[0.78rem] font-medium tracking-wide transition-colors hover:text-gold ${
                    isActive ? "text-gold font-bold" : "text-on-navy-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
            {/* ── 3-Language Selector Pill ──────────────────────────────── */}
            <div className="flex items-center rounded-full bg-navy/60 p-0.5 border border-gold/30 text-[11px] shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage("am")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  language === "am"
                    ? "bg-gold text-navy-deep shadow-xs"
                    : "text-gold/70 hover:text-gold"
                }`}
                title="አማርኛ (Amharic)"
              >
                አማ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("or")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  language === "or"
                    ? "bg-gold text-navy-deep shadow-xs"
                    : "text-gold/70 hover:text-gold"
                }`}
                title="Afaan Oromoo"
              >
                ORO
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-gold text-navy-deep shadow-xs"
                    : "text-gold/70 hover:text-gold"
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <Link
                  to="/my-books"
                  className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-gold/15 px-2.5 sm:px-4 py-1.5 text-[0.72rem] sm:text-[0.75rem] font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="max-w-[70px] sm:max-w-none truncate">{user.fullName || user.email.split("@")[0]}</span>
                </Link>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title={t("logout")}
                  className="flex items-center justify-center rounded-full bg-red-500/10 p-1.5 sm:p-2 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gold/10 px-3 sm:px-5 py-1.5 sm:py-2 text-[0.72rem] font-semibold tracking-wide text-gold border border-gold/40 transition-all hover:bg-gold hover:text-navy-deep active:scale-95 touch-manipulation cursor-pointer"
              >
                {t("login")}
              </Link>
            )}

            {/* ── Mobile & Tablet Hamburger Button ──────────────────────── */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="flex lg:hidden items-center justify-center rounded-full p-2 text-gold hover:bg-gold/15 border border-gold/30 transition-all cursor-pointer active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile & Tablet Dropdown Navigation Drawer ──────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gold/20 bg-navy-deep/98 px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1 max-h-[75vh] overflow-y-auto py-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/" && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-gold text-navy-deep font-bold shadow-xs"
                        : "text-on-navy-muted hover:bg-white/5 hover:text-gold"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-navy-deep" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-gold/30 shadow-2xl p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-navy mb-1">
              {t("logoutConfirmTitle")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              {t("logoutConfirmDesc")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-semibold text-navy hover:bg-navy/5 transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {t("confirmLogout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



