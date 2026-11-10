import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Search,
  User as UserIcon,
  LogOut,
  X,
  Menu,
  AlertTriangle,
  BookOpen,
  Home,
  Video,
  FileText,
  HeartHandshake,
  GraduationCap,
  Info,
  ShieldAlert,
  ChevronRight,
  Globe,
  ChevronDown,
  Check,
} from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";
import { useAuth } from "@/lib/auth";
import { useLanguage, type Language } from "@/lib/language";

interface NavItemDef {
  label: string;
  href: string;
  icon: any;
}

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "or", label: "Afaan Oromoo", flag: "🌳" },
  { code: "en", label: "English", flag: "🌐" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]!;

  const navItems: NavItemDef[] = [
    { label: t("navHome"), href: "/", icon: Home },
    { label: t("navBooks"), href: "/books", icon: BookOpen },
    ...(user ? [{ label: t("navMyBooks"), href: "/my-books", icon: BookOpen }] : []),
    { label: t("navMedia"), href: "/media", icon: Video },
    { label: t("navArticles"), href: "/articles", icon: FileText },
    { label: t("navPrayer"), href: "/prayer", icon: HeartHandshake },
    { label: t("navCourses"), href: "/courses", icon: GraduationCap },
    { label: t("navAbout"), href: "/about", icon: Info },
    ...(user?.role === "ADMIN" ? [{ label: t("navAdmin"), href: "/admin", icon: ShieldAlert }] : []),
  ];

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
    navigate({ to: "/" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate({ to: "/books" });
      setMobileMenuOpen(false);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="bg-navy-deep sticky top-0 z-50 border-b border-gold/10 shadow-sm">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-[0.78rem] font-medium tracking-wide transition-colors hover:text-gold ${
                    isActive ? "text-gold font-bold" : "text-on-navy-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown (Desktop & Mobile) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                title="ቋንቋ ይምረጡ / Choose Language"
                className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 sm:px-3 py-1.5 text-[0.72rem] font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all cursor-pointer active:scale-95"
              >
                <Globe className="h-3.5 w-3.5 text-gold shrink-0" />
                <span className="hidden sm:inline font-bold">{currentLangObj.label}</span>
                <span className="sm:hidden font-bold">{language.toUpperCase()}</span>
                <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-card border border-gold/30 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b border-gold/15 mb-1">
                    ቋንቋ ይምረጡ / Select Language
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        language === l.code ? "bg-gold/20 text-navy font-bold" : "text-navy hover:bg-gold/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check className="h-3.5 w-3.5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/my-books"
                  className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-gold/15 px-3 sm:px-4 py-1.5 sm:py-2 text-[0.72rem] sm:text-[0.75rem] font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all max-w-[130px] sm:max-w-[200px]"
                >
                  <UserIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.fullName || user.email.split("@")[0]}</span>
                </Link>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title={t("logout")}
                  className="hidden sm:flex items-center justify-center rounded-full bg-red-500/10 p-2 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gold/10 px-3.5 sm:px-5 py-1.5 sm:py-2 text-[0.7rem] sm:text-[0.72rem] font-semibold tracking-wide text-gold border border-gold/40 transition-all hover:bg-gold hover:text-navy-deep active:scale-95 touch-manipulation whitespace-nowrap"
              >
                {t("login")}
              </Link>
            )}

            {/* Quick Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="ፈልግ"
              className="text-on-navy-muted transition-colors hover:text-gold p-1.5 rounded-lg hover:bg-gold/10 cursor-pointer"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "ምናሌ ዝጋ" : "ምናሌ ክፈት"}
              className="flex lg:hidden items-center justify-center rounded-xl p-1.5 sm:p-2 text-gold border border-gold/30 hover:bg-gold/15 transition-all active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Quick Search Bar Drawer (Desktop & Mobile) */}
        {searchOpen && (
          <div className="border-t border-gold/15 bg-navy-deep/95 px-4 sm:px-6 py-3 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="mx-auto max-w-[700px] flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-xl border border-gold/30 bg-background/95 pl-10 pr-4 py-2 text-xs text-navy focus:border-gold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-gold px-4 py-2 text-xs font-bold text-navy-deep hover:bg-gold/90 transition-all cursor-pointer shrink-0"
              >
                {t("searchBtn")}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:text-gold cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Content */}
          <aside className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] bg-navy-deep border-l border-gold/30 shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-right duration-250">
            {/* Drawer Top Header */}
            <div className="p-5 border-b border-gold/15 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-on-navy-muted hover:bg-gold/15 hover:text-gold transition-colors cursor-pointer"
                aria-label="ዝጋ"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Selector Bar inside Mobile Drawer */}
            <div className="px-5 py-3 border-b border-gold/15 bg-navy-soft/80">
              <span className="block text-[10px] font-bold text-gold uppercase tracking-wider mb-2">
                ቋንቋ ይምረጡ / Choose Language
              </span>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all cursor-pointer border ${
                      language === l.code
                        ? "bg-gold text-navy-deep border-gold shadow-sm"
                        : "bg-navy-deep/80 text-on-navy-muted border-gold/20 hover:bg-gold/10"
                    }`}
                  >
                    <span className="block text-sm">{l.flag}</span>
                    <span className="block truncate">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Status Ribbon in Mobile Drawer */}
            {user ? (
              <div className="px-5 py-4 border-b border-gold/15 bg-navy-soft/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold border border-gold/30 shrink-0 font-bold text-sm">
                    {(user.fullName?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gold truncate">
                      {user.fullName || user.email.split("@")[0]}
                    </p>
                    <p className="text-[11px] text-on-navy-muted truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 rounded-md bg-gold/15 px-2 py-0.2 text-[9px] font-bold text-gold uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-gold/15 bg-navy-soft/40">
                <p className="text-xs text-on-navy-muted mb-2.5">
                  ወደ መለያዎ በመግባት የተፈቀዱ መጽሐፍትን ያንብቡ።
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center rounded-xl bg-gold py-2 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center rounded-xl border border-gold/40 py-2 text-xs font-bold text-gold hover:bg-gold/15 transition-all"
                  >
                    ተመዝገብ
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links Scrollable List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/" && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gold text-navy-deep font-bold shadow-sm"
                        : "text-on-navy-muted hover:bg-gold/10 hover:text-gold"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-navy-deep" : "text-gold"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 ${isActive ? "text-navy-deep" : "opacity-40"}`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-gold/15 bg-navy-deep space-y-2">
              {user && (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/25 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </button>
              )}
              <p className="text-center text-[10px] text-on-navy-muted">
                © 2024 RABBI Christian Platform
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-gold/30 shadow-2xl p-6 text-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-3.5 right-3.5 rounded-full p-1 text-muted-foreground hover:bg-navy/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="font-display text-lg font-bold text-navy mb-2">
              ከስርዓቱ መውጣት ይፈልጋሉ?
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              ከወጡ በኋላ ወደ እርስዎ መጽሐፍትና ሚዲያዎች ለመግባት እንደገና መግባት ይኖርብዎታል።
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-accent transition-all"
              >
                ተመለስ (Cancel)
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                አዎ፣ ውጣ (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-gold/30 shadow-2xl p-6 text-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-3.5 right-3.5 rounded-full p-1 text-muted-foreground hover:bg-navy/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="font-display text-lg font-bold text-navy mb-2">
              ከስርዓቱ መውጣት ይፈልጋሉ?
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              ከወጡ በኋላ ወደ እርስዎ መጽሐፍትና ሚዲያዎች ለመግባት እንደገና መግባት ይኖርብዎታል።
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-accent transition-all"
              >
                ተመለስ (Cancel)
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                አዎ፣ ውጣ (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


