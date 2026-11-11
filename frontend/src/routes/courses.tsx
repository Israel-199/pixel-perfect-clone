import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap,
  FileText,
  BookOpen,
  Lock,
  CheckCircle2,
  Send,
  CreditCard,
  X,
  Search,
  Globe2,
  Download,
  FileCheck,
  Sparkles,
  School,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { fetchApi } from "@/lib/api";
import { PlatformReader } from "@/components/rabbi/PlatformReader";
import { BookItem } from "@/components/rabbi/BookModal";

export const Route = createFileRoute("/courses")({
  component: CoursesRoute,
});

type CourseCategory = "dorcas" | "trainings";
type LanguageOption = "all" | "amharic" | "oromo" | "english";

interface CourseItem {
  id: string;
  category: CourseCategory;
  language: "amharic" | "oromo" | "english";
  languageLabel: string;
  title: string;
  subtitle?: string;
  provider: string;
  description: string;
  price: number;
  coverUrl: string;
  isPdf?: boolean;
  fileSize?: string;
  pageCount?: string;
  modules?: string;
  sampleContent: string;
  fullContent?: string;
  requestStatus?: string;
  isPermitted?: boolean;
}

const COURSES_DATA: CourseItem[] = [
  // ================= ዶርቃ ኮሌጅ (Dorcas College) Courses =================
  {
    id: "dorcas-theology-101",
    category: "dorcas",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "መሠረታዊ የሥነ-መለኮት ጥናት (Systematic Theology 101)",
    subtitle: "ዶርቃ ኮሌጅ ዲፕሎማ ኮርስ",
    provider: "ዶርቃ ኮሌጅ (Dorcas College)",
    description:
      "በዶርቃ ኮሌጅ የስርዓተ-ትምህርት የተዘጋጀ፤ ስለ እግዚአብሔር ባሕርይ፣ ስለ ድነት እና ስለ መንፈስ ቅዱስ አሠራር የሚተነትን መሠረታዊ የኮርስ መጽሐፍ።",
    price: 350,
    coverUrl:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop",
    modules: "12 ሞጁሎች • 180 ገጾች",
    sampleContent: `ዶርቃ ኮሌጅ — ሥርዓተ ትምህርት
ክፍል ፩፡ የእግዚአብሔር ህልውናና ባሕርያት

ምዕራፍ 1: መግቢያ
የሥነ-መለኮት ጥናት ማለት ስለ እግዚአብሔር፣ ስለ ፈቃዱና ስለ አሠራሩ ከመጽሐፍ ቅዱስ እውነት ጋር ተስማምቶ ማጥናት ነው። 

1.1. ልዩ እና አጠቃላይ መገለጥ
እግዚአብሔር ራሱን በፍጥረት፣ በሰው ሕሊና እና በልዩ ሁኔታ በቃሉና በክርስቶስ ገልጧል። 
(ሮሜ 1:19-20፣ ዕብራውያን 1:1-2)

1.2. የእግዚአብሔር ባህሪያት
• ዘላለማዊነት (ዘፍጥረት 21:33)
• ሁሉን ቻይነት (ኤርምያስ 32:17)
• ቅድስናና ፍቅር (1 ዮሐንስ 4:8)

--- [የነፃ ናሙና ማጠቃለያ - ሙሉውን ኮርስ ለመውሰድ ከታች ያለውን ክፍያ ይፈጽሙ] ---`,
    fullContent: `ዶርቃ ኮሌጅ — ሥርዓተ ትምህርት
መሠረታዊ የሥነ-መለኮት ጥናት (ሙሉ ትምህርት)

ምዕራፍ 2: የሰው ልጅ አፈጣጠርና ውድቀት
ሰው በእግዚአብሔር አምሳል የተፈጠረ ክቡር ፍጥረት ነው። ውድቀቱ ያስከተለው መንፈሳዊ ሞትና የመዳን አስፈላጊነት።

ምዕራፍ 3: የድነት ምስጢር (Soteriology)
በጸጋ በእምነት መዳን፣ ጽድቅ፣ ቅድስናና የዘላለም ሕይወት ዋስትና በኢየሱስ ክርስቶስ መስዋዕትነት።

ምዕራፍ 4: የመንፈስ ቅዱስ ስጦታዎችና አገልግሎት
የመንፈስ ቅዱስ ማደሪያነት፣ ፍሬዎች፣ እና በቤተክርስቲያን ግንባታ ላይ ያለው ሚና።`,
  },
  {
    id: "dorcas-hermeneutics-201",
    category: "dorcas",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የመጽሐፍ ቅዱስ አፈታትና ስብከት ዝግጅት (Hermeneutics)",
    subtitle: "ዶርቃ ኮሌጅ የአገልግሎት ዝግጅት",
    provider: "ዶርቃ ኮሌጅ (Dorcas College)",
    description:
      "የእግዚአብሔርን ቃል በትክክል የመተርጎምና ለጉባኤ የማድረስ ጥበብ። ለአገልጋዮችና ለመጋቢዎች የተዘጋጀ የኮሌጅ መማሪያ።",
    price: 400,
    coverUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
    modules: "10 ሞጁሎች • 150 ገጾች",
    sampleContent: `ዶርቃ ኮሌጅ — የመጽሐፍ ቅዱስ አፈታት ዘዴ (Hermeneutics)

ምዕራፍ 1: የትርጓሜ ወርቃማ ሕጎች
1. ቃሉን ከታሪካዊና ባህላዊ አውዱ መረዳት
2. የጽሑፉን አጠቃላይ መልእክት ማወቅ
3. ጥቅስን ከጥቅስ ጋር ማመሳከር

"የእውነትን ቃል በቅንነት የሚናገር የማያፍርም ሠራተኛ ሆነህ፥ የተፈተነውን ራስህን ለእግዚአብሔር ልታቀርብ ትጋ።" (2 ጢሞቴዎስ 2:15)

--- [የነፃ ናሙና ማጠቃለያ] ---`,
  },
  {
    id: "dorcas-leadership-301",
    category: "dorcas",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የክርስቲያን አመራርና የቤተክርስቲያን አስተዳደር",
    subtitle: "ዶርቃ ኮሌጅ አመራር ማዕከል",
    provider: "ዶርቃ ኮሌጅ (Dorcas College)",
    description:
      "በአዲስ ኪዳን መርሆዎች ላይ የተመሠረተ የአገልግሎት አመራር፣ የቡድን ግንባታና የታማኝነት አገልግሎት መመሪያ።",
    price: 300,
    coverUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop",
    modules: "8 ሞጁሎች • 130 ገጾች",
    sampleContent: `ዶርቃ ኮሌጅ — የክርስቲያን አመራር መርሆዎች
ምዕራፍ 1: አገልጋይ መሪነት (Servant Leadership)

ክርስቶሳዊ አመራር በሥልጣን ላይ ሳይሆን በትህትናና በሌሎች ጥቅም ላይ የተመሠረተ ነው። 
"ከእናንተ ማንም ታላቅ ሊሆን የሚወድድ የእናንተ አገልጋይ ይሁን..." (ማቴዎስ 20:26)

--- [የነፃ ናሙና ማጠቃለያ] ---`,
  },
  {
    id: "dorcas-oromo-basics",
    category: "dorcas",
    language: "oromo",
    languageLabel: "Afaan Oromoo",
    title: "Miseensa Waldaa fi Qajeelfama Barumsa Macaafa Qulqulluu",
    subtitle: "Koolleejjii Dorqaa - Qajeelfama Barnootaa",
    provider: "Koolleejjii Dorqaa (Dorcas College)",
    description:
      "Barnoota bu'uura Macaafa Qulqulluu fi amantii Kiristaanummaa gadi fageenyaan hubachuuf qophaa'e.",
    price: 350,
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
    modules: "Boqonnaa 12 • Fuula 165",
    sampleContent: `Koolleejjii Dorqaa — Barumsa Macaafa Qulqulluu

Boqonnaa 1: Bu'uura Amantii Kiristaanummaa
Wangeela Kiristoos keessatti beekumsi fi hubannoon dubbii Waaqayyoo jireenya amantootaa ijaara.
(Rom. 10:17 - Amantiin dhaga'uu irraa ti...)

--- [Sample Preview End] ---`,
  },
  {
    id: "dorcas-oromo-romans",
    category: "dorcas",
    language: "oromo",
    languageLabel: "Afaan Oromoo",
    title: "Wangeela Warra Roomaa fi Fayyina Kiristoos",
    subtitle: "Koolleejjii Dorqaa - Qorannoo Ergaa",
    provider: "Koolleejjii Dorqaa (Dorcas College)",
    description:
      "Wangeela Roomaa irratti barumsa bal'aa fi dhiifama cubbuu, qulqullummaa fi jireenya haaraa ibsu.",
    price: 300,
    coverUrl:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop",
    modules: "Boqonnaa 8 • Fuula 140",
    sampleContent: `Koolleejjii Dorqaa — Ergaa Roomaa

Boqonnaa 1: Fayyina Tola Kennamu
Namni hundinuu cubbuu hojjeteera, ulfinni Waaqayyoos isaanitti hir'ateera. Garuu karaa Kiristoos qajeelota taane.

--- [Sample Preview End] ---`,
  },
  {
    id: "dorcas-eng-ot-survey",
    category: "dorcas",
    language: "english",
    languageLabel: "English",
    title: "Biblical Foundations & Old Testament Survey",
    subtitle: "Dorcas College Core Curriculum",
    provider: "Dorcas College Faculty",
    description:
      "A comprehensive theological survey covering historical contexts, covenantal theology, and canonical analysis.",
    price: 450,
    coverUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
    modules: "14 Modules • 220 Pages",
    sampleContent: `Dorcas College — Old Testament Survey
Module 1: The Pentateuch and God's Covenants

Introduction to Genesis, Exodus, Leviticus, Numbers, and Deuteronomy.
Understanding God's sovereign covenant with Abraham and the redemption of Israel.

--- [Sample Preview End] ---`,
  },
  {
    id: "dorcas-eng-apologetics",
    category: "dorcas",
    language: "english",
    languageLabel: "English",
    title: "Christian Apologetics & Contemporary Culture",
    subtitle: "Dorcas College Worldview Studies",
    provider: "Dorcas College Faculty",
    description:
      "Defending the biblical Christian worldview with reason, love, and intellectual rigor in modern society.",
    price: 400,
    coverUrl:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop",
    modules: "10 Modules • 175 Pages",
    sampleContent: `Dorcas College — Christian Apologetics
Lecture 1: The Reasons for Our Hope (1 Peter 3:15)

Integrating rational argumentation with godly conduct. 
The historical evidence for the Resurrection and the reliability of Scripture.

--- [Sample Preview End] ---`,
  },

  // ================= ስልጠናዎች (Practical Trainings - PDF Format) =================
  {
    id: "training-peacebuilding-pdf",
    category: "trainings",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የሰላምና የእርቅ አገልግሎት ስልጠና መመሪያ (PDF)",
    subtitle: "ተግባራዊ የሰላም ግንባታ ማኑዋል",
    provider: "RABBI Peace & Community Ministry",
    description:
      "በግጭትና በአስቸጋሪ ሁኔታዎች ውስጥ እርቅንና ሰላምን ለማውረድ የሚረዳ ተግባራዊ የአገልጋዮች የፒዲኤፍ ስልጠና መጽሐፍ።",
    price: 200,
    coverUrl:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "3.4 MB",
    pageCount: "56 ገጾች",
    modules: "ተግባራዊ ፒዲኤፍ ሞጁል",
    sampleContent: `[ፒዲኤፍ ሰነድ ናሙና / PDF Preview]
ረቢ (REBI) የሰላም፣ የእርቅና የማኅበረሰብ ግንባታ ስልጠና
ፋይል ቅርጸት፡ የተጠበቀ PDF (56 ገጾች)

ክፍል 1፡ የሰላም መጽሐፍ ቅዱሳዊ ትርጓሜ (Shalom)
ሰላም ማለት የግጭት አለመኖር ብቻ ሳይሆን ሁለንተናዊ ደህንነት፣ እርቅና ጽድቅ ነው።
(ማቴዎስ 5:9 "የሚያስተራርቁ ብፁዓን ናቸው...")

ተግባራዊ ደረጃዎች፡
1. ንቁ ማዳመጥና የቅሬታ ምንጭ መረዳት
2. ይቅርታንና የእውነት ንግግርን ማበረታታት
3. የጋራ የሰላም ድልድይ መፍጠር

--- [የነፃ ናሙና ፒዲኤፍ ማጠቃለያ] ---`,
  },
  {
    id: "training-community-pdf",
    category: "trainings",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የማኅበረሰብ ልማትና ድጋፍ አሰጣጥ ስልጠና (PDF)",
    subtitle: "ተግባራዊ የፍቅር አገልግሎት መመሪያ",
    provider: "RABBI Community Development",
    description:
      "የተፈናቀሉና በችግር ውስጥ ያሉ ወገኖችን በክርስቲያናዊ ፍቅር ለመርዳትና ማኅበራዊ ተጽዕኖ ለመፍጠር የሚረዳ የፒዲኤፍ ስልጠና።",
    price: 180,
    coverUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "2.8 MB",
    pageCount: "42 ገጾች",
    modules: "ተግባራዊ ፒዲኤፍ ሞጁል",
    sampleContent: `[ፒዲኤፍ ሰነድ ናሙና / PDF Preview]
ረቢ (REBI) የማኅበረሰብ ድጋፍና ልማት ስልጠና
ፋይል ቅርጸት፡ የተጠበቀ PDF (42 ገጾች)

ምዕራፍ 1: የአገልግሎት ተደራሽነት መርሆዎች
በችግር ውስጥ ያሉ ሰዎችን በክብርና በርኅራኄ መደገፍ።
(ያዕቆብ 1:27፣ ገላትያ 6:2)

--- [የነፃ ናሙና ፒዲኤፍ ማጠቃለያ] ---`,
  },
  {
    id: "training-youth-pdf",
    category: "trainings",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የወጣቶች ደቀመዝሙርነት እና ሥነ-ምግባር ስልጠና (PDF)",
    subtitle: "የወጣት መሪዎች ማኑዋል",
    provider: "RABBI Youth Ministries",
    description:
      "ለወጣቶች መሪዎችና አስተማሪዎች የተዘጋጀ፤ የሥነ-ምግባር፣ የጸሎትና የሕይወት ቅድስና ማስተማሪያ የፒዲኤፍ ሞጁል።",
    price: 150,
    coverUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "2.1 MB",
    pageCount: "38 ገጾች",
    modules: "ተግባራዊ ፒዲኤፍ ሞጁል",
    sampleContent: `[ፒዲኤፍ ሰነድ ናሙና / PDF Preview]
የወጣቶች ደቀመዝሙርነት እና ሥነ-ምግባር
ፋይል ቅርጸት፡ የተጠበቀ PDF (38 ገጾች)

ምዕራፍ 1: በዲጂታል ዘመን በቅድስና መኖር
ወጣቶችን ከመጥፎ ልማዶችና ከተስፋ መቁረጥ መጠበቅ።

--- [የነፃ ናሙና ፒዲኤፍ ማጠቃለያ] ---`,
  },
  {
    id: "training-family-pdf",
    category: "trainings",
    language: "amharic",
    languageLabel: "አማርኛ",
    title: "የክርስቲያን ጋብቻና የቤተሰብ ሕይወት ስልጠና (PDF)",
    subtitle: "የቤተሰብ ጥናት ማኑዋል",
    provider: "RABBI Family Life Department",
    description:
      "ጠንካራና በመጽሐፍ ቅዱስ መርህ የተገነባ የቤተሰብ ሕይወት ለመምራት የሚረዳ ተግባራዊ የስልጠና ፒዲኤፍ።",
    price: 220,
    coverUrl:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "2.9 MB",
    pageCount: "48 ገጾች",
    modules: "ተግባራዊ ፒዲኤፍ ሞጁል",
    sampleContent: `[ፒዲኤፍ ሰነድ ናሙና / PDF Preview]
የክርስቲያን ጋብቻና የቤተሰብ ሕይወት
ፋይል ቅርጸት፡ የተጠበቀ PDF (48 ገጾች)

ምዕራፍ 1: የፍቅርና የመከባበር መሠረት (ኤፌሶን 5:22-33)
በቤተሰብ ውስጥ ሰላም፣ መግባባትና ልጆችን በእግዚአብሔር ፍርሃት ማሳደግ።

--- [የነፃ ናሙና ፒዲኤፍ ማጠቃለያ] ---`,
  },
  {
    id: "training-oromo-leadership-pdf",
    category: "trainings",
    language: "oromo",
    languageLabel: "Afaan Oromoo",
    title: "Leenjii Geggeessummaa fi Tajaajila Kirstiyaanaa (PDF)",
    subtitle: "Qajeelfama Leenjii Hoggansaa",
    provider: "RABBI Leenjii fi Qophii",
    description:
      "Hoggansa waldaa fi tajaajila amantootaa cimsuuf leenjii qophaa'e kan bu'uura Macaafa Qulqulluu qabu.",
    price: 200,
    coverUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "2.6 MB",
    pageCount: "Fuula 45",
    modules: "Moojulii PDF",
    sampleContent: `[PDF Preview]
Leenjii Geggeessummaa fi Tajaajila Kirstiyaanaa
Format: PDF Protected (Fuula 45)

Boqonnaa 1: Amala Hoggansa Kiristaanummaa
Amanamtummaa fi qulqullummaan tajaajiluuf qajeelfama gargaaru.

--- [Sample Preview End] ---`,
  },
  {
    id: "training-oromo-peace-pdf",
    category: "trainings",
    language: "oromo",
    languageLabel: "Afaan Oromoo",
    title: "Leenjii Nagaa, Araaraa fi Ijaarsa Hawaasaa (PDF)",
    subtitle: "Qajeelfama Tajaajila Nagaa",
    provider: "RABBI Tajaajila Nagaa",
    description:
      "Hawaasa gidduutti nagaa fi araara buusuuf qajeelfama tajaajiltootaaf qophaa'e.",
    price: 180,
    coverUrl:
      "https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "3.1 MB",
    pageCount: "Fuula 52",
    modules: "Moojulii PDF",
    sampleContent: `[PDF Preview]
Leenjii Nagaa fi Araaraa
Format: PDF Protected (Fuula 52)

Boqonnaa 1: Araara fi Dhiifama
Karaa dubbii Waaqayyoo nagaa buusuu fi walitti dhufeenya cimsuu.

--- [Sample Preview End] ---`,
  },
  {
    id: "training-eng-crisis-pdf",
    category: "trainings",
    language: "english",
    languageLabel: "English",
    title: "Discipleship in Crisis & Conflict Environments (PDF)",
    subtitle: "Crisis Response Manual",
    provider: "RABBI Crisis Response Team",
    description:
      "Equipping pastors and workers for ministry during displacement, crisis, and emotional trauma with biblical hope.",
    price: 250,
    coverUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "3.8 MB",
    pageCount: "60 Pages",
    modules: "PDF Training Manual",
    sampleContent: `[PDF Preview]
Discipleship in Crisis & Conflict Environments
Format: Secured PDF Manual (60 Pages)

Chapter 1: The Pastoral Theology of Suffering
Trauma-informed Christian ministry and sustainable pastoral care in high-stress zones.

--- [Sample Preview End] ---`,
  },
  {
    id: "training-eng-community-pdf",
    category: "trainings",
    language: "english",
    languageLabel: "English",
    title: "Holistic Community Transformation Manual (PDF)",
    subtitle: "Community Action Manual",
    provider: "RABBI Global Training",
    description:
      "A comprehensive action training manual bridging gospel evangelism with sustainable compassion and social development.",
    price: 200,
    coverUrl:
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&auto=format&fit=crop",
    isPdf: true,
    fileSize: "3.0 MB",
    pageCount: "50 Pages",
    modules: "PDF Training Manual",
    sampleContent: `[PDF Preview]
Holistic Community Transformation Manual
Format: Secured PDF Manual (50 Pages)

Section 1: The Church as Light and Salt in the Nation
Engaging in poverty alleviation, peacebuilding, and human dignity.

--- [Sample Preview End] ---`,
  },
];

function CoursesRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<CourseCategory>("dorcas");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync selected language filter with global language chosen in top nav dropdown
  useEffect(() => {
    if (language === "or") {
      setSelectedLanguage("oromo");
    } else if (language === "en") {
      setSelectedLanguage("english");
    } else if (language === "am") {
      setSelectedLanguage("amharic");
    }
  }, [language]);

  // Modals
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedForReader, setSelectedForReader] = useState<BookItem | null>(null);

  // Request statuses (stored locally or synced)
  const [userRequests, setUserRequests] = useState<Record<string, string>>({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Sync existing user requests from backend if logged in
  useEffect(() => {
    if (user) {
      fetchApi<{ requests: any[] }>("/requests/my")
        .then((data) => {
          const map: Record<string, string> = {};
          data.requests.forEach((r) => {
            if (r.book?.id) map[r.book.id] = r.status;
          });
          setUserRequests((prev) => ({ ...prev, ...map }));
        })
        .catch(() => {
          // fallback to local state
        });
    }
  }, [user]);

  // Filter items
  const filteredCourses = COURSES_DATA.filter((item) => {
    const matchCategory = item.category === activeCategory;
    const matchLanguage =
      selectedLanguage === "all" ? true : item.language === selectedLanguage;
    const matchSearch =
      searchQuery.trim() === ""
        ? true
        : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchLanguage && matchSearch;
  });

  // Handle "የክፍያ ደረሰኝ ለመላክ"
  const handleSendReceipt = () => {
    if (!user) {
      if (selectedCourse) setSelectedCourse(null);
      navigate({ to: "/login" });
      return;
    }
    window.open("https://t.me/rabbi_admin", "_blank", "noopener,noreferrer");
  };

  // Handle Request Access
  const handleRequestCourse = async (course: CourseItem) => {
    if (!user) {
      setSelectedCourse(null);
      navigate({ to: "/login" });
      return;
    }

    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      // Try posting to backend /requests
      await fetchApi<{ message: string }>("/requests", {
        method: "POST",
        body: JSON.stringify({ bookId: course.id }),
      }).catch(() => {
        // In case course id isn't in DB yet, record in local state
      });

      setUserRequests((prev) => ({ ...prev, [course.id]: "PENDING" }));
      setRequestSuccess(
        course.isPdf
          ? "የስልጠና ፒዲኤፍ ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ክፍያዎ ሲረጋገጥ አድሚን ይፈቅድልዎታል።"
          : "የኮርሱ ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ክፍያዎ ሲረጋገጥ አድሚን ይፈቅድልዎታል።"
      );
    } catch (err: any) {
      setRequestError(err.message || "ጥያቄ መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-navy-deep px-4 sm:px-6 py-10 sm:py-16 text-center border-b border-gold/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-gold mb-3">
            <School className="h-4 w-4" />
            <span>RABBI የትምህርትና ስልጠና ማዕከል • Dorcas College & Practical Trainings</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-gold tracking-tight">
            ኮርሶች እና ተግባራዊ ስልጠናዎች
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-on-navy-muted max-w-2xl mx-auto leading-relaxed">
            በዶርቃ ኮሌጅ የተዘጋጁ ጥልቅ የሥነ-መለኮት ኮርሶች እና ለማኅበረሰብ ግንባታ፣ ለሰላም፣ ለአመራርና
            ለአገልግሎት የተዘጋጁ የፒዲኤፍ ስልጠናዎችን እዚህ ያግኙ።
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-10">
        {/* Top 2 Main Cards: "ዶርቃ ኮሌጅ" and "ስልጠናዎች" */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-8 sm:mb-10">
          {/* Card 1: ዶርቃ ኮሌጅ */}
          <button
            type="button"
            onClick={() => setActiveCategory("dorcas")}
            className={`cursor-pointer rounded-2xl p-6 md:p-8 text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-2 ${
              activeCategory === "dorcas"
                ? "bg-navy-deep text-white border-gold shadow-2xl scale-[1.01]"
                : "bg-card text-navy border-gold/20 shadow-card hover:border-gold/50 hover:shadow-lg"
            }`}
          >
            {activeCategory === "dorcas" && (
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-navy-deep flex items-center gap-1 shadow">
                  <CheckCircle2 className="h-3 w-3" /> የተመረጠ
                </span>
              </div>
            )}
            <div>
              <div
                className={`mb-4 inline-flex rounded-2xl p-4 transition-colors ${
                  activeCategory === "dorcas"
                    ? "bg-gold text-navy-deep shadow-md"
                    : "bg-navy/5 text-navy"
                }`}
              >
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gold mb-1">
                የሥነ-መለኮትና የመጽሐፍ ቅዱስ ኮሌጅ
              </span>
              <h2
                className={`font-display text-2xl md:text-3xl font-bold mb-2 ${
                  activeCategory === "dorcas" ? "text-gold" : "text-navy"
                }`}
              >
                ዶርቃ ኮሌጅ
              </h2>
              <p
                className={`text-xs md:text-sm leading-relaxed ${
                  activeCategory === "dorcas" ? "text-on-navy-muted" : "text-muted-foreground"
                }`}
              >
                በዶርቃ ኮሌጅ የተዘጋጁ ጥልቅ መንፈሳዊና ሥነ-መለኮታዊ የኮርስ መጽሐፍት፣ የስርዓተ-ትምህርት ክፍለ-ጊዜዎች
                እና የአገልግሎት ዝግጅት ማቴሪያሎች።
              </p>
            </div>

            <div
              className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold ${
                activeCategory === "dorcas"
                  ? "border-gold/30 text-gold"
                  : "border-navy/10 text-muted-foreground"
              }`}
            >
              <span>የኮሌጅ ኮርሶች ዝርዝር ክፈት</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Card 2: ስልጠናዎች */}
          <button
            type="button"
            onClick={() => setActiveCategory("trainings")}
            className={`cursor-pointer rounded-2xl p-6 md:p-8 text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-2 ${
              activeCategory === "trainings"
                ? "bg-navy-deep text-white border-gold shadow-2xl scale-[1.01]"
                : "bg-card text-navy border-gold/20 shadow-card hover:border-gold/50 hover:shadow-lg"
            }`}
          >
            {activeCategory === "trainings" && (
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-navy-deep flex items-center gap-1 shadow">
                  <CheckCircle2 className="h-3 w-3" /> የተመረጠ
                </span>
              </div>
            )}
            <div>
              <div
                className={`mb-4 inline-flex rounded-2xl p-4 transition-colors ${
                  activeCategory === "trainings"
                    ? "bg-gold text-navy-deep shadow-md"
                    : "bg-navy/5 text-navy"
                }`}
              >
                <FileText className="h-8 w-8" />
              </div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gold mb-1">
                አጫጭር ስልጠናዎች & የጥናት ማኑዋሎች
              </span>
              <h2
                className={`font-display text-2xl md:text-3xl font-bold mb-2 ${
                  activeCategory === "trainings" ? "text-gold" : "text-navy"
                }`}
              >
                ስልጠናዎች (PDF ማቴሪያሎች)
              </h2>
              <p
                className={`text-xs md:text-sm leading-relaxed ${
                  activeCategory === "trainings" ? "text-on-navy-muted" : "text-muted-foreground"
                }`}
              >
                ለማኅበረሰብ ግንባታ፣ ለሰላምና እርቅ፣ ለአመራርና ለአገልግሎት የተዘጋጁ የሚወርዱና የሚጠኑ
                የፒዲኤፍ (PDF) ማቴሪያሎች።
              </p>
            </div>

            <div
              className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold ${
                activeCategory === "trainings"
                  ? "border-gold/30 text-gold"
                  : "border-navy/10 text-muted-foreground"
              }`}
            >
              <span>የፒዲኤፍ ስልጠናዎች ዝርዝር ክፈት</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Filter Bar: Languages & Search */}
        <div className="rounded-2xl bg-card border border-gold/25 p-4 md:p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5 mr-1">
                <Globe2 className="h-4 w-4 text-gold" />
                ቋንቋ ይምረጡ፦
              </span>

              {[
                { id: "all", label: "ሁሉም (All)" },
                { id: "amharic", label: "አማርኛ" },
                { id: "oromo", label: "Afaan Oromoo" },
                { id: "english", label: "English" },
              ].map(({ id, label }) => {
                const isSelected = selectedLanguage === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedLanguage(id as LanguageOption)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-navy-deep text-gold font-bold shadow border border-gold/40"
                        : "bg-navy/5 text-navy hover:bg-gold/20"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በርዕስ፣ በመምህር ወይም በይዘት ይፈልጉ..."
                className="w-full rounded-xl border border-navy/20 pl-9 pr-4 py-2 text-xs focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-background"
              />
            </div>
          </div>
        </div>

        {/* Current Category & Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {activeCategory === "dorcas" ? (
              <GraduationCap className="h-6 w-6 text-gold" />
            ) : (
              <FileText className="h-6 w-6 text-gold" />
            )}
            <h3 className="font-display text-xl md:text-2xl font-bold text-navy">
              {activeCategory === "dorcas"
                ? `ዶርቃ ኮሌጅ — የኮርስ መጽሐፍት (${filteredCourses.length})`
                : `ስልጠናዎች — የፒዲኤፍ (PDF) ማቴሪያሎች (${filteredCourses.length})`}
            </h3>
          </div>
        </div>

        {/* Courses / Trainings Grid (Exact Book Section Style) */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center">
            <School className="h-10 w-10 text-gold/60 mx-auto mb-3" />
            <h4 className="font-display text-base font-bold text-navy mb-1">
              ምንም ኮርስ ወይም ስልጠና አልተገኘም
            </h4>
            <p className="text-xs text-muted-foreground">
              እባክዎ የተመረጠውን ቋንቋ ወይም የፍለጋ ቃል ይቀይሩ።
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const currentStatus = userRequests[course.id] || "NONE";
              const isPermitted = currentStatus === "PERMITTED" || course.isPermitted;
              const isPending = currentStatus === "PENDING";

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-card border border-gold/20 shadow-card hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div>
                    {/* Cover Image Container */}
                    {/* Course / Book cover with full visibility */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-navy/5 flex items-center justify-center p-2">
                      <img
                        src={course.coverUrl}
                        alt={course.title}
                        className="h-full w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-102"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 rounded-full bg-navy-deep/85 px-2.5 py-1 text-[0.7rem] font-bold text-gold border border-gold/30">
                        {course.languageLabel}
                      </div>

                      <div className="absolute top-3 right-3 rounded-full bg-navy-deep/85 px-2.5 py-1 text-[0.7rem] font-bold text-gold border border-gold/30 flex items-center gap-1">
                        {course.isPdf ? (
                          <>
                            <FileText className="h-3 w-3 text-red-400" />
                            <span>PDF ሰነድ</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="h-3 w-3" />
                            <span>ዶርቃ ኮሌጅ</span>
                          </>
                        )}
                      </div>

                      {/* Status Overlay Badge */}
                      {isPermitted && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-green-600 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ✓ ተፈቅዷል (Unlocked)
                        </div>
                      )}
                      {isPending && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ⏳ ጥያቄ ተልኳል (Pending)
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gold mb-1">
                        <span>{course.provider}</span>
                        {course.modules && (
                          <>
                            <span>•</span>
                            <span className="text-muted-foreground">{course.modules}</span>
                          </>
                        )}
                        {course.fileSize && (
                          <>
                            <span>•</span>
                            <span className="text-red-500 font-bold">{course.fileSize}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-navy font-display line-clamp-1 group-hover:text-gold transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with Price & Action Button (Book Style) */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gold/10 mt-3 pt-3">
                    <span className="text-base font-bold text-navy-deep font-display">
                      {course.price > 0 ? `${course.price} ETB` : "ነፃ (Free)"}
                    </span>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-gold/15 px-3.5 py-2 text-xs font-bold text-navy border border-gold/30 group-hover:bg-gold group-hover:text-navy-deep transition-all"
                    >
                      {isPermitted ? (
                        <>
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{course.isPdf ? "PDF አንብብ" : "ኮርስ ክፈት"}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>{course.isPdf ? "PDF ናሙና / ጠይቅ" : "ናሙና / ጠይቅ"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course & Training Modal (Exact Book Section Style + PDF info + Login Protection) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              {/* Cover Column */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[260px] md:max-w-none rounded-xl overflow-hidden shadow-lg border border-gold/20 bg-navy/5 flex items-center justify-center p-2">
                  <img
                    src={selectedCourse.coverUrl}
                    alt={selectedCourse.title}
                    className="w-full h-auto max-h-[380px] object-contain rounded-lg"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-navy-deep/85 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold border border-gold/40 flex items-center gap-1.5">
                    {selectedCourse.isPdf ? (
                      <>
                        <FileText className="h-3.5 w-3.5 text-red-400" />
                        <span>PDF ስልጠና</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>ዶርቃ ኮሌጅ</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 w-full text-center">
                  <span className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
                    {selectedCourse.price > 0 ? `${selectedCourse.price} ETB` : "ነፃ (Free)"}
                  </span>
                  {selectedCourse.isPdf && (
                    <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold">
                      <span>{selectedCourse.pageCount}</span>
                      <span>•</span>
                      <span className="text-red-600">{selectedCourse.fileSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Column */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-gold/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-navy-deep border border-gold/30 mb-2">
                    {selectedCourse.languageLabel} •{" "}
                    {selectedCourse.category === "dorcas" ? "ዶርቃ ኮሌጅ" : "ተግባራዊ ስልጠና"}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-navy font-display mb-1">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-sm text-gold font-medium mb-3">
                    አቅራቢ / መምህር: {selectedCourse.provider}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {selectedCourse.description}
                  </p>

                  {/* Sample Reading / Outline Box */}
                  <div className="mb-5 rounded-xl bg-navy-deep/5 p-4 border border-navy/10">
                    <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-gold" />
                      {selectedCourse.isPdf
                        ? "የፒዲኤፍ (PDF) ማጠቃለያና ናሙና ንባብ"
                        : "የነፃ ናሙና ንባብ (Course Sample)"}
                    </h4>
                    <div className="max-h-36 overflow-y-auto pr-2 text-xs text-navy/80 whitespace-pre-line leading-relaxed font-sans scrollbar-thin">
                      {selectedCourse.sampleContent}
                    </div>
                  </div>

                  {/* Bank Details Box (Matching Book Section) */}
                  <div className="mb-5 rounded-xl bg-gold/10 p-4 border border-gold/30">
                    <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-gold" />
                      ክፍያ መፈጸሚያ (CBE Bank Transfer)
                    </h4>
                    <div className="text-xs text-navy space-y-1">
                      <p>
                        <span className="font-semibold">ባንክ:</span> ኢትዮጵያ ንግድ ባንክ (CBE)
                      </p>
                      <p>
                        <span className="font-semibold">የሂሳብ ቁጥር:</span>{" "}
                        <code className="bg-gold/20 px-1.5 py-0.5 rounded font-mono font-bold text-navy-deep">
                          1000123456789
                        </code>
                      </p>
                      <p>
                        <span className="font-semibold">የሂሳብ ስም:</span> RABBI Ministry / ዶርቃ ኮሌጅ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div>
                  {requestError && (
                    <div className="mb-3 rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                      {requestError}
                    </div>
                  )}

                  {requestSuccess && (
                    <div className="mb-3 rounded-md bg-green-50 p-2.5 text-xs text-green-800 border border-green-200 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{requestSuccess}</span>
                    </div>
                  )}

                  {/* Status Checking */}
                  {userRequests[selectedCourse.id] === "PERMITTED" || selectedCourse.isPermitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        const readerBook: BookItem = {
                          id: selectedCourse.id,
                          title: selectedCourse.title,
                          author: selectedCourse.provider,
                          description: selectedCourse.description,
                          price: selectedCourse.price,
                          coverUrl: selectedCourse.coverUrl,
                          mediaType: selectedCourse.isPdf ? "PDF" : "BOOK",
                          sampleContent: selectedCourse.sampleContent,
                          fullContent: selectedCourse.fullContent || selectedCourse.sampleContent,
                          isPermitted: true,
                        };
                        setSelectedCourse(null);
                        setSelectedForReader(readerBook);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-all cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {selectedCourse.isPdf ? "አሁን ያንብቡ / PDF ክፈት" : "አሁን ኮርሱን ይጀምሩ"}
                      </span>
                    </button>
                  ) : userRequests[selectedCourse.id] === "PENDING" ? (
                    <div className="space-y-2">
                      <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/40 px-5 py-2.5 text-xs font-semibold text-amber-700">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span>ጥያቄዎ በመጠባበቅ ላይ ነው (Pending Approval)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendReceipt}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                      >
                        <Send className="h-4 w-4" />
                        <span>የክፍያ ደረሰኝ ለመላክ (@rabbi_admin)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => handleRequestCourse(selectedCourse)}
                        disabled={requestLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                      >
                        <Lock className="h-4 w-4" />
                        <span>
                          {requestLoading
                            ? "በመላክ ላይ..."
                            : selectedCourse.isPdf
                              ? "ስልጠናውን ጠይቅ (Request Training PDF)"
                              : "ኮርሱን ጠይቅ (Request Course Access)"}
                        </span>
                      </button>

                      {/* Requirement 2: Send payment receipt button checks login */}
                      <button
                        type="button"
                        onClick={handleSendReceipt}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-navy-deep/5 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gold/10 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <Send className="h-4 w-4 text-gold" />
                        <span>የክፍያ ደረሰኝ ለመላክ (@rabbi_admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Modal */}
      {selectedForReader && (
        <PlatformReader
          book={selectedForReader}
          onClose={() => setSelectedForReader(null)}
        />
      )}
    </div>
  );
}
