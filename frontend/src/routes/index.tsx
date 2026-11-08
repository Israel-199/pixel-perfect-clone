import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  GraduationCap,
  Sparkles,
  Music,
  Video,
} from "lucide-react";

import { Logo } from "@/components/rabbi/Logo";
import heroImg from "@/assets/hero-shepherd.jpg";
import bookCover from "@/assets/book-cover.jpg";
import academyImg from "@/assets/academy-cap.jpg";
import appScreen from "@/assets/app-screen.jpg";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RABBI — ጌታና መምህር | መጻሕፍት፣ ጥናት፣ ጸሎት" },
      {
        name: "description",
        content:
          "RABBI — ቃሉን አንብብ፣ እምነትን ተረዳ፣ በሕይወትህ ኑር። መጻሕፍት፣ ጥናት፣ RABBI Academy፣ ሚዲያ፣ ጽሑፎች እና ጸሎት በአንድ ቦታ።",
      },
      { property: "og:title", content: "RABBI — ጌታና መምህር" },
      {
        property: "og:description",
        content: "ቃሉን አንብብ፣ እምነትን ተረዳ፣ በሕይወትህ ኑር።",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    icon: BookOpen,
    title: "ንባቦች",
    body: "መጽሐፍ ቅዱስን አንብብ፤\nመጽሐፍትን አግኝ፤",
    link: "የበለጠ ይመልከቱ",
    to: "/books",
  },
  {
    icon: Brain,
    title: "ትምህርት",
    body: "ተረዳ፣ ጥናት አድርግ፤\nእውቀትን አሳድግ፤",
    link: "የበለጠ ይመልከቱ",
    to: "/courses",
  },
  {
    icon: HandHeart,
    title: "ጸሎት",
    body: "በጸሎት ተገናኝ፤\nበእምነት ኑር፤",
    link: "የበለጠ ይመልከቱ",
    to: "/prayer",
  },
];

const SECTIONS = [
  { icon: BookOpen, title: "መጽሐፍት", sub: "መንፈሳዊ መጽሐፍት", to: "/books" },
  { icon: GraduationCap, title: "ኮርሶች", sub: "ዶርቃ ኮሌጅ & ስልጠናዎች", to: "/courses" },
  { icon: Play, title: "ሚዲያ", sub: "ቪዲዮ፣ ኦዲዮ፣ ስብከቶች", to: "/media" },
  { icon: Pencil, title: "ጽሑፎች", sub: "መንፈሳዊ ጽሑፎች", to: "/articles" },
  { icon: HandHeart, title: "ጸሎት ክፍል", sub: "የጸሎት ርዕሶች", to: "/prayer" },
  { icon: Users, title: "ስለ RABBI", sub: "ስለ እኛ እና አጋርነት", to: "/about" },
];

