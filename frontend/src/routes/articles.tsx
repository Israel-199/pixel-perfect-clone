import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  FolderTree,
  TrendingUp,
  CalendarDays,
  Clock,
  User,
  BookOpen,
  X,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "RABBI Digital | መንፈሳዊ ጽሑፎች — እምነት፣ ቤተሰብ፣ አገልግሎት" },
      {
        name: "description",
        content:
          "RABBI Digital ጽሑፎች — በእምነት፣ በቤተሰብ፣ በአገልግሎትና በዕለታዊ መንፈሳዊ እድገት ላይ ጥልቅ ትምህርቶችና ቃለ-እግዚአብሔር ያንብቡ።",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "RABBI Digital | መንፈሳዊ ጽሑፎች" },
      {
        property: "og:description",
        content:
          "እምነት፣ ቤተሰብ፣ አገልግሎትና ዕለታዊ ሕይወት ላይ ጥልቅ ጽሑፎች — RABBI Digital።",
      },
      { property: "og:url", content: "https://www.rabbidigital.com/articles" },
      { property: "og:locale", content: "am_ET" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RABBI Digital | ጽሑፎች" },
      {
        name: "twitter:description",
        content:
          "መንፈሳዊ ጽሑፎችና ቃለ-ሕይወት — RABBI Digital።",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.rabbidigital.com/articles" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": "https://www.rabbidigital.com/articles",
          "url": "https://www.rabbidigital.com/articles",
          "name": "RABBI Digital — መንፈሳዊ ጽሑፎች",
          "description": "እምነት፣ ቤተሰብ፣ አገልግሎትና ዕለታዊ ሕይወት ላይ ጥልቅ ጽሑፎች",
          "inLanguage": "am",
          "publisher": { "@id": "https://www.rabbidigital.com/#organization" },
          "isPartOf": { "@id": "https://www.rabbidigital.com/#website" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "ዋና ገጽ", "item": "https://www.rabbidigital.com/" },
              { "@type": "ListItem", "position": 2, "name": "ጽሑፎች", "item": "https://www.rabbidigital.com/articles" }
            ]
          }
        })
      }
    ],
  }),
  component: ArticlesRoute,
});

type ArticleTab = "all" | "categories" | "popular" | "daily";

interface ArticleItem {
  id: string;
  tab: ArticleTab;
  categoryName: string;
  title: string;
  author: string;
  readTime: string;
  date: string;
  coverUrl: string;
  summary: string;
  fullText: string;
  scripture?: string;
  isPopular?: boolean;
  isDaily?: boolean;
}

