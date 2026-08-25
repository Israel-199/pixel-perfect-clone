import React, { useEffect, useState } from "react";
import { X, Lock, BookOpen, Sun, Moon, Type, ShieldCheck, PlayCircle, Music } from "lucide-react";
import { BookItem } from "./BookModal";

interface PlatformReaderProps {
  book: BookItem;
  onClose: () => void;
}

export const PlatformReader: React.FC<PlatformReaderProps> = ({ book, onClose }) => {
  const [theme, setTheme] = useState<"cream" | "dark" | "sepia">("cream");
  const [fontSize, setFontSize] = useState<number>(18);

  // Security Hardening: Block text selection, right click, copy/print keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+A, Ctrl+P, Ctrl+S, Ctrl+U, F12
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "a", "p", "s", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        alert("ይዘትን መቅዳት፣ ማተም ወይም ማስቀመጥ አይፈቀድም። (Copying and printing are disabled)");
      }
      if (e.key === "F12" || e.key === "PrintScreen") {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    // Dynamic Print Prevention CSS
    const style = document.createElement("style");
    style.id = "prevent-print-css";
    style.innerHTML = "@media print { body { display: none !important; } }";
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      const existing = document.getElementById("prevent-print-css");
      if (existing) existing.remove();
    };
  }, []);

  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-slate-950 text-slate-100 border-slate-800";
      case "sepia":
        return "bg-[#fbf0d9] text-[#5f4b32] border-[#e6d5b8]";
      default:
        return "bg-[#fdfbf7] text-slate-900 border-gold/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy-deep text-white select-none">
      {/* Security Banner Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-navy-deep border-b border-gold/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gold/20 p-2 text-gold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-gold">{book.title}</h3>
            <p className="text-xs text-on-navy-muted">
              {book.author || "RABBI"} • የተጠበቀ ይዘት (Protected Reader)
            </p>
          </div>
        </div>

        {/* Reader Customization Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-navy/40 p-1 border border-gold/20">
            <button
              onClick={() => setTheme("cream")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                theme === "cream" ? "bg-gold text-navy-deep font-bold" : "text-on-navy-muted"
              }`}
            >
              ብርሃናማ
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                theme === "sepia" ? "bg-[#e6d5b8] text-[#5f4b32] font-bold" : "text-on-navy-muted"
              }`}
            >
              ሴፒያ
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                theme === "dark" ? "bg-slate-800 text-gold font-bold" : "text-on-navy-muted"
              }`}
            >
              ጨለማ
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-navy/40 px-2 py-1 border border-gold/20">
            <Type className="h-4 w-4 text-gold" />
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="px-2 text-xs font-bold text-gold hover:opacity-80"
            >
              A-
            </button>
            <span className="text-xs text-white font-mono px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(32, s + 2))}
              className="px-2 text-xs font-bold text-gold hover:opacity-80"
            >
              A+
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-4 py-2 text-xs font-bold text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            <X className="h-4 w-4" />
            <span>ዝጋ (Close)</span>
          </button>
        </div>
      </header>

      {/* Reader Content Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 flex justify-center bg-navy-deep/95">
        <div
          className={`w-full max-w-4xl rounded-2xl p-6 md:p-12 shadow-2xl border transition-all ${getThemeClasses()}`}
          style={{ fontSize: `${fontSize}px`, userSelect: "none" }}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {/* Media Player Section if Video/Audio */}
          {book.videoUrl && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-gold/30 aspect-video bg-black">
              <iframe
                src={book.videoUrl}
                title={book.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {book.audioUrl && (
            <div className="mb-8 rounded-xl bg-gold/15 p-4 border border-gold/40 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gold">
                <Music className="h-5 w-5" />
                <span>የድምፅ ትምህርት ያዳምጡ</span>
              </div>
              <audio controls className="w-full">
                <source src={book.audioUrl} type="audio/mpeg" />
                የእርስዎ ብราวዘር ኦዲዮ ማጫወት አይችልም።
              </audio>
            </div>
          )}

          {/* Book Text Content */}
          <div className="font-serif leading-relaxed whitespace-pre-line text-justify selection:bg-none">
            {book.fullContent || book.sampleContent || "የይዘት መረጃ አልተገኘም።"}
          </div>

          <div className="mt-12 pt-6 border-t border-current/20 text-center text-xs opacity-60">
            © RABBI Ministry — በስርዓቱ ላይ ብቻ እንዲነበብ የተፈቀደ። ቅጂ ማሰራጨት የተከለከለ ነው።
          </div>
        </div>
      </main>
    </div>
  );
};