function Index() {
  const navigate = useNavigate();

  // Dynamic recent posted items by admin
  const [recentBook, setRecentBook] = useState<any>(null);
  const [recentMedia, setRecentMedia] = useState<any>(null);
  const [recentCourse, setRecentCourse] = useState<any>(null);

  useEffect(() => {
    fetchApi<{ books: any[] }>("/books")
      .then((data) => {
        const all = data.books || [];
        // Recent Book
        const book = all.find((b) => b.mediaType === "BOOK" && !b.title.includes("ኮርስ"));
        if (book) setRecentBook(book);

        // Recent Media
        const media = all.find((b) => b.mediaType === "VIDEO" || b.mediaType === "AUDIO");
        if (media) setRecentMedia(media);

        // Recent Course
        const course = all.find(
          (b) =>
            b.mediaType === "COURSE" ||
            b.title.includes("ኮርስ") ||
            b.title.includes("ስልጠና") ||
            b.title.includes("ዶርቃ")
        );
        if (course) setRecentCourse(course);
      })
      .catch(() => {});
  }, []);

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
          <div className="text-center md:text-left">
            <h1 className="font-display text-5xl tracking-[0.22em] text-on-navy md:text-7xl font-bold">
              RABBI
            </h1>
            <div className="gold-rule mt-4 text-sm tracking-[0.3em] text-gold-soft font-semibold">
              ጌታና መምህር
            </div>
            <p className="mt-8 text-xl font-semibold text-on-navy md:text-2xl">
              ዛሬ ከመምህር ምን ትማራለህ?
            </p>
            <p className="mt-3 text-sm text-on-navy-muted">
              ቃሉን አንብብ ፤ እምነትን ተረዳ ፤ በሕይወትህ ኑር
            </p>
            <Link
              to="/books"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-bold text-navy-deep transition-opacity hover:opacity-90 shadow-lg"
            >
              ዛሬ አንብብ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <aside className="rounded-2xl border border-gold/25 bg-navy-deep/85 p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Quote className="h-4 w-4" />
              <span>የዛሬ ቃል</span>
            </div>
            <p className="mt-4 text-[0.9rem] leading-7 text-on-navy font-serif italic">
              &ldquo;እናንተ መምህር ጌታም ትሉኛላችሁ፤ እንዲሁም ነኝና መልካም ትላላችሁ።&rdquo;
            </p>
            <p className="mt-3 text-xs text-gold font-semibold">ዮሐንስ 13:13</p>
            <Link
              to="/articles"
              className="mt-5 inline-flex rounded-xl border border-gold/60 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/15"
            >
              ሙሉ ጥቅስ አንብብ →
            </Link>
          </aside>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="grid rounded-2xl bg-card shadow-card md:grid-cols-3 border border-gold/15">
          {PILLARS.map(({ icon: Icon, title, body, link, to }, i) => (
            <article
              key={title}
              className={`flex items-center gap-5 p-8 ${
                i > 0 ? "md:border-l md:border-border" : ""
              }`}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-deep shadow">
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-xl text-navy font-bold">{title}</h2>
                <p className="mt-2 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                  {body}
                </p>
                <Link
                  to={to}
                  className="mt-3 inline-block text-xs font-semibold text-gold hover:underline"
                >
                  {link} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Three panels: Exact Recently Posted Content by Admin (Media, Book, Course) */}
      <section className="mx-auto grid max-w-[1180px] gap-6 px-6 pb-14 lg:grid-cols-3">
        {/* Panel 1 (Left): Recent Media posted by admin */}
        <div
          onClick={() => navigate({ to: "/media" })}
          className="group cursor-pointer rounded-2xl bg-navy-deep p-6 text-white border border-gold/30 shadow-card hover:shadow-2xl hover:border-gold transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold text-gold border border-gold/30">
                <Video className="h-3 w-3" />
                የቅርብ ጊዜ ሚዲያ
              </span>
              <span className="text-[11px] text-on-navy-muted group-hover:text-gold transition-colors">
                ሁሉንም ሚዲያዎች →
              </span>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-soft mb-4 border border-gold/20">
              <img
                src={
                  recentMedia?.coverUrl ||
                  "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop"
                }
                alt={recentMedia?.title || "የእሁድ ትምህርት"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy-deep shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute top-2.5 right-2.5 rounded-md bg-navy-deep/90 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                {recentMedia?.mediaType || "VIDEO"}
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-gold line-clamp-1 group-hover:text-white transition-colors">
              {recentMedia?.title || "የእሁድ ትምህርት - ቪዲዮና ኦዲዮ"}
            </h3>
            <p className="text-xs text-on-navy-muted font-semibold mt-1">
              አቅራቢ: {recentMedia?.author || "RABBI Academy"}
            </p>
            <p className="text-xs text-on-navy-muted line-clamp-2 mt-2 leading-relaxed">
              {recentMedia?.description || "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።"}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-xs font-bold text-gold">
            <span>ወደ ሚዲያ ገጽ ክፈት</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Panel 2 (Middle): Recent Book posted by admin */}
        <div
          onClick={() => navigate({ to: "/books" })}
          className="group cursor-pointer rounded-2xl bg-card p-6 shadow-card hover:shadow-2xl border border-gold/20 hover:border-gold/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-[11px] font-bold text-navy border border-gold/30">
                <BookOpen className="h-3 w-3 text-gold" />
                የቅርብ ጊዜ መጽሐፍ
              </span>
              <span className="text-[11px] text-muted-foreground group-hover:text-gold transition-colors">
                ሁሉንም መጽሐፍት →
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={recentBook?.coverUrl || bookCover}
                alt={recentBook?.title || "ከእምነት ወደ እምነት"}
                className="h-[155px] w-[110px] shrink-0 rounded-xl object-cover shadow-md border border-gold/20 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-navy-deep border border-gold/30">
                  {recentBook?.price > 0 ? `${recentBook.price} ETB` : "ነፃ (Free)"}
                </span>
                <h4 className="font-display text-base font-bold text-navy mt-1.5 line-clamp-2 group-hover:text-gold transition-colors">
                  {recentBook?.title || "ከእምነት ወደ እምነት"}
                </h4>
                <p className="text-xs text-gold font-semibold mt-1">
                  {recentBook?.author || "መጋቢ ካስሁብ መሰሎን"}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                  {recentBook?.description || "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between text-xs font-bold text-navy group-hover:text-gold transition-colors">
            <span>መጽሐፉን አንብብ / ናሙና ክፈት</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Panel 3 (Right): Recent Course / Academy posted by admin */}
        <div
          onClick={() => navigate({ to: "/courses" })}
          className="group cursor-pointer rounded-2xl bg-navy-deep p-6 text-white border border-gold/30 shadow-card hover:shadow-2xl hover:border-gold transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold text-gold border border-gold/30">
                <GraduationCap className="h-3.5 w-3.5" />
                RABBI ACADEMY & ኮርሶች
              </span>
              <span className="text-[11px] text-on-navy-muted group-hover:text-gold transition-colors">
                ኮርሶችን ይመልከቱ →
              </span>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-soft mb-4 border border-gold/20">
              <img
                src={recentCourse?.coverUrl || academyImg}
                alt={recentCourse?.title || "ዶርቃ ኮሌጅ"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2.5 right-2.5 rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-deep">
                {recentCourse?.price > 0 ? `${recentCourse.price} ETB` : "ኮሌጅ & PDF"}
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-gold line-clamp-1 group-hover:text-white transition-colors">
              {recentCourse?.title || "መሠረታዊ የሥነ-መለኮት ጥናት (Theology 101)"}
            </h3>
            <p className="text-xs text-on-navy-muted font-semibold mt-1">
              አቅራቢ: {recentCourse?.author || "ዶርቃ ኮሌጅ & አጫጭር ስልጠናዎች"}
            </p>
            <p className="text-xs text-on-navy-muted line-clamp-2 mt-2 leading-relaxed">
              {recentCourse?.description || "በዶርቃ ኮሌጅ የስርዓተ-ትምህርት የተዘጋጁ ኮርሶች እና የፒዲኤፍ ስልጠናዎች።"}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-xs font-bold text-gold">
            <span>ወደ ኮርስ ገጽ ሂድ</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Sections strip */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16">
        <h3 className="mb-4 text-sm font-bold text-navy flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <span>ተመራጭ የአገልግሎት ክፍሎች</span>
        </h3>
        <div className="grid rounded-2xl bg-card shadow-card border border-gold/15 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden">
          {SECTIONS.map(({ icon: Icon, title, sub, to }, i) => (
            <Link
              key={title}
              to={to}
              className={`flex flex-col items-center gap-2 px-4 py-7 text-center transition-all hover:bg-gold/10 group ${
                i > 0 ? "lg:border-l lg:border-border" : ""
              }`}
            >
              <div className="rounded-xl bg-navy/5 p-3 group-hover:bg-navy-deep group-hover:text-gold transition-colors">
                <Icon className="h-6 w-6 text-navy group-hover:text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-navy group-hover:text-gold transition-colors">
                {title}
              </span>
              <span className="text-[0.68rem] text-muted-foreground">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter band */}
      <section className="bg-navy-deep border-t border-gold/20">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-8 px-6 py-7">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold/10">
              <Mail className="h-4 w-4 text-gold" />
            </span>
            <p className="text-[0.72rem] leading-5 text-on-navy-muted">
              የዕለቱን ቃል በኢሜይል ይቀበሉ
              <br />
              ይመዝገቡ እና ይቀበሉ!
            </p>
          </div>
          <form
            className="flex flex-1 min-w-[260px] overflow-hidden rounded-xl border border-gold/30"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="ደህንነቱ የተጠበቀ ኢሜይል ያስገቡ"
              aria-label="ኢሜይል"
              className="flex-1 bg-cream px-4 py-2.5 text-xs text-foreground outline-none"
            />
            <button className="bg-gold px-5 text-xs font-bold text-navy-deep hover:bg-gold/90 transition-colors">
              ይመዝገቡ
            </button>
          </form>
          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] text-on-navy-muted">በእኛ ይከተሉን</span>
            {[Facebook, Send, Youtube, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="ማህበራዊ ገጽ"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-soft text-on-navy hover:bg-gold hover:text-navy-deep transition-colors"
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
