import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Book, Library, GraduationCap, LayoutList, Lock, CheckCircle2, PlayCircle, Music, BookOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { BookItem, BookModal } from "@/components/rabbi/BookModal";
import { PlatformReader } from "@/components/rabbi/PlatformReader";

export const Route = createFileRoute("/books")({
  component: BooksRoute,
});

const SUB_SECTIONS = [
  { icon: Book, title: "መጽሐፍ ቅዱስ", desc: "የሕይወት ቃል" },
  { icon: Library, title: "ሁሉም መጽሐፍት", desc: "መንፈሳዊ መጽሐፍት ክምችት" },
  { icon: GraduationCap, title: "የመማሪያ መጽሐፍት", desc: "ለጥናት የሚረዱ መጽሐፍት" },
  { icon: LayoutList, title: "መጽሐፍ ዝርዝር", desc: "የመጽሐፍት ማጠቃለያና መግለጫ" },
];

function BooksRoute() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<BookItem | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ books: BookItem[] }>("/books");
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
      <div className="bg-navy-deep px-6 py-16 text-center border-b border-gold/20">
        <h1 className="font-display text-4xl text-gold md:text-5xl font-bold">መንፈሳዊ መጽሐፍትና ሚዲያዎች</h1>
        <p className="mt-3 text-sm text-on-navy-muted max-w-xl mx-auto">
          የተመረጡ መንፈሳዊ መጽሐፍትን፣ የቪዲዮና ኦዲዮ ትምህርቶችን ናሙና ያንብቡ፤ በስርዓቱ ላይ ብቻ በሚሰራው ጥበቃ ይማሩ።
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 mt-10">
        {/* Categories / Filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {SUB_SECTIONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group cursor-pointer rounded-xl bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg border border-gold/10 hover:border-gold/30"
            >
              <div className="mb-3 inline-flex rounded-full bg-navy/5 p-3 text-navy transition-colors group-hover:bg-navy-deep group-hover:text-gold">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-base font-bold text-navy">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Books List Grid */}
        <h2 className="font-display text-2xl font-bold text-navy mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          <span>ያሉ መጽሐፍት ({books.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* Cover Image */}
                    <div className="relative aspect-[3/2] overflow-hidden bg-navy/5">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 rounded-full bg-navy-deep/80 px-2.5 py-1 text-[0.7rem] font-bold text-gold border border-gold/30 flex items-center gap-1">
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
                          ✓ ተፈቅዷል
                        </div>
                      )}
                      {isPending && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow">
                          ⏳ ጥያቄ ተልኳል
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-navy font-display line-clamp-1 group-hover:text-gold transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs font-semibold text-gold mt-0.5">
                        ደራሲ: {book.author || "RABBI"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gold/10 mt-3 pt-3">
                    <span className="text-base font-bold text-navy-deep">
                      {book.price > 0 ? `${book.price} ETB` : "ነፃ"}
                    </span>
                    <button className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3.5 py-2 text-xs font-bold text-navy border border-gold/30 group-hover:bg-gold group-hover:text-navy-deep transition-all">
                      {isPermitted ? (
                        <>
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>አንብብ</span>
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