const DEFAULT_ARTICLES: ArticleItem[] = [
  // 1. የዕለት ጽሑፍ (Daily Devotional)
  {
    id: "daily-1",
    tab: "daily",
    categoryName: "የዕለት ቃል",
    title: "በጸጥታና በመታመን የሚገኝ ኃይል",
    author: "መጋቢ ካስሁብ መሰሎን",
    readTime: "4 ደቂቃ",
    date: "ዛሬ የቀረበ",
    coverUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop",
    summary:
      "በችኮላና በጭንቀት በተሞላ ዓለም ውስጥ የእግዚአብሔርን ሰላም እንዴት መቀበል ይቻላል? የዕለቱ መንፈሳዊ ማሰላሰያ።",
    scripture: "ኢሳይያስ 30:15 — 'በመመለስና በማረፍ ትድናላችሁ፤ በጸጥታና በመታመን ኃይል ይሆንላችኋል፤'",
    isDaily: true,
    isPopular: true,
    fullText: `በሕይወታችን ውስጥ ብዙ ጊዜ የምንደክመው በሁኔታዎች መደናገጥና በራሳችን ጥረት ነገሮችን ለመቀየር ስንሮጥ ነው። ነገር ግን መጽሐፍ ቅዱስ የሚነግረን እውነተኛው ኃይል የሚገኘው በጸጥታና በእግዚአብሔር በመታመን ውስጥ እንደሆነ ነው።

1. ከመሯሯጥ ወደ ማረፍ መመለስ
የእግዚአብሔር ቃል "በመመለስና በማረፍ ትድናላችሁ" ይላል። ወደ እግዚአብሔር መመለስ ማለት ሸክማችንን በእርሱ እግር ስር ማኖር ነው። ጭንቀታችን እርሱን እንደማይረዳው ማወቅና በእርሱ ፍጹም ፍቅር ውስጥ ማረፍ ነው።

2. ጸጥታ የመንፈስ ቅዱስን ድምፅ ለመስማት
ጩኸትና ውጣ ውረድ በበዛበት ዓለም የእግዚአብሔር ድምፅ የሚሰማው በረጋ ልብ ውስጥ ነው። ኤልያስ እግዚአብሔርን ያገኘው በታላቁ ነፋስ፣ በመሬት መንቀጥቀጥ ወይም በእሳቱ ውስጥ ሳይሆን በለሰለሰው ድምፅ ውስጥ ነበር።

3. ዛሬ የሚወሰድ ተግባራዊ እርምጃ
ዛሬ ማለዳ ወይም ምሽት ላይ ቢያንስ 10 ደቂቃ ስልክዎንና ሥራዎን ወደ ጎን በማድረግ በጸጥታ በጌታ ፊት ይቀመጡ። ሸክምዎን ለእርሱ አሳልፈው ይስጡ። እርሱ መንገድ ያዘጋጅልዎታል።`,
  },

  // 2. ታዋቂ ጽሑፍ (Popular)
  {
    id: "pop-1",
    tab: "popular",
    categoryName: "የእምነት ሕይወት",
    title: "የእምነት ፈተናዎች እና የድል ምስጢር",
    author: "RABBI Ministry",
    readTime: "6 ደቂቃ",
    date: "ታዋቂ ጽሑፍ",
    coverUrl:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop",
    summary:
      "እምነታችን በእሳት ሲፈተን እንዴት ጸንተን እንቆማለን? በፈተና ውስጥ የእግዚአብሔርን ዓላማ የመረዳት ቁልፍ።",
    scripture: "1 ጴጥሮስ 1:7 — 'የተፈተነው እምነታችሁ ከሚጠፋው በእሳትም ከሚፈተነው ወርቅ ይልቅ እጅግ የከበረ ሆኖ ይገኝ ዘንድ፤'",
    isPopular: true,
    fullText: `እምነት የተፈጠረው በምቾት ውስጥ ለመኖር ብቻ ሳይሆን በማዕበል ውስጥ ጸንቶ ለመቆም ነው። ታላላቅ የእምነት አባቶች እምነታቸው የተረጋገጠው በታላላቅ ፈተናዎች ውስጥ ባለፉ ጊዜ ነበር።

1. ፈተና እምነትን ያጠራል
እንደ ወርቅ በእሳት ውስጥ የሚያልፍ እምነት ቆሻሻው ሁሉ ተወግዶ ንጹሕ ሆኖ ይወጣል። በሕይወትህ ውስጥ የሚገጥሙህ ፈተናዎች ሊያጠፉህ ሳይሆን ሊያጠሩህና ወደ ተሻለ መንፈሳዊ ከፍታ ሊያደርሱህ የሚመጡ ናቸው።

2. በክርስቶስ ያለን ድል
የእኛ ድል የተመሠረተው በራሳችን አቅም ሳይሆን በክርስቶስ የተጠናቀቀ ሥራ ላይ ነው። እርሱ ሞትንና ጨለማን ስላሸነፈ እኛም በእርሱ አሸናፊዎች ነን።

3. ተስፋ አለመቁረጥ
ምንም እንኳን መንገዱ አዳጋች ቢመስልም የተስፋው ባለቤት እግዚአብሔር ታማኝ ነው። እምነትህን አትጣል፤ ታላቅ ብድራት አለውና።`,
  },

  // 3. የምድብ ጽሑፍ (Categories: ቤተሰብ)
  {
    id: "cat-fam-1",
    tab: "categories",
    categoryName: "የቤተሰብ ሕይወት",
    title: "በክርስቶስ ፍቅር ላይ የተገነባ ትዳር",
    author: "RABBI Family Life",
    readTime: "5 ደቂቃ",
    date: "የቤተሰብ ጥናት",
    coverUrl:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop",
    summary:
      "የጋብቻና የቤተሰብ ሰላም መሠረት መከባበርና ይቅርታ ነው። ክርስቲያናዊ ትዳርን የሚያጠናክሩ ተግባራዊ ምክሮች።",
    scripture: "ኤፌሶን 4:32 — 'እርስ በርሳችሁም ቸሮችና ርኅሩኆች ሁኑ፥ እግዚአብሔርም በክርስቶስ ይቅር እንዳላችሁ ይቅር ተባባሉ።'",
    fullText: `ትዳር የሁለት ፍጹም ሰዎች ጥምረት ሳይሆን የሁለት ይቅር ባዮች የጋራ ጉዞ ነው። በክርስቶስ ፍቅር ላይ የተመሠረተ ትዳር ለማዕበል የማይበገር ጽኑ መሠረት አለው።

1. ራስን መስጠትና መከባበር
ፍቅር ስሜት ብቻ ሳይሆን በየዕለቱ ሌላውን ለማክበርና ለመጥቀም የሚደረግ ምርጫ ነው። ራስ ወዳድነት ባለበት ስፍራ ሰላም አይኖርም፤ ነገር ግን ክርስቶስ ቤተክርስቲያንን እንደወደደ እርስ በርስ መዋደድ ቤተሰብን ያድሳል።

2. ይቅርታ የማያቋርጥ የአኗኗር ዘይቤ
ቂም የፍቅር ጠላት ነው። በጋብቻ ውስጥ አለመግባባቶች ሲፈጠሩ ቶሎ ይቅር መባባልና በእግዚአብሔር ፊት በጸሎት መቆም ቁስልን ይፈውሳል።

3. ልጆችን በእግዚአብሔር ቃል ማሳደግ
ቤተሰብ የቤተክርስቲያን መጀመሪያ ነው። በቤት ውስጥ የሚሰማው የጸሎት ድምፅና የፍቅር አየር ለልጆች ታላቅ መንፈሳዊ ቅርስ ነው።`,
  },

  // 4. የምድብ ጽሑፍ (Categories: አገልግሎትና አመራር)
  {
    id: "cat-lead-1",
    tab: "categories",
    categoryName: "አገልግሎትና አመራር",
    title: "የአገልጋይ መሪ ልብ እና ታማኝነት",
    author: "ዶርቃ ኮሌጅ መምህራን",
    readTime: "7 ደቂቃ",
    date: "አመራር ማዕከል",
    coverUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop",
    summary:
      "በአዲስ ኪዳን መርህ መሠረት አመራር በትህትና ሌሎችን ማገልገል ነው። የታማኝ አገልጋይ ባሕርያት።",
    scripture: "ማርቆስ 10:45 — 'የሰው ልጅም ሊያገለግል ነፍሱንም ለብዙዎች ቤዛ ሊሰጥ እንጂ እንዲያገለግሉት አልመጣም።'",
    fullText: `የክርስቲያን አመራር መለኪያ የሥልጣን ከፍታ ሳይሆን የአገልግሎትና የትህትና ጥልቀት ነው። ጌታችን ኢየሱስ ክርስቶስ የደቀመዛሙርቱን እግር በማጠብ የአመራርን እውነተኛ ትርጉም አስተምሮናል።

1. የታማኝነት ዋጋ
እግዚአብሔር ከአገልጋዮቹ የሚፈልገው ዝናን ሳይሆን ታማኝነትን ነው። በጥቂቱ የታመነ በብዙ ላይ ይሾማል። በስውር የምናደርገው አገልግሎት በግልጽ ከምናሳየው ይበልጣል በእግዚአብሔር ፊት።

2. የቅድስናና የጸሎት ሕይወት
ያለ ውስጣዊ መንፈሳዊ ኃይል ውጫዊ አገልግሎት ፍሬ ሊያፈራ አይችልም። መሪ ሁልጊዜ ከመንፈስ ቅዱስ ጋር ጥልቅ ግንኙነት ሊኖረው ይገባል።`,
  },

  // 5. ታዋቂ ጽሑፍ 2
  {
    id: "pop-2",
    tab: "popular",
    categoryName: "መንፈሳዊ እድገት",
    title: "የእግዚአብሔርን ቃል የማጥናት ጥበብ",
    author: "RABBI Bible Study",
    readTime: "5 ደቂቃ",
    date: "ታዋቂ ጽሑፍ",
    coverUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
    summary:
      "መጽሐፍ ቅዱስን ማንበብ ብቻ ሳይሆን በሕይወት ለመተርጎም የሚረዱ ተግባራዊ ዘዴዎች።",
    scripture: "መዝሙር 119:105 — 'ሕግህ ለእግሬ መብራት፥ ለመንገዴም ብርሃን ነው።'",
    isPopular: true,
    fullText: `የእግዚአብሔር ቃል የሕይወት እንጀራ ነው። ቃሉን ሳንመገብ በመንፈስ ልናድግ አንችልም።

1. ማሰላሰል (Meditation)
ቃሉን አንብበው አያልፉት፤ በልብዎ ውስጥ ያብሰሉስሉት። ቃሉ ለዕለት ተዕለት ውሳኔዎችዎ መሪ ይሁን።

2. በጸሎት መቅረብ
የመጽሐፍ ቅዱስ ጸሐፊ መንፈስ ቅዱስ ስለሆነ ቃሉን ለመረዳት የመንፈስ ቅዱስን መገለጥ በጸሎት መጠየቅ ይገባል።

3. ተግባራዊ ማድረግ
"ቃሉን የምታደርጉ ሁኑ፥ ራሳችሁን እያሳታችሁ የምትሰሙ ብቻ አትሁኑ።" (ያዕቆብ 1:22)`,
  },
];

