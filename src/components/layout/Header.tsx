import { Link, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";

const NAV = [
  { label: "ቤት", href: "/" },
  { label: "መጽሐፍት", href: "/books" },
  { label: "MEDIA", href: "/media" },
  { label: "ጽሑፎች", href: "/articles" },
  { label: "ጸሎት", href: "/prayer" },
  { label: "ስለ RABBI", href: "/about" },
];

export function Header() {
  const location = useLocation();
  
  return (
    <header className="bg-navy-deep sticky top-0 z-50">
      <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-6 py-4">
        <Logo />
        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`text-[0.78rem] tracking-wide transition-colors hover:text-gold ${
                  isActive ? "text-gold" : "text-on-navy-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            to="/login"
            className="rounded-full bg-gold/10 px-5 py-2 text-[0.72rem] font-semibold tracking-wide text-gold border border-gold/40 transition-all hover:bg-gold hover:text-navy-deep active:scale-95 touch-manipulation"
          >
            ግባ / Login
          </Link>
          
          <a
            href="#"
            className="rounded-md bg-gold px-4 py-2 text-[0.72rem] font-semibold tracking-wide text-navy-deep transition-all hover:opacity-90 active:scale-95"
          >
            APP ይመርኳ
          </a>
          
          <button
            aria-label="ፈልግ"
            className="text-on-navy-muted transition-colors hover:text-gold ml-2"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
