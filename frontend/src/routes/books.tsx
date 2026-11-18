import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Book, Library, GraduationCap, LayoutList, Lock, CheckCircle2, PlayCircle, Music, BookOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { BookItem, BookModal } from "@/components/rabbi/BookModal";
import { PlatformReader } from "@/components/rabbi/PlatformReader";
import { formatEtbWithUsd } from "@/lib/bookUtils";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "RABBI Digital | መጻሕፍት — መንፈሳዊ፣ ሥነ-መለኮትና የትምህርት መጻሕፍት" },
      {
        name: "description",
        content:
          "RABBI Digital ላይ ያሉ ሁሉም መንፈሳዊ፣ ሥነ-መለኮታዊ እና ትምህርታዊ መጻሕፍትን ያስሱ። ቅዱሳን ጽሑፎችን፣ የጥናት ማኑዋሎችን እና የዶርቃ ኮሌጅ ምሑራዊ ሥራዎችን ያግኙ።",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "RABBI Digital | መጻሕፍት" },
      {
        property: "og:description",
        content:
          "መንፈሳዊ፣ ሥነ-መለኮታዊ እና ትምህርታዊ መጻሕፍት ሙሉ ስብስብ — RABBI Digital።",
      },
      { property: "og:url", content: "https://www.rabbidigital.com/books" },
      { property: "og:locale", content: "am_ET" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RABBI Digital | መጻሕፍት" },
      {
        name: "twitter:description",
        content:
          "መንፈሳዊ እና ሥነ-መለኮታዊ መጻሕፍት — RABBI Digital።",
      },
    ],
    links: [
      { rel: "canonical", href: "https://www.rabbidigital.com/books" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://www.rabbidigital.com/books",
          "url": "https://www.rabbidigital.com/books",
          "name": "RABBI Digital — መጻሕፍት",
          "description": "RABBI Digital ላይ ያሉ ሁሉም መንፈሳዊ፣ ሥነ-መለኮታዊ እና ትምህርታዊ መጻሕፍት",
          "inLanguage": "am",
          "isPartOf": {
            "@id": "https://www.rabbidigital.com/#website"
          },
          "publisher": {
            "@id": "https://www.rabbidigital.com/#organization"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "ዋና ገጽ", "item": "https://www.rabbidigital.com/" },
              { "@type": "ListItem", "position": 2, "name": "መጻሕፍት", "item": "https://www.rabbidigital.com/books" }
            ]
          }
        })
      }
    ],
  }),
  component: BooksRoute,
});

function BooksRoute() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<BookItem | null>(null);

  const subSections = [
    { icon: Book, title: t("catBibleTitle"), desc: t("catBibleDesc") },
    { icon: Library, title: t("catAllBooksTitle"), desc: t("catAllBooksDesc") },
    { icon: GraduationCap, title: t("catStudyTitle"), desc: t("catStudyDesc") },
    { icon: LayoutList, title: t("catSummaryTitle"), desc: t("catSummaryDesc") },
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ books: BookItem[] }>("/books", { skipCache: true });
      setBooks(data.books);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="animate-in fade-in pb-20">
      {/* Banner */}
      <div className="bg-navy-deep px-4 sm:px-6 py-10 sm:py-16 text-center border-b border-gold/20">
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-gold">{t("booksTitle")}</h1>
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-on-navy-muted max-w-xl mx-auto leading-relaxed">
          {t("booksSubtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 mt-8 sm:mt-10">
        {/* Categories / Filters */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
          {subSections.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group cursor-pointer rounded-xl bg-card p-3.5 sm:p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg border border-gold/10 hover:border-gold/30"
            >
              <div className="mb-2 sm:mb-3 inline-flex rounded-full bg-navy/5 p-2.5 sm:p-3 text-navy transition-colors group-hover:bg-navy-deep group-hover:text-gold">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-navy">{title}</h3>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground line-clamp-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Books List Grid */}
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy mb-5 sm:mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gold shrink-0" />
          <span>{t("availableBooks")} ({books.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {books.map((book) => {
              const isPermitted = book.isPermitted || book.requestStatus === "PERMITTED";
              const isPending = book.requestStatus === "PENDING";

              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-card border border-gold/20 shadow-card hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div>
                    {/* Cover Image — aspect-[3/4] so book cover is perfectly preserved and not cut */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-navy/5 flex items-center justify-center p-2">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-102"
                      />
                      <div className="absolute top-3 right-3 rounded-full bg-navy-deep/85 px-2.5 py-1 text-[0.7rem] font-bold text-gold border border-gold/30 flex items-center gap-1 shadow-md">
                        {book.mediaType === "VIDEO" ? (
                          <PlayCircle className="h-3 w-3" />
                        ) : book.mediaType === "AUDIO" ? (
                          <Music className="h-3 w-3" />
                        ) : (
                          <BookOpen className="h-3 w-3" />
                        )}
                        <span>{book.mediaType}</span>
                      </div>

                      {/* Status Overlay Badge */}
                      {isPermitted && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-green-600 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ✓ {t("approved")}
                        </div>
                      )}
                      {isPending && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ⏳ {t("pendingApproval")}
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-navy font-display line-clamp-1 group-hover:text-gold transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs font-semibold text-gold mt-0.5">
                        {t("authorLabel")}: {book.author || "RABBI"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed whitespace-pre-wrap">
                        {book.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with ETB and USD */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gold/10 mt-3 pt-3">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-navy-deep leading-tight">
                        {formatEtbWithUsd(book.price).etbText}
                      </span>
                      {book.price > 0 && (
                        <span className="text-[11px] font-bold text-gold">
                          {formatEtbWithUsd(book.price).usdText}
                        </span>
                      )}
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3.5 py-2 text-xs font-bold text-navy border border-gold/30 group-hover:bg-gold group-hover:text-navy-deep transition-all">
                      {isPermitted ? (
                        <>
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{t("readAction")}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>{t("sampleOrRequest")}</span>
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

      {/* Book Preview / Request Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRequestSubmitted={() => fetchBooks()}
          onOpenReader={(b) => setSelectedBookForReader(b)}
        />
      )}

      {/* Full Content Platform Reader */}
      {selectedBookForReader && (
        <PlatformReader
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
        />
      )}
    </div>
  );
}
