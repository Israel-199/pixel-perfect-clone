import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Info,
  Target,
  Users,
  Handshake,
  Mail,
  BookOpen,
  PenTool,
  GraduationCap,
  Volume2,
  HeartHandshake,
  Newspaper,
  Compass,
  FileSearch,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Sparkles,
  Phone,
  Send,
  MapPin,
  MessageSquare,
  ArrowRight,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutRoute,
});

type SectionKey = "about" | "vision" | "team" | "partnership" | "contact";

interface SubSectionCard {
  id: SectionKey;
  icon: any;
  title: string;
  desc: string;
  badge: string;
}

const SUB_SECTIONS: SubSectionCard[] = [
  {
    id: "about",
    icon: Info,
    title: "ስለ እኛ",
    desc: "ስለ RABBI አገልግሎት እና ታሪክ",
    badge: "መድረክ እና አገልግሎቶች",
  },
  {
    id: "vision",
    icon: Target,
    title: "ራዕይ እና ተልዕኮ",
    desc: "የምንሰራው እና መዳረሻችን",
    badge: "ራዕይ፣ ተልዕኮና እሴቶች",
  },
  {
    id: "team",
    icon: Users,
    title: "ቡድናችን",
    desc: "ከእኛ ጋር ያሉ አገልጋዮች",
    badge: "የአገልጋዮች ማኅበረሰብ",
  },
  {
    id: "partnership",
    icon: Handshake,
    title: "አጋርነት",
    desc: "አጋር ለመሆን",
    badge: "ሀገር ግንባታና ትብብር",
  },
  {
    id: "contact",
    icon: Mail,
    title: "ያግኙን",
    desc: "ለአስተያየትና ጥያቄ ያግኙን",
    badge: "ቀጥታ ግንኙነትና ድጋፍ",
  },
];

