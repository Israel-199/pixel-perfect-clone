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
import { useLanguage } from "@/lib/language";
import { ABOUT_CONTENT } from "@/lib/aboutContent";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "RABBI Digital | ስለ እኛ — ተልእኮ፣ ራዕይና አጋርነት" },
      {
        name: "description",
        content:
          "RABBI Digital ስለ እኛ — ተልእኮ፣ ራዕይ፣ አጋርነት። RABBI ዲጂታሉን ቦታ ወደ ሚሊዮን ኢትዮጵያዊ ምዕምናን ቃሉን ለማድረስ ያለውን ቁርጠኝነት ያውቁ።",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "RABBI Digital | ስለ እኛ" },
      {
        property: "og:description",
        content:
          "RABBI Digital ተልእኮ፣ ራዕይ፣ አጋርነት — ቃሉን ለሁሉም ለማድረስ።",
      },
      { property: "og:url", content: "https://www.rabbidigital.com/about" },
      { property: "og:locale", content: "am_ET" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RABBI Digital | ስለ እኛ" },
      {
        name: "twitter:description",
        content: "ተልእኮ፣ ራዕይ፣ አጋርነት — RABBI Digital።",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.rabbidigital.com/about" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": "https://www.rabbidigital.com/about",
          "url": "https://www.rabbidigital.com/about",
          "name": "ስለ RABBI Digital",
          "description": "RABBI Digital ተልእኮ፣ ራዕይ፣ አጋርነት",
          "inLanguage": "am",
          "isPartOf": { "@id": "https://www.rabbidigital.com/#website" },
          "publisher": { "@id": "https://www.rabbidigital.com/#organization" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "ዋና ገጽ", "item": "https://www.rabbidigital.com/" },
              { "@type": "ListItem", "position": 2, "name": "ስለ እኛ", "item": "https://www.rabbidigital.com/about" }
            ]
          }
        })
      }
    ],
  }),
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

