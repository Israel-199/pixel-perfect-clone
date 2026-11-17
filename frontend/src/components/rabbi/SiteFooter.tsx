import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Send,
  Youtube,
  Instagram,
} from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";

const FOOTER_COLS = [
  {
    title: "መጽሐፍት",
    links: ["መዓረሳዊ አደጎት", "ጸሎት", "አምነት", "ደዓ መጽሐፍት", "ሁሉም መጽሐፍት"],
  },
  {
    title: "RABBI ACADEMY",
    links: ["ኮርሶች", "መምህርች", "የምሰክር ወረቀት", "FAQ"],
  },
  {
    title: "ደጋፍ",
    links: ["ስለ እኛ", "ደጋፍ ያግኙ", "የአጋርነት ጥያቄ", "የማሕዋንት ፖሊሲ"],
  },
];

export function SiteFooter() {
  return (
    <>
      {/* Newsletter band */}
      <section className="bg-navy-deep">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-8 px-6 py-7">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded border border-gold/40">
              <Mail className="h-4 w-4 text-gold" />
            </span>
            <p className="text-[0.72rem] leading-5 text-on-navy-muted">
              የዕለላኑ ቃል በእሜይል ይቀበሉ
              <br />
              ይመዝገቡ እና ይቀበሉ!
            </p>
          </div>
          <form
            className="flex flex-1 min-w-[260px] overflow-hidden rounded"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="ደህን ኢሜይል ያስገቡ"
              aria-label="ኢሜይል"
              className="flex-1 bg-cream px-4 py-2.5 text-xs text-foreground outline-none"
            />
            <button className="bg-gold px-5 text-xs font-semibold text-navy-deep">
              ይመዝገቡ
            </button>
          </form>
          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] text-on-navy-muted">በእኛ ይከተቱን</span>
            {[Facebook, Send, Youtube, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="ማህበራዊ ገጽ"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-soft text-on-navy hover:bg-gold hover:text-navy-deep"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-soft/40 bg-navy-deep">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr_1.1fr]">
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
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[0.7rem] text-on-navy-muted hover:text-gold"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-xs font-semibold text-gold">ያማኸኝ</h4>
            <ul className="mt-3 space-y-2 text-[0.7rem] text-on-navy-muted">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gold" /> rabbidigitals@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gold" /> +251 921 161 705
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
    </>
  );
}
