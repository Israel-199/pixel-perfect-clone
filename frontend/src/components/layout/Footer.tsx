import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";

const FOOTER_COLS = [
  {
    title: "መጽሐፍትና ኮርሶች",
    links: [
      { label: "ሁሉም መጽሐፍት", to: "/books" },
      { label: "ኮርሶች እና ስልጠናዎች", to: "/courses" },
      { label: "ጸሎት", to: "/prayer" },
      { label: "ጽሑፎች", to: "/articles" },
      { label: "ሚዲያ", to: "/media" },
    ],
  },
  {
    title: "ደጋፍና መረጃ",
    links: [
      { label: "ስለ እኛ", to: "/about" },
      { label: "ራዕይና ተልዕኮ", to: "/about" },
      { label: "የአጋርነት ጥያቄ", to: "/about" },
      { label: "ያግኙን", to: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-soft/40 bg-navy-deep">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 py-10 sm:py-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo size="lg" />
          <p className="mt-4 text-[0.7rem] leading-5 text-on-navy-muted">
            ቃሱን አንብብ፣ አምነትን ተረዳ፣
            <br />
            በሕይወትህ ኑር፤
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold text-gold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-[0.7rem] text-on-navy-muted hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-xs font-semibold text-gold">ያማኸኝ</h4>
          <ul className="mt-3 space-y-2 text-[0.7rem] text-on-navy-muted">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gold" /> info@rabbimessenger.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold" /> +251 9XX XXX XXX
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold" /> አዲስ አበባ፣ ኢትዮጵያ
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-soft/40 py-4 text-center text-[0.65rem] text-on-navy-muted">
        © 2024 RABBI. All Rights Reserved.
      </div>
    </footer>
  );
}