function AboutRoute() {
  const { language } = useLanguage();
  const content = ABOUT_CONTENT[language] || ABOUT_CONTENT.am;

  const [activeSection, setActiveSection] = useState<SectionKey>("about");
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("General");
  const [contactMessage, setContactMessage] = useState("");
  const [formSent, setFormSent] = useState(false);

  const subSections: SubSectionCard[] = [
    {
      id: "about",
      icon: Info,
      title: content.subSections.about.title,
      desc: content.subSections.about.desc,
      badge: content.subSections.about.badge,
    },
    {
      id: "vision",
      icon: Target,
      title: content.subSections.vision.title,
      desc: content.subSections.vision.desc,
      badge: content.subSections.vision.badge,
    },
    {
      id: "team",
      icon: Users,
      title: content.subSections.team.title,
      desc: content.subSections.team.desc,
      badge: content.subSections.team.badge,
    },
    {
      id: "partnership",
      icon: Handshake,
      title: content.subSections.partnership.title,
      desc: content.subSections.partnership.desc,
      badge: content.subSections.partnership.badge,
    },
    {
      id: "contact",
      icon: Mail,
      title: content.subSections.contact.title,
      desc: content.subSections.contact.desc,
      badge: content.subSections.contact.badge,
    },
  ];

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
            <span>{content.heroBadge}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gold">
            {content.heroTitle}
          </h1>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-on-navy-muted max-w-2xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gold/80 font-medium">
            {content.heroPillars.map((pill, idx) => (
              <span key={idx} className="flex items-center gap-1.5 sm:gap-2">
                <span className="rounded-md bg-navy-soft px-2.5 sm:px-3 py-0.5 sm:py-1 border border-gold/20">{pill}</span>
                {idx < content.heroPillars.length - 1 && <span>•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Category Cards Navigation */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 sm:mb-10">
          {subSections.map(({ id, icon: Icon, title, desc, badge }) => {
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
                      {content.activeLabel}
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
            {content.sectionPickerLabel}
          </span>
          {subSections.map(({ id, title }) => (
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">{content.aboutPart}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      {content.aboutHeaderTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Main Intro Highlight */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3">
                  {content.aboutIntroTitle}
                </h3>
                <h4 className="text-sm font-semibold text-gold/90 mb-4 tracking-wide">
                  {content.aboutIntroSubtitle}
                </h4>
                <div className="space-y-3.5 text-xs md:text-sm text-on-navy-muted leading-relaxed font-sans">
                  <p>{content.aboutIntroP1}</p>
                  <p>{content.aboutIntroP2}</p>
                  <p className="rounded-xl bg-gold/15 p-4 border border-gold/30 text-white font-medium">
                    {content.aboutIntroP3}
                  </p>
                </div>
              </div>

              {/* 3. Primary Service Divisions */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    {content.servicesTitle}
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {content.services.map((item, idx) => {
                    const icons = [BookOpen, PenTool, GraduationCap, Volume2, HeartHandshake, Newspaper, Compass, FileSearch];
                    const SvcIcon = icons[idx % icons.length] || BookOpen;
                    return (
                      <div key={idx} className="rounded-2xl border border-gold/20 bg-background p-5 hover:border-gold/50 transition-all shadow-sm">
                        <div className="flex items-start gap-3.5">
                          <div className="rounded-xl bg-navy/5 p-2.5 text-navy shrink-0">
                            <SvcIcon className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <h4 className="font-display text-base font-bold text-navy mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 9. REBI Message */}
              <div className="rounded-2xl bg-gold/10 p-6 md:p-8 border border-gold/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy-deep">
                    {content.messageTitle}
                  </h3>
                </div>
                <div className="space-y-3 text-xs md:text-sm text-navy/90 leading-relaxed">
                  <p>{content.messageP1}</p>
                  <p>{content.messageP2}</p>
                  <p>{content.messageP3}</p>
                  <div className="mt-4 pt-4 border-t border-gold/30 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <span className="font-display text-base font-bold text-navy-deep">
                      {content.motto}
                    </span>
                    <span className="rounded-full bg-navy-deep text-gold px-4 py-1.5 text-xs font-semibold">
                      {content.principle}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">{content.visionPart}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      {content.visionHeaderTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* 1. ራዕያችን */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Target className="h-4 w-4" />
                  <span>{content.visionTitle}</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3 leading-snug">
                  {content.visionHeading}
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed font-sans">
                  {content.visionText}
                </p>
              </div>

              {/* 2. ተልዕኳችን */}
              <div className="rounded-2xl border border-gold/25 bg-background p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    {content.missionTitle}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  {content.missionIntro}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {content.missionItems.map((item, idx) => (
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

              {/* 7. Long-Term Objectives */}
              <div className="rounded-2xl border border-gold/25 bg-navy-deep/5 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    {content.goalsTitle}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {content.goalsIntro}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {content.goalsItems.map((goal, idx) => (
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

              {/* 8. Core Values */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    {content.valuesTitle}
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {content.values.map((v, i) => (
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">{content.teamPart}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      {content.teamHeaderTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Team Intro */}
              <div className="rounded-2xl bg-navy-deep p-6 md:p-8 text-white border border-gold/30">
                <h3 className="font-display text-xl font-bold text-gold mb-2">
                  {content.teamIntroTitle}
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed">
                  {content.teamIntroText}
                </p>
              </div>

              {/* Ministry Service Groups */}
              <div>
                <h3 className="font-display text-xl font-bold text-navy mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>{content.ministryGroupsTitle}</span>
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  {content.ministryGroups.map((team, idx) => (
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

              <div className="rounded-2xl bg-gradient-to-r from-gold/15 to-navy-deep/10 p-6 md:p-8 border border-gold/40 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-display text-lg font-bold text-navy mb-1">
                    {content.serveCallTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {content.serveCallText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectSection("contact")}
                  className="rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all shrink-0 cursor-pointer"
                >
                  {content.contactNowBtn}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">{content.partnerPart}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      {content.partnerHeaderTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* 4. Role in Nation Building */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe className="h-4 w-4" />
                  <span>{content.nationRoleTag}</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-gold mb-3">
                  {content.nationRoleTitle}
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed mb-4">
                  {content.nationRoleText}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {content.nationRoles.map((role, idx) => (
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
                  {content.nationRoleCallout}
                </div>
              </div>

              {/* 5. Bridge between Church and Society */}
              <div className="rounded-2xl border border-gold/25 bg-background p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <HeartHandshake className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-navy">
                    {content.bridgeTitle}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
                  {content.bridgeIntro}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {content.bridgePoints.map((bridge, idx) => (
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
                  {content.partnerInstitutionsTitle}
                </h4>
                <p className="text-xs text-navy/80 mb-5 leading-relaxed">
                  {content.partnerInstitutionsText}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://t.me/rabbidigitals"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-deep px-5 py-2.5 text-xs font-bold text-gold hover:bg-navy transition-all shadow"
                  >
                    <Send className="h-4 w-4" />
                    <span>{content.telegramPartnerBtn}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleSelectSection("contact")}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy/30 bg-background px-5 py-2.5 text-xs font-bold text-navy hover:bg-card transition-all cursor-pointer"
                  >
                    <Mail className="h-4 w-4 text-gold" />
                    <span>{content.fillFormBtn}</span>
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">{content.contactPart}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                      {content.contactHeaderTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* 6. Education Accessibility */}
              <div className="rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-6 md:p-8 text-white border border-gold/30 shadow-lg">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe className="h-4 w-4" />
                  <span>{content.accessTag}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gold mb-2">
                  {content.accessTitle}
                </h3>
                <p className="text-xs md:text-sm text-on-navy-muted leading-relaxed mb-4">
                  {content.accessText}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {content.accessPoints.map((acc, i) => (
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
                    <span>{content.contactDirectTitle}</span>
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
                        {content.telegramAdminTitle}
                      </h4>
                      <p className="text-xs text-gold font-semibold mt-0.5">@rabbi_admin</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {content.telegramAdminDesc}
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 rounded-2xl bg-card p-5 border border-gold/25 shadow-sm">
                    <div className="rounded-xl bg-gold/15 p-3 text-gold">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-navy">{content.emailTitle}</h4>
                      <p className="text-xs text-navy font-semibold mt-0.5">rabbidigitals@gmail.com</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {content.emailDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-card p-5 border border-gold/25 shadow-sm">
                    <div className="rounded-xl bg-gold/15 p-3 text-gold">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-navy">{content.locationTitle}</h4>
                      <p className="text-xs text-navy font-semibold mt-0.5">{content.locationCity}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {content.locationSubtitle}
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
                        {content.formTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                      {content.formDesc}
                    </p>

                    {formSent && (
                      <div className="mb-4 rounded-xl bg-green-50 p-4 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{content.formSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          {content.formNameLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder={content.formNamePlaceholder}
                          className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">
                            {content.formContactLabel}
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
                            {content.formTopicLabel}
                          </label>
                          <select
                            value={contactTopic}
                            onChange={(e) => setContactTopic(e.target.value)}
                            className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                          >
                            <option value="Feedback">{content.formTopicFeedback}</option>
                            <option value="Inquiry">{content.formTopicInquiry}</option>
                            <option value="Partnership">{content.formTopicPartnership}</option>
                            <option value="Payment">{content.formTopicPayment}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          {content.formMsgLabel} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder={content.formMsgPlaceholder}
                          className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <Send className="h-4 w-4" />
                        <span>{content.formSubmitBtn}</span>
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
