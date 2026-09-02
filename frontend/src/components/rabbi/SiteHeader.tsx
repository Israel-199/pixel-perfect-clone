import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";

export const NAV: { label: string; to: string }[] = [
  { label: "ቤት", to: "/" },
  { label: "መጽሐፍት", to: "/books" },
  { label: "ጥናት", to: "/articles" },
  { label: "RABBI ACADEMY", to: "/about" },
  { label: "MEDIA", to: "/media" },
  { label: "ጽሑፎች", to: "/articles" },
  { label: "ጸሎት", to: "/prayer" },
  { label: "ስለ RABBI", to: "/about" },
];

export function SiteHeader() {
  return (
    <header className="bg-navy-deep">
      <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-[0.78rem] tracking-wide text-on-navy-muted transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          to="/books"
          className="ml-auto rounded-md bg-gold px-4 py-2 text-[0.72rem] font-semibold tracking-wide text-navy-deep transition-opacity hover:opacity-90 lg:ml-0"
        >
          APP ይመርኳ
        </Link>
        <button
          aria-label="ፈልግ"
          className="text-on-navy-muted transition-colors hover:text-gold"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