const SUB_SECTIONS = [
  { id: "all" as ArticleTab, icon: FileText, titleKey: "artAllTitle", descKey: "artAllDesc" },
  { id: "categories" as ArticleTab, icon: FolderTree, titleKey: "artCategoriesTitle", descKey: "artCategoriesDesc" },
  { id: "popular" as ArticleTab, icon: TrendingUp, titleKey: "artPopularTitle", descKey: "artPopularDesc" },
  { id: "daily" as ArticleTab, icon: CalendarDays, titleKey: "artDailyTitle", descKey: "artDailyDesc" },
];

function ArticlesRoute() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ArticleTab>("all");
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [adminArticles, setAdminArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch any ARTICLE mediaType from backend
  useEffect(() => {
    fetchApi<{ books: any[] }>("/books")
      .then((data) => {
        const customArticles = (data.books || [])
          .filter((b) => b.mediaType === "ARTICLE")
          .map((b) => ({
            id: b.id,
            tab: "daily" as ArticleTab,
            categoryName: "የዕለት ጽሑፍ",
            title: b.title,
            author: b.author || "RABBI",
            readTime: "5 ደቂቃ",
            date:
              new Date(b.createdAt).toDateString() === new Date().toDateString()
                ? "ዛሬ የቀረበ"
                : new Date(b.createdAt).toLocaleDateString(),
            coverUrl: b.coverUrl,
            summary: b.description || b.sampleContent?.slice(0, 150) || "",
            scripture: b.sampleContent || b.videoUrl || "",
            fullText: b.fullContent || b.sampleContent || b.description || "",
            isPopular: true,
            isDaily: true,
          }));
        setAdminArticles(customArticles);
      })
      .catch(() => {});
  }, []);

  const allArticles = adminArticles.length > 0
    ? (() => {
        const adminTitles = new Set(adminArticles.map((a) => a.title.trim().toLowerCase()));
        const remainingDefault = DEFAULT_ARTICLES.filter(
          (a) => !adminTitles.has(a.title.trim().toLowerCase())
        );
        return [...adminArticles, ...remainingDefault];
      })()
    : DEFAULT_ARTICLES;

  // Filter based on active tab
  const filteredArticles = allArticles.filter((item) => {
    let matchTab = true;
    if (activeTab === "categories") matchTab = true; // categories displays grouped or category badges
    else if (activeTab === "popular") matchTab = item.isPopular === true || item.tab === "popular";
    else if (activeTab === "daily") matchTab = item.isDaily === true || item.tab === "daily";

    const matchSearch =
      searchQuery.trim() === ""
        ? true
        : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTab && matchSearch;
  });

  return (
    <div className="animate-in fade-in pb-24">
      {/* Banner */}
      <div className="relative overflow-hidden bg-navy-deep px-4 sm:px-6 py-10 sm:py-16 text-center border-b border-gold/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-semibold text-gold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("articlesHeroBadge")}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-gold">
            {t("articlesTitle")}
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-on-navy-muted max-w-xl mx-auto leading-relaxed">
            {t("articlesSubtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-10">
        {/* The 4 Category Cards from User Request */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-10">
          {SUB_SECTIONS.map(({ id, icon: Icon, titleKey, descKey }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`group cursor-pointer rounded-2xl p-3.5 sm:p-6 text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-2 ${
                  isSelected
                    ? "bg-navy-deep text-white border-gold shadow-xl scale-[1.01]"
                    : "bg-card text-navy border-gold/15 shadow-card hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-navy-deep">
                      {t("selectedBadge")}
                    </span>
                  </div>
                )}
                <div>
                  <div
                    className={`mb-2.5 sm:mb-4 inline-flex rounded-xl p-2.5 sm:p-3.5 transition-colors ${
                      isSelected
                        ? "bg-gold text-navy-deep shadow-md"
                        : "bg-navy/5 text-navy group-hover:bg-gold/20 group-hover:text-gold"
                    }`}
                  >
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.5} />
                  </div>
                  <h3
                    className={`font-display text-sm sm:text-lg font-bold mb-1 ${
                      isSelected ? "text-gold" : "text-navy"
                    }`}
                  >
                    {t(titleKey)}
                  </h3>
                  <p
                    className={`text-[11px] sm:text-xs leading-relaxed line-clamp-2 ${
                      isSelected ? "text-on-navy-muted" : "text-muted-foreground"
                    }`}
                  >
                    {t(descKey)}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3 border-t text-[11px] font-semibold flex items-center justify-between ${
                    isSelected ? "border-gold/30 text-gold" : "border-navy/10 text-muted-foreground"
                  }`}
                >
                  <span>{t("viewArticleContent")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar */}
        <div className="rounded-2xl bg-card border border-gold/20 p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gold/15 px-3 py-1 text-xs font-bold text-navy-deep border border-gold/30">
              {t(SUB_SECTIONS.find((s) => s.id === activeTab)?.titleKey || "")}
            </span>
            <span className="text-xs text-muted-foreground">
              ({filteredArticles.length} {t("articlesFoundSuffix")})
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchArticlesPlaceholder")}
              className="w-full rounded-xl border border-navy/20 pl-8 pr-4 py-1.5 text-xs focus:border-gold focus:outline-none bg-background"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer rounded-2xl bg-card border border-gold/20 shadow-card hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-navy/5">
                  <img
                    src={article.coverUrl}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-navy-deep/85 px-2.5 py-1 text-[10px] font-bold text-gold border border-gold/30">
                    {article.categoryName}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-white flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gold" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-navy group-hover:text-gold transition-colors line-clamp-1">
                    {article.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-navy/80">{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                  <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 mt-2 border-t border-navy/5 pt-3 flex items-center justify-between text-xs font-bold text-gold">
                <span className="group-hover:translate-x-0.5 transition-transform">
                  ሙሉውን አንብብ →
                </span>
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-10">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 sm:mb-4 inline-block rounded-md bg-gold/15 px-3 py-1 text-xs font-bold text-navy-deep border border-gold/30">
              {selectedArticle.categoryName} • {selectedArticle.readTime}
            </div>

            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-navy mb-2">
              {selectedArticle.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pb-4 border-b border-gold/20 mb-6">
              <span className="font-bold text-navy">{selectedArticle.author}</span>
              <span>•</span>
              <span>{selectedArticle.date}</span>
            </div>

            {selectedArticle.scripture && (
              <div className="mb-6 rounded-2xl bg-gold/10 p-4 border border-gold/30 text-xs md:text-sm font-serif italic text-navy leading-relaxed">
                {selectedArticle.scripture}
              </div>
            )}

            <div className="font-serif text-sm md:text-base text-navy/90 leading-relaxed whitespace-pre-line text-justify space-y-4">
              {selectedArticle.fullText}
            </div>

            <div className="mt-8 pt-6 border-t border-navy/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                © RABBI Christian Digital Platform • መንፈሳዊ ጽሑፎች
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-navy-deep px-5 py-2 text-xs font-bold text-gold hover:bg-navy cursor-pointer"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
