import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  ListTodo,
  User,
  BookOpen,
  Heart,
  Send,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Lock,
  Clock,
  EyeOff,
  Plus,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/prayer")({
  component: PrayerRoute,
});

type PrayerTab = "corporate" | "topics" | "personal" | "guideline";

interface PrayerItem {
  id: string;
  tab: PrayerTab;
  categoryLabel: string;
  title: string;
  scripture: string;
  summary: string;
  fullPrayer: string;
  amenCount: number;
}

const DEFAULT_PRAYERS: PrayerItem[] = [
  // 1. የጋራ ጸሎት (Corporate Prayers)
  {
    id: "corp-1",
    tab: "corporate",
    categoryLabel: "የጋራ ጸሎት",
    title: "ስለ ሀገራችን ኢትዮጵያ ሰላምና አንድነት",
    scripture:
      "1 ጢሞቴዎስ 2:1-2 — 'እንግዲህ እግዚአብሔርን በመምሰልና በጭምትነት ሁሉ ጸጥና ዝግ ብለን እንድንኖር፥ ልመናና ጸሎት ምልጃም ምስጋናም ስለ ሰዎች ሁሉ ስለ ነገሥታትና ስለ መኳንንትም ሁሉ እንዲደረጉ ከሁሉ በፊት እመክራለሁ።'",
    summary:
      "በኢትዮጵያ ምድር ላይ ፍቅር፣ እርቅ፣ ሰላም እና የመንፈስ ቅዱስ አድራጊነት እንዲበዛ በህብረት የምንጸልየው የጋራ ጸሎት።",
    amenCount: 142,
    fullPrayer: `ሉዓላዊ አምላካችን እግዚአብሔር ሆይ፤
የሰላም አለቃ፣ የመጽናናት አምላክ የሆንክ አንተን በጌታችን በኢየሱስ ክርስቶስ ስም እናመሰግናለን።
ዛሬ በህብረት ሆነን ስለ ሀገራችን ኢትዮጵያ በፊትህ እንቆማለን።

የጥላቻን፣ የልዩነትንና የግጭትን መንፈስ ከምድራችን ላይ ገስጽልን። በሕዝቦች መካከል ይቅርታን፣ መከባበርንና ሰላማዊ አብሮ መኖርን አፍስስ።
ለሀገራችን መሪዎች ጥበብንና እውነተኛ ፍትሕን ስጣቸው። በችግርና በመፈናቀል ውስጥ ያሉ ወገኖቻችንን በመለኮታዊ እጅህ አጽናና፣ ረዳት ሁናቸው።
የወንጌልህ ብርሃን በምድራችን ላይ ይብራ፤ ቤተክርስቲያንህም የሰላምና የእርቅ ድልድይ ሆና እንድታገለግል ጸጋህን አብዛልን።
በኢየሱስ ክርስቶስ ሕያው ስም፣ አሜን።`,
  },
  {
    id: "corp-2",
    tab: "corporate",
    categoryLabel: "የጋራ ጸሎት",
    title: "ስለ ቤተክርስቲያን አንድነትና የወንጌል መስፋፋት",
    scripture:
      "ዮሐንስ 17:21 — 'ሁሉ አንድ ይሆኑ ዘንድ፤ አንተ አባት ሆይ፥ በእኔ እንዳለህ እኔም በአንተ፥ እነርሱ ደግሞ በእኛ አንድ ይሆኑ ዘንድ ዓለም አንተ እንደ ላክኸኝ ያምን ዘንድ።'",
    summary:
      "የክርስቶስ አካል የሆነችው ቤተክርስቲያን በፍቅርና በአንድነት ጸንታ ወንጌልን ለአለም እንድታደርስ የሚደረግ የጋራ ልመና።",
    amenCount: 98,
    fullPrayer: `የክብር አባት እግዚአብሔር ሆይ፤
ቤተክርስቲያንህን በልጅህ በኢየሱስ ክርስቶስ ውድ ደም የዋጀሃት አንተ ነህ።
አካሉ አንድ እንደሆነ ሁሉ አማኞች ሁሉ በፍቅርና በአንድነት መንፈስ እንዲተሳሰሩ እንጸልያለን።
የወንጌል ሰራተኞችን፣ ሰባኪዎችን፣ ደራሲያንንና መጋቢዎችን በሞገስህ ጋርዳቸው።
በስርዓትህና በቃልህ እውነት ላይ ቆመን የወንጌልን ብርሃን ለጨለማው ዓለም እንድናበራ አቅም ሁነን።
በኢየሱስ ስም፣ አሜን።`,
  },

  // 2. የጸሎት ርዕሶች (Current Prayer Topics)
  {
    id: "topic-1",
    tab: "topics",
    categoryLabel: "የጸሎት ርዕስ",
    title: "ስለ ተፈናቀሉና በችግር ውስጥ ላሉ ወገኖች",
    scripture:
      "መዝሙር 34:18 — 'እግዚአብሔር ልባቸው ለተሰበረ ቅርብ ነው፥ መንፈሳቸው የተሰበረውንም ያድናቸዋል።'",
    summary:
      "በጦርነት፣ በድርቅ እና በመፈናቀል ምክንያት በችግር ውስጥ ለሚገኙ ወገኖች መለኮታዊ ጥበቃና ረዳትነት የሚደረግ ጸሎት።",
    amenCount: 115,
    fullPrayer: `የምሕረትና የርኅራኄ አምላክ ሆይ፤
መጠጊያ ለሌላቸው መጠጊያ፣ ረዳት ለሌላቸው ረዳት የሆንክ አምላክ ነህ።
ዛሬ በልዩ ሁኔታ በችግር፣ በመፈናቀል፣ በረሃብና በስቃይ ውስጥ ላሉ ወገኖቻችን ምሕረትህን እንለምናለን።
የዕለት ምግባቸውንና መጠለያቸውን አዘጋጅላቸው፤ ልባቸውን በመንፈስ ቅዱስ ሰላም አጽናና።
አብያተ ክርስቲያናትና ማኅበረሰቡም በፍቅርና በእርዳታ እጃቸውን እንዲዘረጉላቸው ልባቸውን ክፈት።
በኢየሱስ ክርስቶስ ስም፣ አሜን።`,
  },
  {
    id: "topic-2",
    tab: "topics",
    categoryLabel: "የጸሎት ርዕስ",
    title: "ስለ ወጣቶችና ተተኪው ትውልድ መንፈሳዊ ጥበቃ",
    scripture: "መክብብ 12:1 — 'በጉብዝናህ ወራት ፈጣሪህን አስብ።'",
    summary:
      "ወጣቶች ከዓለም ፈተና፣ ሱስና ተስፋ መቁረጥ ተጠብቀው በእግዚአብሔር እውቀት እንዲያድጉ የሚደረግ ጸሎት።",
    amenCount: 88,
    fullPrayer: `አምላካችን እግዚአብሔር ሆይ፤
ተተኪው ትውልድ በቅድስና፣ በእውቀትና በሥነ-ምግባር ታንጾ እንዲያድግ ጸጋህን ስጠው።
ወጣቶቻችንን ከሱስ፣ ከስንፍና፣ ከተስፋ መቁረጥና ከክፉ የዓለም ፍልስፍና ጠብቃቸው።
ለሀገራቸውና ለቤተክርስቲያን የሚጠቅሙ የታመኑ መሪዎችና አገልጋዮች ሆነው እንዲወጡ አድርጋቸው።
በኢየሱስ ስም፣ አሜን።`,
  },

  // 3. የጸሎት መመሪያ (Prayer Guidelines)
  {
    id: "guide-1",
    tab: "guideline",
    categoryLabel: "የጸሎት መመሪያ",
    title: "የጸሎት መሠረታዊ መርሆዎች (ACTS)",
    scripture:
      "ማቴዎስ 6:9-13 — 'እንግዲህ እናንተስ እንዲህ ጸልዩ፦ በሰማያት የምትኖር አባታችን ሆይ...'",
    summary:
      "ውጤታማና በመጽሐፍ ቅዱስ የተመሠረተ ጸሎት ለማድረግ የሚረዱ 4 ወርቃማ ደረጃዎች (አድናቆት፣ ንስሐ፣ ምስጋናና ልመና)።",
    amenCount: 160,
    fullPrayer: `በመጽሐፍ ቅዱስ የተመሠረተ ሚዛናዊ የጸሎት መመሪያ፦

1. አድናቆት (Adoration)
ጸሎትዎን እግዚአብሔር ማን እንደሆነ በማሰብና ቅድስናውን፣ ታላቅነቱንና ፍቅሩን በማድነቅ ይጀምሩ።
(መዝሙር 100:4)

2. ንስሐ (Confession)
በእግዚአብሔር ፊት ራስን በትህትና መመርመርና የበደሉትን በግልጽ በመናዘዝ የይቅርታን ደም መሻት።
(1 ዮሐንስ 1:9)

3. ምስጋና (Thanksgiving)
እግዚአብሔር ቀደም ሲል ላደረገልዎ መልካም ነገር ሁሉ ከልብ የመነጨ ምስጋና ማቅረብ።
(1 ተሰሎንቄ 5:18)

4. ልመናና ምልጃ (Supplication)
የራስዎንና የሌሎችን ፍላጎት፣ የሀገርንና የቤተክርስቲያንን ርዕስ በእምነት በእግዚአብሔር ፊት ማቅረብ።
(ፊልጵስዩስ 4:6)`,
  },
  {
    id: "guide-2",
    tab: "guideline",
    categoryLabel: "የጸሎት መመሪያ",
    title: "የጾምና ጸሎት መንፈሳዊ ጥቅም",
    scripture:
      "ኢሳይያስ 58:6 — 'እኔ የመረጥሁት ጾም ይህ አይደለምን? የበደልን እስራት ትፈቱ ዘንድ፥ የቀንበርን ጠፍር ትለቁ ዘንድ፥ የተገፉትንስ አርነት ትሰድዱ ዘንድ...'",
    summary:
      "ጾም ሥጋን ለእግዚአብሔር መንፈስ የማስገዛትና የመንፈሳዊ ንቃት መሣሪያ እንዴት እንደሚሆን የሚያሳይ መመሪያ።",
    amenCount: 110,
    fullPrayer: `የጾም መጽሐፍ ቅዱሳዊ ዓላማዎች፦
1. ራስን በእግዚአብሔር ፊት ማዋረድ እና የመንፈስን ድምፅ ለመስማት ንቁ መሆን።
2. ጾም ከምግብ መከልከል ብቻ ሳይሆን ከክፉ ንግግርና ከተንኮል መራቅ እንዲሁም ለድሆች ርኅራኄ ማሳየት ነው።
3. በጾም ወቅት የጸሎትና የቃል ንባብ ጊዜን መጨመር ያስፈልጋል።`,
  },
];

