import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatEtbWithUsd } from "@/lib/bookUtils";
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
import { parseScripture } from "@/lib/scripture";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RABBI Digital | መንፈሳዊ መጻሕፍት፣ ኮርሶችና የክርስቲያን ትምህርት በኢትዮጵያ" },
      {
        name: "description",
        content:
          "RABBI Digital — ቃሉን አንብብ፣ እምነትን ተረዳ፣ በሕይወትህ ኑር። የኢትዮጵያ ዲጂታል ክርስቲያን መድረክ — መጻሕፍት፣ ዶርቃ ኮሌጅ ኮርሶች፣ ሚዲያ፣ ጽሑፎችና ጸሎት በአንድ ቦታ።",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "googlebot", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "RABBI Digital | መንፈሳዊ መጻሕፍት፣ ኮርሶችና ትምህርት" },
      {
        property: "og:description",
        content:
          "ቃሉን አንብብ፣ እምነትን ተረዳ፣ በሕይወትህ ኑር — RABBI Digital፣ የኢትዮጵያ ዲጂታል ክርስቲያን መድረክ።",
      },
      { property: "og:url", content: "https://www.rabbidigital.com/" },
      { property: "og:locale", content: "am_ET" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RABBI Digital | ቃሉን አንብብ፣ እምነትን ተረዳ" },
      {
        name: "twitter:description",
        content:
          "የኢትዮጵያ ዲጂታል ክርስቲያን መድረክ — መጻሕፍት፣ ኮርሶች፣ ሚዲያ፣ ጸሎት።",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.rabbidigital.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.rabbidigital.com/",
          "url": "https://www.rabbidigital.com/",
          "name": "RABBI Digital — ዋና ገጽ",
          "description":
            "ቃሉን አንብብ፣ እምነትን ተረዳ፣ በሕይወትህ ኑር። የኢትዮጵያ ዲጂታል ክርስቲያን መድረክ።",
          "inLanguage": "am",
          "isPartOf": { "@id": "https://www.rabbidigital.com/#website" },
          "publisher": { "@id": "https://www.rabbidigital.com/#organization" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "ዋና ገጽ", "item": "https://www.rabbidigital.com/" }
            ]
          }
        })
      }
    ],
  }),
  component: Index,
});

const PILLAR_KEYS = [
  { icon: BookOpen, titleKey: "pillarReadTitle", bodyKey: "pillarReadBody", link: "viewMore", to: "/books" },
  { icon: Brain, titleKey: "pillarLearnTitle", bodyKey: "pillarLearnBody", link: "viewMore", to: "/courses" },
  { icon: HandHeart, titleKey: "pillarPrayerTitle", bodyKey: "pillarPrayerBody", link: "viewMore", to: "/prayer" },
];

const SECTIONS = [
  { icon: BookOpen, titleKey: "secBooksTitle", subKey: "secBooksSub", to: "/books" },
  { icon: GraduationCap, titleKey: "secCoursesTitle", subKey: "secCoursesSub", to: "/courses" },
  { icon: Play, titleKey: "secMediaTitle", subKey: "secMediaSub", to: "/media" },
  { icon: Pencil, titleKey: "secArticlesTitle", subKey: "secArticlesSub", to: "/articles" },
  { icon: HandHeart, titleKey: "secPrayerTitle", subKey: "secPrayerSub", to: "/prayer" },
  { icon: Users, titleKey: "secAboutTitle", subKey: "secAboutSub", to: "/about" },
];