function AboutRoute() {
  const [activeSection, setActiveSection] = useState<SectionKey>("about");
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("አስተያየት");
  const [contactMessage, setContactMessage] = useState("");
  const [formSent, setFormSent] = useState(false);

  const handleSelectSection = (id: SectionKey) => {
    setActiveSection(id);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    setFormSent(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setFormSent(false);
    }, 4000);
  };

  return (
    <div className="animate-in fade-in pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-navy-deep px-4 sm:px-6 py-12 sm:py-20 text-center border-b border-gold/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-gold mb-3 sm:mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ረቢ (REBI) • የክርስቲያን እውቀትና ሥነ-ጽሑፍ ዲጂታል መድረክ</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gold">
            ስለ RABBI
          </h1>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-on-navy-muted max-w-2xl mx-auto leading-relaxed">
            በኢትዮጵያ የወንጌል አማኞች ማኅበረሰብ ግንባታ፣ በሀገር ልማት፣ በሰላም ግንባታና በእውቀት ማዳረስ ላይ
            አስተዋጽኦ ለማድረግ የተቋቋመ ሁለገብ ዲጂታል መድረክ።
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gold/80 font-medium">
            <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">ማንበብ</span>
            <span>•</span>
            <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">መማር</span>
            <span>•</span>
            <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">መጻፍ</span>
            <span>•</span>
            <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">ማገናኘት</span>
            <span>•</span>
            <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">ማነጽ</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Category Cards Navigation */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 sm:mb-10">
          {SUB_SECTIONS.map(({ id, icon: Icon, title, desc, badge }) => {
            const isSelected = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectSection(id)}
                className={`group cursor-pointer rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-navy-deep text-white border-2 border-gold shadow-xl scale-[1.01]"
                    : "bg-card text-navy border border-gold/15 shadow-card hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 h-10 w-10 overflow-hidden">
                    <div className="absolute transform rotate-45 bg-gold text-navy-deep font-bold text-[9px] py-0.5 right-[-30px] top-[14px] w-[100px] text-center">
                      ንቁ
                    </div>
                  </div>
                )}
                <div>
                  <div
                    className={`mb-3 inline-flex rounded-xl p-3 transition-colors ${
                      isSelected
                        ? "bg-gold text-navy-deep shadow-md"
                        : "bg-navy/5 text-navy group-hover:bg-gold/20 group-hover:text-gold"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3
                    className={`font-display text-base font-bold ${
                      isSelected ? "text-gold" : "text-navy"
                    }`}
                  >
                    {title}
                  </h3>
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      isSelected ? "text-on-navy-muted" : "text-muted-foreground"
                    }`}
                  >
                    {desc}
                  </p>
                </div>
                <div
                  className={`mt-4 pt-3 border-t text-[11px] font-semibold flex items-center justify-between ${
                    isSelected ? "border-gold/30 text-gold" : "border-navy/10 text-muted-foreground group-hover:text-navy"
                  }`}
                >
                  <span>{badge}</span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isSelected ? "translate-x-1" : "group-hover:translate-x-1"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Anchor view reference */}
        <div ref={contentRef} className="scroll-mt-24" />

        {/* Tab Quick Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-navy/10 scrollbar-none">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap pl-1">
            ክፍል ምረጥ፦
          </span>
          {SUB_SECTIONS.map(({ id, title }) => (
            <button
              key={id}
              onClick={() => handleSelectSection(id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === id
                  ? "bg-gold text-navy-deep shadow-sm font-bold"
                  : "bg-navy/5 text-navy hover:bg-gold/20"
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Content Box with Dynamic Switch */}
        <div className="rounded-3xl bg-card border border-gold/25 p-6 md:p-10 shadow-card">
          {/* 1. ስለ እኛ SECTION */}
          {activeSection === "about" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b border-gold/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gold/15 p-2.5 text-gold border border-gold/30">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">ክፍል ፩</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      ስለ እኛ — ስለ RABBI አገልግሎት እና ታሪክ
                    </h2>
                  </div>
                </div>
              </div>

              {/* Main Intro Highlight */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3">
                  ረቢ (REBI)
                </h3>
                <h4 className="text-sm font-semibold text-gold/90 mb-4 tracking-wide">
                  የክርስቲያን እውቀት፣ ሥነ-ጽሑፍና ማኅበረሰብ ግንባታ ዲጂታል መድረክ
                </h4>
                <div className="space-y-3.5 text-xs md:text-sm text-on-navy-muted leading-relaxed font-sans">
                  <p>
                    ረቢ መጽሐፍትን ለማንበብና ለመሸጥ ብቻ የተዘጋጀ አፕ ሳይሆን፣ በኢትዮጵያ የወንጌል አማኞች
                    ማኅበረሰብ ግንባታ፣ በሀገር ልማት፣ በሰላም ግንባታና በእውቀት ማዳረስ ላይ አስተዋጽኦ ለማድረግ የተቋቋመ
                    ሁለገብ ዲጂታል መድረክ ነው።
                  </p>
                  <p>
                    መድረኩ የመጽሐፍ ማንበብን፣ የመጻፍና የህትመት አገልግሎትን፣ የመጽሐፍ ቅዱስ ትምህርትን፣ የድምፅ
                    መጽሐፍትን፣ የመስመር ላይ ኮርሶችን፣ የክርስቲያን ዜናዎችን፣ የጥናት ሀብቶችንና የማኅበረሰብ ትብብርን በአንድ
                    ሥርዓት ያገናኛል።
                  </p>
                  <p className="rounded-xl bg-gold/15 p-4 border border-gold/30 text-white font-medium">
                    የረቢ ዋና ዓላማ የወንጌል አማኞች መንፈሳዊ እድገት በግለሰብና በቤተሰብ ደረጃ ብቻ እንዳይቀር፣ ወደ
                    ቤተክርስቲያን፣ ወደ ማኅበረሰብና ወደ ሀገር ግንባታ የሚዘልቅ ተግባራዊ አስተዋጽኦ እንዲያፈራ ማገዝ ነው።
                  </p>
                </div>
              </div>

              {/* 3. የረቢ ዋና ዋና የአገልግሎት ዘርፎች */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    3. የረቢ ዋና ዋና የአገልግሎት ዘርፎች
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* 3.1 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <BookOpen className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.1. የመንፈሳዊ መጽሐፍት ማንበቢያና መሸጫ
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          የክርስቲያን መጽሐፍትን በዲጂታል መልኩ ማንበብ፣ መፈለግ፣ መግዛትና ማሰራጨት። ደራሲያንና
                          አሳታሚዎች ሥራቸውን ለብዙ አንባቢያን እንዲያደርሱ ማገዝ።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.2 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <PenTool className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.2. የደራሲያን ማበልጸጊያና የህትመት ድጋፍ
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          ከሐሳብ ማመንጨት ጀምሮ እስከ የመጽሐፍ እቅድ፣ ጽሑፍ ዝግጅት፣ አርትዖት፣ የሥነ-መለኮት ግምገማ፣
                          ዲዛይንና ህትመት ድረስ ድጋፍ መስጠት። ሥራውን በግል ወይም በተባባሪ ቡድን ማከናወን።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.3 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <GraduationCap className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.3. የመጽሐፍ ቅዱስ ትምህርትና የመስመር ላይ ኮርሶች
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          በመጽሐፍ ቅዱስ፣ በሥነ-መለኮት፣ በደቀ መዝሙርነት፣ በአገልግሎት አመራር፣ በቤተሰብ ሕይወትና
                          በክርስቲያናዊ ሥነ-ምግባር ላይ የተዘጋጁ ኮርሶችን፣ የጥናት መመሪያዎችንና የትምህርት ቁሳቁሶችን ማቅረብ።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.4 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <Volume2 className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.4. የድምፅ መጽሐፍትና የድምፅ ትምህርቶች
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          መጽሐፍትን፣ የመጽሐፍ ቅዱስ ትምህርቶችን፣ ስብከቶችንና የጥናት ትምህርቶችን በድምፅ ማቅረብ።
                          ማንበብ ለማይችሉ፣ ለሚቸገሩ ወይም በሥራና በጉዞ ምክንያት ለማንበብ ጊዜ ለማያገኙ ሰዎች ተደራሽነትን
                          ማሳደግ።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.5 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <HeartHandshake className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.5. የሰላም፣ የእርቅና የማኅበረሰብ ግንባታ
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          በቤተክርስቲያንና በማኅበረሰብ መካከል የጋራ ሥራ እንዲጠናከር ማገዝ። በይቅርታ፣ በመግባባት፣ በእርቅ፣
                          በሰው ክብርና በማኅበራዊ ኃላፊነት ላይ የተመሠረቱ ትምህርቶችንና ውይይቶችን ማበረታታት።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.6 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <Newspaper className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.6. የክርስቲያን ዜናዎች፣ ጽሑፎችና ሚዲያ
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          በድረ ገጹ የክርስቲያን ዜናዎችን፣ የቤተክርስቲያን የአገልግሎት ታሪኮችን፣ የትምህርት ጽሑፎችን፣
                          ቃለ-መጠይቆችን፣ የምርምር ውጤቶችንና የተለያዩ የማኅበረሰብ ልምዶችን ማቅረብ። መረጃዎችን
                          በኃላፊነት ማረጋገጥና በተገቢው ሁኔታ ማሰራጨት።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.7 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <Compass className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.7. ለአስቸጋሪ አካባቢዎች የትምህርት ተደራሽነት
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          በሰላም በሚኖሩ አካባቢዎችም ሆነ በግጭት፣ በመፈናቀል፣ በድርቅ ወይም በደካማ የኢንተርኔት አገልግሎት
                          የተጎዱ አካባቢዎች ያሉ ሰዎች የመጽሐፍ ቅዱስ ትምህርቶችንና መጽሐፍትን እንዲያገኙ ማመቻቸት።
                          ከመስመር ውጭ የሚሠሩ መጽሐፍትን፣ የሚወርዱ የድምፅ ፋይሎችንና በሞባይል የሚደረስባቸውን
                          ትምህርቶች ማበልጸግ።
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3.8 */}
                  <div className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                        <FileSearch className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy mb-1">
                          3.8. ምርምር፣ ጥናትና የእውቀት ልውውጥ
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          በመጽሐፍ ቅዱስ፣ በሥነ-መለኮት፣ በቤተክርስቲያን ታሪክ፣ በሀገር ማኅበራዊ እድገትና በክርስቲያናዊ
                          አስተዋጽኦ ላይ የሚከናወኑ ጥናቶችን ማበረታታት። የጥናት ጽሑፎችን፣ የውይይት መድረኮችንና
                          የትምህርት ሀብቶችን ለማኅበረሰቡ ማቅረብ።
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. የረቢ መልእክት */}
              <div className="rounded-2xl bg-gold/10 p-6 md:p-8 border border-gold/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy-deep">
                    9. የረቢ መልእክት
                  </h3>
                </div>
                <div className="space-y-3 text-xs md:text-sm text-navy/90 leading-relaxed">
                  <p>
                    ረቢ እውቀት ከመጽሐፍ ገጾች ወጥቶ ወደ ሕይወት፣ ከግለሰብ ወደ ማኅበረሰብ፣ ከቤተክርስቲያን ወደ
                    ሀገር ግንባታ እንዲዘልቅ የሚሠራ መድረክ ነው።
                  </p>
                  <p>
                    ደራሲዎች ሐሳባቸውን ወደ መጽሐፍ እንዲቀይሩ፣ አንባቢያን በእውቀት እንዲያድጉ፣ መምህራን ትምህርታቸውን
                    ለብዙዎች እንዲያደርሱ፣ ቤተክርስቲያንም በማኅበረሰብ ግንባታ ላይ ያላትን አስተዋጽኦ እንድታጠናክር ያግዛል።
                  </p>
                  <p>
                    የረቢ ዓላማ መጽሐፍትን ማተም ብቻ ሳይሆን፣ እውቀትን ማሳደግ፣ ሰዎችን ማገናኘት፣ የሰላም ባህልን
                    ማበረታታትና ለሀገር የሚጠቅም ትውልድ ግንባታ ላይ መሳተፍ ነው።
                  </p>
                  <div className="mt-4 pt-4 border-t border-gold/30 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <span className="font-display text-base font-bold text-navy-deep">
                      ረቢ — ከእውቀት ወደ ሕይወት፤ ከመጽሐፍ ወደ ማኅበረሰብ፤ ከእምነት ወደ አገልግሎት።
                    </span>
                    <span className="rounded-full bg-navy-deep text-gold px-4 py-1.5 text-xs font-semibold">
                      መሪ መርህ፦ ማንበብ፣ መማር፣ መጻፍ፣ ማገናኘትና ማነጽ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ራዕይ እና ተልዕኮ SECTION */}
          {activeSection === "vision" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b border-gold/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gold/15 p-2.5 text-gold border border-gold/30">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">ክፍል ፪</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      ራዕይ እና ተልዕኮ — የምንሰራው እና መዳረሻችን
                    </h2>
                  </div>
                </div>
              </div>

              {/* 1. ራዕያችን */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Target className="h-4 w-4" />
                  <span>1. ራዕያችን</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3 leading-snug">
                  በመጽሐፍ ቅዱስ እውነት፣ በእውቀት፣ በጥበብና በተግባራዊ አገልግሎት የተገነባ የወንጌል አማኞች ማኅበረሰብ መገንባት!
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed font-sans">
                  በመጽሐፍ ቅዱስ እውነት፣ በእውቀት፣ በጥበብና በተግባራዊ አገልግሎት የተገነባ፤ የሚያነብ፣ የሚጽፍ፣ የሚመረምር፣
                  ለሰላም የሚሠራና ለሀገር ዕድገት አስተዋጽኦ የሚያደርግ የወንጌል አማኞች ማኅበረሰብ መገንባት።
                </p>
              </div>

              {/* 2. ተልዕኳችን */}
              <div className="rounded-2xl border border-gold/25 bg-background p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    2. ተልዕኳችን
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  ረቢ ዲጂታል ቴክኖሎጂን፣ የመጽሐፍ ሥነ-ጽሑፍን፣ የትምህርት ሀብቶችንና የባለሙያዎችን ትብብር በመጠቀም፦
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "በኢትዮጵያ የወንጌል አማኞች የእውቀትና የሥነ-ጽሑፍ ባህልን ማሳደግ።",
                    "የመጽሐፍ ቅዱስ ትምህርቶችን ለተለያዩ ዕድሜዎች፣ ቋንቋዎችና የመማር ፍላጎቶች ተስማሚ በሆነ መልኩ ማቅረብ።",
                    "በሰላም የሚኖሩ እና በግጭት፣ በመፈናቀል ወይም በሌሎች አስቸጋሪ ሁኔታዎች የሚገኙ ሰዎች የመንፈሳዊ ትምህርት ሀብቶችን እንዲያገኙ ማስቻል።",
                    "በቤተክርስቲያንና በማኅበረሰብ መካከል የመግባባት፣ የአገልግሎትና የትብብር ድልድዮችን መገንባት።",
                    "የደራሲያንን፣ የመምህራንን፣ የመርማሪዎችንና የአርታዒያንን አቅም ማበልጸግ።",
                    "በሰላም፣ በፍትሕ፣ በኃላፊነት፣ በአገልግሎትና በሰው ክብር ላይ የተመሠረተ ማኅበረሰባዊ ተሳትፎን ማበረታታት።",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl bg-navy/5 p-3.5 border border-gold/10"
                    >
                      <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span className="text-xs text-navy/90 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. የረቢ የረጅም ጊዜ ግቦች */}
              <div className="rounded-2xl border border-gold/25 bg-navy-deep/5 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    7. የረቢ የረጅም ጊዜ ግቦች
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  ረቢ በደረጃ በደረጃ የሚያሳካቸው ዋና ግቦች፦
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "በኢትዮጵያ የክርስቲያን ሥነ-ጽሑፍ የዲጂታል ማንበቢያና መሸጫ መድረክ መሆን።",
                    "ለአዳዲስ ደራሲያን የመጻፍ፣ የአርትዖትና የህትመት ድጋፍ መስጠት።",
                    "የመጽሐፍ ቅዱስ ትምህርቶችንና ኮርሶችን በዲጂታልና በድምፅ ቅርጾች ማስፋፋት።",
                    "የክርስቲያን ዜናዎችን፣ የጥናት ጽሑፎችንና የትምህርት ሀብቶችን የሚያቀርብ ድረ ገጽ መገንባት።",
                    "በሰላም፣ በእርቅ፣ በማኅበረሰብ አገልግሎትና በሀገር ግንባታ ላይ የሚያተኩሩ የትምህርት ሀብቶችን ማበልጸግ።",
                    "ደራሲያን፣ አንባቢያን፣ መምህራን፣ መርማሪዎችና የቤተክርስቲያን አገልጋዮች የሚተባበሩበት ማኅበረሰብ መፍጠር።",
                  ].map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl bg-card p-4 border border-gold/20 shadow-sm"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-navy-deep">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-navy/90 leading-relaxed font-medium">
                        {goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. የረቢ መሠረታዊ እሴቶች */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    8. የረቢ መሠረታዊ እሴቶች
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    {
                      title: "እውነትና ጥራት",
                      desc: "በመጽሐፍ ቅዱስ እውነት፣ በታማኝ ምርምርና በጥራት ያለው የሥነ-ጽሑፍ ሥራ ላይ መመሥረት።",
                    },
                    {
                      title: "ትብብርና አገልግሎት",
                      desc: "በግልና በቡድን የሚከናወኑ ሥራዎችን በማገናኘት ለጋራ ዓላማ መሥራት።",
                    },
                    {
                      title: "ሰላምና የሰው ክብር",
                      desc: "መግባባትን፣ ርህራሄን፣ እርቅንና ሰላማዊ አብሮ መኖርን ማበረታታት።",
                    },
                    {
                      title: "ተደራሽነትና ፈጠራ",
                      desc: "ቴክኖሎጂን በመጠቀም እውቀትንና ትምህርትን ለብዙ ሰዎች ማድረስ።",
                    },
                    {
                      title: "ዘላቂ ተጽዕኖ",
                      desc: "ዛሬ የሚዘጋጁ መጽሐፍት፣ ትምህርቶችና ጥናቶች ለነገው ትውልድ የሚጠቅሙ እንዲሆኑ መሥራት።",
                    },
                  ].map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gold/25 bg-card p-4 text-center hover:border-gold hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-sm">
                          {i + 1}
                        </div>
                        <h4 className="font-display text-sm font-bold text-navy mb-1.5">
                          {v.title}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          {v.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ቡድናችን SECTION */}
          {activeSection === "team" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b border-gold/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gold/15 p-2.5 text-gold border border-gold/30">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">ክፍል ፫</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      ቡድናችን — ከእኛ ጋር ያሉ አገልጋዮች
                    </h2>
                  </div>
                </div>
              </div>

              {/* Team Intro */}
              <div className="rounded-2xl bg-navy-deep p-6 md:p-8 text-white border border-gold/30">
                <h3 className="font-display text-xl font-bold text-gold mb-2">
                  ደራሲያን፣ አንባቢያን፣ መምህራን፣ መርማሪዎችና የቤተክርስቲያን አገልጋዮች ማኅበረሰብ
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed">
                  ረቢ በአንድ ግለሰብ ጥረት ብቻ ሳይሆን በኢትዮጵያ የወንጌል አማኞች አብያተ ክርስቲያናት መጋቢዎች፣
                  የሥነ-መለኮት ምሁራን፣ ጸሐፊያንና የቴክኖሎጂ አገልጋዮች የጋራ ራዕይና የትብብር አገልግሎት የሚመራ መድረክ
                  ነው።
                </p>
              </div>

              {/* Ministry Service Groups */}
              <div>
                <h3 className="font-display text-xl font-bold text-navy mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>ከእኛ ጋር ያሉ የአገልግሎት ዘርፎችና አገልጋዮች</span>
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    {
                      role: "የመጋቢዎችና የሥነ-መለኮት አማካሪዎች ቦርድ",
                      desc: "በመድረኩ ላይ የሚቀርቡትን ትምህርቶች፣ መጽሐፍትና ኮርሶች ከመጽሐፍ ቅዱስ እውነትና ከንጹሕ የክርስትና አስተምህሮ አኳያ የሚመረምሩና አቅጣጫ የሚያሳዩ መጋቢዎችና የሥነ-መለኮት አስተማሪዎች።",
                      badge: "መንፈሳዊ አመራርና ክትትል",
                    },
                    {
                      role: "የደራሲያን፣ መምህራንና አርታዒያን ቡድን",
                      desc: "ከሐሳብ ማመንጨት አንስቶ መጽሐፍትን፣ የመጽሐፍ ቅዱስ ጥናቶችን፣ የሰላም ማስተማሪያዎችንና መመሪያዎችን በከፍተኛ ጥራት የሚያዘጋጁና የሚያበለጽጉ የሥነ-ጽሑፍ አገልጋዮች።",
                      badge: "ሥነ-ጽሑፍና ምርምር",
                    },
                    {
                      role: "የዲጂታል ቴክኖሎጂና የሚዲያ ቡድን",
                      desc: "የተጠበቀውን የዲጂታል ማንበቢያ፣ የመስመር ላይ ኮርሶችን፣ የድምፅና ቪዲዮ መድረክን የሚያለሙና ዘመናዊ የቴክኖሎጂ ጥበቃ የሚያደርጉ ወጣት ባለሙያዎች።",
                      badge: "ፈጠራና ቴክኖሎጂ",
                    },
                    {
                      role: "የቋንቋና ትርጉም አገልግሎት (Translation & Reach)",
                      desc: "ይዘቶችን በአማርኛ፣ በአፋን ኦሮሞና በእንግሊዝኛ እንዲሁም በሌሎች የሀገራችን ቋንቋዎች ተደራሽ ለማድረግ በትጋት የሚሠሩ የቋንቋ አገልጋዮችና ተርጓሚዎች።",
                      badge: "ሁለገብ ተደራሽነት",
                    },
                  ].map((team, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gold/20 bg-card p-6 shadow-card hover:border-gold/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold text-navy-deep border border-gold/30 mb-2">
                          {team.badge}
                        </span>
                        <h4 className="font-display text-base font-bold text-navy mb-2">
                          {team.role}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {team.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Serve Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-gold/15 to-navy-deep/10 p-6 md:p-8 border border-gold/40 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-display text-lg font-bold text-navy mb-1">
                    ከእኛ ጋር አብረው ማገልገል ይፈልጋሉ?
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    በደራሲነት፣ በትርጉም፣ በድምፅ ንባብ ወይም በቴክኖሎጂ ድጋፍ አገልግሎታችንን ለማጠናከር የእርስዎ
                    ተሳትፎ ሁሌም በደስታ ይቀበላል።
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectSection("contact")}
                  className="rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all shrink-0 cursor-pointer"
                >
                  አሁን ያነጋግሩን
                </button>
              </div>
            </div>
          )}

          {/* 4. አጋርነት SECTION */}
          {activeSection === "partnership" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b border-gold/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gold/15 p-2.5 text-gold border border-gold/30">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">ክፍል ፬</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      አጋርነት — አጋር ለመሆን እና የጋራ ሥራ
                    </h2>
                  </div>
                </div>
              </div>

              {/* 4. ረቢ በሀገር ግንባታ ላይ ያለው ሚና */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe className="h-4 w-4" />
                  <span>4. ረቢ በሀገር ግንባታ ላይ ያለው ሚና</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3">
                  መንፈሳዊ እድገትን ከሀገራዊ ኃላፊነት ጋር ማገናኘት
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed mb-4">
                  ረቢ የወንጌል አማኞች ማኅበረሰብ መንፈሳዊ እድገትን ከሀገራዊ ኃላፊነት ጋር በማገናኘት፣ ቤተክርስቲያን
                  በሀገር ግንባታ ላይ የምታደርገውን አስተዋጽኦ ለማጠናከር ይሠራል። ይህ አስተዋጽኦ በሚከተሉት መንገዶች
                  ሊገለጽ ይችላል፦
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {[
                    {
                      label: "በእውቀት ግንባታ",
                      text: "የማንበብ፣ የማሰብ፣ የመጻፍና የምርምር ባህልን ማሳደግ።",
                    },
                    {
                      label: "በሥነ-ምግባርና በኃላፊነት",
                      text: "ታማኝነትን፣ ፍትሕን፣ ርህራሄን፣ የሥራ ባህልንና የሕዝብ አገልግሎትን የሚያበረታቱ ትምህርቶችን ማቅረብ።",
                    },
                    {
                      label: "በሰላምና በእርቅ",
                      text: "ልዩነቶችን በንግግር፣ በመግባባትና በጋራ ኃላፊነት ለመፍታት የሚያግዙ ሀብቶችን ማዘጋጀት።",
                    },
                    {
                      label: "በትብብር",
                      text: "ቤተክርስቲያናት፣ የትምህርት ተቋማት፣ የሲቪል ማኅበረሰብ ድርጅቶችና ሌሎች በጋራ ሊሠሩ የሚችሉ ተቋማት መካከል ግንኙነት መፍጠር።",
                    },
                    {
                      label: "በሰው ክብርና በማኅበራዊ ድጋፍ",
                      text: "በችግር፣ በመፈናቀልና በሌሎች አስቸጋሪ ሁኔታዎች ውስጥ ለሚገኙ ሰዎች የተደራሽ ትምህርትና መንፈሳዊ ማጽናኛ ማቅረብ።",
                    },
                  ].map((role, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-navy-soft/60 p-4 border border-gold/20 flex flex-col justify-start"
                    >
                      <span className="font-display text-xs font-bold text-gold mb-1">
                        • {role.label}፦
                      </span>
                      <span className="text-xs text-on-navy-muted leading-relaxed font-sans">
                        {role.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-gold/15 p-4 border border-gold/30 text-xs md:text-sm text-white font-medium">
                  የረቢ አቀራረብ የቤተክርስቲያንን መንፈሳዊ ማንነት እየጠበቀ፣ ለጋራ የሰው ልጅ ደህንነትና ለሀገር ዕድገት
                  በኃላፊነት የሚሳተፍ ማኅበረሰብ መገንባት ነው።
                </div>
              </div>

              {/* 5. በቤተክርስቲያንና በማኅበረሰብ መካከል ድልድይ መፍጠር */}
              <div className="rounded-2xl border border-gold/25 bg-background p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <HeartHandshake className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    5. በቤተክርስቲያንና በማኅበረሰብ መካከል ድልድይ መፍጠር
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
                  ረቢ ቤተክርስቲያን ከማኅበረሰቡ ጋር በጋራ የሚያስቡበትን፣ የሚማሩበትንና የሚሠሩበትን መንገድ
                  ለማስፋት ይጥራል። ይህም በሚከተሉት ይተገበራል፦
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "በሰላም፣ በእርቅ፣ በይቅርታና በማኅበራዊ ኃላፊነት ላይ የተዘጋጁ መጽሐፍትንና ኮርሶችን ማቅረብ።",
                    "ለተለያዩ ማኅበረሰቦች የሚጠቅሙ የጋራ ጥናትና ውይይት መድረኮችን ማበረታታት።",
                    "የማኅበረሰቡን ችግሮችና ፍላጎቶች በጥናት ለመረዳትና ተገቢ የእውቀት ሀብቶችን ለማቅረብ መሥራት።",
                    "በተለያዩ የእምነትና የማኅበራዊ ዳራ ያላቸው ሰዎች መካከል መከባበርንና ሰላማዊ አብሮ መኖርን የሚያጠናክሩ ትምህርቶችን ማዳረስ።",
                  ].map((bridge, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl bg-navy/5 p-4 border border-gold/15"
                    >
                      <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span className="text-xs text-navy/90 leading-relaxed font-medium">
                        {bridge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnership Options */}
              <div className="rounded-2xl bg-gold/10 p-6 md:p-8 border border-gold/30">
                <h4 className="font-display text-lg font-bold text-navy-deep mb-2">
                  አጋር ለመሆን የሚፈልጉ ተቋማትና አገልጋዮች
                </h4>
                <p className="text-xs text-navy/80 mb-5 leading-relaxed">
                  አብያተ ክርስቲያናት፣ ደራሲያን፣ አሳታሚዎች፣ የሥነ-መለኮት ኮሌጆች እና የሲቪል ማኅበራት ከእኛ ጋር በትብብር
                  ለመሥራት ዝግጁ ነን።
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://t.me/rabbidigitals"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-deep px-5 py-2.5 text-xs font-bold text-gold hover:bg-navy transition-all shadow"
                  >
                    <Send className="h-4 w-4" />
                    <span>በቴሌግራም አጋር ለመሆን ያነጋግሩ (@rabbi_admin)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleSelectSection("contact")}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy/30 bg-background px-5 py-2.5 text-xs font-bold text-navy hover:bg-card transition-all cursor-pointer"
                  >
                    <Mail className="h-4 w-4 text-gold" />
                    <span>የመልእክት ቅፅ ይሙሉ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. ያግኙን SECTION */}
          {activeSection === "contact" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b border-gold/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gold/15 p-2.5 text-gold border border-gold/30">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">ክፍል ፭</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      ያግኙን — ለአስተያየትና ጥያቄ ያግኙን
                    </h2>
                  </div>
                </div>
              </div>

              {/* 6. ለሁሉም ተደራሽ የሆነ የትምህርት መድረክ */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe className="h-4 w-4" />
                  <span>6. ለሁሉም ተደራሽ የሆነ የትምህርት መድረክ</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gold mb-2">
                  የቴክኖሎጂ አጠቃቀምን የሰዎች ልዩነትና ፍላጎት በሚያከብር መልኩ ማቅረብ
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed mb-4">
                  ረቢ የቴክኖሎጂ አጠቃቀምን የሰዎች ልዩነትና ፍላጎት በሚያከብር መልኩ ለማቅረብ ይሠራል።
                </p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    "በስልክ ላይ ቀላል የሆነ የንባብና የትምህርት አጠቃቀም።",
                    "በኢንተርኔት ውስንነት ለሚገኙ አካባቢዎች የሚወርዱ መጽሐፍትና የድምፅ ትምህርቶች።",
                    "የተለያዩ የቋንቋ ፍላጎቶችን ለማሟላት በአማርኛ፣ በአፋን ኦሮሞ፣ በእንግሊዝኛና በሌሎች ቋንቋዎች ይዘቶችን የማቅረብ ዕቅድ።",
                    "የተለያዩ የመማር ፍላጎቶች ያላቸው ሰዎች እንዲጠቀሙ የጽሑፍና የድምፅ አማራጮች።",
                    "ይዘቶችን በተገቢው ፈቃድ፣ በጥራትና በኃላፊነት ማቅረብ።",
                  ].map((acc, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-navy-soft/60 p-3.5 border border-gold/20 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span className="text-xs text-on-navy-muted leading-relaxed">
                        {acc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information & Feedback Form Grid */}
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Contact Cards (Left 5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-display text-xl font-bold text-navy mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gold" />
                    <span>የቀጥታ ግንኙነት መንገዶች</span>
                  </h3>

                  <a
                    href="https://t.me/rabbidigitals"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-4 rounded-2xl bg-card p-5 border border-gold/25 shadow-sm hover:border-gold hover:shadow-md transition-all group"
                  >
                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-navy">
                        ቴሌግራም አድሚን (Telegram Admin)
                      </h4>
                      <p className="text-xs text-gold font-semibold mt-0.5">@rabbi_admin</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        የክፍያ ደረሰኝ ለመላክ እና ፈጣን ምላሽ ለማግኘት
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 rounded-2xl bg-card p-5 border border-gold/25 shadow-sm">
                    <div className="rounded-xl bg-gold/15 p-3 text-gold">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-navy">ኢሜይል (Email)</h4>
                      <p className="text-xs text-navy font-semibold mt-0.5">rabbidigitals@gmail.com</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        ለመደበኛ ደብዳቤዎችና ለአጋርነት ጥያቄዎች
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-card p-5 border border-gold/25 shadow-sm">
                    <div className="rounded-xl bg-gold/15 p-3 text-gold">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-navy">አድራሻ (Location)</h4>
                      <p className="text-xs text-navy font-semibold mt-0.5">አዲስ አበባ፣ ኢትዮጵያ</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        RABBI Christian Digital Platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feedback Form (Right 7 Cols) */}
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-gold/30 bg-card p-6 md:p-8 shadow-card">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-gold" />
                      <h3 className="font-display text-xl font-bold text-navy">
                        ለአስተያየትና ጥያቄ ያግኙን
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                      ማንኛውም ጥያቄ፣ አስተያየት ወይም ሐሳብ ካለዎት ከዚህ በታች ያለውን ቅፅ በመሙላት ይላኩልን።
                    </p>

                    {formSent && (
                      <div className="mb-4 rounded-xl bg-green-50 p-4 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span>እናመሰግናለን! አስተያየትዎ በተሳካ ሁኔታ ደርሶናል። በቅርቡ ምላሽ እንሰጣለን።</span>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          ሙሉ ስም <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="ስምዎን ያስገቡ"
                          className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">
                            ኢሜይል ወይም ስልክ ቁጥር
                          </label>
                          <input
                            type="text"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="example@gmail.com / +251 9XX..."
                            className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">
                            የመልእክት ርዕስ
                          </label>
                          <select
                            value={contactTopic}
                            onChange={(e) => setContactTopic(e.target.value)}
                            className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                          >
                            <option value="አስተያየት">አስተያየት (General Feedback)</option>
                            <option value="ጥያቄ">ጥያቄ (Inquiry)</option>
                            <option value="የአጋርነት ጥያቄ">የአጋርነት ጥያቄ (Partnership)</option>
                            <option value="የክፍያ ጉዳይ">የክፍያ ወይም የመጽሐፍ ጥያቄ</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          መልእክት / አስተያየት <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="ዝርዝር መልእክትዎን እዚህ ይጻፉ..."
                          className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <Send className="h-4 w-4" />
                        <span>መልእክት ላክ (Submit Message)</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
