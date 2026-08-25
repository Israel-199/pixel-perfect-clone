import { Link, useLocation } from "@tanstack/react-router";
import { Search, User as UserIcon, LogOut, Shield } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";

const BASE_NAV = [
  { label: "ቤት", href: "/" },
  { label: "መጽሐፍት", href: "/books" },
  { label: "ሚዲያ", href: "/media" },
  { label: "ጽሑፎች", href: "/articles" },
  { label: "ጸሎት", href: "/prayer" },
  { label: "ስለ RABBI", href: "/about" },
];

export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [...BASE_NAV];

  if (user) {
    navItems.splice(2, 0, { label: "የእኔ መጽሃፎች", href: "/my-books" });
    if (user.role === "ADMIN") {
      navItems.push({ label: "ADMIN PANEL", href: "/admin" });
    }
  }

  return (
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
                onClick={logout}
                title="ውጣ / Logout"
                className="flex items-center justify-center rounded-full bg-red-500/10 p-2 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
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

          <a
            href="#"
            className="rounded-md bg-gold px-4 py-2 text-[0.72rem] font-semibold tracking-wide text-navy-deep transition-all hover:opacity-90 active:scale-95 hidden sm:inline-block"
          >
            APP ይመርኳ
          </a>

          <button
            aria-label="ፈልግ"
            className="text-on-navy-muted transition-colors hover:text-gold ml-1"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
