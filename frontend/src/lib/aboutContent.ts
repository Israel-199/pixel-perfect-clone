import { Language } from "./language";

export interface AboutSectionData {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPillars: string[];

  subSections: {
    about: { title: string; desc: string; badge: string };
    vision: { title: string; desc: string; badge: string };
    team: { title: string; desc: string; badge: string };
    partnership: { title: string; desc: string; badge: string };
    contact: { title: string; desc: string; badge: string };
  };

  activeLabel: string;
  sectionPickerLabel: string;

  aboutPart: string;
  aboutHeaderTitle: string;
  aboutIntroTitle: string;
  aboutIntroSubtitle: string;
  aboutIntroP1: string;
  aboutIntroP2: string;
  aboutIntroP3: string;
  servicesTitle: string;
  services: { title: string; desc: string }[];
  messageTitle: string;
  messageP1: string;
  messageP2: string;
  messageP3: string;
  motto: string;
  principle: string;

  visionPart: string;
  visionHeaderTitle: string;
  visionTitle: string;
  visionHeading: string;
  visionText: string;
  missionTitle: string;
  missionIntro: string;
  missionItems: string[];
  goalsTitle: string;
  goalsIntro: string;
  goalsItems: string[];
  valuesTitle: string;
  values: { title: string; desc: string }[];

  teamPart: string;
  teamHeaderTitle: string;
  teamIntroTitle: string;
  teamIntroText: string;
  ministryGroupsTitle: string;
  ministryGroups: { role: string; desc: string; badge: string }[];
  serveCallTitle: string;
  serveCallText: string;
  contactNowBtn: string;

  partnerPart: string;
  partnerHeaderTitle: string;
  nationRoleTag: string;
  nationRoleTitle: string;
  nationRoleText: string;
  nationRoles: { label: string; text: string }[];
  nationRoleCallout: string;
  bridgeTitle: string;
  bridgeIntro: string;
  bridgePoints: string[];
  partnerInstitutionsTitle: string;
  partnerInstitutionsText: string;
  telegramPartnerBtn: string;
  fillFormBtn: string;

  contactPart: string;
  contactHeaderTitle: string;
  accessTag: string;
  accessTitle: string;
  accessText: string;
  accessPoints: string[];
  contactDirectTitle: string;
  telegramAdminTitle: string;
  telegramAdminDesc: string;
  emailTitle: string;
  emailDesc: string;
  locationTitle: string;
  locationCity: string;
  locationSubtitle: string;
  formTitle: string;
  formDesc: string;
  formSuccess: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formContactLabel: string;
  formTopicLabel: string;
  formTopicFeedback: string;
  formTopicInquiry: string;
  formTopicPartnership: string;
  formTopicPayment: string;
  formMsgLabel: string;
  formMsgPlaceholder: string;
  formSubmitBtn: string;
}

