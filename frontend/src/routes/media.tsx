import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Video, Headphones, Mic, Sparkles, Radio, PlayCircle, Music, Lock, BookOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { BookItem, BookModal } from "@/components/rabbi/BookModal";
import { PlatformReader } from "@/components/rabbi/PlatformReader";

export const Route = createFileRoute("/media")({
  component: MediaRoute,
});

const SUB_SECTIONS = [
  { icon: Video, type: "ALL", title: "ሁሉም ሚዲያዎች", desc: "ቪዲዮዎችና ኦዲዮዎች" },
  { icon: Video, type: "VIDEO", title: "ቪዲዮዎች", desc: "የቪዲዮ ትምህርቶች እና መዝሙሮች" },
  { icon: Headphones, type: "AUDIO", title: "ኦዲዮዎች", desc: "የድምፅ ትምህርቶች" },
];

function MediaRoute() {
  const [mediaItems, setMediaItems] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<BookItem | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ books: BookItem[] }>("/books");
      // Filter video/audio media items or all books if needed
      setMediaItems(data.books);
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
    return true; // ALL
  });

  return (
    <div className="animate-in fade-in pb-20">
      {/* Header Banner */}
      <div className="bg-navy-deep px-6 py-16 text-center border-b border-gold/20">
        <h1 className="font-display text-4xl text-gold md:text-5xl font-bold">መንፈሳዊ ሚዲያዎች</h1>
        <p className="mt-3 text-sm text-on-navy-muted max-w-xl mx-auto">
          የተመረጡ የቪዲዮና ኦዲዮ ትምህርቶች፣ መዝሙሮችና መንፈሳዊ ውይይቶች።
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 mt-10">
        {/* Category Filters */}
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {SUB_SECTIONS.map(({ icon: Icon, type, title, desc }) => (
            <div
              key={title}
              onClick={() => setSelectedFilter(type)}
              className={`group cursor-pointer rounded-2xl p-5 shadow-card transition-all border ${
                selectedFilter === type
                  ? "bg-navy-deep text-white border-gold shadow-lg"
                  : "bg-card text-navy border-gold/10 hover:border-gold/30 hover:-translate-y-1"
              }`}
            >
              <div
                className={`mb-3 inline-flex rounded-full p-3 ${
                  selectedFilter === type ? "bg-gold text-navy-deep" : "bg-navy/5 text-navy group-hover:bg-navy-deep group-hover:text-gold"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-base font-bold">{title}</h3>
              <p
                className={`mt-1 text-xs ${
                  selectedFilter === type ? "text-on-navy-muted" : "text-muted-foreground"
                }`}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Media Grid */}
        <h2 className="font-display text-2xl font-bold text-navy mb-6 flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-gold" />
          <span>ያሉ ሚዲያዎች ({filteredItems.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center shadow-card">
            <Video className="mx-auto h-12 w-12 text-gold/60 mb-3" />
            <h3 className="text-base font-bold text-navy">ምንም የተጫነ ሚዲያ የለም</h3>
            <p className="text-xs text-muted-foreground mt-1">አድሚን አዲስ ቪዲዮ ወይም ኦዲዮ ሲጭን እዚህ ይገኛሉ።</p>
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
                          ✓ ተፈቅዷል
                        </div>
                      )}
                      {isPending && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ⏳ ጥያቄ ተልኳል
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
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
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
