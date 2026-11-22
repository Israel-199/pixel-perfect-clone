import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Video, Headphones, Mic, Sparkles, Radio, PlayCircle, Music, Lock, BookOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { BookItem, BookModal } from "@/components/rabbi/BookModal";
import { PlatformReader } from "@/components/rabbi/PlatformReader";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "RABBI Digital | መንፈሳዊ ሚዲያ — ቪዲዮዎች፣ ኦዲዮዎች፣ ስብከቶችና መዝሙሮች" },
      {
        name: "description",
        content:
          "RABBI Digital ሚዲያ ሞጁል — የተመረጡ የቪዲዮ እና ኦዲዮ ትምህርቶች፣ ስብከቶች፣ የወንጌል መዝሙሮችና መንፈሳዊ ውይይቶች ያለ ምንም ቅድመ-ሁኔታ ያዳምጡ።",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "RABBI Digital | መንፈሳዊ ሚዲያ" },
      {
        property: "og:description",
        content:
          "ቪዲዮዎች፣ ኦዲዮዎች፣ ስብከቶችና መዝሙሮች — RABBI Digital ሚዲያ።",
      },
      { property: "og:url", content: "https://www.rabbidigital.com/media" },
      { property: "og:locale", content: "am_ET" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RABBI Digital | ሚዲያ" },
      {
        name: "twitter:description",
        content:
          "የቪዲዮ እና ኦዲዮ ስብከቶችና ትምህርቶች — RABBI Digital።",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.rabbidigital.com/media" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://www.rabbidigital.com/media",
          "url": "https://www.rabbidigital.com/media",
          "name": "RABBI Digital — መንፈሳዊ ሚዲያ",
          "description": "ቪዲዮዎች፣ ኦዲዮዎች፣ ስብከቶችና መዝሙሮች",
          "inLanguage": "am",
          "isPartOf": { "@id": "https://www.rabbidigital.com/#website" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "ዋና ገጽ", "item": "https://www.rabbidigital.com/" },
              { "@type": "ListItem", "position": 2, "name": "ሚዲያ", "item": "https://www.rabbidigital.com/media" }
            ]
          }
        })
      }
    ],
  }),
  component: MediaRoute,
});

const SUB_SECTIONS = [
  { icon: Video, type: "ALL", titleKey: "filterAllMedia", descKey: "filterAllMediaDesc" },
  { icon: Video, type: "VIDEO", titleKey: "filterVideos", descKey: "filterVideosDesc" },
  { icon: Headphones, type: "AUDIO", titleKey: "filterAudios", descKey: "filterAudiosDesc" },
];

function MediaRoute() {
  const { t } = useLanguage();
  const [mediaItems, setMediaItems] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<BookItem | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ books: BookItem[] }>("/books", { skipCache: true });
      // Filter video/audio media items only
      const mediaOnly = (data.books || []).filter(
        (b) => b.mediaType === "VIDEO" || b.mediaType === "AUDIO"
      );
      setMediaItems(mediaOnly);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filteredItems = mediaItems.filter((item) => {
    if (selectedFilter === "VIDEO") return item.mediaType === "VIDEO";
    if (selectedFilter === "AUDIO") return item.mediaType === "AUDIO";
    return item.mediaType === "VIDEO" || item.mediaType === "AUDIO"; // ALL
  });

  return (
    <div className="animate-in fade-in pb-20">
      {/* Header Banner */}
      <div className="bg-navy-deep px-4 sm:px-6 py-10 sm:py-16 text-center border-b border-gold/20">
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-gold">{t("mediaTitle")}</h1>
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-on-navy-muted max-w-xl mx-auto leading-relaxed">
          {t("mediaSubtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-10">
        {/* Category Filters */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-8 sm:mb-10">
          {SUB_SECTIONS.map(({ icon: Icon, type, titleKey, descKey }) => (
            <div
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`group cursor-pointer rounded-2xl p-4 sm:p-5 shadow-card transition-all border ${
                selectedFilter === type
                  ? "bg-navy-deep text-white border-gold shadow-lg"
                  : "bg-card text-navy border-gold/10 hover:border-gold/30 hover:-translate-y-1"
              }`}
            >
              <div
                className={`mb-2 sm:mb-3 inline-flex rounded-full p-2.5 sm:p-3 ${
                  selectedFilter === type ? "bg-gold text-navy-deep" : "bg-navy/5 text-navy group-hover:bg-navy-deep group-hover:text-gold"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold">{t(titleKey)}</h3>
              <p
                className={`mt-1 text-xs ${
                  selectedFilter === type ? "text-on-navy-muted" : "text-muted-foreground"
                }`}
              >
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Media Grid */}
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy mb-5 sm:mb-6 flex items-center gap-2">
          <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gold shrink-0" />
          <span>{t("availableMedia")} ({filteredItems.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center shadow-card">
            <Video className="mx-auto h-12 w-12 text-gold/60 mb-3" />
            <h3 className="text-base font-bold text-navy">{t("noMediaFound")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("noMediaFoundDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isPermitted = item.isPermitted || item.requestStatus === "PERMITTED";
              const isPending = item.requestStatus === "PENDING";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedBook(item)}
                  className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-card border border-gold/20 shadow-card hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-navy-deep">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                        <div className="rounded-full bg-gold/90 p-3 text-navy-deep shadow-lg transform group-hover:scale-110 transition-transform">
                          {item.mediaType === "AUDIO" ? (
                            <Music className="h-7 w-7" />
                          ) : (
                            <PlayCircle className="h-7 w-7" />
                          )}
                        </div>
                      </div>

                      <div className="absolute top-3 right-3 rounded-full bg-navy-deep/80 px-2.5 py-1 text-[0.7rem] font-bold text-gold border border-gold/30 flex items-center gap-1">
                        {item.mediaType === "AUDIO" ? <Music className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                        <span>{item.mediaType}</span>
                      </div>

                      {/* Status Badges */}
                      {isPermitted && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-green-600 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          {t("statusPermitted")}
                        </div>
                      )}
                      {isPending && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          {t("statusPendingBadge")}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-navy font-display line-clamp-1 group-hover:text-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-gold mt-0.5">
                        ደራሲ/አቅራቢ: {item.author || "RABBI"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gold/10 mt-3 pt-3">
                    <span className="text-base font-bold text-navy-deep">
                      {item.price > 0 ? `${item.price} ETB` : "ነፃ"}
                    </span>
                    <button className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3.5 py-2 text-xs font-bold text-navy border border-gold/30 group-hover:bg-gold group-hover:text-navy-deep transition-all">
                      {isPermitted ? (
                        <>
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>ክፈት / ያዳምጡ</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>ናሙና / ጠይቅ</span>
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

      {/* Book / Media Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRequestSubmitted={() => fetchMedia()}
          onOpenReader={(b) => setSelectedBookForReader(b)}
        />
      )}

      {/* Media Platform Reader / Player */}
      {selectedBookForReader && (
        <PlatformReader
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
        />
      )}
    </div>
  );
}
