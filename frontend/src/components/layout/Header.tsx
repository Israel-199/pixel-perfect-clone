import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Search, User as UserIcon, LogOut, X, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";

const BASE_NAV = [
  { label: "ቤት", href: "/" },
  { label: "መጽሐፍት", href: "/books" },
  { label: "ሚዲያ", href: "/media" },
  { label: "ጽሑፎች", href: "/articles" },
  { label: "ጸሎት", href: "/prayer" },
  { label: "ኮርስ", href: "/courses" },
  { label: "ስለ RABBI", href: "/about" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [...BASE_NAV];

  if (user) {
    navItems.splice(2, 0, { label: "የእኔ መጽሃፎች", href: "/my-books" });
    if (user.role === "ADMIN") {
      navItems.push({ label: "ADMIN PANEL", href: "/admin" });
    }
  }

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="bg-navy-deep sticky top-0 z-50 border-b border-gold/10">
        <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-6 py-4">
          <Logo />
          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
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

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/my-books"
                  className="flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-[0.75rem] font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{user.fullName || user.email.split("@")[0]}</span>
                </Link>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="ውጣ / Logout"
                  className="flex items-center justify-center rounded-full bg-red-500/10 p-2 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gold/10 px-5 py-2 text-[0.72rem] font-semibold tracking-wide text-gold border border-gold/40 transition-all hover:bg-gold hover:text-navy-deep active:scale-95 touch-manipulation"
              >
                ግባ / Login
              </Link>
            )}

            <Link
              to="/books"
              className="rounded-md bg-gold px-4 py-2 text-[0.72rem] font-semibold tracking-wide text-navy-deep transition-all hover:opacity-90 active:scale-95 hidden sm:inline-block"
            >
              APP ይመርኳ
            </Link>

            <button
              aria-label="ፈልግ"
              className="text-on-navy-muted transition-colors hover:text-gold ml-1"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-gold/30 shadow-2xl p-6 text-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-3.5 right-3.5 rounded-full p-1 text-muted-foreground hover:bg-navy/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="font-display text-lg font-bold text-navy mb-2">
              ከስርዓቱ መውጣት ይፈልጋሉ?
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              ከወጡ በኋላ ወደ እርስዎ መጽሐፍትና ሚዲያዎች ለመግባት እንደገና መግባት ይኖርብዎታል።
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-accent transition-all"
              >
                ተመለስ (Cancel)
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                አዎ፣ ውጣ (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
