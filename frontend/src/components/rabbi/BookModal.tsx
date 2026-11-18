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
  const [docxSamplePages, setDocxSamplePages] = useState<string[]>([]);
  const [docxPageIndex, setDocxPageIndex] = useState<number>(0);
  const [docxLoading, setDocxLoading] = useState<boolean>(false);

  // ── Accurate DOCX / PDF Page Count & Lossless Sample Extraction ────────────
  useEffect(() => {
    if (!book) return;
    const content = (book.fullContent || book.sampleContent || "").trim();
    const isDocx = /\.docx?(\?|$)/i.test(content);
    const isPdfUrl = (content.startsWith("http://") || content.startsWith("https://") || content.includes(".pdf")) && !isDocx;

    if (isDocx && (content.startsWith("http://") || content.startsWith("https://"))) {
      setDocxLoading(true);
      parseDocx(content)
        .then((analysis) => {
          setPageCount(analysis.pageCount);
          setDocxSamplePages(analysis.pages);
        })
        .catch((e) => {
          console.error("BookModal docx parse error:", e);
        })
        .finally(() => {
          setDocxLoading(false);
        });
    } else if (isPdfUrl) {
      getPdfPageCount(content).then((cnt) => {
        if (cnt > 0) setPageCount(cnt);
      });
    } else if (content) {
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
                {pageCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-navy border border-gold/30">
                    <FileText className="h-3.5 w-3.5 text-gold" />
                    <span>{pageCount} {pageCount === 1 ? "ገጽ (1 Page)" : `ገጾች (${pageCount} Pages)`}</span>
                  </div>
                )}

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
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{book.description}</p>

              {/* Sample Content Section */}
              <div className="mb-5 rounded-xl bg-navy-deep/5 p-4 border border-navy/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-gold" />
                    <span>የነፃ ናሙና ንባብ (Sample Preview)</span>
                    {docxSamplePages.length > 0 && (
                      <span className="text-[11px] font-mono text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                        ገጽ {docxPageIndex + 1} / {docxSamplePages.length}
                      </span>
                    )}
                  </h4>
                  {docxSamplePages.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={docxPageIndex <= 0}
                        onClick={() => setDocxPageIndex((p) => Math.max(0, p - 1))}
                        className="px-2 py-0.5 text-xs font-bold rounded bg-gold/20 text-gold hover:bg-gold hover:text-navy-deep disabled:opacity-40 cursor-pointer"
                        title="ቀዳሚ ገጽ"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        disabled={docxPageIndex >= docxSamplePages.length - 1}
                        onClick={() => setDocxPageIndex((p) => Math.min(docxSamplePages.length - 1, p + 1))}
                        className="px-2 py-0.5 text-xs font-bold rounded bg-gold/20 text-gold hover:bg-gold hover:text-navy-deep disabled:opacity-40 cursor-pointer"
                        title="ቀጣይ ገጽ"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto pr-2 text-xs text-navy/85 leading-relaxed font-sans scrollbar-thin">
                  {docxLoading ? (
                    <div className="py-4 text-center text-xs text-gold flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                      <span>የDOCX ገጾችን በማዘጋጀት ላይ...</span>
                    </div>
                  ) : docxSamplePages.length > 0 ? (
                    <div className="text-justify leading-relaxed space-y-3 font-sans">
                      {(docxSamplePages[docxPageIndex] || "").split(/\r?\n\s*\r?\n/).map((para, pIdx) => (
                        <p key={pIdx} className="mb-3 text-navy/90 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : book.sampleContent && !book.sampleContent.startsWith("http") ? (
                    <div className="text-justify leading-relaxed space-y-3 font-sans">
                      {book.sampleContent.split(/\r?\n\s*\r?\n/).map((para, pIdx) => (
                        <p key={pIdx} className="mb-3 text-navy/90 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : /\.docx?(\?|$)/i.test(book.fullContent || "") ? (
                    "የተዘጋጀ የተጠበቀ የዲጂታል ዎርድ / DOCX መጽሐፍ (Word/DOCX Book)። ክፍያውን ፈጽመው አስተዳዳሪው ሲያጸድቅልዎ ሙሉውን መጽሐፍ በከፍተኛ ጥራት በዲጂታል አንባቢው ማንበብ ይችላሉ።"
                  ) : (
                    "የተዘጋጀ የተጠበቀ የዲጂታል ፒዲኤፍ መጽሐፍ (PDF Book)። ክፍያውን ፈጽመው አስተዳዳሪው ሲያጸድቅልዎ ሙሉውን መጽሐፍ በከፍተኛ ጥራት በዲጂታል አንባቢው ማንበብ ይችላሉ።"
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
                  <p><span className="font-semibold">{t("accountNumber")}</span> <code className="bg-gold/20 px-1.5 py-0.5 rounded font-mono font-bold text-navy-deep">1000123456789</code></p>
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