const SUB_SECTIONS = [
  {
    id: "corporate" as PrayerTab,
    icon: Users,
    title: "የጋራ ጸሎት",
    desc: "በህብረት የምንፀልያቸው የጋራ ጸሎቶች",
  },
  {
    id: "topics" as PrayerTab,
    icon: ListTodo,
    title: "የጸሎት ርዕሶች",
    desc: "ወቅታዊ የፀሎት ርዕሶች & አጠቃላይ ጥያቄዎች",
  },
  {
    id: "personal" as PrayerTab,
    icon: User,
    title: "የግል ጸሎት",
    desc: "የግል ጸሎትዎን በምስጢር ለአስተዳዳሪ ማቅረቢያ",
  },
  {
    id: "guideline" as PrayerTab,
    icon: BookOpen,
    title: "የጸሎት መመሪያ",
    desc: "እንዴት መፀለይ እንዳለብን የሚያስተምር",
  },
];

function PrayerRoute() {
  const [activeTab, setActiveTab] = useState<PrayerTab>("corporate");
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerItem | null>(null);
  const [amenCounts, setAmenCounts] = useState<Record<string, number>>({});
  const [hasAmened, setHasAmened] = useState<Record<string, boolean>>({});

  // Topic prayer request form (under topics tab)
  const [requesterName, setRequesterName] = useState("");
  const [requesterContact, setRequesterContact] = useState("");
  const [prayerRequestTopic, setPrayerRequestTopic] = useState("");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  // Private Personal Prayer form (under personal tab)
  const [privateTitle, setPrivateTitle] = useState("");
  const [privateDescription, setPrivateDescription] = useState("");
  const [privateName, setPrivateName] = useState("");
  const [privateContact, setPrivateContact] = useState("");
  const [privateSubmitting, setPrivateSubmitting] = useState(false);
  const [privateSuccess, setPrivateSuccess] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);

  // Load custom corporate/topic prayer items from backend if created by admin
  const [adminPrayers, setAdminPrayers] = useState<PrayerItem[]>([]);

  useEffect(() => {
    fetchApi<{ books: any[] }>("/books")
      .then((data) => {
        const prayers = (data.books || [])
          .filter((b) => b.mediaType === "PRAYER")
          .map((b) => ({
            id: b.id,
            tab: "corporate" as PrayerTab,
            categoryLabel: "አስተዳዳሪ ጸሎት",
            title: b.title,
            scripture: b.description || "ፊልጵስዩስ 4:6",
            summary: b.sampleContent || b.description || "",
            fullPrayer: b.fullContent || b.sampleContent || "",
            amenCount: 50,
          }));
        setAdminPrayers(prayers);
      })
      .catch(() => {});
  }, []);

  const allPrayers = [...adminPrayers, ...DEFAULT_PRAYERS];

  const filteredPrayers = allPrayers.filter((p) => {
    if (activeTab === "corporate") return p.tab === "corporate";
    if (activeTab === "topics") return p.tab === "topics";
    if (activeTab === "guideline") return p.tab === "guideline";
    return false;
  });

  const handleAmen = (prayerId: string, initialCount: number) => {
    if (hasAmened[prayerId]) return;
    const current = amenCounts[prayerId] ?? initialCount;
    setAmenCounts((prev) => ({ ...prev, [prayerId]: current + 1 }));
    setHasAmened((prev) => ({ ...prev, [prayerId]: true }));
  };

  const handleGeneralPrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequestTopic.trim()) return;
    setPrayerSubmitted(true);
    setTimeout(() => {
      setRequesterName("");
      setRequesterContact("");
      setPrayerRequestTopic("");
      setPrayerSubmitted(false);
    }, 4000);
  };

  // Submit Private Prayer to backend
  const handlePrivatePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateTitle.trim() || !privateDescription.trim()) {
      setPrivateError("እባክዎ የጸሎቱን ርዕስ እና ዝርዝር ያስገቡ።");
      return;
    }

    try {
      setPrivateSubmitting(true);
      setPrivateError(null);

      await fetchApi("/private-prayers", {
        method: "POST",
        body: JSON.stringify({
          title: privateTitle.trim(),
          description: privateDescription.trim(),
          submittedBy: privateName.trim() || undefined,
          contactInfo: privateContact.trim() || undefined,
        }),
      });

      setPrivateSuccess(true);
      setPrivateTitle("");
      setPrivateDescription("");
      setPrivateName("");
      setPrivateContact("");
    } catch (err: any) {
      setPrivateError(err.message || "የግል ጸሎቱን መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setPrivateSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-navy-deep px-4 sm:px-6 py-10 sm:py-16 text-center border-b border-gold/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-semibold text-gold mb-3">
            <Heart className="h-3.5 w-3.5" />
            <span>የጸሎትና የምልጃ ማዕከል • The Prayer Sanctuary</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-gold">
            ጸሎት
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-on-navy-muted max-w-xl mx-auto leading-relaxed">
            ጸሎት ወደ እግዚአብሔር የምንቀርብበት፣ ኃይልንና ሰላምን የምንቀበልበት ሕያው ድልድይ ነው።
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-10">
        {/* The 4 Category Cards from User Request */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-10">
          {SUB_SECTIONS.map(({ id, icon: Icon, title, desc }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  setPrivateSuccess(false);
                  setPrivateError(null);
                }}
                className={`group cursor-pointer rounded-2xl p-3.5 sm:p-6 text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-2 ${
                  isSelected
                    ? "bg-navy-deep text-white border-gold shadow-xl scale-[1.01]"
                    : "bg-card text-navy border-gold/15 shadow-card hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-navy-deep">
                      የተመረጠ
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
                    {title}
                  </h3>
                  <p
                    className={`text-[11px] sm:text-xs leading-relaxed line-clamp-2 ${
                      isSelected ? "text-on-navy-muted" : "text-muted-foreground"
                    }`}
                  >
                    {desc}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3 border-t text-[11px] font-semibold flex items-center justify-between ${
                    isSelected ? "border-gold/30 text-gold" : "border-navy/10 text-muted-foreground"
                  }`}
                >
                  <span>ይዘቱን ክፈት</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Section Header */}
        <div className="rounded-2xl bg-card border border-gold/20 p-4 mb-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gold/15 px-3 py-1 text-xs font-bold text-navy-deep border border-gold/30">
              {SUB_SECTIONS.find((s) => s.id === activeTab)?.title}
            </span>
            {activeTab !== "personal" ? (
              <span className="text-xs text-muted-foreground">
                ({filteredPrayers.length} ርዕሶች)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                <Lock className="h-3 w-3" />
                ምስጢራዊና የግል (100% Confidential)
              </span>
            )}
          </div>

          <span className="text-xs text-gold font-semibold hidden sm:inline">
            {SUB_SECTIONS.find((s) => s.id === activeTab)?.desc}
          </span>
        </div>

        {/* --------------------------------------------------------- */}
        {/* TAB 1: PERSONAL PRAYER (የግል ጸሎት) - PRIVATE FORM ONLY */}
        {/* --------------------------------------------------------- */}
        {activeTab === "personal" ? (
          <div className="max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Privacy Assurance Card */}
            <div className="rounded-3xl bg-card border-2 border-gold/30 shadow-card p-6 md:p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-2xl bg-gold/15 p-3 text-gold shrink-0 border border-gold/30 shadow-inner">
                  <Lock className="h-7 w-7 text-navy-deep" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-0.5 text-[11px] font-bold text-navy mb-1.5 border border-navy/15">
                    <EyeOff className="h-3 w-3 text-gold" />
                    <span>ምስጢራዊ የግል ጸሎት ክፍል</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-navy mb-1">
                    የግል ጸሎትዎን በምስጢር ያስገቡ
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    የግል ጸሎትና የልብ ሸክም እጅግ ውድ እና የተቀደሰ ነው። እዚህ የሚያስገቡት የጸሎት ርዕስና ዝርዝር
                    <strong className="text-navy"> በይፋ ለማንም ሰው አይታይም</strong>፤ በቀጥታ የሚደርሰው
                    ለአስተዳዳሪውና ለታመኑ አገልጋዮች ቡድን ብቻ ነው፤ በጸሎት ከእርስዎ ጋር እንቆማለን።
                  </p>
                </div>
              </div>

              {/* Bible Encouragement Quote */}
              <div className="mb-8 rounded-2xl bg-navy-deep p-4 text-white border border-gold/30 shadow-md">
                <div className="flex items-center gap-2 text-gold text-xs font-bold mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>የእግዚአብሔር ቃል ተስፋ፦</span>
                </div>
                <p className="text-xs md:text-sm font-serif italic text-on-navy-muted leading-relaxed">
                  "በነገር ሁሉ በጸሎትና በምልጃ ከምስጋና ጋር በእግዚአብሔር ዘንድ ልመናችሁን አስታውቁ እንጂ በአንዳች አትጨነቁ።
                  አእምሮንም ሁሉ የሚያልፍ የእግዚአብሔር ሰላም ልባችሁንና አሳባችሁን በክርስቶስ ኢየሱስ ይጠብቃል።"
                  <span className="block mt-1 font-sans text-[11px] text-gold not-italic">— ፊልጵስዩስ 4:6-7</span>
                </p>
              </div>

              {/* Success Message Banner */}
              {privateSuccess ? (
                <div className="rounded-2xl bg-green-500/10 border-2 border-green-500/40 p-6 text-center animate-in zoom-in-95">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 mb-3">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-green-800 mb-1">
                    የግል ጸሎትዎ በምስጢር ደርሷል!
                  </h3>
                  <p className="text-xs text-green-700 max-w-md mx-auto leading-relaxed mb-4">
                    የጸሎት ርዕስዎ በደህንነት ተመዝግቧል። የአገልጋዮቻችን ቡድን ይህንን የግል ጥያቄ በጸሎት
                    በእግዚአብሔር ፊት ይዘው ይቆማሉ። እግዚአብሔር ልመናዎን ይስማ!
                  </p>
                  <button
                    type="button"
                    onClick={() => setPrivateSuccess(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-deep text-gold px-5 py-2 text-xs font-bold shadow hover:bg-navy transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ሌላ የግል ጸሎት አስገባ</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePrivatePrayerSubmit} className="space-y-5">
                  {privateError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600">
                      {privateError}
                    </div>
                  )}

                  {/* Prayer Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      የግል ጸሎቱ ርዕስ (Prayer Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={privateTitle}
                      onChange={(e) => setPrivateTitle(e.target.value)}
                      placeholder="ምሳሌ፦ በፈተና ወቅት መጽናናት፣ ስለ ቤተሰብ ሰላም፣ ለትምህርት ወይም ለስራ ስኬት..."
                      className="w-full rounded-xl border border-navy/20 bg-background px-4 py-2.5 text-xs text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Prayer Description Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      የጸሎት ዝርዝርና የልብ ሸክም (Prayer Description) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={privateDescription}
                      onChange={(e) => setPrivateDescription(e.target.value)}
                      placeholder="በጸሎት እንዲደገፍልዎ የሚፈልጉትን የግል ጉዳይ በሙሉ እዚህ ይግለጹ (ሙሉ በሙሉ ምስጢር የተጠበቀ ነው)..."
                      className="w-full rounded-xl border border-navy/20 bg-background px-4 py-3 text-xs text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold leading-relaxed"
                    />
                  </div>

                  {/* Optional Submitter Info */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-navy/80 mb-1.5">
                        ስምዎ (አማራጭ — ባዶ መተው ይችላሉ)
                      </label>
                      <input
                        type="text"
                        value={privateName}
                        onChange={(e) => setPrivateName(e.target.value)}
                        placeholder="ስምዎን ያስገቡ ወይም በስውር"
                        className="w-full rounded-xl border border-navy/20 bg-background px-3.5 py-2 text-xs text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy/80 mb-1.5">
                        ስልክ ወይም ኢሜይል (አማራጭ)
                      </label>
                      <input
                        type="text"
                        value={privateContact}
                        onChange={(e) => setPrivateContact(e.target.value)}
                        placeholder="ክትትል ለማድረግ ካስፈለገ"
                        className="w-full rounded-xl border border-navy/20 bg-background px-3.5 py-2 text-xs text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={privateSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        {privateSubmitting
                          ? "በመላክ ላይ ነው..."
                          : "የግል ጸሎቴን በምስጢር ላክ (Submit Private Prayer)"}
                      </span>
                    </button>
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      🔒 ይህ መረጃ የተጠበቀ ሲሆን በዳሽቦርዱ ላይ ለአስተዳዳሪው ብቻ ነው የሚታየው።
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* --------------------------------------------------------- */
          /* TABS 2, 3, 4: CORPORATE, TOPICS, GUIDELINES (CARDS VIEW)   */
          /* --------------------------------------------------------- */
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-12">
              {filteredPrayers.map((prayer) => {
                const count = amenCounts[prayer.id] ?? prayer.amenCount;
                const amened = hasAmened[prayer.id];

                return (
                  <div
                    key={prayer.id}
                    className="rounded-3xl bg-card border border-gold/25 p-6 shadow-card hover:border-gold/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-full bg-navy/5 px-3 py-0.5 text-[11px] font-bold text-gold border border-gold/20">
                          {prayer.categoryLabel}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-400" />
                          <span>{count} አሜን ተብሏል</span>
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        {prayer.title}
                      </h3>

                      <div className="mb-3 rounded-xl bg-gold/10 p-3 border border-gold/25 text-xs font-serif italic text-navy/90 leading-relaxed">
                        {prayer.scripture}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {prayer.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-navy/10 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleAmen(prayer.id, prayer.amenCount)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                          amened
                            ? "bg-green-600 text-white"
                            : "bg-navy/5 text-navy hover:bg-gold/20"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{amened ? "አሜን ብለዋል ✓" : "አብሬ እጸልያለሁ (አሜን)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPrayer(prayer)}
                        className="flex items-center gap-1 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-navy-deep hover:bg-gold/90 transition-all cursor-pointer shadow"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>ሙሉ ጸሎቱን አንብብ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Section under "የጸሎት ርዕሶች": Interactive Prayer Request Submission */}
            {activeTab === "topics" && (
              <div className="max-w-2xl mx-auto rounded-3xl bg-navy-deep border border-gold/30 p-6 md:p-8 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-gold">
                    ወቅታዊ የጸሎት ጥያቄዎን ይላኩልን
                  </h3>
                </div>
                <p className="text-xs text-on-navy-muted mb-5 leading-relaxed">
                  በጋራ ወይም በማኅበር ጸሎት አብረን እንድንቆም የሚፈልጉት ወቅታዊ ጉዳይ ካለ ከታች ያለውን ቅፅ በመሙላት ይላኩልን፤
                  የአገልጋዮች ቡድን በጸሎት ይደግፍዎታል።
                </p>

                {prayerSubmitted && (
                  <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500/40 p-4 text-xs text-green-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <span>የጸሎት ጥያቄዎ ደርሶናል! የአገልጋዮቻችን ቡድን በጸሎት ከእርስዎ ጋር ይቆማሉ። እግዚአብሔር ይባርክዎ!</span>
                  </div>
                )}

                <form onSubmit={handleGeneralPrayerSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-on-navy-muted mb-1">
                        ስምዎ (አማራጭ)
                      </label>
                      <input
                        type="text"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        placeholder="ስም ያስገቡ ወይም በስውር"
                        className="w-full rounded-xl border border-white/20 bg-navy-soft px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-navy-muted mb-1">
                        ስልክ ወይም ኢሜይል (አማራጭ)
                      </label>
                      <input
                        type="text"
                        value={requesterContact}
                        onChange={(e) => setRequesterContact(e.target.value)}
                        placeholder="ግንኙነት ለማድረግ"
                        className="w-full rounded-xl border border-white/20 bg-navy-soft px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-navy-muted mb-1">
                      የጸሎት ጥያቄዎ ዝርዝር <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={prayerRequestTopic}
                      onChange={(e) => setPrayerRequestTopic(e.target.value)}
                      placeholder="የሚጸለይበትን ጉዳይ እዚህ ይግለጹ..."
                      className="w-full rounded-xl border border-white/20 bg-navy-soft px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-gold focus:outline-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>የጸሎት ጥያቄውን ላክ (Submit Prayer Request)</span>
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Prayer Modal */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-8">
            <button
              onClick={() => setSelectedPrayer(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-block rounded-md bg-gold/15 px-3 py-1 text-xs font-bold text-navy-deep border border-gold/30 mb-2">
              {selectedPrayer.categoryLabel}
            </span>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-navy mb-3">
              {selectedPrayer.title}
            </h2>

            <div className="mb-5 rounded-2xl bg-gold/10 p-4 border border-gold/30 text-xs md:text-sm font-serif italic text-navy leading-relaxed">
              {selectedPrayer.scripture}
            </div>

            <div className="font-serif text-sm md:text-base text-navy/90 leading-relaxed whitespace-pre-line text-justify space-y-3 p-4 rounded-2xl bg-navy/5 border border-navy/10">
              {selectedPrayer.fullPrayer}
            </div>

            <div className="mt-6 pt-4 border-t border-navy/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAmen(selectedPrayer.id, selectedPrayer.amenCount)}
                className="flex items-center gap-1.5 rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-current text-red-600" />
                <span>አብሬ እጸልያለሁ (አሜን)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPrayer(null)}
                className="rounded-xl border border-navy/20 px-4 py-2 text-xs font-semibold text-navy hover:bg-card cursor-pointer"
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
