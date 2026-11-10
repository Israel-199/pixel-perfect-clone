import React, { useState } from "react";
import { X, Lock, CheckCircle2, Send, CreditCard, BookOpen, PlayCircle, Music } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(book?.requestStatus || "NONE");

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
    window.open("https://t.me/rabbi_admin", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Cover Column */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[220px] md:max-w-none aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-gold/20 bg-navy/5">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 rounded-full bg-navy-deep/80 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold border border-gold/40 flex items-center gap-1.5">
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

            <div className="mt-3 sm:mt-4 w-full text-center">
              <span className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
                {book.price > 0 ? `${book.price} ETB` : "ነፃ (Free)"}
              </span>
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
                <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-gold" />
                  የነፃ ናሙና ንባብ (4-5 Sample Pages)
                </h4>
                <div className="max-h-36 overflow-y-auto pr-2 text-xs text-navy/80 whitespace-pre-line leading-relaxed font-sans scrollbar-thin">
                  {book.sampleContent && !book.sampleContent.startsWith("http")
                    ? book.sampleContent
                    : "የተዘጋጀ የተጠበቀ የዲጂታል ፒዲኤፍ መጽሐፍ (PDF Book)። ክፍያውን ፈጽመው አስተዳዳሪው ሲያጸድቅልዎ ሙሉውን መጽሐፍ በከፍተኛ ጥራት በዲጂታል አንባቢው ማንበብ ይችላሉ።"}
                </div>
              </div>

              {/* Bank Details Box */}
              <div className="mb-5 rounded-xl bg-gold/10 p-4 border border-gold/30">
                <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-gold" />
                  ክፍያ መፈጸሚያ (CBE Bank Transfer)
                </h4>
                <div className="text-xs text-navy space-y-1">
                  <p><span className="font-semibold">ባንክ:</span> ኢትዮጵያ ንግድ ባንክ (CBE)</p>
                  <p><span className="font-semibold">የሂሳብ ቁጥር:</span> <code className="bg-gold/20 px-1.5 py-0.5 rounded font-mono font-bold text-navy-deep">1000123456789</code></p>
                  <p><span className="font-semibold">የሂሳብ ስም:</span> RABBI Ministry / መጋቢ ካስሁብ</p>
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
                  <span>አሁን ያንብቡ / ሙሉ ይዘት ክፈት</span>
                </button>
              ) : currentStatus === "PENDING" ? (
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/40 px-5 py-2.5 text-sm font-semibold text-amber-700">
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
                    onClick={handleRequestAccess}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{loading ? "በመላክ ላይ..." : "መጽሐፉን ጠይቅ (Request Access)"}</span>
                  </button>

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
  );
};
