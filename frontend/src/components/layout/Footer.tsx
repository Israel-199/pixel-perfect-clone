import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/rabbi/Logo";
import { useLanguage } from "@/lib/language";

export function Footer() {
  const { t } = useLanguage();

  const footerCols = [
    {
      title: t("footerBooksCoursesCol"),
      links: [
        { label: t("catAllBooksTitle"), to: "/books" },
        { label: t("navCourses"), to: "/courses" },
        { label: t("navPrayer"), to: "/prayer" },
        { label: t("navArticles"), to: "/articles" },
        { label: t("navMedia"), to: "/media" },
      ],
    },
    {
      title: t("footerSupportCol"),
      links: [
        { label: t("subAboutUs"), to: "/about" },
        { label: t("subVision"), to: "/about" },
        { label: t("subPartnership"), to: "/about" },
        { label: t("subContact"), to: "/about" },
      ],
    },
  ];

  return (
    <footer className="border-t border-navy-soft/40 bg-navy-deep">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 py-10 sm:py-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo size="lg" />
          <p className="mt-4 text-[0.7rem] leading-5 text-on-navy-muted whitespace-pre-line">
            {t("motto")}
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold text-gold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-[0.7rem] text-on-navy-muted hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-xs font-semibold text-gold">{t("footerContactCol")}</h4>
          <ul className="mt-3 space-y-2 text-[0.7rem] text-on-navy-muted">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gold" /> rabbidigitals@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold" /> +251 921 161 705
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold" /> {t("footerAddisAbaba")}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-soft/40 py-4 text-center text-[0.65rem] text-on-navy-muted">
        {t("footerCopyright")}
      </div>
    </footer>
  );
}
