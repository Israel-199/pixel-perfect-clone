import React, { useState, useEffect } from "react";
import { X, Lock, CheckCircle2, Send, CreditCard, BookOpen, PlayCircle, Music, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { formatEtbWithUsd, estimateTextPageCount, getPdfPageCount, parseDocx } from "@/lib/bookUtils";

export interface BookItem {
  id: string;
  title: string;
  author?: string;
  description?: string;
  price: number;
  coverUrl: string;
  mediaType: string;
  sampleContent?: string;
  fullContent?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  requestStatus?: string;
  isPermitted?: boolean;
}

interface BookModalProps {
  book: BookItem | null;
  onClose: () => void;
  onRequestSubmitted?: () => void;
  onOpenReader?: (book: BookItem) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  book,
  onClose,
  onRequestSubmitted,
  onOpenReader,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(book?.requestStatus || "NONE");
  const [pageCount, setPageCount] = useState<number>(0);

  // ── Accurate Page Count Estimation ──────────────────────────────────────────
  useEffect(() => {
    if (!book) return;
    const content = (book.fullContent || book.sampleContent || "").trim();
    const isDocx = /\.docx?(\?|$)/i.test(content);
    const isPdfUrl = (content.startsWith("http://") || content.startsWith("https://") || content.includes(".pdf")) && !isDocx;

    if (isPdfUrl) {
      getPdfPageCount(content).then((cnt) => {
        if (cnt > 0) setPageCount(cnt);
      });
    } else if (isDocx) {
      parseDocx(content)
        .then((analysis) => {
          if (analysis && analysis.pageCount > 0) {
            setPageCount(analysis.pageCount);
          }
        })
        .catch((e) => {
          console.warn("Docx modal page count notice:", e);
        });
    } else if (content && !content.startsWith("http")) {
      const cnt = estimateTextPageCount(content);
      setPageCount(cnt);
    }
  }, [book]);

  if (!book) return null;

  const handleRequestAccess = async () => {
    if (!user) {
      onClose();
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetchApi<{ message: string; request: any }>("/requests", {
        method: "POST",
        body: JSON.stringify({ bookId: book.id }),
      });

      setCurrentStatus("PENDING");
      setSuccessMsg("የመጽሐፍ ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ክፍያዎ ሲረጋገጥ አድሚን ይፈቅድልዎታል።");
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || "ጥያቄ መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = () => {
    if (!user) {
      onClose();
      navigate({ to: "/login" });
      return;
    }
    window.open("https://t.me/rabbidigitals", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-1 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            {/* Cover Column */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] md:max-w-none rounded-xl overflow-hidden shadow-xl border border-gold/25 bg-navy/5 flex items-center justify-center p-1.5">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto max-h-[380px] object-contain rounded-lg shadow-sm pointer-events-none"
                />
                <div className="absolute top-3 right-3 rounded-full bg-navy-deep/85 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold border border-gold/40 flex items-center gap-1.5 shadow-md">
                  {book.mediaType === "VIDEO" ? (
                    <PlayCircle className="h-3.5 w-3.5" />
                  ) : book.mediaType === "AUDIO" ? (
                    <Music className="h-3.5 w-3.5" />
                  ) : (
                    <BookOpen className="h-3.5 w-3.5" />
                  )}
                  <span>{book.mediaType}</span>
                </div>
              </div>

              {/* Page Number & Price Conversion */}
              <div className="mt-3.5 sm:mt-4 w-full flex flex-col items-center text-center gap-1.5 bg-navy-deep/5 border border-gold/20 rounded-xl p-3">
                {/* Accurate Page Count Badge above price */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-navy border border-gold/30">
                  <FileText className="h-3.5 w-3.5 text-gold" />
                  <span>
                    {(pageCount > 0 ? pageCount : 1)} {(pageCount > 0 ? pageCount : 1) === 1 ? "ገጽ (1 Page)" : `ገጾች (${pageCount > 0 ? pageCount : 1} Pages)`}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-extrabold text-navy-deep font-display">
                    {formatEtbWithUsd(book.price).etbText}
                  </span>
                  {book.price > 0 && (
                    <span className="text-xs sm:text-sm font-bold text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/30 mt-0.5">
                      {formatEtbWithUsd(book.price).usdText}
                    </span>
                  )}
                </div>
              </div>
            </div>

          {/* Details Column */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-navy font-display mb-1">{book.title}</h2>
              <p className="text-sm text-gold font-medium mb-3">ደራሲ / መጋቢ: {book.author || "RABBI"}</p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap break-words">{book.description}</p>

              {/* Sample Content Section - Only display text typed by admin preserving every horizontal & vertical space */}
              <div className="mb-5 rounded-xl bg-navy-deep/5 p-4 border border-navy/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-gold" />
                    <span>{t("samplePreview")}</span>
                  </h4>
                </div>

                <div className="max-h-56 overflow-y-auto pr-2 text-xs text-navy/85 leading-relaxed font-sans scrollbar-thin">
                  {book.sampleContent && !book.sampleContent.startsWith("http://") && !book.sampleContent.startsWith("https://") ? (
                    <div className="whitespace-pre-wrap break-words font-sans text-navy/90 leading-relaxed">
                      {book.sampleContent}
                    </div>
                  ) : book.description ? (
                    <div className="whitespace-pre-wrap break-words font-sans text-navy/90 leading-relaxed">
                      {book.description}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {t("samplePreview")}
                    </p>
                  )}
                </div>
              </div>

              {/* Bank Details Box */}
              <div className="mb-5 rounded-xl bg-gold/10 p-4 border border-gold/30">
                <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-gold" />
                  {t("cbeBankTransfer")}
                </h4>
                <div className="text-xs text-navy space-y-1">
                  <p><span className="font-semibold">{t("bankTitle")}</span> {t("bankCbeName")}</p>
                  <p><span className="font-semibold">{t("accountNumber")}</span> <code className="bg-gold/20 px-1.5 py-0.5 rounded font-mono font-bold text-navy-deep">1000313542002</code></p>
                  <p><span className="font-semibold">{t("accountHolder")}</span> Kaleb Mesfin</p>
                </div>
              </div>
            </div>

            {/* Actions & Status */}
            <div>
              {errorMsg && (
                <div className="mb-3 rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-3 rounded-md bg-green-50 p-2.5 text-xs text-green-800 border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Status Display or Request Action */}
              {book.isPermitted || currentStatus === "PERMITTED" ? (
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReader) onOpenReader(book);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{t("readNowFull")}</span>
                </button>
              ) : currentStatus === "PENDING" ? (
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/40 px-5 py-2.5 text-sm font-semibold text-amber-700">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span>{t("requestPendingStatus")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendReceipt}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <Send className="h-4 w-4" />
                    <span>{t("sendReceiptBtn")}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={handleRequestAccess}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{loading ? t("requestAccessSending") : t("requestBookAccess")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendReceipt}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-navy-deep/5 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gold/10 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <Send className="h-4 w-4 text-gold" />
                    <span>{t("sendReceiptBtn")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
