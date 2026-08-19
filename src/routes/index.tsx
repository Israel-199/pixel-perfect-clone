import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  ArrowRight,
  BookOpen,
  Brain,
  HandHeart,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Play,
  Pencil,
  Users,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Send,
  Youtube,
  Instagram,
  Quote,
} from "lucide-react";

import { Logo } from "@/components/rabbi/Logo";
import heroImg from "@/assets/hero-shepherd.jpg";
import bookCover from "@/assets/book-cover.jpg";
import academyImg from "@/assets/academy-cap.jpg";
import appScreen from "@/assets/app-screen.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RABBI — ጊታና መምህር | መጻሕፍት፣ ጥናት፣ ጸሎት" },
      {
        name: "description",
        content:
          "RABBI — ቃሱን አንብብ፣ አምነትን ተረዳ፣ በሕይወትህ ኑር። መጻሕፍት፣ ጥናት፣ RABBI Academy፣ ሚዲያ፣ ጽሑፎች እና ጸሎት በአንድ ቦታ።",
      },
      { property: "og:title", content: "RABBI — ጊታና መምህር" },
      {
        property: "og:description",
        content: "ቃሱን አንብብ፣ አምነትን ተረዳ፣ በሕይወትህ ኑር።",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  "ቤት",
  "መጽሐፍት",
  "ጥናት",
  "RABBI ACADEMY",
  "MEDIA",
  "ጽሑፎች",
  "ጸሎት",
  "ስለ RABBI",
];

const PILLARS = [
  {
    icon: BookOpen,
    title: "አንብብ",
    body: "መጽሐፍ ቅዱስን አንብብ፤\nመጽሐፍትን ገናኝ፤",
    link: "የበለጠ ይመልከቱ",
  },
  {
    icon: Brain,
    title: "ትምር",
    body: "ተረዳ፣ ጥናት አድርግ፤\nአውቀትን አድርግ፤",
    link: "የበለጠ ይመልከቱ",
  },
  {
    icon: HandHeart,
    title: "ጸሎይ",
    body: "ጸሎት ግባቦ፣ በውገራሰ ኑር፤\nበዖሉ ተገናኝ፤",
    link: "የበለጠ ይመልከቱ",
  },
];

const SECTIONS = [
  { icon: BookOpen, title: "መጽሐፍት", sub: "ቤቴ–መጽሐፍት" },
  { icon: MessageSquare, title: "RABBI ጥያቄ", sub: "ጠይቅ" },
  { icon: Play, title: "ሚዲያ", sub: "ቪዲዮ፣ አዲዮ፣ ፖድካስት" },
  { icon: Pencil, title: "ጽሑፎች", sub: "መንፈሳዊ ጽሑፎች" },
  { icon: HandHeart, title: "ጸሎት ክፍል", sub: "የጸሎት ርእሳዎች" },
  { icon: Users, title: "መህበረሰብ", sub: "ተገናኝ እና አገሩ" },
];

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


