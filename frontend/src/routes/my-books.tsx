import React, { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Lock, CheckCircle2, Clock, XCircle, Send, PlayCircle, PlusCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { fetchApi } from "@/lib/api";
import { BookItem } from "@/components/rabbi/BookModal";
import { PlatformReader } from "@/components/rabbi/PlatformReader";

export const Route = createFileRoute("/my-books")({
  component: MyBooksRoute,
});

interface UserRequestItem {
  id: string;
  status: "PENDING" | "PERMITTED" | "REJECTED";
  createdAt: string;
  book: BookItem;
}

function MyBooksRoute() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<UserRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Reader Modal State
  const [selectedBookForReader, setSelectedBookForReader] = useState<BookItem | null>(null);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ requests: UserRequestItem[] }>("/requests/my");
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message || "የእርስዎን መጽሐፍት ማምጣት አልተሳካም።");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    window.open("https://t.me/rabbidigitals", "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
      return;
    }
    if (user) {
      fetchMyRequests();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm font-medium text-navy">መረጃ በማምጣት ላይ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 md:px-6">
      {/* Top Banner */}
      <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-r from-navy-deep via-navy to-navy-deep p-5 sm:p-8 text-white shadow-xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gold">የእኔ መጽሃፎችና ሚዲያዎች</h1>
          <p className="mt-1 text-xs sm:text-sm text-on-navy-muted leading-relaxed">
            እንኳን ደህና መጡ {user?.fullName || user?.email}! የጠየቋቸውንና የገዟቸውን መንፈሳዊ መጽሐፍት እዚህ ያገኛሉ።
          </p>
        </div>
        <Link
          to="/books"
          className="flex items-center gap-2 rounded-xl bg-gold px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-navy-deep hover:bg-gold/90 shadow transition-all shrink-0 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>ተጨማሪ መጽሐፍት ይመልከቱ</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-gold/20 bg-card p-8 sm:p-12 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-navy font-display mb-1">እስካሁን ምንም የጠየቁት መጽሐፍ የለም</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6">
            የሚፈልጉትን መንፈሳዊ መጽሐፍ ወይም ትምህርት ከመጽሐፍት ዝርዝር ውስጥ መርጠው መጠየቅ ይችላሉ።
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-navy-deep hover:bg-gold/90 transition-all shadow"
          >
            <BookOpen className="h-4 w-4" />
            <span>ወደ መጽሐፍት ዝርዝር ሂድ</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {requests.map((item) => {
            const isPermitted = item.status === "PERMITTED";
            const isPending = item.status === "PENDING";
            const isRejected = item.status === "REJECTED";

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl bg-card border border-gold/20 shadow-card hover:shadow-xl transition-all overflow-hidden"
              >
                <div>
                  {/* Image & Status Badge */}
                  {/* Cover Image — aspect-[3/4] & object-contain so cover is never cut */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-navy/5 flex items-center justify-center p-2">
                    <img
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      className="h-full w-full object-contain rounded-lg"
                    />
                    <div className="absolute top-3 right-3">
                      {isPermitted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>ተፈቅዷል (Paid)</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <Clock className="h-3.5 w-3.5" />
                          <span>በመጠባበቅ ላይ (Pending)</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>ተሰርዟል (Rejected)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-navy font-display line-clamp-1 mb-1">
                      {item.book.title}
                    </h3>
                    <p className="text-xs text-gold font-semibold mb-2">
                      ደራሲ: {item.book.author || "RABBI"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {item.book.description}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  {isPermitted ? (
                    <button
                      onClick={() => setSelectedBookForReader(item.book)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 shadow transition-all active:scale-[0.98]"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{t("readFullAccessBtn")}</span>
                    </button>
                  ) : isPending ? (
                    <div className="space-y-2">
                      <div className="text-[0.72rem] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                        {t("pendingReviewNotice")}
                      </div>
                      <button
                        type="button"
                        onClick={handleSendReceipt}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{t("sendReceiptBtn")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center font-medium">
                      {t("rejectedNotice")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Protected Reader Modal Component */}
      {selectedBookForReader && (
        <PlatformReader
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
        />
      )}
    </div>
  );
}