export const ABOUT_CONTENT: Record<Language, AboutSectionData> = {
  am: {
    heroBadge: "ረቢ (RABBI) • የክርስቲያን እውቀትና ሥነ-ጽሑፍ ዲጂታል መድረክ",
    heroTitle: "ስለ RABBI",
    heroSubtitle:
      "በኢትዮጵያ የወንጌል አማኞች ማኅበረሰብ ግንባታ፣ በሀገር ልማት፣ በሰላም ግንባታና በእውቀት ማዳረስ ላይ አስተዋጽኦ ለማድረግ የተቋቋመ ሁለገብ ዲጂታል መድረክ።",
    heroPillars: ["ማንበብ", "መማር", "መጻፍ", "ማገናኘት", "ማነጽ"],

    subSections: {
      about: { title: "ስለ እኛ", desc: "ስለ RABBI አገልግሎት እና ታሪክ", badge: "መድረክ እና አገልግሎቶች" },
      vision: { title: "ራዕይ እና ተልዕኮ", desc: "የምንሰራው እና መዳረሻችን", badge: "ራዕይ፣ ተልዕኮና እሴቶች" },
      team: { title: "ቡድናችን", desc: "ከእኛ ጋር ያሉ አገልጋዮች", badge: "የአገልጋዮች ማኅበረሰብ" },
      partnership: { title: "አጋርነት", desc: "አጋር ለመሆን", badge: "ሀገር ግንባታና ትብብር" },
      contact: { title: "ያግኙን", desc: "ለአስተያየትና ጥያቄ ያግኙን", badge: "ቀጥታ ግንኙነትና ድጋፍ" },
    },

    activeLabel: "ንቁ",
    sectionPickerLabel: "ክፍል ምረጥ፦",

    aboutPart: "ክፍል ፩",
    aboutHeaderTitle: "ስለ እኛ — ስለ RABBI አገልግሎት እና ታሪክ",
    aboutIntroTitle: "ረቢ (RABBI)",
    aboutIntroSubtitle: "የክርስቲያን እውቀት፣ ሥነ-ጽሑፍና ማኅበረሰብ ግንባታ ዲጂታል መድረክ",
    aboutIntroP1:
      "ረቢ መጽሐፍትን ለማንበብና ለመሸጥ ብቻ የተዘጋጀ አፕ ሳይሆን፣ በኢትዮጵያ የወንጌል አማኞች ማኅበረሰብ ግንባታ፣ በሀገር ልማት፣ በሰላም ግንባታና በእውቀት ማዳረስ ላይ አስተዋጽኦ ለማድረግ የተቋቋመ ሁለገብ ዲጂታል መድረክ ነው።",
    aboutIntroP2:
      "መድረኩ የመጽሐፍ ማንበብን፣ የመጻፍና የህትመት አገልግሎትን፣ የመጽሐፍ ቅዱስ ትምህርትን፣ የድምፅ መጽሐፍትን፣ የመስመር ላይ ኮርሶችን፣ የክርስቲያን ዜናዎችን፣ የጥናት ሀብቶችንና የማኅበረሰብ ትብብርን በአንድ ሥርዓት ያገናኛል።",
    aboutIntroP3:
      "የረቢ ዋና ዓላማ የወንጌል አማኞች መንፈሳዊ እድገት በግለሰብና በቤተሰብ ደረጃ ብቻ እንዳይቀር፣ ወደ ቤተክርስቲያን፣ ወደ ማኅበረሰብና ወደ ሀገር ግንባታ የሚዘልቅ ተግባራዊ አስተዋጽኦ እንዲያፈራ ማገዝ ነው።",
    servicesTitle: "3. የረቢ ዋና ዋና የአገልግሎት ዘርፎች",
    services: [
      {
        title: "3.1. የመንፈሳዊ መጽሐፍት ማንበቢያና መሸጫ",
        desc: "የክርስቲያን መጽሐፍትን በዲጂታል መልኩ ማንበብ፣ መፈለግ፣ መግዛትና ማሰራጨት። ደራሲያንና አሳታሚዎች ሥራቸውን ለብዙ አንባቢያን እንዲያደርሱ ማገዝ።",
      },
      {
        title: "3.2. የደራሲያን ማበልጸጊያና የህትመት ድጋፍ",
        desc: "ከሐሳብ ማመንጨት ጀምሮ እስከ የመጽሐፍ እቅድ፣ ጽሑፍ ዝግጅት፣ አርትዖት፣ የሥነ-መለኮት ግምገማ፣ ዲዛይንና ህትመት ድረስ ድጋፍ መስጠት። ሥራውን በግል ወይም በተባባሪ ቡድን ማከናወን።",
      },
      {
        title: "3.3. የመጽሐፍ ቅዱስ ትምህርትና የመስመር ላይ ኮርሶች",
        desc: "በመጽሐፍ ቅዱስ፣ በሥነ-መለኮት፣ በደቀ መዝሙርነት፣ በአገልግሎት አመራር፣ በቤተሰብ ሕይወትና በክርስቲያናዊ ሥነ-ምግባር ላይ የተዘጋጁ ኮርሶችን፣ የጥናት መመሪያዎችንና የትምህርት ቁሳቁሶችን ማቅረብ።",
      },
      {
        title: "3.4. የድምፅ መጽሐፍትና የድምፅ ትምህርቶች",
        desc: "መጽሐፍትን፣ የመጽሐፍ ቅዱስ ትምህርቶችን፣ ስብከቶችንና የጥናት ትምህርቶችን በድምፅ ማቅረብ። ማንበብ ለማይችሉ፣ ለሚቸገሩ ወይም በሥራና በጉዞ ምክንያት ለማንበብ ጊዜ ለማያገኙ ሰዎች ተደራሽነትን ማሳደግ።",
      },
      {
        title: "3.5. የሰላም፣ የእርቅና የማኅበረሰብ ግንባታ",
        desc: "በቤተክርስቲያንና በማኅበረሰብ መካከል የጋራ ሥራ እንዲጠናከር ማገዝ። በይቅርታ፣ በመግባባት፣ በእርቅ፣ በሰው ክብርና በማኅበራዊ ኃላፊነት ላይ የተመሠረቱ ትምህርቶችንና ውይይቶችን ማበረታታት።",
      },
      {
        title: "3.6. የክርስቲያን ዜናዎች፣ ጽሑፎችና ሚዲያ",
        desc: "በድረ ገጹ የክርስቲያን ዜናዎችን፣ የቤተክርስቲያን የአገልግሎት ታሪኮችን፣ የትምህርት ጽሑፎችን፣ ቃለ-መጠይቆችን፣ የምርምር ውጤቶችንና የተለያዩ የማኅበረሰብ ልምዶችን ማቅረብ። መረጃዎችን በኃላፊነት ማረጋገጥና በተገቢው ሁኔታ ማሰራጨት።",
      },
      {
        title: "3.7. ለአስቸጋሪ አካባቢዎች የትምህርት ተደራሽነት",
        desc: "በሰላም በሚኖሩ አካባቢዎችም ሆነ በግጭት፣ በመፈናቀል፣ በድርቅ ወይም በደካማ የኢንተርኔት አገልግሎት የተጎዱ አካባቢዎች ያሉ ሰዎች የመጽሐፍ ቅዱስ ትምህርቶችንና መጽሐፍትን እንዲያገኙ ማመቻቸት። ከመስመር ውጭ የሚሠሩ መጽሐፍትን፣ የሚወርዱ የድምፅ ፋይሎችንና በሞባይል የሚደረስባቸውን ትምህርቶች ማበልጸግ።",
      },
      {
        title: "3.8. ምርምር፣ ጥናትና የእውቀት ልውውጥ",
        desc: "በመጽሐፍ ቅዱስ፣ በሥነ-መለኮት፣ በቤተክርስቲያን ታሪክ፣ በሀገር ማኅበራዊ እድገትና በክርስቲያናዊ አስተዋጽኦ ላይ የሚከናወኑ ጥናቶችን ማበረታታት። የጥናት ጽሑፎችን፣ የውይይት መድረኮችንና የትምህርት ሀብቶችን ለማኅበረሰቡ ማቅረብ።",
      },
    ],
    messageTitle: "9. የረቢ መልእክት",
    messageP1:
      "ረቢ እውቀት ከመጽሐፍ ገጾች ወጥቶ ወደ ሕይወት፣ ከግለሰብ ወደ ማኅበረሰብ፣ ከቤተክርስቲያን ወደ ሀገር ግንባታ እንዲዘልቅ የሚሠራ መድረክ ነው።",
    messageP2:
      "ደራሲዎች ሐሳባቸውን ወደ መጽሐፍ እንዲቀይሩ፣ አንባቢያን በእውቀት እንዲያድጉ፣ መምህራን ትምህርታቸውን ለብዙዎች እንዲያደርሱ፣ ቤተክርስቲያንም በማኅበረሰብ ግንባታ ላይ ያላትን አስተዋጽኦ እንድታጠናክር ያግዛል።",
    messageP3:
      "የረቢ ዓላማ መጽሐፍትን ማተም ብቻ ሳይሆን፣ እውቀትን ማሳደግ፣ ሰዎችን ማገናኘት፣ የሰላም ባህልን ማበረታታትና ለሀገር የሚጠቅም ትውልድ ግንባታ ላይ መሳተፍ ነው።",
    motto: "ረቢ — ከእውቀት ወደ ሕይወት፤ ከመጽሐፍ ወደ ማኅበረሰብ፤ ከእምነት ወደ አገልግሎት።",
    principle: "መሪ መርህ፦ ማንበብ፣ መማር፣ መጻፍ፣ ማገናኘትና ማነጽ",

    visionPart: "ክፍል ፪",
    visionHeaderTitle: "ራዕይ እና ተልዕኮ — የምንሰራው እና መዳረሻችን",
    visionTitle: "1. ራዕያችን",
    visionHeading: "በመጽሐፍ ቅዱስ እውነት፣ በእውቀት፣ በጥበብና በተግባራዊ አገልግሎት የተገነባ የወንጌል አማኞች ማኅበረሰብ መገንባት!",
    visionText:
      "በመጽሐፍ ቅዱስ እውነት፣ በእውቀት፣ በጥበብና በተግባራዊ አገልግሎት የተገነባ፤ የሚያነብ፣ የሚጽፍ፣ የሚመረምር፣ ለሰላም የሚሠራና ለሀገር ዕድገት አስተዋጽኦ የሚያደርግ የወንጌል አማኞች ማኅበረሰብ መገንባት።",
    missionTitle: "2. ተልዕኳችን",
    missionIntro: "ረቢ ዲጂታል ቴክኖሎጂን፣ የመጽሐፍ ሥነ-ጽሑፍን፣ የትምህርት ሀብቶችንና የባለሙያዎችን ትብብር በመጠቀም፦",
    missionItems: [
      "በኢትዮጵያ የወንጌል አማኞች የእውቀትና የሥነ-ጽሑፍ ባህልን ማሳደግ።",
      "የመጽሐፍ ቅዱስ ትምህርቶችን ለተለያዩ ዕድሜዎች፣ ቋንቋዎችና የመማር ፍላጎቶች ተስማሚ በሆነ መልኩ ማቅረብ።",
      "በሰላም የሚኖሩ እና በግጭት፣ በመፈናቀል ወይም በሌሎች አስቸጋሪ ሁኔታዎች የሚገኙ ሰዎች የመንፈሳዊ ትምህርት ሀብቶችን እንዲያገኙ ማስቻል።",
      "በቤተክርስቲያንና በማኅበረሰብ መካከል የመግባባት፣ የአገልግሎትና የትብብር ድልድዮችን መገንባት።",
      "የደራሲያንን፣ የመምህራንን፣ የመርማሪዎችንና የአርታዒያንን አቅም ማበልጸግ።",
      "በሰላም፣ በፍትሕ፣ በኃላፊነት፣ በአገልግሎትና በሰው ክብር ላይ የተመሠረተ ማኅበረሰባዊ ተሳትፎን ማበረታታት።",
    ],
    goalsTitle: "7. የረቢ የረጅም ጊዜ ግቦች",
    goalsIntro: "ረቢ በደረጃ በደረጃ የሚያሳካቸው ዋና ግቦች፦",
    goalsItems: [
      "በኢትዮጵያ የክርስቲያን ሥነ-ጽሑፍ የዲጂታል ማንበቢያና መሸጫ መድረክ መሆን።",
      "ለአዳዲስ ደራሲያን የመጻፍ፣ የአርትዖትና የህትመት ድጋፍ መስጠት።",
      "የመጽሐፍ ቅዱስ ትምህርቶችንና ኮርሶችን በዲጂታልና በድምፅ ቅርጾች ማስፋፋት።",
      "የክርስቲያን ዜናዎችን፣ የጥናት ጽሑፎችንና የትምህርት ሀብቶችን የሚያቀርብ ድረ ገጽ መገንባት።",
      "በሰላም፣ በእርቅ፣ በማኅበረሰብ አገልግሎትና በሀገር ግንባታ ላይ የሚያተኩሩ የትምህርት ሀብቶችን ማበልጸግ።",
      "ደራሲያን፣ አንባቢያን፣ መምህራን፣ መርማሪዎችና የቤተክርስቲያን አገልጋዮች የሚተባበሩበት ማኅበረሰብ መፍጠር።",
    ],
    valuesTitle: "8. የረቢ መሠረታዊ እሴቶች",
    values: [
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
    ],

    teamPart: "ክፍል ፫",
    teamHeaderTitle: "ቡድናችን — ከእኛ ጋር ያሉ አገልጋዮች",
    teamIntroTitle: "ደራሲያን፣ አንባቢያን፣ መምህራን፣ መርማሪዎችና የቤተክርስቲያን አገልጋዮች ማኅበረሰብ",
    teamIntroText:
      "ረቢ በአንድ ግለሰብ ጥረት ብቻ ሳይሆን በኢትዮጵያ የወንጌል አማኞች አብያተ ክርስቲያናት መጋቢዎች፣ የሥነ-መለኮት ምሁራን፣ ጸሐፊያንና የቴክኖሎጂ አገልጋዮች የጋራ ራዕይና የትብብር አገልግሎት የሚመራ መድረክ ነው።",
    ministryGroupsTitle: "ከእኛ ጋር ያሉ የአገልግሎት ዘርፎችና አገልጋዮች",
    ministryGroups: [
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
    ],
    serveCallTitle: "ከእኛ ጋር አብረው ማገልገል ይፈልጋሉ?",
    serveCallText:
      "በደራሲነት፣ በትርጉም፣ በድምፅ ንባብ ወይም በቴክኖሎጂ ድጋፍ አገልግሎታችንን ለማጠናከር የእርስዎ ተሳትፎ ሁሌም በደስታ ይቀበላል።",
    contactNowBtn: "አሁን ያነጋግሩን",

    partnerPart: "ክፍል ፬",
    partnerHeaderTitle: "አጋርነት — አጋር ለመሆን እና የጋራ ሥራ",
    nationRoleTag: "4. ረቢ በሀገር ግንባታ ላይ ያለው ሚና",
    nationRoleTitle: "መንፈሳዊ እድገትን ከሀገራዊ ኃላፊነት ጋር ማገናኘት",
    nationRoleText:
      "ረቢ የወንጌል አማኞች ማኅበረሰብ መንፈሳዊ እድገትን ከሀገራዊ ኃላፊነት ጋር በማገናኘት፣ ቤተክርስቲያን በሀገር ግንባታ ላይ የምታደርገውን አስተዋጽኦ ለማጠናከር ይሠራል። ይህ አስተዋጽኦ በሚከተሉት መንገዶች ሊገለጽ ይችላል፦",
    nationRoles: [
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
    ],
    nationRoleCallout:
      "የረቢ አቀራረብ የቤተክርስቲያንን መንፈሳዊ ማንነት እየጠበቀ፣ ለጋራ የሰው ልጅ ደህንነትና ለሀገር ዕድገት በኃላፊነት የሚሳተፍ ማኅበረሰብ መገንባት ነው።",
    bridgeTitle: "5. በቤተክርስቲያንና በማኅበረሰብ መካከል ድልድይ መፍጠር",
    bridgeIntro:
      "ረቢ ቤተክርስቲያን ከማኅበረሰቡ ጋር በጋራ የሚያስቡበትን፣ የሚማሩበትንና የሚሠሩበትን መንገድ ለማስፋት ይጥራል። ይህም በሚከተሉት ይተገበራል፦",
    bridgePoints: [
      "በሰላም፣ በእርቅ፣ በይቅርታና በማኅበራዊ ኃላፊነት ላይ የተዘጋጁ መጽሐፍትንና ኮርሶችን ማቅረብ።",
      "ለተለያዩ ማኅበረሰቦች የሚጠቅሙ የጋራ ጥናትና ውይይት መድረኮችን ማበረታታት።",
      "የማኅበረሰቡን ችግሮችና ፍላጎቶች በጥናት ለመረዳትና ተገቢ የእውቀት ሀብቶችን ለማቅረብ መሥራት።",
      "በተለያዩ የእምነትና የማኅበራዊ ዳራ ያላቸው ሰዎች መካከል መከባበርንና ሰላማዊ አብሮ መኖርን የሚያጠናክሩ ትምህርቶችን ማዳረስ።",
    ],
    partnerInstitutionsTitle: "አጋር ለመሆን የሚፈልጉ ተቋማትና አገልጋዮች",
    partnerInstitutionsText:
      "አብያተ ክርስቲያናት፣ ደራሲያን፣ አሳታሚዎች፣ የሥነ-መለኮት ኮሌጆች እና የሲቪል ማኅበራት ከእኛ ጋር በትብብር ለመሥራት ዝግጁ ነን።",
    telegramPartnerBtn: "በቴሌግራም አጋር ለመሆን ያነጋግሩ (@rabbi_admin)",
    fillFormBtn: "የመልእክት ቅፅ ይሙሉ",

    contactPart: "ክፍል ፭",
    contactHeaderTitle: "ያግኙን — ለአስተያየትና ጥያቄ ያግኙን",
    accessTag: "6. ለሁሉም ተደራሽ የሆነ የትምህርት መድረክ",
    accessTitle: "የቴክኖሎጂ አጠቃቀምን የሰዎች ልዩነትና ፍላጎት በሚያከብር መልኩ ማቅረብ",
    accessText: "ረቢ የቴክኖሎጂ አጠቃቀምን የሰዎች ልዩነትና ፍላጎት በሚያከብር መልኩ ለማቅረብ ይሠራል።",
    accessPoints: [
      "በስልክ ላይ ቀላል የሆነ የንባብና የትምህርት አጠቃቀም።",
      "በኢንተርኔት ውስንነት ለሚገኙ አካባቢዎች የሚወርዱ መጽሐፍትና የድምፅ ትምህርቶች።",
      "የተለያዩ የቋንቋ ፍላጎቶችን ለማሟላት በአማርኛ፣ በአፋን ኦሮሞ፣ በእንግሊዝኛና በሌሎች ቋንቋዎች ይዘቶችን የማቅረብ ዕቅድ።",
      "የተለያዩ የመማር ፍላጎቶች ያላቸው ሰዎች እንዲጠቀሙ የጽሑፍና የድምፅ አማራጮች።",
      "ይዘቶችን በተገቢው ፈቃድ፣ በጥራትና በኃላፊነት ማቅረብ።",
    ],
    contactDirectTitle: "የቀጥታ ግንኙነት መንገዶች",
    telegramAdminTitle: "ቴሌግራም አድሚን (Telegram Admin)",
    telegramAdminDesc: "የክፍያ ደረሰኝ ለመላክ እና ፈጣን ምላሽ ለማግኘት",
    emailTitle: "ኢሜይል (Email)",
    emailDesc: "ለመደበኛ ደብዳቤዎችና ለአጋርነት ጥያቄዎች",
    locationTitle: "አድራሻ (Location)",
    locationCity: "አዲስ አበባ፣ ኢትዮጵያ",
    locationSubtitle: "RABBI Christian Digital Platform",
    formTitle: "ለአስተያየትና ጥያቄ ያግኙን",
    formDesc: "ማንኛውም ጥያቄ፣ አስተያየት ወይም ሐሳብ ካለዎት ከዚህ በታች ያለውን ቅፅ በመሙላት ይላኩልን።",
    formSuccess: "እናመሰግናለን! አስተያየትዎ በተሳካ ሁኔታ ደርሶናል። በቅርቡ ምላሽ እንሰጣለን።",
    formNameLabel: "ሙሉ ስም",
    formNamePlaceholder: "ስምዎን ያስገቡ",
    formContactLabel: "ኢሜይል ወይም ስልክ ቁጥር",
    formTopicLabel: "የመልእክት ርዕስ",
    formTopicFeedback: "አስተያየት (General Feedback)",
    formTopicInquiry: "ጥያቄ (Inquiry)",
    formTopicPartnership: "የአጋርነት ጥያቄ (Partnership)",
    formTopicPayment: "የክፍያ ወይም የመጽሐፍ ጥያቄ",
    formMsgLabel: "መልእክት / አስተያየት",
    formMsgPlaceholder: "ዝርዝር መልእክትዎን እዚህ ይጻፉ...",
    formSubmitBtn: "መልእክት ላክ (Submit Message)",
  },

  or: {
    heroBadge: "RABBI • Wiirtuu Dijitaalaa Beekumsa fi Barreeffama Kiristaanaa",
    heroTitle: "Waa'ee RABBI",
    heroSubtitle:
      "Hawaasa amantoota wangeelaa Itoophiyaa ijaaruu, guddina biyyaa, ijaarsa nagaa fi beekumsa babal'isuuf kan hundeeffame waltajjii dijitaalaa maraa.",
    heroPillars: ["Dubbisuu", "Barachuu", "Barreessuu", "Walqunnamsiisuu", "Ijaaruu"],

    subSections: {
      about: {
        title: "Waa'ee Keenya",
        desc: "Waa'ee tajaajila RABBI fi seenaa",
        badge: "Waltajjii fi Tajaajiloota",
      },
      vision: {
        title: "Mul'ata fi Ergama",
        desc: "Waan hojjennuu fi galma keenya",
        badge: "Mul'ata, Ergama fi Duudhaalee",
      },
      team: {
        title: "Garee Keenya",
        desc: "Tajaajiltoota nu waliin jiran",
        badge: "Hawaasa Tajaajiltootaa",
      },
      partnership: {
        title: "Michummaa",
        desc: "Michuu tajaajilaa ta'uuf",
        badge: "Ijaarsa Biyyaa fi Gamtaa",
      },
      contact: {
        title: "Nu Qunnamaa",
        desc: "Yaada fi gaaffiidhaaf nu qunnamaa",
        badge: "Qunnamtii Kallattii fi Deeggarsa",
      },
    },

    activeLabel: "Hojii Irra",
    sectionPickerLabel: "Kutaa Filadhaa:",

    aboutPart: "Kutaa 1",
    aboutHeaderTitle: "Waa'ee Keenya — Waa'ee Tajaajila fi Seenaa RABBI",
    aboutIntroTitle: "RABBI",
    aboutIntroSubtitle:
      "Waltajjii Dijitaalaa Beekumsa Kiristaanaa, Barreeffama fi Ijaarsa Hawaasaa",
    aboutIntroP1:
      "Rabbi macaafota dubbisuu fi gurguruu qofaaf kan qophaa'e utuu hin taane, hawaasa amantoota wangeelaa Itoophiyaa ijaaruu, guddina biyyaa, ijaarsa nagaa fi beekumsa qooduuf kan hundeeffamedha.",
    aboutIntroP2:
      "Waltajjiin kun dubbisa macaafotaa, tajaajila barreessuu fi maxxansaa, barnoota Macaafa Qulqulluu, macaafota sagalee, leenjiilee toora interneetii, oduuwwan kiristaanaa fi qorannoo sirna tokko jalatti walitti fida.",
    aboutIntroP3:
      "Kaayyoon guddaan Rabbi guddinni hafuuraa amantoota wangeelaa dhuunfaa fi maatiitti qofa akka hin hafne, gara waldaa, hawaasa fi ijaarsa biyyaatti akka babal'atu gargaaruudha.",
    servicesTitle: "3. Dameewwan Tajaajilaa Ijoo Rabbi",
    services: [
      {
        title: "3.1. Bakka Dubbisa fi Gurgurtaa Macaafota Hafuuraa",
        desc: "Macaafota kiristaanaa bifa dijitaalaatiin dubbisuu, barbaaduu, bituu fi tamsaasuudha. Barreessitoonni hojii isaanii dubbistoota hedduuf akka geessan gargaaruu.",
      },
      {
        title: "3.2. Misooma Barreessitootaa fi Deeggarsa Maxxansaa",
        desc: "Yaada maddisiisuu irraa kaasee hanga karoora macaafaa, qophii barreeffamaa, sirreessuu, gamaggama tiyooloojii, dizaayinii fi maxxansaatti deeggarsa kennuu.",
      },
      {
        title: "3.3. Barnoota Macaafa Qulqulluu fi Koorasoota Toora Interneetii",
        desc: "Macaafa Qulqulluu, tiyooloojii, barataa ta'uu, hoggansa tajaajilaa, jireenya maatii fi naamusaa irratti koorasota fi qajeelfamoota dhiyeessuu.",
      },
      {
        title: "3.4. Macaafota Sagalee fi Barnoota Sagalee",
        desc: "Macaafota, barnoota Macaafa Qulqulluu, lallaboota fi barnoota qorannoo sagaleedhaan dhiyeessuu. Namoota dubbisuuf yeroo hin qabneef teessuma bal'isuu.",
      },
      {
        title: "3.5. Nagaa, Araara fi Ijaarsa Hawaasaa",
        desc: "Waldaa fi hawaasa gidduutti hojii waliinii cimsuu. Dhiifama, hubannoo, araara, kabaja namaa fi itti gaafatamummaa irratti marii jajjabeessuu.",
      },
      {
        title: "3.6. Oduu Kiristaanaa, Barreeffamoota fi Miidiyaa",
        desc: "Oduuwwan kiristaanaa, seenaa tajaajila waldaa, barreeffamoota barnootaa, gaaffi-deebii fi muuxannoowwan hawaasaa dhiyeessuu.",
      },
      {
        title: "3.7. Bakkeewwan Rakkoo Qabaniif Barnoota Dhiyeessuu",
        desc: "Bakkeewwan nagaa qabanis ta'ee bakkeewwan waldhabdee, buqqa'iinsaa fi rakkoo interneetiitiin miidhamanitti barnoota Macaafa Qulqulluu qaqqabsiisuu.",
      },
      {
        title: "3.8. Qorannoo, Qo'annoo fi Jijjiirraa Beekumsaa",
        desc: "Macaafa Qulqulluu, tiyooloojii, seenaa waldaa fi guddina hawaasummaa irratti qorannoowwan gaggeeffaman jajjabeessuu.",
      },
    ],
    messageTitle: "9. Ergaa Rabbi",
    messageP1:
      "Rabbi beekumsi fuula macaafaa irraa gara jireenyaatti, dhuunfaa irraa gara hawaasaatti, waldaa irraa gara ijaarsa biyyaatti akka darbuuf hojjeta.",
    messageP2:
      "Barreessitoonni yaada isaanii gara macaafaatti akka jijjiiran, dubbistoonni beekumsan akka guddatan, barsiisonni barnoota isaanii bal'inaan akka geessan gargaara.",
    messageP3:
      "Kaayyoon Rabbi macaafa maxxansuu qofa utuu hin taane, beekumsa guddisuu, namoota walitti fiduu, aadaa nagaa jajjabeessuu fi dhaloota biyyaaf ta'u ijaaruudha.",
    motto:
      "Rabbi — Beekumsa irraa gara jireenyaatti; Macaafa irraa gara hawaasaatti; Amantii irraa gara tajaajilaatti.",
    principle: "Qajeelfama Ijoo: Dubbisuu, Barachuu, Barreessuu, Walqunnamsiisuu fi Ijaaruu",

    visionPart: "Kutaa 2",
    visionHeaderTitle: "Mul'ata fi Ergama — Waan Hojjennuu fi Galma Keenya",
    visionTitle: "1. Mul'ata Keenya",
    visionHeading:
      "Dhugaa Macaafa Qulqulluu, beekumsa, ogummaa fi tajaajila qabatamaadhaan hawaasa amantoota wangeelaa ijaaruu!",
    visionText:
      "Dhugaa Macaafa Qulqulluu, beekumsa, ogummaa fi tajaajila qabatamaadhaan hawaasa dubbisu, barreessu, qoratu, nagaaf hojjetu fi guddina biyyaaf gumaachu ijaaruudha.",
    missionTitle: "2. Ergama Keenya",
    missionIntro:
      "Rabbi teeknooloojii dijitaalaa, aadaa barreeffamaa, qabeenya barnootaa fi gamtaa ogeessotaatti fayyadamuun:",
    missionItems: [
      "Amantoota wangeelaa Itoophiyaa keessatti aadaa beekumsaa fi barreeffamaa guddisuu.",
      "Barnoota Macaafa Qulqulluu umrii, afaan fi fedhii barachuu garaagaraaf mijatuun dhiyeessuu.",
      "Namoonni bakka nagaa jiranis ta'ee bakka rakkoo jiran qabeenya hafuuraa akka argatan dandeessisuu.",
      "Waldaa fi hawaasa gidduutti riqicha hubannoo, tajaajilaa fi gamtaa ijaaruu.",
      "Dandeettii barreessitootaa, barsiisotaa, qorattootaa fi gulaaltotaa gabbisuu.",
      "Nagaa, haqa, itti gaafatamummaa fi kabaja namaa irratti hirmaannaa hawaasummaa jajjabeessuu.",
    ],
    goalsTitle: "7. Galmaalee Yeroo Dheeraa Rabbi",
    goalsIntro: "Galmaalee gurguddoo Rabbi sadarkaadhaan milkeessuuf karoorfate:",
    goalsItems: [
      "Itoophiyaa keessatti waltajjii dubbisaa fi gurgurtaa barreeffama kiristaanaa dijitaalaa ta'uu.",
      "Barreessitoota haaraaf deeggarsa barreessuu, gulaaluu fi maxxansaa kennuu.",
      "Barnoota Macaafa Qulqulluu fi koorasoota bifa dijitaalaa fi sagaleetiin babal'isuu.",
      "Oduu kiristaanaa, barreeffamoota qorannoo fi qabeenya barnootaa dhiyeessu toora interneetii ijaaruu.",
      "Nagaa, araara, tajaajila hawaasaa fi ijaarsa biyyaa irratti qabeenya barnootaa gabbisuu.",
      "Hawaasa barreessitoonni, dubbistoonni, barsiisonni fi tajaajiltoonni waloon hojjetan uumuu.",
    ],
    valuesTitle: "8. Duudhaalee Bu'uuraa Rabbi",
    values: [
      {
        title: "Dhugaa fi Qulqullina",
        desc: "Dhugaa Macaafa Qulqulluu, qorannoo amanamaa fi hojii barreeffama qulqullina qabu irratti hundaa'uu.",
      },
      {
        title: "Gamtaa fi Tajaajila",
        desc: "Hojiiwwan dhuunfaa fi garee walitti fiduun kaayyoo waliiniif hojjechuu.",
      },
      {
        title: "Nagaa fi Kabaja Namaa",
        desc: "Waliigaltee, gara-laafina, araara fi waliin jireenya nagaa jajjabeessuu.",
      },
      {
        title: "Qaqqabamummaa fi Kalaqa",
        desc: "Teeknooloojiitti fayyadamuun beekumsa fi barnoota namoota baay'eef geessuu.",
      },
      {
        title: "Dhiibbaa Itti Fufiinsa Qabu",
        desc: "Macaafonni, leenjiileen fi qorannoowwan har'a qophaa'an dhaloota boruutiif kan darban akka ta'an hojjechuu.",
      },
    ],

    teamPart: "Kutaa 3",
    teamHeaderTitle: "Garee Keenya — Tajaajiltoota Nu Waliin Jiran",
    teamIntroTitle: "Hawaasa Barreessitootaa, Dubbistootaa, Barsiisotaa fi Tajaajiltoota Waldaa",
    teamIntroText:
      "Rabbi carraaqqii nama dhuunfaa qofaan utuu hin taane, lubaawwan waldoota wangeelaa Itoophiyaa, hayyoota tiyooloojii, barreessitootaa fi ogeessota teeknooloojiitiin kan hogganamudha.",
    ministryGroupsTitle: "Dameewwan Tajaajilaa fi Tajaajiltoota Nu Waliin Jiran",
    ministryGroups: [
      {
        role: "Boordii Gorsitoota Tiyooloojii fi Lubaawwanii",
        desc: "Barnoota, macaafota fi koorasoota waltajjicha irratti dhiyaatan dhugaa Macaafa Qulqulluu fi barsiisa sirrii waliin qoratan.",
        badge: "Hoggansa Hafuuraa fi Hordoffii",
      },
      {
        role: "Garee Barreessitootaa, Barsiisotaa fi Gulaaltotaa",
        desc: "Macaafota, qo'annoo Macaafa Qulqulluu, qajeelfamoota nagaa qulqullina olaanaadhaan qopheessan.",
        badge: "Barreeffama fi Qorannoo",
      },
      {
        role: "Garee Teeknooloojii Dijitaalaa fi Miidiyaa",
        desc: "Waltajjii dubbisa dijitaalaa eegame, koorasoota toora interneetii fi miidiyaa kan misoomsan.",
        badge: "Kalaqa fi Teeknooloojii",
      },
      {
        role: "Tajaajila Afaanii fi Hiikkaa (Translation & Reach)",
        desc: "Qabiyyeewwan Afaan Amaaraa, Afaan Oromoo fi Ingiliffaan akka qaqqaban kan hojjetan.",
        badge: "Qaqqabamummaa Bal'aa",
      },
    ],
    serveCallTitle: "Nu Waliin Tajaajiluu Barbaadduu?",
    serveCallText:
      "Barreessummaan, hiikkaan, dubbisa sagaleen ykn deeggarsa teeknooloojiitiin hirmaannaan keessan simatamaadha.",
    contactNowBtn: "Amma Nu Qunnamaa",

    partnerPart: "Kutaa 4",
    partnerHeaderTitle: "Michummaa — Michuu Ta'uu fi Hojii Waliinii",
    nationRoleTag: "4. Gahee Rabbi Ijaarsa Biyyaa Keessatti",
    nationRoleTitle: "Guddina Hafuuraa Itti Gaafatamummaa Biyyaalessaa Waliin Walitti Fiduu",
    nationRoleText:
      "Rabbi guddina hafuuraa amantootaa itti gaafatamummaa biyyaalessaa waliin walitti qabsiisuun, waldaan ijaarsa biyyaa keessatti gumaacha ishee akka cimsituuf hojjeta:",
    nationRoles: [
      {
        label: "Ijaarsa Beekumsaatiin",
        text: "Aadaa dubbisuu, yaaduu, barreessuu fi qorannoo guddisuu.",
      },
      {
        label: "Naamusaa fi Itti Gaafatamummaadhaan",
        text: "Amanamtummaa, haqa, gara-laafina fi tajaajila uummataa jajjabeessuu.",
      },
      {
        label: "Nagaa fi Araaraan",
        text: "Garaagarummaa marii, hubannoo fi itti gaafatamummaa waliiniitiin hiikuu.",
      },
      {
        label: "Gamtaadhaan",
        text: "Waldoota, manneen barnootaa fi dhaabbilee hawaasaa walitti fiduu.",
      },
      {
        label: "Kabaja Namaa fi Deeggarsa Hawaasummaan",
        text: "Namoota rakkoo fi buqqa'iinsa keessa jiraniif barnoota fi jajjabina dhiyeessuu.",
      },
    ],
    nationRoleCallout:
      "Ilaalchi Rabbi eenyummaa hafuuraa waldaa eegaa, nageenya ilma namaa fi guddina biyyaatiif hawaasa itti gaafatamummaadhaan hirmaatu ijaaruudha.",
    bridgeTitle: "5. Riqicha Waldaa fi Hawaasa Gidduu Uumuu",
    bridgeIntro:
      "Rabbi waldaan hawaasa waliin kan itti yaadan, baratan fi hojjetan babal'isuuf carraaqaa:",
    bridgePoints: [
      "Nagaa, araara, dhiifama fi itti gaafatamummaa hawaasummaa irratti macaafota fi koorasoota dhiyeessuu.",
      "Hawaasa adda addaatiif waltajjii marii fi qorannoo waliinii jajjabeessuu.",
      "Rakkoo fi fedhii hawaasaa qorannoodhaan hubachuun qabeenya beekumsaa dhiyeessuu.",
      "Namoota amantii fi duudhaa garaagaraa qaban gidduutti kabaja fi waliin jireenya nagaa cimsuu.",
    ],
    partnerInstitutionsTitle: "Dhaabbilee fi Tajaajiltoota Michuu Ta'uu Barbaadan",
    partnerInstitutionsText:
      "Waldootni, barreessitoonni, maxxansitoonni, koolleejjiin tiyooloojii fi waldaaleen sivikii nu waliin hojjechuuf qophiidha.",
    telegramPartnerBtn: "Telegram irratti Michuu Ta'uuf (@rabbi_admin)",
    fillFormBtn: "Unka Ergaa Guutaa",

    contactPart: "Kutaa 5",
    contactHeaderTitle: "Nu Qunnamaa — Yaada fi Gaaffiidhaaf",
    accessTag: "6. Waltajjii Barnootaa Hundaaf Qaqqabu",
    accessTitle: "Fayyadama Teeknooloojii Fedhii fi Garaagarummaa Namaa Kabajuun Dhiyeessuu",
    accessText:
      "Rabbi teeknooloojiitti fayyadamuun fedhii fi garaagarummaa namaa kabajuun hojjeta.",
    accessPoints: [
      "Bilbila irratti dubbisaa fi barnoota salphaatti dhiyaatu.",
      "Bakkeewwan interneetiin daangeffametti macaafota buufatamanii fi sagaleewwan.",
      "Fedhii afaanii guutuuf qabiyyeewwan Afaan Amaaraa, Oromoo fi Ingiliffaan qopheessuu.",
      "Fedhii barachuu garaagaraatiif filannoowwan barreeffamaa fi sagalee.",
      "Qabiyyeewwan eeyyama sirriidhaan, qulqullinaa fi itti gaafatamummaadhaan dhiyeessuu.",
    ],
    contactDirectTitle: "Mootummoota Qunnamtii Kallattii",
    telegramAdminTitle: "Admin Telegram (Telegram Admin)",
    telegramAdminDesc: "Nagahee kaffaltii erguu fi deebii saffisaa argachuuf",
    emailTitle: "Imeelii (Email)",
    emailDesc: "Xalayaawwan idilee fi gaaffii michummaatiif",
    locationTitle: "Teessoo (Location)",
    locationCity: "Finfinnee, Itoophiyaa",
    locationSubtitle: "RABBI Christian Digital Platform",
    formTitle: "Yaada fi Gaaffiidhaaf Nu Qunnamaa",
    formDesc:
      "Gaaffii, yaada ykn yaada kamiyyuu yoo qabaattan unka armaan gadii guutuun nuuf ergaa.",
    formSuccess: "Galatoomaa! Yaanni keessan milkaa'inaan nu ga'eera. Dhiyootti deebii kennina.",
    formNameLabel: "Maqaa Guutuu",
    formNamePlaceholder: "Maqaa keessan galchaa",
    formContactLabel: "Imeelii ykn Lakkoofsa Bilbilaa",
    formTopicLabel: "Mata Duree Ergaa",
    formTopicFeedback: "Yaada Waliigalaa (General Feedback)",
    formTopicInquiry: "Gaaffii (Inquiry)",
    formTopicPartnership: "Gaaffii Michummaa (Partnership)",
    formTopicPayment: "Kaffaltii ykn Gaaffii Macaafaa",
    formMsgLabel: "Ergaa / Yaada",
    formMsgPlaceholder: "Ergaa keessan asitti barreessaa...",
    formSubmitBtn: "Ergaa Ergi (Submit Message)",
  },

  en: {
    heroBadge: "RABBI • Christian Knowledge & Literature Digital Platform",
    heroTitle: "About RABBI",
    heroSubtitle:
      "A comprehensive digital platform established to contribute to the Evangelical community building, national development, peace-building, and knowledge dissemination in Ethiopia.",
    heroPillars: ["Read", "Learn", "Write", "Connect", "Edify"],

    subSections: {
      about: {
        title: "About Us",
        desc: "About RABBI ministry and history",
        badge: "Platform & Ministries",
      },
      vision: {
        title: "Vision & Mission",
        desc: "Our work and destination",
        badge: "Vision, Mission & Values",
      },
      team: {
        title: "Our Team",
        desc: "Ministers serving with us",
        badge: "Community of Servants",
      },
      partnership: {
        title: "Partnership",
        desc: "Partner with us",
        badge: "Nation Building & Unity",
      },
      contact: {
        title: "Contact Us",
        desc: "Inquiries and feedback",
        badge: "Direct Communication & Support",
      },
    },

    activeLabel: "Active",
    sectionPickerLabel: "Select Section:",

    aboutPart: "Section I",
    aboutHeaderTitle: "About Us — About RABBI Ministry and History",
    aboutIntroTitle: "RABBI",
    aboutIntroSubtitle: "Digital Platform for Christian Knowledge, Literature & Community Building",
    aboutIntroP1:
      "RABBI is not merely an app for reading and buying books; it is a holistic digital platform established to contribute to the growth of the Ethiopian evangelical Christian community, national development, peacebuilding, and the spread of biblical knowledge.",
    aboutIntroP2:
      "The platform integrates reading, authoring and publishing services, biblical instruction, audiobooks, online courses, Christian news, research resources, and fellowship in a single unified ecosystem.",
    aboutIntroP3:
      "The primary mission of RABBI is to ensure that spiritual growth is not confined to individuals or homes, but blossoms into practical transformation for local churches, communities, and nation building.",
    servicesTitle: "3. Primary Service Divisions of RABBI",
    services: [
      {
        title: "3.1. Spiritual Books Reading & Bookstore",
        desc: "Read, search, purchase, and distribute Christian books digitally, enabling authors and publishers to reach a wider audience across Ethiopia and globally.",
      },
      {
        title: "3.2. Authorship Enrichment & Publishing Support",
        desc: "Providing end-to-end guidance from initial concept development, book outlining, manuscript drafting, and editing to theological review, layout design, and publishing.",
      },
      {
        title: "3.3. Bible Teaching & Online Courses",
        desc: "Curating courses, study manuals, and educational materials covering biblical studies, systematic theology, discipleship, ministry leadership, and family life.",
      },
      {
        title: "3.4. Audiobooks & Audio Teachings",
        desc: "Producing books, Bible lessons, sermons, and lectures in high-quality audio formats to ensure maximum accessibility for commuters, the visually impaired, and busy believers.",
      },
      {
        title: "3.5. Peace, Reconciliation & Community Building",
        desc: "Strengthening the collaborative role between the church and society through teachings on forgiveness, mutual understanding, human dignity, and civic responsibility.",
      },
      {
        title: "3.6. Christian News, Articles & Media",
        desc: "Publishing verified Christian news, ministry chronicles, educational articles, interviews, research papers, and testimonies with journalistic responsibility.",
      },
      {
        title: "3.7. Educational Reach for Challenging Contexts",
        desc: "Ensuring believers in conflict-affected zones, displaced populations, drought-impacted regions, or areas with poor internet connectivity can access offline-capable books and downloadable audio resources.",
      },
      {
        title: "3.8. Research, Scholarship & Knowledge Exchange",
        desc: "Promoting scholarly research in biblical studies, theology, church history, and socio-economic contributions of the Christian faith in Ethiopia.",
      },
    ],
    messageTitle: "9. The RABBI Message",
    messageP1:
      "RABBI works to translate knowledge from printed pages into living reality, from the individual to the community, and from the sanctuary into national transformation.",
    messageP2:
      "We help authors turn ideas into published books, readers grow in biblical wisdom, teachers share insights with thousands, and churches deepen their civic and spiritual impact.",
    messageP3:
      "Our aim is not merely publishing books, but fostering lifelong learning, connecting faithful servants, championing a culture of peace, and raising a generation that blesses the nation.",
    motto: "RABBI — From Knowledge to Life; From Books to Community; From Faith to Action.",
    principle: "Guiding Principles: Read, Learn, Write, Connect, and Edify",

    visionPart: "Section II",
    visionHeaderTitle: "Vision & Mission — What We Do and Where We Are Going",
    visionTitle: "1. Our Vision",
    visionHeading:
      "Building a vibrant evangelical community grounded in biblical truth, knowledge, wisdom, and practical service!",
    visionText:
      "To see a thriving evangelical community grounded in biblical truth, knowledge, wisdom, and practical service that reads, writes, investigates, works for peace, and contributes meaningfully to national growth.",
    missionTitle: "2. Our Mission",
    missionIntro:
      "Utilizing digital technology, literature, educational resources, and ministerial collaboration to:",
    missionItems: [
      "Cultivate a rich reading and literary culture among Ethiopian evangelical Christians.",
      "Deliver Bible teachings adapted for diverse age groups, languages, and learning preferences.",
      "Empower believers in peaceful areas as well as those facing displacement, conflict, or hardship with spiritual resources.",
      "Build bridges of mutual understanding, service, and cooperation between the church and society.",
      "Equip and uplift authors, theological teachers, researchers, and editors.",
      "Inspire active community participation founded on peace, justice, stewardship, and human dignity.",
    ],
    goalsTitle: "7. Long-Term Objectives of RABBI",
    goalsIntro: "Strategic goals being realized progressively by RABBI:",
    goalsItems: [
      "Establishing the premier digital library and bookstore for Ethiopian Christian literature.",
      "Offering comprehensive writing, editing, and publishing incubation for emerging authors.",
      "Expanding theological instruction and courses across modern digital and audio formats.",
      "Operating an informative portal providing Christian news, research papers, and educational media.",
      "Developing educational manuals focused on peace, reconciliation, community service, and nation-building.",
      "Nurturing a supportive community of authors, readers, educators, researchers, and church leaders.",
    ],
    valuesTitle: "8. Core Values of RABBI",
    values: [
      {
        title: "Truth & Quality",
        desc: "Anchored in biblical veracity, rigorous research, and excellence in Christian literature.",
      },
      {
        title: "Collaboration & Service",
        desc: "Uniting individual and collective endeavors toward shared kingdom and societal objectives.",
      },
      {
        title: "Peace & Human Dignity",
        desc: "Promoting mutual respect, compassion, reconciliation, and harmonious coexistence.",
      },
      {
        title: "Accessibility & Innovation",
        desc: "Harnessing technology to make transformative knowledge universally accessible.",
      },
      {
        title: "Lasting Impact",
        desc: "Ensuring current books, curricula, and studies bless and guide future generations.",
      },
    ],

    teamPart: "Section III",
    teamHeaderTitle: "Our Team — Servants Partnering With Us",
    teamIntroTitle: "A Community of Authors, Readers, Teachers, Scholars & Church Ministers",
    teamIntroText:
      "RABBI is not guided by solitary effort, but by a collaborative fellowship of evangelical pastors, theologians, literary writers, and digital technologists across Ethiopia.",
    ministryGroupsTitle: "Service Divisions & Collaborative Teams",
    ministryGroups: [
      {
        role: "Pastoral & Theological Advisory Board",
        desc: "Pastors and theological educators who review curricula, publications, and courses in fidelity to biblical sound doctrine.",
        badge: "Spiritual Oversight & Guidance",
      },
      {
        role: "Authors, Educators & Editorial Team",
        desc: "Dedicated writers and editors who formulate high-caliber books, Bible study guides, and reconciliation manuals.",
        badge: "Literature & Scholarship",
      },
      {
        role: "Digital Technology & Media Team",
        desc: "Engineers and creative professionals maintaining the secure digital reader, streaming platform, and robust DRM infrastructure.",
        badge: "Innovation & Technology",
      },
      {
        role: "Language & Translation Ministry (Translation & Reach)",
        desc: "Linguists and translators delivering spiritual works in Amharic, Afaan Oromoo, English, and regional languages.",
        badge: "Multilingual Reach",
      },
    ],
    serveCallTitle: "Would You Like to Serve With Us?",
    serveCallText:
      "Whether through writing, translation, voice recording, or technical contributions, your partnership in this ministry is always welcomed with joy.",
    contactNowBtn: "Contact Us Now",

    partnerPart: "Section IV",
    partnerHeaderTitle: "Partnership — Partnering for Kingdom Impact",
    nationRoleTag: "4. RABBI's Role in Nation Building",
    nationRoleTitle: "Connecting Spiritual Growth with National Responsibility",
    nationRoleText:
      "RABBI strengthens the church's constructive impact on nation building by linking spiritual maturity to civic responsibility through several key avenues:",
    nationRoles: [
      {
        label: "Knowledge Cultivation",
        text: "Advancing a culture of rigorous reading, thoughtful inquiry, and Christian authorship.",
      },
      {
        label: "Ethics & Integrity",
        text: "Providing teachings that champion integrity, justice, compassion, work ethic, and public service.",
      },
      {
        label: "Peace & Reconciliation",
        text: "Developing resources to resolve tensions through constructive dialogue, empathy, and collective responsibility.",
      },
      {
        label: "Institutional Cooperation",
        text: "Fostering synergy among churches, theological colleges, civil society organizations, and academic centers.",
      },
      {
        label: "Human Dignity & Compassion",
        text: "Extending accessible education and spiritual comfort to displaced, vulnerable, and underserved communities.",
      },
    ],
    nationRoleCallout:
      "RABBI's approach preserves the spiritual identity of the church while empowering believers to participate responsibly in the welfare and development of society.",
    bridgeTitle: "5. Building Bridges Between Church & Society",
    bridgeIntro:
      "RABBI broadens how the church and society reflect, learn, and collaborate through:",
    bridgePoints: [
      "Providing courses and publications on peace, reconciliation, forgiveness, and social responsibility.",
      "Facilitating public study and discussion forums for diverse communities.",
      "Researching societal needs to formulate constructive biblical resources.",
      "Fostering mutual respect and peaceful coexistence across varied faith and cultural backgrounds.",
    ],
    partnerInstitutionsTitle: "Institutions & Ministries Seeking Partnership",
    partnerInstitutionsText:
      "We welcome partnerships with local churches, denominations, publishers, Bible colleges, and civil society organizations.",
    telegramPartnerBtn: "Connect on Telegram for Partnership (@rabbi_admin)",
    fillFormBtn: "Complete Message Form",

    contactPart: "Section V",
    contactHeaderTitle: "Contact Us — For Inquiries and Feedback",
    accessTag: "6. An Universally Accessible Educational Platform",
    accessTitle: "Deploying Technology with Respect for Human Diversity and Needs",
    accessText:
      "RABBI designs digital solutions tailored to varied user circumstances and regional realities:",
    accessPoints: [
      "Streamlined mobile reading and study experience.",
      "Downloadable books and audio lessons for low-bandwidth environments.",
      "Multilingual publications in Amharic, Afaan Oromoo, English, and regional languages.",
      "Dual text and audio options catering to diverse learning preferences.",
      "High standard of intellectual property protection and verified copyright authorization.",
    ],
    contactDirectTitle: "Direct Channels of Communication",
    telegramAdminTitle: "Telegram Admin",
    telegramAdminDesc: "For sending payment receipts and prompt assistance",
    emailTitle: "Official Email",
    emailDesc: "For formal correspondence and partnership inquiries",
    locationTitle: "Location",
    locationCity: "Addis Ababa, Ethiopia",
    locationSubtitle: "RABBI Christian Digital Platform",
    formTitle: "Send Inquiries & Feedback",
    formDesc:
      "If you have questions, feedback, or collaboration proposals, please submit the form below.",
    formSuccess: "Thank you! Your message has been submitted successfully. We will reply shortly.",
    formNameLabel: "Full Name",
    formNamePlaceholder: "Enter your name",
    formContactLabel: "Email or Phone Number",
    formTopicLabel: "Subject",
    formTopicFeedback: "General Feedback",
    formTopicInquiry: "General Inquiry",
    formTopicPartnership: "Partnership Proposal",
    formTopicPayment: "Payment or Book Access Inquiry",
    formMsgLabel: "Message / Feedback",
    formMsgPlaceholder: "Write your message here...",
    formSubmitBtn: "Submit Message",
  },
};
