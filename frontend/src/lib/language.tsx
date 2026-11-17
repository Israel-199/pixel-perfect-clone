import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "am" | "or" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // ── Navigation & Header ─────────────────────────────────────────────────────
  navHome: { am: "ቤት", or: "Mana", en: "Home" },
  navBooks: { am: "መጽሐፍት", or: "Macaafota", en: "Books" },
  navMyBooks: { am: "የእኔ መጽሃፎች", or: "Macaafota Koo", en: "My Books" },
  navMedia: { am: "ሚዲያ", or: "Miidiyaa", en: "Media" },
  navArticles: { am: "ጽሑፎች", or: "Barreeffamoota", en: "Articles" },
  navPrayer: { am: "ጸሎት", or: "Kadhannaa", en: "Prayer" },
  navCourses: { am: "ኮርስ", or: "Leenjii", en: "Courses" },
  navAbout: { am: "ስለ RABBI", or: "Waa'ee RABBI", en: "About RABBI" },
  navAdmin: { am: "ADMIN PANEL", or: "GABAASA ADMIN", en: "Admin Panel" },

  // ── Auth & Header Controls ──────────────────────────────────────────────────
  login: { am: "ግባ / Login", or: "Seeni / Login", en: "Sign In" },
  logout: { am: "ውጣ (Logout)", or: "Ba'i (Logout)", en: "Log Out" },
  register: { am: "ተመዝገብ", or: "Galmaa'i", en: "Register" },
  logoutConfirmTitle: {
    am: "ከመለያዎ መውጣት ይፈልጋሉ?",
    or: "Akkaawuntii keessan keessaa ba'uu barbaadduu?",
    en: "Are you sure you want to log out?",
  },
  logoutConfirmDesc: {
    am: "ከወጡ በኋላ መጽሐፍትንና ይዘቶችን ለማግኘት እንደገና መግባት ይኖርብዎታል።",
    or: "Erga baatanii booda macaafota argachuuf lammata seenuu qabdu.",
    en: "You will need to sign in again to access your permitted books and media.",
  },
  cancel: { am: "ይቅር", or: "Dhiisi", en: "Cancel" },
  confirmLogout: { am: "አዎ ውጣ", or: "Eeyyee Ba'i", en: "Yes, Log Out" },
  searchPlaceholder: {
    am: "መጽሐፍትን፣ ሚዲያዎችን፣ ጽሑፎችንና ኮርሶችን ፈልግ...",
    or: "Macaafota, miidiyaa fi leenjii barbaadi...",
    en: "Search books, media, articles and courses...",
  },
  searchBtn: { am: "ፈልግ", or: "Barbaadi", en: "Search" },

  // ── General & Home Hero ─────────────────────────────────────────────────────
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
  rejected: { am: "ተሰርዟል", or: "Haqarameera", en: "Rejected" },
  allLanguages: { am: "ሁሉም ቋንቋዎች", or: "Afaanota Hunda", en: "All Languages" },
  amharicLang: { am: "አማርኛ", or: "Afaan Amaaraa", en: "Amharic" },
  oromoLang: { am: "Afaan Oromoo", or: "Afaan Oromoo", en: "Oromo" },
  englishLang: { am: "English", or: "Ingiliffa", en: "English" },

  // ── Books Page ──────────────────────────────────────────────────────────────
  booksTitle: {
    am: "መንፈሳዊ መጽሐፍትና ሚዲያዎች",
    or: "Macaafota fi Miidiyaalee Hafuuraa",
    en: "Spiritual Books & Media",
  },
  booksSubtitle: {
    am: "የተመረጡ መንፈሳዊ መጽሐፍትን፣ የቪዲዮና ኦዲዮ ትምህርቶችን ናሙና ያንብቡ፤ በስርዓቱ ላይ ብቻ በሚሰራው ጥበቃ ይማሩ።",
    or: "Macaafota hafuuraa filataman, leenjii viidiyoo fi sagalee dubbisaa; sirna eegameen baradhaa.",
    en: "Explore selected spiritual books, video and audio teachings with protected reader access.",
  },
  catBibleTitle: { am: "መጽሐፍ ቅዱስ", or: "Macaafa Qulqulluu", en: "Holy Bible" },
  catBibleDesc: { am: "የሕይወት ቃል", or: "Dubbii Jireenyaa", en: "Word of Life" },
  catAllBooksTitle: { am: "ሁሉም መጽሐፍት", or: "Macaafota Hunda", en: "All Books" },
  catAllBooksDesc: { am: "መንፈሳዊ መጽሐፍት ክምችት", or: "Kuusaa Macaafotaa", en: "Spiritual Collection" },
  catStudyTitle: { am: "የመማሪያ መጽሐፍት", or: "Macaafota Barnootaa", en: "Study Books" },
  catStudyDesc: { am: "ለጥናት የሚረዱ መጽሐፍት", or: "Qorannoo kan gargaaran", en: "Books for Study" },
  catSummaryTitle: { am: "መጽሐፍ ዝርዝር", or: "Tarree Macaafa", en: "Book Overview" },
  catSummaryDesc: { am: "የመጽሐፍት ማጠቃለያና መግለጫ", or: "Gabaabaa fi ibsa", en: "Summaries & Outlines" },
  availableBooks: { am: "ያሉ መጽሐፍት", or: "Macaafota Jiran", en: "Available Books" },
  loading: { am: "መረጃ በማምጣት ላይ...", or: "Odeeffannoo fidaa jira...", en: "Loading..." },
  authorLabel: { am: "ደራሲ / መጋቢ", or: "Barreessaa / Luba", en: "Author / Pastor" },
  sampleOrRequest: { am: "ናሙና / ጠይቅ", or: "Fakkeenya / Gaafadhu", en: "Sample / Request" },
  readAction: { am: "አንብብ", or: "Dubbisi", en: "Read" },

  // ── Book Modal & Purchase ───────────────────────────────────────────────────
  samplePreview: {
    am: "የነፃ ናሙና ንባብ (Sample Preview)",
    or: "Dubbisa Fakkeenya Bilaashaa (Sample)",
    en: "Free Sample Preview",
  },
  cbeBankTransfer: {
    am: "ክፍያ መፈጸሚያ (CBE Bank Transfer)",
    or: "Kaffaltii Raawwachuuf (Baankii Daldala Itoophiyaa)",
    en: "Payment Method (CBE Bank Transfer)",
  },
  bankLabel: {
    am: "ባንክ: ኢትዮጵያ ንግድ ባንክ (CBE)",
    or: "Baankii: Baankii Daldala Itoophiyaa (CBE)",
    en: "Bank: Commercial Bank of Ethiopia (CBE)",
  },
  accountNumLabel: { am: "የሂሳብ ቁጥር:", or: "Lakkoofsa Herregaa:", en: "Account Number:" },
  accountNameLabel: {
    am: "የሂሳብ ስም: RABBI Ministry / መጋቢ ካስሁብ",
    or: "Maqaa Herregaa: RABBI Ministry / Luba Kaashub",
    en: "Account Name: RABBI Ministry / Pastor Kashub",
  },
  sendReceiptBtn: {
    am: "የክፍያ ደረሰኝ ለመላክ (@rabbi_admin)",
    or: "Nagahee Kaffaltii Erguuf (@rabbi_admin)",
    en: "Send Receipt to Telegram (@rabbi_admin)",
  },
  requestBookAccess: {
    am: "መጽሐፉን ጠይቅ (Request Access)",
    or: "Macaafa Gaafadhu (Request Access)",
    en: "Request Book Access",
  },
  requestPendingStatus: {
    am: "ጥያቄዎ በመጠባበቅ ላይ ነው (Pending Approval)",
    or: "Gaaffiin keessan eegamaa jira (Pending Approval)",
    en: "Your request is pending approval",
  },
  readNowFull: {
    am: "አሁን ያንብቡ / ሙሉ ይዘት ክፈት",
    or: "Amma Dubbisi / Guutuu Bani",
    en: "Read Now / Open Full Content",
  },
  requestSuccessMsg: {
    am: "የመጽሐፍ ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ክፍያዎ ሲረጋገጥ አድሚን ይፈቅድልዎታል።",
    or: "Gaaffiin keessan milkaa'inaan ergameera! Kaffaltiin yeroo mirkanaa'u admin ni eeyyama.",
    en: "Your book request has been submitted! Admin will grant access upon payment confirmation.",
  },

  // ── My Books ────────────────────────────────────────────────────────────────
  myBooksBannerTitle: {
    am: "የእኔ መጽሃፎችና ሚዲያዎች",
    or: "Macaafota fi Miidiyaalee Koo",
    en: "My Books & Media",
  },
  myBooksBannerSubtitle: {
    am: "እንኳን ደህና መጡ! የጠየቋቸውንና የገዟቸውን መንፈሳዊ መጽሐፍት እዚህ ያገኛሉ።",
    or: "Baga nagaan dhuftan! Macaafota gaafattanii fi bitattan asitti argattu.",
    en: "Welcome! Access the spiritual books and media you have requested or purchased.",
  },
  seeMoreBooks: {
    am: "ተጨማሪ መጽሐፍት ይመልከቱ",
    or: "Macaafota dabalataa ilaalaa",
    en: "Explore More Books",
  },
  emptyMyBooksTitle: {
    am: "እስካሁን ምንም የጠየቁት መጽሐፍ የለም",
    or: "Hamma ammaatti macaafni gaafattan hin jiru",
    en: "No books requested yet",
  },
  emptyMyBooksDesc: {
    am: "የሚፈልጉትን መንፈሳዊ መጽሐፍ ወይም ትምህርት ከመጽሐፍት ዝርዝር ውስጥ መርጠው መጠየቅ ይችላሉ።",
    or: "Macaafa ykn leenjii barbaaddan tarree keessaa filachuun gaafachuu dandeessu.",
    en: "You can choose and request any spiritual book or teaching from our book collection.",
  },
  goToBooks: {
    am: "ወደ መጽሐፍት ዝርዝር ሂድ",
    or: "Gara Tarree Macaafaatti Deemi",
    en: "Go to Book Collection",
  },
  readFullAccessBtn: {
    am: "አሁን ያንብቡ (Read Full Access)",
    or: "Amma Dubbisi (Guutuu)",
    en: "Read Now (Full Access)",
  },
  pendingReviewNotice: {
  am: "ጥያቄዎ በመታየት ላይ ነው። የክፍያ ደረሰኝ በቴሌግራም መላክ አይርሱ!!!",
  or: "Gaaffiin keessan ilaalamaa jira. Ragaa kaffaltii keessan Telegram irratti erguu hin dagatinaa!!!",
  en: "Your request is being reviewed. Please don't forget to send your payment receipt via Telegram!!!"
},
  rejectedNotice: {
    am: "ጥያቄዎ አልተፈቀደም። እባክዎ አድሚንን ያነጋግሩ።",
    or: "Gaaffiin keessan hin eeyyamamne. Maaloo admin qunnamaa.",
    en: "Your request was rejected. Please contact the administrator.",
  },

  // ── Media Page ──────────────────────────────────────────────────────────────
  mediaTitle: {
    am: "መንፈሳዊ ሚዲያዎች",
    or: "Miidiyaalee Hafuuraa",
    en: "Spiritual Media",
  },
  mediaSubtitle: {
    am: "የተመረጡ የቪዲዮና ኦዲዮ ትምህርቶች፣ መዝሙሮችና መንፈሳዊ ውይይቶች።",
    or: "Leenjii viidiyoo fi sagalee, faarfannaa fi marii hafuuraa filataman.",
    en: "Selected video and audio teachings, hymns, and spiritual discussions.",
  },
  filterAllMedia: { am: "ሁሉም ሚዲያዎች", or: "Miidiyaa Hunda", en: "All Media" },
  filterVideos: { am: "ቪዲዮዎች", or: "Viidiyoowwan", en: "Videos" },
  filterAudios: { am: "ኦዲዮዎች", or: "Sagaleewwan", en: "Audios" },
  filterVideosDesc: { am: "የቪዲዮ ትምህርቶች እና መዝሙሮች", or: "Leenjii viidiyoo fi faarfannaa", en: "Video teachings & hymns" },
  filterAudiosDesc: { am: "የድምፅ ትምህርቶች", or: "Leenjii sagalee", en: "Audio teachings" },
  availableMedia: { am: "ያሉ ሚዲያዎች", or: "Miidiyaalee Jiran", en: "Available Media" },

  // ── Articles Page ───────────────────────────────────────────────────────────
  articlesTitle: {
    am: "መንፈሳዊ ጽሑፎች",
    or: "Barreeffamoota Hafuuraa",
    en: "Spiritual Articles",
  },
  articlesSubtitle: {
    am: "የዕለት ማሰላሰያዎች፣ የመጽሐፍ ቅዱስ ጥናቶችና የእምነት ማበረታቻ ጽሑፎች።",
    or: "Xiinxala guyyaa, qorannoo Macaafa Qulqulluu fi barreeffama jajjabinaa.",
    en: "Daily devotionals, Bible studies, and faith-building articles.",
  },
  tabAllArticles: { am: "ሁሉም ጽሑፎች", or: "Barreeffama Hunda", en: "All Articles" },
  tabCategories: { am: "ምድቦች", or: "Ramaddii", en: "Categories" },
  tabPopular: { am: "ተወዳጅ ጽሑፎች", or: "Barreeffamoota Jaallataman", en: "Popular Articles" },
  tabDaily: { am: "የዕለት ቃል", or: "Dubbii Guyyaa", en: "Daily Word" },

  // ── Prayer Page ─────────────────────────────────────────────────────────────
  prayerTitle: {
    am: "የጸሎት ክፍል",
    or: "Kutaa Kadhannaa",
    en: "Prayer Room",
  },
  prayerSubtitle: {
    am: "በጸሎትና በምልጃ ወደ እግዚአብሔር ዙፋን በህብረት የምንቀርብበት መድረክ።",
    or: "Kadhannaa fi araarsaan gara teessoo Waaqayyootti kan dhiyaannu.",
    en: "Approaching the throne of God together in prayer and intercession.",
  },
  tabCorporatePrayer: { am: "የጋራ ጸሎት", or: "Kadhannaa Waliinii", en: "Corporate Prayer" },
  tabPrayerTopics: { am: "አርዕስተ ጸሎት", or: "Mata Duree Kadhannaa", en: "Prayer Topics" },
  tabPersonalPrayer: { am: "የግል ጸሎት", or: "Kadhannaa Dhuunfaa", en: "Personal Prayer" },
  tabPrayerGuideline: { am: "የጸሎት መመሪያ", or: "Qajeelfama Kadhannaa", en: "Prayer Guidelines" },
  sayAmenBtn: { am: "አሜን በል", or: "Ameen Jedhi", en: "Say Amen" },
  submitPrayerBtn: { am: "የጸሎት ጥያቄ ላክ", or: "Gaaffii Kadhannaa Ergi", en: "Submit Prayer Request" },

  // ── About Page ──────────────────────────────────────────────────────────────
  aboutTitle: {
    am: "ስለ RABBI አገልግሎት",
    or: "Waa'ee Tajaajila RABBI",
    en: "About RABBI Ministry",
  },
  aboutSubtitle: {
    am: "ቃሉን በማንበብ፣ እምነትን በመረዳትና በሕይወት በመኖር የምናገለግልበት መንፈሳዊ መድረክ።",
    or: "Dubbii dubbisuun, amantii hubachuun fi jireenyaan tajaajiluuf.",
    en: "A spiritual platform dedicated to reading the Word, understanding faith, and living it out.",
  },
  subAboutUs: { am: "ስለ እኛ", or: "Waa'ee Keenya", en: "About Us" },
  subAboutUsDesc: { am: "ስለ RABBI አገልግሎት እና ታሪክ", or: "Waa'ee tajaajila RABBI fi seenaa", en: "About RABBI Ministry and history" },
  subVision: { am: "ራዕይና ተልዕኮ", or: "Mul'ata fi Ergama", en: "Vision & Mission" },
  subVisionDesc: { am: "የምንሰራው እና መዳረሻችን", or: "Waan hojjennuu fi galma keenya", en: "Our work and destination" },
  subTeam: { am: "አገልጋዮችና ቡድናችን", or: "Tajaajiltoota fi Garee Keenya", en: "Our Team & Ministers" },
  subTeamDesc: { am: "በአገልግሎቱ ያሉ መሪዎች", or: "Hoggantoota tajaajila keessa jiran", en: "Leaders in the ministry" },
  subPartnership: { am: "አጋርነትና ህብረት", or: "Michummaa fi Tokkummaa", en: "Partnership & Fellowship" },
  subPartnershipDesc: { am: "አብረው የሚያገለግሉ", or: "Waliin kan tajaajilan", en: "Serving together" },
  subContact: { am: "ያግኙን", or: "Nu Qunnamaa", en: "Contact Us" },
  subContactDesc: { am: "አድራሻና ግንኙነት", or: "Teessoo fi qunnamtii", en: "Address and inquiries" },

  // ── Auth Pages (Login / Register / Forgot Password) ─────────────────────────
  loginTitle: { am: "ወደ መለያዎ ይግቡ", or: "Gara Akkaawuntii Seenaa", en: "Sign In to Your Account" },
  loginSubtitle: { am: "የተፈቀዱ መጽሐፍትንና ይዘቶችን ለማግኘት ይግቡ", or: "Macaafota eeyyamaman argachuuf seenaa", en: "Sign in to access your permitted books and media" },
  registerTitle: { am: "አዲስ መለያ ይክፈቱ", or: "Akkaawuntii Haaraa Banaa", en: "Create an Account" },
  registerSubtitle: { am: "የRABBI ዲጂታል ቤተ-መጽሐፍት አባል ይሁኑ", or: "Miseensa Mana Macaafa Dijitaalaa RABBI ta'aa", en: "Join the RABBI Digital Library community" },
  emailLabel: { am: "ኢሜይል (Email)", or: "Imeelii (Email)", en: "Email Address" },
  passwordLabel: { am: "የይለፍ ቃል (Password)", or: "Jecha Darbii (Password)", en: "Password" },
  fullNameLabel: { am: "ሙሉ ስም", or: "Maqaa Guutuu", en: "Full Name" },
  phoneLabel: { am: "ስልክ ቁጥር", or: "Lakkoofsa Bilbilaa", en: "Phone Number" },
  signInBtn: { am: "ግባ (Sign In)", or: "Seeni (Sign In)", en: "Sign In" },
  registerBtn: { am: "ተመዝገብ (Register)", or: "Galmaa'i (Register)", en: "Create Account" },
  noAccountPrompt: { am: "መለያ የለዎትም? ተመዝገብ", or: "Akkaawuntii hin qabdan? Galmaa'aa", en: "Don't have an account? Sign Up" },
  haveAccountPrompt: { am: "መለያ አለዎት? ይግቡ", or: "Akkaawuntii qabdu? Seenaa", en: "Already have an account? Sign In" },
  forgotPasswordPrompt: { am: "የይለፍ ቃል ረሱ?", or: "Jecha darbii irraanfattanii?", en: "Forgot password?" },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footerBooksCoursesCol: { am: "መጽሐፍትና ኮርሶች", or: "Macaafota fi Leenjii", en: "Books & Courses" },
  footerSupportCol: { am: "ድጋፍና መረጃ", or: "Gargaarsa fi Odeeffannoo", en: "Support & Info" },
  footerContactCol: { am: "አድራሻችን", or: "Teessoo Keenya", en: "Contact Us" },
  footerAddisAbaba: { am: "አዲስ አበባ፣ ኢትዮጵያ", or: "Finfinnee, Itoophiyaa", en: "Addis Ababa, Ethiopia" },
  footerCopyright: { am: "© 2026 RABBI. መብቱ በሕግ የተጠበቀ ነው።", or: "© 2026 RABBI. Mirgi Qajeelfamaa Eegameera.", en: "© 2026 RABBI. All Rights Reserved." },

  // ── Reader & DRM Security ───────────────────────────────────────────────────
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

  // ── Home Panels ─────────────────────────────────────────────────────────────
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

  // ── Pillars Section ─────────────────────────────────────────────────────────
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