function Index() {
  return (
    <>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-deep">
        <img
          src={heroImg}
          alt="በተራራ ላይ በጎችን የሚጠብቅ እረኛ በፀሐይ መውጫ ጊዜ"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.175_0.048_265/0.92)_0%,oklch(0.175_0.048_265/0.55)_45%,oklch(0.175_0.048_265/0.85)_100%)]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-[1.6fr_1fr] md:items-center md:py-20">
          <div className="text-center">
            <h1 className="font-display text-5xl tracking-[0.22em] text-on-navy md:text-7xl">
              RABBI
            </h1>
            <div className="gold-rule mt-4 text-sm tracking-[0.3em] text-gold-soft">
              ጊታና መምህር
            </div>
            <p className="mt-8 text-xl font-semibold text-on-navy md:text-2xl">
              ሃሬ ከመምህር ምን ትሟራለህ?
            </p>
            <p className="mt-3 text-sm text-on-navy-muted">
              ቃሱን አንብብ ፤ አምነትን ተረዳ ፤ በሕይወትህ ኑር
            </p>
            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3 text-sm font-semibold text-navy-deep transition-opacity hover:opacity-90"
            >
              ሃሬ አንብብ <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <aside className="rounded-lg border border-gold/25 bg-navy-deep/85 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Quote className="h-4 w-4" />
              የዛሬ ቃል
            </div>
            <p className="mt-4 text-[0.85rem] leading-7 text-on-navy">
              &ldquo;እናንተ መምህር እና ጊታ ትላላችሁ፤ ትክከል ትላላችሁ፤ እኔ ሰለሆነ እንዲ ነው፤&rdquo;
            </p>
            <p className="mt-4 text-xs text-on-navy-muted">ዮሐንስ 13:13</p>
            <a
              href="#"
              className="mt-5 inline-flex rounded-md border border-gold/60 px-4 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
            >
              መሉ ጥቅስ አንብብ
            </a>
          </aside>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="grid rounded-lg bg-card shadow-card md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body, link }, i) => (
            <article
              key={title}
              className={`flex items-center gap-5 p-8 ${
                i > 0 ? "md:border-l md:border-border" : ""
              }`}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-deep">
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-xl text-navy">{title}</h2>
                <p className="mt-2 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                  {body}
                </p>
                <a
                  href="#"
                  className="mt-3 inline-block text-xs font-medium text-navy-soft hover:text-gold"
                >
                  {link} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Three panels */}
      <section className="mx-auto grid max-w-[1180px] gap-6 px-6 pb-12 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* App */}
        <div className="rounded-lg bg-navy-deep p-6">
          <h3 className="font-display text-xl text-gold">RABBI APE ይመርኳ</h3>
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <p className="text-[0.7rem] leading-5 text-on-navy-muted">
                መጽሐፍ ያንብብ፣
                <br />
                ጸሎት ግባ፣ በዖፍር ይምዳ፤
              </p>
              <div className="mt-5 space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-2 rounded bg-black px-3 py-2 text-on-navy"
                >
                  <Play className="h-4 w-4 text-gold" />
                  <span className="text-[0.6rem] leading-tight">
                    GET IT ON
                    <br />
                    <strong className="text-[0.75rem]">Google Play</strong>
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 rounded bg-black px-3 py-2 text-on-navy"
                >
                  <ArrowRight className="h-4 w-4 -rotate-90 text-gold" />
                  <span className="text-[0.6rem] leading-tight">
                    Download on the
                    <br />
                    <strong className="text-[0.75rem]">App Store</strong>
                  </span>
                </a>
              </div>
            </div>
            <div className="w-[110px] shrink-0 rounded-[1.1rem] border-4 border-navy-soft bg-navy p-1">
              <img
                src={appScreen}
                alt="የ RABBI መተግበሪያ ማሳያ"
                width={512}
                height={896}
                loading="lazy"
                className="h-[190px] w-full rounded-[0.8rem] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">የመሬ መጽሐፍ</h3>
            <a href="#" className="text-xs text-muted-foreground hover:text-gold">
              ሁሉንም ይመልከቱ →
            </a>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <img
              src={bookCover}
              alt="የመጽሐፍ ሽፋን"
              width={640}
              height={900}
              loading="lazy"
              className="h-[170px] w-[120px] shrink-0 rounded object-cover shadow-card"
            />
            <div>
              <h4 className="font-display text-lg text-navy">ከእባ ወይ አምነት</h4>
              <p className="mt-1 text-xs text-muted-foreground">መጋቢ ካሱብ መሰሎን</p>
              <p className="mt-3 text-[0.7rem] leading-5 text-muted-foreground">
                ከእብራት ወይ ተስፋ፣ ከእንግ ወይ አምነት የሚያደርን መንፈሳዊ ጉዞ፤
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href="#"
                  className="rounded border border-gold px-3 py-1.5 text-[0.7rem] text-navy hover:bg-gold/10"
                >
                  ስለ መጽሐፉ
                </a>
                <a
                  href="#"
                  className="rounded bg-navy-deep px-3 py-1.5 text-[0.7rem] text-on-navy hover:opacity-90"
                >
                  በAPP አንብብ
                </a>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button aria-label="ቀዳሚ" className="text-muted-foreground hover:text-gold">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((d) => (
                <span
                  key={d}
                  className={`h-1.5 w-1.5 rounded-full ${
                    d === 0 ? "bg-navy" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button aria-label="ቀጣይ" className="text-muted-foreground hover:text-gold">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Academy */}
        <div className="rounded-lg bg-navy-deep p-6">
          <h3 className="font-display text-xl text-gold">RABBI ACADEMY</h3>
          <p className="mt-3 text-[0.7rem] leading-5 text-on-navy-muted">
            የመጽሐፈ ቅዱስ ኮርሶች
            <br />
            ተምር፣ ተረዳ፣ አስፋልም፤
          </p>
          <img
            src={academyImg}
            alt="የወርቅ ምረቃ ኮፍያ በመጻሕፍት ላይ"
            width={1024}
            height={768}
            loading="lazy"
            className="mt-4 h-[110px] w-full rounded object-cover"
          />
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-gold px-4 py-2 text-xs font-medium text-gold hover:bg-gold/10"
          >
            ኮርሰችን ይመልከቱ →
          </a>
        </div>
      </section>

      {/* Sections strip */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16">
        <h3 className="mb-4 text-sm font-semibold text-navy">ተመደጂ ክፍሎች</h3>
        <div className="grid rounded-lg bg-card shadow-card sm:grid-cols-3 lg:grid-cols-6">
          {SECTIONS.map(({ icon: Icon, title, sub }, i) => (
            <a
              key={title}
              href="#"
              className={`flex flex-col items-center gap-2 px-4 py-7 text-center transition-colors hover:bg-secondary ${
                i > 0 ? "lg:border-l lg:border-border" : ""
              }`}
            >
              <Icon className="h-6 w-6 text-navy" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-navy">{title}</span>
              <span className="text-[0.65rem] text-muted-foreground">{sub}</span>
            </a>
          ))}
        </div>
      </section>

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

    </>
  );
}