function Index() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Dynamic recent posted items by admin
  const [recentBook, setRecentBook] = useState<any>(null);
  // Slidable recent books & media
  const [recentBooksList, setRecentBooksList] = useState<any[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(0);
  const [recentMediaList, setRecentMediaList] = useState<any[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [recentMedia, setRecentMedia] = useState<any>(null);
  const [recentCourse, setRecentCourse] = useState<any>(null);
  const [todaysWord, setTodaysWord] = useState({
    verse: "ኢሳይያስ 30:15",
    text: "በመመለስና በማረፍ ትድናላችሁ፤ በጸጥታና በመታመን ኃይል ይሆንላችኋል፤",
  });

  useEffect(() => {
    fetchApi<{ books: any[] }>("/books")
      .then((data) => {
        const all = data.books || [];
        // Recent Book
        const book = all.find((b) => b.mediaType === "BOOK" && !b.title.includes("ኮርስ"));
        if (book) setRecentBook(book);
        const booksList = all.filter((b) => b.mediaType === "BOOK" && !b.title.includes("ኮርስ"));
        if (booksList.length > 0) setRecentBooksList(booksList);

        // Recent Media
        const media = all.find((b) => b.mediaType === "VIDEO" || b.mediaType === "AUDIO");
        if (media) setRecentMedia(media);
        const mediaList = all.filter((b) => b.mediaType === "VIDEO" || b.mediaType === "AUDIO");
        if (mediaList.length > 0) setRecentMediaList(mediaList);

        // Recent Course
        const course = all.find(
          (b) =>
            b.mediaType === "COURSE" ||
            b.title.includes("ኮርስ") ||
            b.title.includes("ስልጠና") ||
            b.title.includes("ዶርቃ")
        );
        if (course) setRecentCourse(course);

        // Recent Article - Fetch and display scripture for "የዛሬ ቃል"
        const recentArticles = all.filter((b) => b.mediaType === "ARTICLE");
        if (recentArticles.length > 0) {
          const latestArticle = recentArticles[0];
          // Scripture can be in sampleContent, videoUrl, description, fullContent, or title
          const rawScripture =
            latestArticle.sampleContent ||
            latestArticle.videoUrl ||
            latestArticle.description ||
            latestArticle.fullContent ||
            latestArticle.title;
          const parsed = parseScripture(rawScripture);
          setTodaysWord(parsed);
        } else {
          // If no custom article in database, use default daily devotional scripture
          setTodaysWord(
            parseScripture(
              "ኢሳይያስ 30:15 — 'በመመለስና በማረፍ ትድናላችሁ፤ በጸጥታና በመታመን ኃይል ይሆንላችኋል፤'"
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // Auto-slide recent books every 10 seconds
  useEffect(() => {
    if (recentBooksList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBookIndex((prev) => (prev + 1) % recentBooksList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [recentBooksList]);

  // Auto-slide recent media every 10 seconds
  useEffect(() => {
    if (recentMediaList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % recentMediaList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [recentMediaList]);

  const activeBook = recentBooksList[currentBookIndex] || recentBook;
  const activeMedia = recentMediaList[currentMediaIndex] || recentMedia;

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
        <div className="relative mx-auto grid max-w-[1180px] gap-8 md:gap-10 px-4 sm:px-6 py-12 md:grid-cols-[1.6fr_1fr] md:items-center md:py-20">
          <div className="text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-[0.12em] sm:tracking-[0.22em] text-on-navy font-bold">
              RABBI
            </h1>
            <div className="gold-rule mt-3 sm:mt-4 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-gold-soft font-semibold justify-start">
              ጌታና መምህር
            </div>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl font-semibold text-on-navy">
              {t("learnFromMaster")}
            </p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-on-navy-muted">
              {t("motto")}
            </p>
            <Link
              to="/books"
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-navy-deep transition-opacity hover:opacity-90 shadow-lg active:scale-95"
            >
              {t("readNow")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <aside className="rounded-2xl border border-gold/25 bg-navy-deep/85 p-5 sm:p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Quote className="h-4 w-4" />
              <span>{t("todaysWord")}</span>
            </div>
            <p className="mt-4 text-[0.9rem] leading-7 text-on-navy font-serif italic">
              &ldquo;{todaysWord.text}&rdquo;
            </p>
            <p className="mt-3 text-xs text-gold font-semibold">{todaysWord.verse}</p>
            <Link
              to="/articles"
              className="mt-5 inline-flex rounded-xl border border-gold/60 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/15"
            >
              {t("readMore")}
            </Link>
          </aside>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-[1180px] px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid rounded-2xl bg-card shadow-card md:grid-cols-3 border border-gold/15">
          {PILLAR_KEYS.map(({ icon: Icon, titleKey, bodyKey, link, to }, i) => (
            <article
              key={titleKey}
              className={`flex items-start sm:items-center gap-4 sm:gap-5 p-5 sm:p-8 ${
                i > 0 ? "border-t md:border-t-0 md:border-l md:border-border" : ""
              }`}
            >
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-deep shadow">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl text-navy font-bold">{t(titleKey)}</h2>
                <p className="mt-1 sm:mt-2 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                  {t(bodyKey)}
                </p>
                <Link
                  to={to}
                  className="mt-2.5 sm:mt-3 inline-block text-xs font-semibold text-gold hover:underline"
                >
                  {t(link)} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Three panels: Exact Recently Posted Content by Admin (Media, Book, Course) */}
      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 sm:px-6 pb-12 sm:pb-14 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Panel 1 (Left): Slidable Recent Media posted by admin */}
        <div
          onClick={() => navigate({ to: "/media" })}
          className="group cursor-pointer rounded-2xl bg-navy-deep p-6 text-white border border-gold/30 shadow-card hover:shadow-2xl hover:border-gold transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold text-gold border border-gold/30">
                <Video className="h-3 w-3" />
                {t("recentMedia")}
                {recentMediaList.length > 1 && (
                  <span className="ml-1 text-[10px] text-gold-soft font-normal">
                    ({currentMediaIndex + 1}/{recentMediaList.length})
                  </span>
                )}
              </span>
              <span className="text-[11px] text-on-navy-muted group-hover:text-gold transition-colors">
                {t("allMedia")}
              </span>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-soft mb-4 border border-gold/20">
              <img
                src={
                  activeMedia?.coverUrl ||
                  "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop"
                }
                alt={activeMedia?.title || "የእሁድ ትምህርት"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy-deep shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute top-2.5 right-2.5 rounded-md bg-navy-deep/90 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                {activeMedia?.mediaType || "VIDEO"}
              </div>
              {/* Pagination Dots */}
              {recentMediaList.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {recentMediaList.slice(0, 6).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentMediaIndex ? "w-5 bg-gold" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <h3 className="font-display text-lg font-bold text-gold line-clamp-1 group-hover:text-white transition-colors">
              {activeMedia?.title || "የእሁድ ትምህርት - ቪዲዮና ኦዲዮ"}
            </h3>
            <p className="text-xs text-on-navy-muted font-semibold mt-1">
              {t("provider")}: {activeMedia?.author || "RABBI Academy"}
            </p>
            <p className="text-xs text-on-navy-muted line-clamp-2 mt-2 leading-relaxed">
              {activeMedia?.description || "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።"}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-xs font-bold text-gold">
            <span>{t("openMediaPage")}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        {/* Panel 2 (Middle): Slidable Recent Books posted by admin */}
        <div
          onClick={() => navigate({ to: "/books" })}
          className="group cursor-pointer rounded-2xl bg-card p-6 shadow-card hover:shadow-2xl border border-gold/20 hover:border-gold/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-[11px] font-bold text-navy border border-gold/30">
                <BookOpen className="h-3 w-3 text-gold" />
                {t("recentBook")}
                {recentBooksList.length > 1 && (
                  <span className="ml-1 text-[10px] text-gold font-normal">
                    ({currentBookIndex + 1}/{recentBooksList.length})
                  </span>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground group-hover:text-gold transition-colors">
                {t("allBooks")}
              </span>
            </div>

            {/* Book Cover Container — full card view with proper aspect-[3/4] & object-contain */}
            <div className="relative aspect-[3/4] max-h-[260px] w-full overflow-hidden rounded-xl bg-navy/5 mb-4 border border-gold/20 flex items-center justify-center p-2">
              <img
                src={activeBook?.coverUrl || bookCover}
                alt={activeBook?.title || "ከእምነት ወደ እምነት"}
                className="h-full w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute top-2.5 right-2.5 rounded-md bg-navy-deep/85 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                {activeBook?.mediaType || "BOOK"}
              </div>
              {/* Pagination Dots indicator for sliding */}
              {recentBooksList.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {recentBooksList.slice(0, 6).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentBookIndex ? "w-5 bg-gold" : "w-1.5 bg-navy/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-navy-deep border border-gold/30">
                {activeBook?.price > 0 ? `${activeBook.price} ETB` : "ነፃ (Free)"}
              </span>
              {activeBook?.price > 0 && (
                <span className="text-[11px] font-bold text-gold">
                  {formatEtbWithUsd(activeBook.price).usdText}
                </span>
              )}
            </div>

            <h4 className="font-display text-base font-bold text-navy mt-2 line-clamp-1 group-hover:text-gold transition-colors">
              {activeBook?.title || "ከእምነት ወደ እምነት"}
            </h4>
            <p className="text-xs text-gold font-semibold mt-1">
              {activeBook?.author || "መጋቢ ካስሁብ መሰሎን"}
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
              {activeBook?.description || "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።"}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between text-xs font-bold text-navy group-hover:text-gold transition-colors">
            <span>{t("readBook")}</span>
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
                {t("recentCourseLabel")}
              </span>
              <span className="text-[11px] text-on-navy-muted group-hover:text-gold transition-colors">
                {t("allCourses")}
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
              {t("provider")}: {recentCourse?.author || "ዶርቃ ኮሌጅ & አጫጭር ስልጠናዎች"}
            </p>
            <p className="text-xs text-on-navy-muted line-clamp-2 mt-2 leading-relaxed">
              {recentCourse?.description || "በዶርቃ ኮሌጅ የስርዓተ-ትምህርት የተዘጋጁ ኮርሶች እና የፒዲኤፍ ስልጠናዎች።"}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-xs font-bold text-gold">
            <span>{t("goToCourse")}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Sections strip */}
      <section className="mx-auto max-w-[1180px] px-4 sm:px-6 pb-12 sm:pb-16">
        <h3 className="mb-4 text-xs sm:text-sm font-bold text-navy flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold shrink-0" />
          <span>{t("preferredServiceSections")}</span>
        </h3>
        <div className="grid rounded-2xl bg-card shadow-card border border-gold/15 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden">
          {SECTIONS.map(({ icon: Icon, titleKey, subKey, to }, i) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-2 px-3 sm:px-4 py-5 sm:py-7 text-center transition-all hover:bg-gold/10 group ${
                i > 0 ? "border-t sm:border-t-0 sm:border-l border-border/60" : ""
              }`}
            >
              <div className="rounded-xl bg-navy/5 p-2.5 sm:p-3 group-hover:bg-navy-deep group-hover:text-gold transition-colors">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-navy group-hover:text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-navy group-hover:text-gold transition-colors">
                {t(titleKey)}
              </span>
              <span className="text-[0.65rem] sm:text-[0.68rem] text-muted-foreground line-clamp-1">{t(subKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter band */}
      <section className="bg-navy-deep border-t border-gold/20">
        <div className="mx-auto flex max-w-[1180px] flex-col sm:flex-row flex-wrap items-center justify-between gap-6 px-4 sm:px-6 py-6 sm:py-7">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/10">
              <Mail className="h-4 w-4 text-gold" />
            </span>
            <p className="text-[0.72rem] leading-5 text-on-navy-muted">
              {t("newsletterHeading")}
              <br />
              {t("newsletterSub")}
            </p>
          </div>
          <form
            className="flex w-full sm:flex-1 sm:max-w-md overflow-hidden rounded-xl border border-gold/30"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={t("newsletterPlaceholder")}
              aria-label="ኢሜይል"
              className="flex-1 min-w-0 bg-cream px-3.5 py-2.5 text-xs text-foreground outline-none"
            />
            <button className="bg-gold px-4 sm:px-5 text-xs font-bold text-navy-deep hover:bg-gold/90 transition-colors shrink-0">
              ይመዝገቡ
            </button>
          </form>
          <div className="flex items-center gap-3 self-center sm:self-auto">
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
