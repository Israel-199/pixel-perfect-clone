import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "am" | "or" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation
  navHome: { am: "ቤት", or: "Mana", en: "Home" },
  navBooks: { am: "መጽሐፍት", or: "Macaafota", en: "Books" },
  navMyBooks: { am: "የእኔ መጽሃፎች", or: "Macaafota Koo", en: "My Books" },
  navMedia: { am: "ሚዲያ", or: "Miidiyaa", en: "Media" },
  navArticles: { am: "ጽሑፎች", or: "Barreeffamoota", en: "Articles" },
  navPrayer: { am: "ጸሎት", or: "Kadhannaa", en: "Prayer" },
  navCourses: { am: "ኮርስ", or: "Leenjii", en: "Courses" },
  navAbout: { am: "ስለ RABBI", or: "Waa'ee RABBI", en: "About RABBI" },
  navAdmin: { am: "ADMIN PANEL", or: "GABAASA ADMIN", en: "Admin Panel" },

  // Header & Auth
  login: { am: "ግባ / Login", or: "Seeni / Login", en: "Sign In" },
  logout: { am: "ውጣ (Logout)", or: "Ba'i (Logout)", en: "Log Out" },
  register: { am: "ተመዝገብ", or: "Galmaa'i", en: "Register" },
  searchPlaceholder: {
    am: "መጽሐፍትን፣ ሚዲያዎችን፣ ጽሑፎችንና ኮርሶችን ፈልግ...",
    or: "Macaafota, miidiyaa fi leenjii barbaadi...",
    en: "Search books, media, articles and courses...",
  },
  searchBtn: { am: "ፈልግ", or: "Barbaadi", en: "Search" },

  // General & Home Hero
  readNow: { am: "ዛሬ አንብብ", or: "Har'a Dubbisi", en: "Read Today" },
  readMore: { am: "ሙሉ ጥቅስ አንብብ →", or: "Guutuu Dubbisi →", en: "Read Full →" },
  todaysWord: { am: "የዛሬ ቃል", or: "Dubbii Har'aa", en: "Today's Word" },
  learnFromMaster: {
    am: "ዛሬ ከመምህር ምን ትማራለህ?",
    or: "Har'a Barsiisaa irraa maal baratta?",
    en: "What will you learn from the Master today?",
  },
  motto: {
    am: "ቃሉን አንብብ ፤ እምነትን ተረዳ ፤ በሕይወትህ ኑር",
    or: "Dubbii dubbisi, amantii hubadhu, jireenyaan jiraadhu",
    en: "Read the Word, Understand the Faith, Live it out",
  },
  free: { am: "ነፃ", or: "Bilaasha", en: "Free" },
  price: { am: "ዋጋ", or: "Gatii", en: "Price" },
  etb: { am: "ብር", or: "ETB", en: "ETB" },
  buyNow: { am: "ግዛ / ይዘዙ", or: "Biti / Ajaji", en: "Purchase" },
  approved: { am: "ተፈቅዷል", or: "Eeyyamameera", en: "Permitted" },
  pendingApproval: { am: "በመጠባበቅ ላይ", or: "Eegamaa jira", en: "Pending" },

  // Reader & DRM Security
  close: { am: "ዝጋ", or: "Cufi", en: "Close" },
  nextPage: { am: "ቀጣይ ገጽ", or: "Fuula Itti Aanu", en: "Next Page" },
  prevPage: { am: "ወደ ኋላ", or: "Gara Duubaa", en: "Previous Page" },
  pageOf: { am: "ከ", or: "irraa", en: "of" },
  page: { am: "ገጽ", or: "Fuula", en: "Page" },
  go: { am: "ሂድ", or: "Deemi", en: "Go" },
  tableOfContents: { am: "ማውጫ (TOC)", or: "Baafata", en: "Contents" },
  singlePage: { am: "1 ገጽ", or: "Fuula 1", en: "1 Page" },
  twoPages: { am: "2 ገጽ", or: "Fuula 2", en: "2 Pages" },
  lightTheme: { am: "ብርሃናማ", or: "Ifaa", en: "Light" },
  sepiaTheme: { am: "ሴፒያ", or: "Seepiyaa", en: "Sepia" },
  darkTheme: { am: "ጨለማ", or: "Dukkana", en: "Dark" },
  protectedContent: {
    am: "የተጠበቀ ይዘት",
    or: "Qabiyyee Eegame",
    en: "Protected Content",
  },
  screenshotBlockedMsg: {
    am: "⚠️ የስክሪን ቀረጻ (Screenshot/Record) ማድረግ አይፈቀድም።",
    or: "⚠️ Waraabbii iskiriinii (Screenshot) dhorkaadha.",
    en: "⚠️ Screen capture and recording are strictly prohibited.",
  },
  copyBlockedMsg: {
    am: "ይዘትን መቅዳት ወይም ማተም የተከለከለ ነው!",
    or: "Qabiyyee waraabuu ykn maxxansuun dhorkaadha!",
    en: "Copying and printing content is disabled!",
  },
  clickToResume: {
    am: "ስርዓቱን ለመቀጠል እዚህ ስክሪኑ ላይ ይጫኑ",
    or: "Itti fufuuf iskiriinii kana cuqaasaa",
    en: "Click screen to resume reading",
  },

  // Courses & Categories
  allLanguages: { am: "ሁሉም ቋንቋዎች", or: "Afaanota Hunda", en: "All Languages" },
  amharicLang: { am: "አማርኛ", or: "Afaan Amaaraa", en: "Amharic" },
  oromoLang: { am: "Afaan Oromoo", or: "Afaan Oromoo", en: "Oromo" },
  englishLang: { am: "English", or: "Ingiliffa", en: "English" },

  // Home panels - media/book/course cards
  recentMedia: { am: "የቅርብ ጊዜ ሚዲያ", or: "Miidiyaa Dhiyeenya", en: "Recent Media" },
  allMedia: { am: "ሁሉንም ሚዲያዎች →", or: "Miidiyaa Hunda →", en: "All Media →" },
  recentBook: { am: "የቅርብ ጊዜ መጽሐፍ", or: "Macaafa Dhiyeenya", en: "Recent Book" },
  allBooks: { am: "ሁሉንም መጽሐፍት →", or: "Macaafota Hunda →", en: "All Books →" },
  recentCourseLabel: { am: "RABBI ACADEMY & ኮርሶች", or: "RABBI ACADEMY & Leenjii", en: "RABBI ACADEMY & Courses" },
  allCourses: { am: "ኮርሶችን ይመልከቱ →", or: "Leenjii Ilaalaa →", en: "View Courses →" },
  openMediaPage: { am: "ወደ ሚዲያ ገጽ ክፈት", or: "Fuula Miidiyaa Bani", en: "Open Media Page" },
  readBook: { am: "መጽሐፉን አንብብ / ናሙና ክፈት", or: "Macaafa Dubbisi / Fakkeenya Bani", en: "Read Book / Open Sample" },
  goToCourse: { am: "ወደ ኮርስ ገጽ ሂድ", or: "Gara Fuula Leenjii Deemi", en: "Go to Course Page" },
  provider: { am: "አቅራቢ", or: "Dhiyeessaa", en: "Provider" },
  viewMore: { am: "የበለጠ ይመልከቱ", or: "Dabalataa Ilaalaa", en: "View More" },

  // Pillars section
  pillarReadTitle: { am: "ንባቦች", or: "Dubbisaa", en: "Reading" },
  pillarLearnTitle: { am: "ትምህርት", or: "Barnoota", en: "Learning" },
  pillarPrayerTitle: { am: "ጸሎት", or: "Kadhannaa", en: "Prayer" },
  pillarReadBody: { am: "መጽሐፍ ቅዱስን አንብብ፤\nመጽሐፍትን አግኝ፤", or: "Macaafa Qulqulluu dubbisi;\nMacaafota argi;", en: "Read the Bible;\nFind books;" },
  pillarLearnBody: { am: "ተረዳ፣ ጥናት አድርግ፤\nእውቀትን አሳድግ፤", or: "Hubadhu, qoradhu;\nBeekumsa guddisuuf;", en: "Understand, Study;\nGrow in knowledge;" },
  pillarPrayerBody: { am: "በጸሎት ተገናኝ፤\nበእምነት ኑር፤", or: "Kadhannaadhaan walitti dhufuu;\nAmantiidhaan jiraadhu;", en: "Connect through prayer;\nLive in faith;" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "am",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("am");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rabbi_language") as Language | null;
      if (saved && ["am", "or", "en"].includes(saved)) {
        setLanguageState(saved);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("rabbi_language", lang);
    } catch {}
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
