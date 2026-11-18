import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  X,
  BookOpen,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Columns,
  Type,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { BookItem } from "./BookModal";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { filterNumberInput } from "@/lib/inputValidation";
import { parseDocx } from "@/lib/bookUtils";

interface PlatformReaderProps {
  book: BookItem;
  onClose: () => void;
}

interface ChapterItem {
  id: number;
  title: string;
  startPage: number;
  startPageLabel?: string | undefined;
}

interface BookPage {
  pageNumber: number;
  chapterTitle: string;
  text: string;
}

export const PlatformReader: React.FC<PlatformReaderProps> = ({ book, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Reader Settings
  const [theme, setTheme] = useState<"cream" | "dark" | "sepia" | "midnight">("cream");
  const [fontSize, setFontSize] = useState<number>(18);
  const [twoPageView, setTwoPageView] = useState<boolean>(false);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [pinToc, setPinToc] = useState<boolean>(false);
  const [tocTab, setTocTab] = useState<"chapters" | "pages">("chapters");
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>("1");

  // ── Screenshot / DRM security state ─────────────────────────────────────────
  // isScreenBlackout drives the React-rendered full-black overlay
  // isBlackoutActiveRef is read synchronously in the RAF loop & event handlers
  const [isScreenBlackout, setIsScreenBlackout] = useState<boolean>(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const isBlackoutActiveRef = useRef<boolean>(false);
  const blackoutTimerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  // ── Mobile Touch Guard (Hardware Screenshot Prevention) ─────────────────────
  // Physical buttons (Power + VolDown) on mobile phones do not trigger key events.
  // The Touch Guard ensures book content is only visible while the user is actively
  // touching/holding the screen. If fingers lift to press screenshot buttons,
  // the content instantly blurs and covers.
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isTouchReading, setIsTouchReading] = useState<boolean>(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  // ── Reader refs ─────────────────────────────────────────────────────────────
  const readerRef = useRef<HTMLDivElement | null>(null);
  const contentAreaRef = useRef<HTMLDivElement | null>(null);

  // ── Video detection ─────────────────────────────────────────────────────────
  const isVideo = useMemo(() => {
    if (book.mediaType === "VIDEO") return true;
    if (book.videoUrl && !book.fullContent) return true;
    const content = (book.fullContent || "").trim();
    if (
      content.includes("youtube.com") ||
      content.includes("youtu.be") ||
      content.includes("vimeo.com") ||
      /\.(mp4|webm|ogg|mov)(\?|$)/i.test(content)
    ) {
      return true;
    }
    return false;
  }, [book.mediaType, book.videoUrl, book.fullContent]);

  // ── DOCX detection ──────────────────────────────────────────────────────────
  const { isDocx, docxUrl } = useMemo(() => {
    if (isVideo) return { isDocx: false, docxUrl: null };

    const fc = (book.fullContent || "").trim();
    const sc = (book.sampleContent || "").trim();

    const targetUrl =
      fc.startsWith("http://") || fc.startsWith("https://")
        ? fc
        : sc.startsWith("http://") || sc.startsWith("https://")
        ? sc
        : null;

    if (targetUrl && /\.docx?(\?|$)/i.test(targetUrl)) {
      return { isDocx: true, docxUrl: targetUrl };
    }

    if (/\.docx?(\?|$)/i.test(fc)) {
      return { isDocx: true, docxUrl: fc };
    }

    return { isDocx: false, docxUrl: null };
  }, [isVideo, book.fullContent, book.sampleContent]);

  // ── PDF detection ───────────────────────────────────────────────────────────
  const { isPdf, pdfUrl } = useMemo(() => {
    if (isVideo || isDocx) return { isPdf: false, pdfUrl: null };

    const fc = (book.fullContent || "").trim();
    const sc = (book.sampleContent || "").trim();

    // Any URL in fullContent or sampleContent → treat as PDF if not docx
    const detectedUrl =
      fc.startsWith("http://") || fc.startsWith("https://")
        ? fc
        : sc.startsWith("http://") || sc.startsWith("https://")
        ? sc
        : null;

    if (detectedUrl) {
      if (/\.docx?(\?|$)/i.test(detectedUrl)) {
        return { isPdf: false, pdfUrl: null };
      }
      return { isPdf: true, pdfUrl: detectedUrl };
    }

    if (
      fc.includes(".pdf") ||
      fc.includes("/pdf/") ||
      fc.includes("raw/upload") ||
      fc.includes("cloudinary.com") ||
      book.mediaType === "PDF"
    ) {
      return { isPdf: true, pdfUrl: fc };
    }

    return { isPdf: false, pdfUrl: null };
  }, [isVideo, isDocx, book.fullContent, book.sampleContent, book.mediaType]);

  // ── DOCX state ──────────────────────────────────────────────────────────────
  const [docxLoading, setDocxLoading] = useState<boolean>(false);
  const [docxError, setDocxError] = useState<string | null>(null);
  const [docxText, setDocxText] = useState<string>("");
  const [docxPages, setDocxPages] = useState<string[]>([]);

  useEffect(() => {
    if (!isDocx || !docxUrl) return;
    let isMounted = true;
    setDocxLoading(true);
    setDocxError(null);

    const loadDocx = async () => {
      try {
        const analysis = await parseDocx(docxUrl);
        if (!isMounted) return;
        setDocxText(analysis.fullText);
        setDocxPages(analysis.pages);
        setDocxLoading(false);
      } catch (err: any) {
        console.error("DOCX loading error:", err);
        if (isMounted) {
          setDocxError(err?.message || "የDOCX ፋይልን ማዘጋጀት አልተቻለም።");
          setDocxLoading(false);
        }
      }
    };

    loadDocx();
    return () => {
      isMounted = false;
    };
  }, [isDocx, docxUrl]);

  // ── PDF.js state ─────────────────────────────────────────────────────────────
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPageLabels, setPdfPageLabels] = useState<string[] | null>(null);
  const [pdfOutlineChapters, setPdfOutlineChapters] = useState<ChapterItem[]>([]);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfCanvasRef2 = useRef<HTMLCanvasElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  // Video overlay refs — canvas stream is piped into these so Android Chrome
  // shows black in OS-level screenshots (video compositor path is excluded from
  // Android's screenshot framebuffer capture).
  const pdfVideoRef = useRef<HTMLVideoElement | null>(null);
  const pdfVideoRef2 = useRef<HTMLVideoElement | null>(null);

  // Exact Page Label helper (uses Roman or customized numbering if present in PDF)
  const getPageLabel = useCallback(
    (pageNo: number): string => {
      if (isPdf && pdfPageLabels && pdfPageLabels[pageNo - 1]) {
        return String(pdfPageLabels[pageNo - 1]);
      }
      return String(pageNo);
    },
    [isPdf, pdfPageLabels]
  );

  // ── Video player state ───────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // ============================================================================
  // 1. TEXT PARSER & LOSSLESS PAGINATION (Preserves 100% of words and formatting)
  // ============================================================================
  const { chapters, pages, totalTextPages } = useMemo(() => {
    if (isPdf) return { chapters: [], pages: [], totalTextPages: 0 };

    // For DOCX files: use the lossless pages with preserved gaps and true page count!
    if (isDocx && docxPages.length > 0) {
      const generatedPages: BookPage[] = docxPages.map((pageText, idx) => ({
        pageNumber: idx + 1,
        chapterTitle: book.title,
        text: pageText,
      }));
      return {
        chapters: [{ id: 1, title: book.title, startPage: 1 }],
        pages: generatedPages,
        totalTextPages: generatedPages.length,
      };
    }

    const rawText = (docxText || book.fullContent || book.sampleContent || "").trim();
    if (!rawText) {
      return {
        chapters: [{ id: 1, title: "መግቢያ", startPage: 1 }],
        pages: [{ pageNumber: 1, chapterTitle: "መግቢያ", text: docxLoading ? "የDOCX ፋይል ይዘት በመጫን ላይ..." : "የይዘት መረጃ አልተገኘም።" }],
        totalTextPages: 1,
      };
    }

    // Comprehensive chapter delimiter for Amharic and English books
    const chapterDelimiter =
      /(?:(?:\r?\n)+(?=(?:#+\s*|ክፍል|ምዕራፍ|ትምህርት|Chapter|Part|Section|Unit)\s*(?:[0-9]+|[፩-፱]+|[A-Z]+)?[:\s\-—]))/i;
    let rawChapters = rawText.split(chapterDelimiter).filter((c) => c.trim().length > 0);

    // If no explicit chapter headers exist but text is substantial (>1200 words),
    // automatically organize into readable parts for the left sidebar index
    if (rawChapters.length <= 1) {
      const allParas = rawText.split(/\r?\n+/).filter(p => p.trim().length > 0);
      const totalWords = rawText.split(/\s+/).filter(Boolean).length;
      if (totalWords > 1200 && allParas.length > 4) {
        rawChapters = [];
        let currentChunk: string[] = [];
        let chunkWords = 0;
        let partIdx = 1;

        allParas.forEach((p) => {
          const w = p.split(/\s+/).filter(Boolean).length;
          currentChunk.push(p);
          chunkWords += w;
          if (chunkWords >= 1000) {
            rawChapters.push(`ክፍል ${partIdx++}\n\n` + currentChunk.join("\n\n"));
            currentChunk = [];
            chunkWords = 0;
          }
        });
        if (currentChunk.length > 0) {
          rawChapters.push(`ክፍል ${partIdx}\n\n` + currentChunk.join("\n\n"));
        }
      }
    }

    if (rawChapters.length === 0) {
      rawChapters = [rawText];
    }

    const generatedChapters: ChapterItem[] = [];
    const generatedPages: BookPage[] = [];
    let pageCounter = 1;
    const TARGET_WORDS_PER_PAGE = 260;

    rawChapters.forEach((chapText, cIdx) => {
      const trimmedChap = chapText.trim();
      const lines = trimmedChap.split(/\r?\n/).filter(Boolean);
      let chapTitle = `ምዕራፍ ${cIdx + 1}`;
      if (lines[0] && lines[0].length < 100) {
        chapTitle = lines[0].replace(/^#+\s*/, "").trim();
      }

      generatedChapters.push({ id: cIdx + 1, title: chapTitle, startPage: pageCounter });

      // Split chapter into natural paragraphs
      const paragraphs = trimmedChap.split(/\r?\n\s*\r?\n/);
      let currentPageParas: string[] = [];
      let currentPageWordCount = 0;

      const flushPage = () => {
        if (currentPageParas.length > 0) {
          generatedPages.push({
            pageNumber: pageCounter++,
            chapterTitle: chapTitle,
            text: currentPageParas.join("\n\n").trim(),
          });
          currentPageParas = [];
          currentPageWordCount = 0;
        }
      };

      paragraphs.forEach((para) => {
        const cleanPara = para.trim();
        if (!cleanPara) return;

        const words = cleanPara.split(/\s+/).filter(Boolean);

        // If a single paragraph is longer than TARGET_WORDS_PER_PAGE, split cleanly into pages without losing any words
        if (words.length > TARGET_WORDS_PER_PAGE) {
          flushPage();

          // Chunk words across pages so NO words are ever removed or lost
          for (let i = 0; i < words.length; i += TARGET_WORDS_PER_PAGE) {
            const chunkWords = words.slice(i, i + TARGET_WORDS_PER_PAGE).join(" ");
            generatedPages.push({
              pageNumber: pageCounter++,
              chapterTitle: chapTitle,
              text: chunkWords,
            });
          }
          return;
        }

        if (currentPageWordCount + words.length > TARGET_WORDS_PER_PAGE && currentPageParas.length > 0) {
          flushPage();
        }

        currentPageParas.push(cleanPara);
        currentPageWordCount += words.length;
      });

      flushPage();
    });

    if (generatedPages.length === 0) {
      generatedPages.push({ pageNumber: 1, chapterTitle: book.title, text: rawText });
    }

    return { chapters: generatedChapters, pages: generatedPages, totalTextPages: generatedPages.length };
  }, [book.fullContent, book.sampleContent, book.title, isPdf, isDocx, docxText, docxPages, docxLoading]);

  const totalPages = isPdf ? pdfNumPages : totalTextPages;

  // ── Unified Table of Contents Chapters (combines PDF outline / labels / text chapters) ──
  const effectiveChapters: ChapterItem[] = useMemo(() => {
    if (isPdf) {
      if (pdfOutlineChapters.length > 0) {
        return pdfOutlineChapters;
      }

      // If PDF has custom page labels (e.g. Roman numerals for preface and 1,2,3 for content)
      if (pdfPageLabels && pdfPageLabels.length > 0) {
        const generated: ChapterItem[] = [];
        let firstRomanIdx = -1;
        let firstNumericIdx = -1;

        pdfPageLabels.forEach((lbl, idx) => {
          if (/^[ivxlcdm]+$/i.test(lbl) && firstRomanIdx === -1) {
            firstRomanIdx = idx;
          } else if (/^\d+$/.test(lbl) && firstNumericIdx === -1) {
            firstNumericIdx = idx;
          }
        });

        if (firstRomanIdx !== -1) {
          generated.push({
            id: 1,
            title: "መግቢያና ማውጫ (Preface / Intro)",
            startPage: firstRomanIdx + 1,
            startPageLabel: pdfPageLabels[firstRomanIdx],
          });
        }
        if (firstNumericIdx !== -1) {
          generated.push({
            id: generated.length + 1,
            title: "ዋናው ይዘት (Main Content)",
            startPage: firstNumericIdx + 1,
            startPageLabel: pdfPageLabels[firstNumericIdx],
          });
        }
        if (generated.length > 0) return generated;
      }

      // Fallback for PDF: group by sections of 10-20 pages
      if (pdfNumPages > 0) {
        const step = pdfNumPages > 40 ? 20 : 10;
        const generated: ChapterItem[] = [];
        for (let p = 1; p <= pdfNumPages; p += step) {
          const endP = Math.min(pdfNumPages, p + step - 1);
          generated.push({
            id: generated.length + 1,
            title: `ክፍል ${generated.length + 1} (ገጽ ${getPageLabel(p)} - ${getPageLabel(endP)})`,
            startPage: p,
            startPageLabel: getPageLabel(p),
          });
        }
        return generated;
      }
      return [];
    }
    return chapters;
  }, [isPdf, pdfOutlineChapters, pdfPageLabels, pdfNumPages, chapters, getPageLabel]);

  // ============================================================================
  // 2. PDF.JS BINARY LOADER
  // ============================================================================
  useEffect(() => {
    if (!isPdf || !pdfUrl) return;
    let isMounted = true;
    setPdfLoading(true);
    setPdfError(null);

    const loadPdfJs = async () => {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("PDF.js failed to load"));
            document.head.appendChild(script);
          });
        }

        const pdfjs = (window as any).pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // Fetch as binary to bypass Cloudinary's application/octet-stream MIME
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Data = new Uint8Array(arrayBuffer);

        const loadingTask = pdfjs.getDocument({
          data: uint8Data,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const loadedPdf = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setPdfNumPages(loadedPdf.numPages);

        // 1. Fetch exact PDF Page Labels (e.g. ['i', 'ii', 'iii', '1', '2', ...])
        let pageLabels: string[] | null = null;
        try {
          pageLabels = await loadedPdf.getPageLabels();
          if (isMounted && pageLabels && pageLabels.length > 0) {
            setPdfPageLabels(pageLabels);
          }
        } catch (e) {
          console.warn("Could not retrieve PDF page labels:", e);
        }

        // 2. Fetch exact PDF Outline / Bookmarks for Table of Contents ("ማውጫ")
        try {
          const outline = await loadedPdf.getOutline();
          if (isMounted && outline && outline.length > 0) {
            const parsedOutlineChapters: ChapterItem[] = [];

            const traverseOutline = async (items: any[]) => {
              for (const item of items) {
                let dest = item.dest;
                if (typeof dest === "string") {
                  try {
                    dest = await loadedPdf.getDestination(dest);
                  } catch (e) {}
                }
                if (Array.isArray(dest)) {
                  try {
                    const pageIndex = await loadedPdf.getPageIndex(dest[0]);
                    const pageNumber = pageIndex + 1;
                    const pageLabel =
                      pageLabels && pageLabels[pageIndex]
                        ? pageLabels[pageIndex]
                        : String(pageNumber);

                    parsedOutlineChapters.push({
                      id: parsedOutlineChapters.length + 1,
                      title: item.title,
                      startPage: pageNumber,
                      startPageLabel: pageLabel,
                    });
                  } catch (e) {}
                }
                if (item.items && item.items.length > 0) {
                  await traverseOutline(item.items);
                }
              }
            };

            await traverseOutline(outline);
            if (isMounted && parsedOutlineChapters.length > 0) {
              setPdfOutlineChapters(parsedOutlineChapters);
            }
          }
        } catch (e) {
          console.warn("Could not retrieve PDF outline:", e);
        }

        setPdfLoading(false);
      } catch (err: any) {
        console.error("PDF loading error:", err);
        if (isMounted) {
          setPdfError(err?.message || "የመጽሐፉን ገጾች ማዘጋጀት አልተቻለም።");
          setPdfLoading(false);
        }
      }
    };

    loadPdfJs();
    return () => { isMounted = false; };
  }, [isPdf, pdfUrl]);

  // ── Forensic Watermark Label (removed) ───────────────────────────────────────

  // ============================================================================
  // 3. PDF CANVAS RENDERER — fills container width, no shrinking
  // ============================================================================
  const renderPdfPage = useCallback(
    async (pageNo: number, canvas: HTMLCanvasElement | null, videoEl?: HTMLVideoElement | null) => {
      if (!pdfDoc || !canvas) return;
      try {
        const page = await pdfDoc.getPage(pageNo);
        const baseViewport = page.getViewport({ scale: 1 });

        // Use the PDF container width to drive the scale — never constrain by height
        const container = pdfContainerRef.current;
        const availableWidth = container
          ? twoPageView
            ? Math.floor(container.clientWidth / 2) - 24
            : container.clientWidth - 32
          : Math.min(window.innerWidth - 48, 900);

        const targetWidth = Math.max(300, availableWidth) * zoomScale;
        const scale = targetWidth / baseViewport.width;
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Physical pixels (crisp on retina)
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        // CSS display size — canvas is HIDDEN; video element shows the content
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        canvas.style.display = "block";
        canvas.style.position = "absolute";
        canvas.style.opacity = "0";
        canvas.style.pointerEvents = "none";

        // If blackout is active, paint solid black immediately
        if (isBlackoutActiveRef.current) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return;
        }

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;
        await page.render({ canvasContext: ctx, viewport, transform }).promise;

        // ── Video DRM trick ──────────────────────────────────────────────────
        // Pipe canvas pixels into a <video> element via captureStream().
        // Android Chrome renders <video> through its protected video compositor
        // path — OS-level screenshots capture this layer as black (no content).
        // This is the same mechanism that prevents screenshots in banking apps.
        if (videoEl && typeof (canvas as any).captureStream === "function") {
          try {
            const stream: MediaStream = (canvas as any).captureStream(0);
            if (videoEl.srcObject !== stream) {
              videoEl.srcObject = stream;
            }
            videoEl.style.width = `${Math.floor(viewport.width)}px`;
            videoEl.style.height = `${Math.floor(viewport.height)}px`;
            if (videoEl.paused) {
              videoEl.play().catch(() => {});
            }
          } catch {}
        }
      } catch (e) {
        console.error("Canvas render error:", e);
      }
    },
    [pdfDoc, zoomScale, twoPageView]
  );

  useEffect(() => {
    if (!isPdf || !pdfDoc) return;
    renderPdfPage(currentPage, pdfCanvasRef.current, pdfVideoRef.current);
    if (twoPageView && currentPage < pdfNumPages) {
      renderPdfPage(currentPage + 1, pdfCanvasRef2.current, pdfVideoRef2.current);
    }
  }, [isPdf, pdfDoc, currentPage, zoomScale, twoPageView, pdfNumPages, renderPdfPage]);

  // Re-render on window resize so canvas always fills its container
  useEffect(() => {
    if (!isPdf || !pdfDoc) return;
    const onResize = () => {
      renderPdfPage(currentPage, pdfCanvasRef.current, pdfVideoRef.current);
      if (twoPageView && currentPage < pdfNumPages) {
        renderPdfPage(currentPage + 1, pdfCanvasRef2.current, pdfVideoRef2.current);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isPdf, pdfDoc, currentPage, twoPageView, pdfNumPages, renderPdfPage]);

  // ============================================================================
  // 4. HARDENED SCREENSHOT & ANTI-LEAK PROTECTION
  // ============================================================================
  const wipeCanvasesBlack = useCallback(() => {
    [pdfCanvasRef.current, pdfCanvasRef2.current].forEach((canvas) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    });
  }, []);

  // Synchronous, zero-latency blackout across DOM, canvases, and clipboard
  const deactivateBlackout = useCallback(() => {
    if (blackoutTimerRef.current) {
      clearTimeout(blackoutTimerRef.current);
      blackoutTimerRef.current = null;
    }
    isBlackoutActiveRef.current = false;
    setIsScreenBlackout(false);
    setSecurityNotice(null);
    if (contentAreaRef.current) {
      contentAreaRef.current.style.filter = "none";
      contentAreaRef.current.style.opacity = "1";
      contentAreaRef.current.style.pointerEvents = "auto";
    }
    // Re-render pages after restoring
    if (pdfDoc) {
      setTimeout(() => {
        renderPdfPage(currentPage, pdfCanvasRef.current, pdfVideoRef.current);
        if (twoPageView && currentPage < pdfNumPages) {
          renderPdfPage(currentPage + 1, pdfCanvasRef2.current, pdfVideoRef2.current);
        }
      }, 50);
    }
  }, [pdfDoc, currentPage, twoPageView, pdfNumPages, renderPdfPage]);

  const activateBlackout = useCallback((durationMs: number = 1200) => {
    isBlackoutActiveRef.current = true;
    setIsScreenBlackout(true);
    wipeCanvasesBlack();
    if (contentAreaRef.current) {
      contentAreaRef.current.style.filter = "blur(80px) brightness(0)";
      contentAreaRef.current.style.opacity = "0";
      contentAreaRef.current.style.pointerEvents = "none";
    }
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(
          `⚠️ ማስጠንቀቂያ፡ ከመጽሐፉ ይዘት ስክሪንሾት ማንሳት ወይም ማጋራት በጥብቅ የተከለከለ ነው! (Unauthorized capture prohibited - Licensed to: ${user?.fullName || "User"})`
        );
      }
    } catch {}

    // Auto-restore after transient duration so user never gets stuck in a permanent black screen
    if (blackoutTimerRef.current) clearTimeout(blackoutTimerRef.current);
    if (durationMs > 0) {
      blackoutTimerRef.current = setTimeout(() => {
        deactivateBlackout();
      }, durationMs);
    }
  }, [wipeCanvasesBlack, user, deactivateBlackout]);

  // RAF loop: keeps canvas wiped black only while active blackout is triggered
  useEffect(() => {
    const loop = () => {
      if (isBlackoutActiveRef.current) {
        wipeCanvasesBlack();
        if (contentAreaRef.current && contentAreaRef.current.style.opacity !== "0") {
          contentAreaRef.current.style.filter = "blur(80px) brightness(0)";
          contentAreaRef.current.style.opacity = "0";
          contentAreaRef.current.style.pointerEvents = "none";
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [wipeCanvasesBlack]);

  // Event-based protection layer (PC + Android / iOS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Block copy/print/save/select-all
      if (ctrl && ["c", "a", "p", "s", "u", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setSecurityNotice(t("copyBlockedMsg"));
        activateBlackout(1500);
        return;
      }

      // Detect screenshot shortcuts synchronously (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5, DevTools F12)
      const isPrintScreen =
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        e.keyCode === 44 ||
        (e as any).which === 44;

      const isSnippingTool =
        (ctrl || e.altKey) && e.shiftKey && ["s", "i", "j", "c", "3", "4", "5"].includes(e.key.toLowerCase());

      const isF12 = e.key === "F12" || e.code === "F12";

      if (isPrintScreen || isSnippingTool || isF12) {
        e.preventDefault();
        // Synchronously blank content immediately before OS capture grab
        if (contentAreaRef.current) {
          contentAreaRef.current.style.filter = "blur(80px) brightness(0)";
          contentAreaRef.current.style.opacity = "0";
        }
        wipeCanvasesBlack();
        try {
          navigator.clipboard?.writeText("⚠️ Protected by RABBI Digital");
        } catch {}
        activateBlackout(1500);
        setSecurityNotice(t("screenshotBlockedMsg"));
      }

      if (!isVideo) {
        if (e.key === "ArrowRight" || e.key === "PageDown") handleNextPage();
        else if (e.key === "ArrowLeft" || e.key === "PageUp") handlePrevPage();
      }
    };

    // Windows Chromium fires PrintScreen on KEYUP
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        e.keyCode === 44 ||
        (e as any).which === 44
      ) {
        e.preventDefault();
        try {
          navigator.clipboard?.writeText("⚠️ Protected by RABBI Digital");
        } catch {}
        activateBlackout(1500);
        setSecurityNotice(t("screenshotBlockedMsg"));
      }
    };

    // Visibility change - only blank when tab is actually hidden, auto-restore when visible
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState !== "visible") {
        activateBlackout(0); // hold blackout while hidden (e.g. app switcher thumbnail)
      } else {
        deactivateBlackout(); // instantly restore when user returns
      }
    };

    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    // ── Mobile Screenshot Gestures (Android / iOS) ────────────────────────────
    const handleTouchStart = (e: TouchEvent) => {
      // Multi-touch gestures (e.g. 3-finger swipe or power+vol-down grip)
      if (e.touches && e.touches.length >= 2) {
        activateBlackout(1200);
        setSecurityNotice(t("screenshotBlockedMsg"));
      }
    };

    const handleTouchCancel = () => {
      activateBlackout(1000);
    };

    const handlePageHide = () => {
      activateBlackout(0);
    };

    const handleFreeze = () => {
      activateBlackout(0);
    };

    // Print prevention CSS
    const printStyle = document.createElement("style");
    printStyle.id = "rabbi-drm-print-guard";
    printStyle.innerHTML =
      "@media print { * { display: none !important; visibility: hidden !important; } }";
    document.head.appendChild(printStyle);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("contextmenu", blockContextMenu);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("freeze", handleFreeze);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchcancel", handleTouchCancel);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.getElementById("rabbi-drm-print-guard")?.remove();
    };
  }, [activateBlackout, deactivateBlackout, isVideo, t]);

  // ============================================================================
  // 5. PAGE CONTROLS
  // ============================================================================
  const handleNextPage = () => {
    const step = twoPageView ? 2 : 1;
    setCurrentPage((p) => {
      const n = Math.min(totalPages, p + step);
      setJumpPageInput(getPageLabel(n));
      return n;
    });
  };

  const handlePrevPage = () => {
    const step = twoPageView ? 2 : 1;
    setCurrentPage((p) => {
      const n = Math.max(1, p - step);
      setJumpPageInput(getPageLabel(n));
      return n;
    });
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = jumpPageInput.trim();
    if (!raw) return;

    // Check if user entered a Roman numeral or custom page label (e.g. "iv", "iii")
    if (isPdf && pdfPageLabels) {
      const matchIdx = pdfPageLabels.findIndex(
        (l) => l.toLowerCase() === raw.toLowerCase()
      );
      if (matchIdx !== -1) {
        setCurrentPage(matchIdx + 1);
        setJumpPageInput(raw);
        return;
      }
    }

    const p = parseInt(raw, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput(getPageLabel(p));
    } else {
      setJumpPageInput(getPageLabel(currentPage));
    }
  };

  const handleSelectChapter = (startPage: number) => {
    setCurrentPage(startPage);
    setJumpPageInput(getPageLabel(startPage));
    setShowToc(false);
  };

  // ============================================================================
  // 6. VIDEO CONTROLS
  // ============================================================================
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
  };
  const handleSkip = (s: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + s), duration);
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; setIsMuted(v === 0); }
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) { videoRef.current.muted = false; setIsMuted(false); videoRef.current.volume = volume || 0.5; }
    else { videoRef.current.muted = true; setIsMuted(true); }
  };
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) videoContainerRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  // ============================================================================
  // 7. THEME — applies to both text pages AND the PDF reader background
  // ============================================================================
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":     return "bg-slate-950 text-slate-100 border-slate-800 shadow-2xl";
      case "midnight": return "bg-[#0a0f1d] text-slate-100 border-gold/30 shadow-2xl";
      case "sepia":    return "bg-[#fbf3e2] text-[#4a3728] border-[#e2d3be] shadow-2xl";
      default:         return "bg-[#fefdfa] text-slate-900 border-gold/25 shadow-2xl";
    }
  };

  // PDF reader area background (behind the white canvas pages)
  const getPdfBgClass = () => {
    switch (theme) {
      case "dark":     return "bg-slate-950";
      case "midnight": return "bg-[#060a14]";
      case "sepia":    return "bg-[#efe5d0]";
      default:         return "bg-navy-deep";
    }
  };

  const activePageObj  = pages[currentPage - 1] || pages[0];
  const secondPageObj  = twoPageView ? pages[currentPage] : null;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      ref={readerRef}
      className="fixed inset-0 z-50 flex flex-col bg-navy-deep text-white overflow-hidden"
      style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ── SCREENSHOT PROTECTION OVERLAY ───────────────────────────────────────── */}
      {isScreenBlackout && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center select-none cursor-pointer transition-opacity backdrop-blur-3xl animate-in fade-in"
          style={{ zIndex: 999999, backgroundColor: "#000000" }}
          onClick={deactivateBlackout}
        >
          <ShieldAlert className="h-12 w-12 text-red-500 mb-3 opacity-90 animate-pulse" />
          <p className="text-gold text-sm font-bold opacity-90 mb-1">
            {t("screenshotBlockedMsg")}
          </p>
          <p className="text-white/60 text-xs">
            {t("clickToResume")}
          </p>
        </div>
      )}

      {/* ── SECURITY TOAST ──────────────────────────────────────────────────── */}
      {securityNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xl border border-red-400 animate-in fade-in slide-in-from-top-4 pointer-events-none">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* ── TOP HEADER BAR ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-navy-deep/95 border-b border-gold/25 backdrop-blur-md z-40 shrink-0">
        {/* Title area */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0">
            {isVideo ? <PlayCircle className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="font-display font-bold text-xs sm:text-sm text-gold truncate max-w-[140px] sm:max-w-[280px] md:max-w-lg">
                {book.title}
              </h2>
              <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold border border-gold/30 shrink-0">
                {book.mediaType || (isPdf ? "PDF BOOK" : isDocx ? "DOCX BOOK" : "BOOK")}
              </span>
            </div>
            <p className="text-[10px] text-on-navy-muted truncate max-w-[200px] sm:max-w-none">
              ደራሲ፦ {book.author || "RABBI Ministry"} • {t("protectedContent")}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
          {/* TOC / Index on the Left */}
          {!isVideo && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                showToc ? "bg-gold text-navy-deep border-gold shadow-xs" : "bg-navy/40 text-gold border-gold/30 hover:bg-gold/20"
              }`}
              title="Table of Contents / ማውጫ"
            >
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">ማውጫ (Index)</span>
            </button>
          )}

          {/* Two-page toggle */}
          {!isVideo && (
            <button
              onClick={() => setTwoPageView(!twoPageView)}
              className="hidden lg:flex items-center gap-1 rounded-xl bg-navy/40 px-2.5 py-1.5 text-xs font-semibold text-gold border border-gold/30 hover:bg-gold/20 cursor-pointer"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>{twoPageView ? t("twoPages") : t("singlePage")}</span>
            </button>
          )}

          {/* Zoom for PDF */}
          {isPdf && (
            <div className="hidden sm:flex items-center gap-0.5 rounded-xl bg-navy/40 px-1.5 py-1 border border-gold/25">
              <button onClick={() => setZoomScale((s) => Math.max(0.6, s - 0.15))} className="p-1 text-gold hover:text-white cursor-pointer" title="Zoom Out">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] text-gold font-mono px-1 min-w-[36px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button onClick={() => setZoomScale((s) => Math.min(2.0, s + 0.15))} className="p-1 text-gold hover:text-white cursor-pointer" title="Zoom In">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Theme switcher for text & DOCX books */}
          {!isVideo && !isPdf && (
            <div className="flex items-center rounded-xl bg-navy/40 p-1 border border-gold/25">
              {(["cream", "sepia", "dark", "midnight"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    theme === th ? "bg-gold text-navy-deep font-bold shadow-xs" : "text-on-navy-muted hover:text-gold"
                  }`}
                  title={`${th} theme`}
                >
                  {th === "cream" ? "ነጭ" : th === "sepia" ? "ሴፒያ" : th === "dark" ? "ጨለማ" : "ምሽት"}
                </button>
              ))}
            </div>
          )}

          {/* Font size for text & DOCX books */}
          {!isVideo && !isPdf && (
            <div className="flex items-center gap-1 rounded-xl bg-navy/40 px-2 py-1 border border-gold/25">
              <Type className="h-3.5 w-3.5 text-gold" />
              <button onClick={() => setFontSize((s) => Math.max(12, s - 2))} className="px-1.5 text-xs font-bold text-gold hover:opacity-80 cursor-pointer" title="Decrease font size">A-</button>
              <span className="text-[10px] text-white font-mono">{fontSize}px</span>
              <button onClick={() => setFontSize((s) => Math.min(36, s + 2))} className="px-1.5 text-xs font-bold text-gold hover:opacity-80 cursor-pointer" title="Increase font size">A+</button>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 border border-red-500/40 hover:bg-red-600 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{t("close")}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div ref={contentAreaRef} className="relative flex-1 overflow-hidden flex bg-navy-deep">
        {/* TOC Sidebar on the Left */}
        {showToc && !isVideo && (
          <aside
            className={`z-30 w-72 md:w-80 bg-navy-deep/98 border-r border-gold/30 shadow-2xl p-4 sm:p-5 overflow-y-auto backdrop-blur-md animate-in slide-in-from-left duration-200 shrink-0 ${
              pinToc ? "relative hidden md:block" : "absolute left-0 top-0 bottom-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gold/20 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-gold" />
                <h3 className="font-display text-sm font-bold text-gold uppercase tracking-wider">
                  ይዘት / ማውጫ (Index)
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPinToc(!pinToc)}
                  className={`hidden md:flex rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                    pinToc
                      ? "bg-gold text-navy-deep border-gold"
                      : "bg-navy/40 text-on-navy-muted border-gold/20 hover:text-gold"
                  }`}
                  title={pinToc ? "Unpin left sidebar" : "Pin left sidebar"}
                >
                  {pinToc ? "📌 የተሰካ" : "📌 ሰካ"}
                </button>
                <button
                  onClick={() => setShowToc(false)}
                  className="rounded-lg p-1 hover:bg-gold/15 hover:text-gold text-on-navy-muted cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* TOC Navigation Tabs: Chapters vs All Pages */}
            <div className="flex rounded-xl bg-navy/60 p-1 mb-3 border border-gold/20">
              <button
                type="button"
                onClick={() => setTocTab("chapters")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tocTab === "chapters"
                    ? "bg-gold text-navy-deep shadow-xs"
                    : "text-on-navy-muted hover:text-white"
                }`}
              >
                ምዕራፎች ({effectiveChapters.length})
              </button>
              <button
                type="button"
                onClick={() => setTocTab("pages")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tocTab === "pages"
                    ? "bg-gold text-navy-deep shadow-xs"
                    : "text-on-navy-muted hover:text-white"
                }`}
              >
                ገጾች ({totalPages})
              </button>
            </div>

            {/* Tab 1: Chapters list */}
            {tocTab === "chapters" && (
              <div className="space-y-1.5">
                {effectiveChapters.map((chap) => {
                  const isActive =
                    currentPage >= chap.startPage &&
                    (chap.id === effectiveChapters.length ||
                      currentPage < (effectiveChapters[chap.id]?.startPage || 9999));
                  const label = chap.startPageLabel || getPageLabel(chap.startPage);
                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        handleSelectChapter(chap.startPage);
                        if (!pinToc) setShowToc(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-gold text-navy-deep font-bold shadow-xs"
                          : "text-on-navy-muted hover:bg-gold/15 hover:text-gold"
                      }`}
                    >
                      <span className="line-clamp-1 pr-2">{chap.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          isActive ? "bg-navy-deep/20 text-navy-deep font-bold" : "bg-navy/40 text-gold"
                        }`}
                      >
                        {t("page")} {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Pages Grid/List */}
            {tocTab === "pages" && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                  const isCurrent = currentPage === pg;
                  const label = getPageLabel(pg);
                  return (
                    <button
                      key={pg}
                      onClick={() => {
                        setCurrentPage(pg);
                        setJumpPageInput(label);
                        if (!pinToc) setShowToc(false);
                      }}
                      className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                        isCurrent
                          ? "bg-gold text-navy-deep shadow-md scale-105"
                          : "bg-navy/50 text-gold border border-gold/20 hover:bg-gold/20"
                      }`}
                    >
                      ገጽ {label}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        )}

        {/* ── CASE A: VIDEO PLAYER ─────────────────────────────────────────── */}
        {isVideo ? (
          <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-black">
            <div
              ref={videoContainerRef}
              className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-gold/30 flex items-center justify-center group"
            >
              {book.videoUrl?.includes("youtube.com") || book.videoUrl?.includes("youtu.be") || book.videoUrl?.includes("vimeo.com") ? (
                <iframe
                  src={book.videoUrl}
                  title={book.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={book.videoUrl || (book.fullContent?.startsWith("http") ? book.fullContent : "")}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlay}
                    onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
                    onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <button onClick={togglePlay} className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/90 text-navy-deep shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                      <Play className="h-8 w-8 fill-current ml-1" />
                    </button>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold mb-3" />
                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="hover:text-gold cursor-pointer">
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                        </button>
                        <button onClick={() => handleSkip(-10)} className="hover:text-gold cursor-pointer"><RotateCcw className="h-4 w-4" /></button>
                        <button onClick={() => handleSkip(10)} className="hover:text-gold cursor-pointer"><RotateCw className="h-4 w-4" /></button>
                        <div className="flex items-center gap-1.5">
                          <button onClick={toggleMute} className="hover:text-gold cursor-pointer">
                            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </button>
                          <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 h-1 bg-white/30 rounded-lg appearance-none accent-gold cursor-pointer" />
                        </div>
                        <span className="font-mono text-[11px] text-on-navy-muted">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select value={playbackSpeed} onChange={(e) => handleSpeedChange(parseFloat(e.target.value))} className="bg-black/60 border border-gold/30 rounded-lg px-2 py-0.5 text-[11px] text-gold cursor-pointer">
                          <option value="0.75">0.75x</option>
                          <option value="1">1.0x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2.0x</option>
                        </select>
                        <button onClick={toggleFullscreen} className="hover:text-gold cursor-pointer"><Maximize2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        ) : (
          /* ── CASE B: BOOK READER ───────────────────────────────────────── */
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable page area */}
            <div
              ref={pdfContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col items-center"
            >
              {isPdf ? (
                /* PDF Canvas area */
                <div className="flex flex-col items-center w-full flex-1">
                  {pdfLoading && (
                    <div className="flex flex-col items-center justify-center flex-1 py-20">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent mb-4" />
                      <p className="text-sm text-gold font-semibold">የመጽሐፉን ገጾች በማዘጋጀት ላይ...</p>
                      <p className="text-xs text-on-navy-muted mt-1">Rendering Book Pages</p>
                    </div>
                  )}

                  {pdfError && (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 max-w-md text-center">
                      <div className="rounded-2xl bg-red-950/40 border border-red-500/40 p-6 w-full">
                        <ShieldAlert className="h-8 w-8 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-200 font-semibold mb-4">{pdfError}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/20 text-gold text-xs font-bold border border-gold/40 hover:bg-gold hover:text-navy-deep cursor-pointer transition-all"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>እንደገና ይሞክሩ (Retry)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!pdfLoading && !pdfError && (
                    <div className={`flex gap-4 items-start justify-center w-full ${twoPageView ? "lg:flex-row flex-col" : "flex-col items-center"}`}>
                      {/* Page 1 — hidden canvas feeds a <video> element.
                          Android Chrome renders <video> through the protected
                          video compositor path, which is excluded from OS-level
                          screenshot capture (shows as black on Android). */}
                      <div
                        className={`relative rounded-2xl overflow-hidden shadow-2xl border border-gold/30 bg-white ${twoPageView ? "flex-1 min-w-0" : "w-full"}`}
                        style={{ isolation: "isolate", willChange: "transform" }}
                      >
                        {/* Hidden canvas — renders PDF pixels but is never visible */}
                        <canvas
                          ref={pdfCanvasRef}
                          style={{ position: "absolute", opacity: 0, pointerEvents: "none", top: 0, left: 0 }}
                          aria-hidden="true"
                        />
                        {/* Visible video — displays canvas stream; black in OS screenshots */}
                        <video
                          ref={pdfVideoRef}
                          muted
                          playsInline
                          autoPlay
                          disablePictureInPicture
                          style={{ display: "block", width: "100%", height: "auto", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                        <div className="absolute bottom-2 right-3 text-[10px] text-navy/70 font-mono bg-white/90 px-2 py-0.5 rounded shadow-sm z-20">
                          {t("page")} {getPageLabel(currentPage)}
                        </div>
                      </div>

                      {/* Page 2 (two-page spread) */}
                      {twoPageView && currentPage < pdfNumPages && (
                        <div
                          className="relative rounded-2xl overflow-hidden shadow-2xl border border-gold/30 bg-white flex-1 min-w-0 hidden lg:block"
                          style={{ isolation: "isolate", willChange: "transform" }}
                        >
                          <canvas
                            ref={pdfCanvasRef2}
                            style={{ position: "absolute", opacity: 0, pointerEvents: "none", top: 0, left: 0 }}
                            aria-hidden="true"
                          />
                          <video
                            ref={pdfVideoRef2}
                            muted
                            playsInline
                            autoPlay
                            disablePictureInPicture
                            style={{ display: "block", width: "100%", height: "auto", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <div className="absolute bottom-2 right-3 text-[10px] text-navy/70 font-mono bg-white/90 px-2 py-0.5 rounded shadow-sm z-20">
                            {t("page")} {getPageLabel(currentPage + 1)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : isDocx && (docxLoading || docxError) ? (
                /* DOCX Loading or Error State */
                <div className="flex flex-col items-center w-full flex-1">
                  {docxLoading && (
                    <div className="flex flex-col items-center justify-center flex-1 py-20">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent mb-4" />
                      <p className="text-sm text-gold font-semibold">የDOCX ፋይል ገጾችን በማዘጋጀት ላይ...</p>
                      <p className="text-xs text-on-navy-muted mt-1">Rendering Word Document</p>
                    </div>
                  )}

                  {docxError && (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 max-w-md text-center">
                      <div className="rounded-2xl bg-red-950/40 border border-red-500/40 p-6 w-full">
                        <ShieldAlert className="h-8 w-8 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-200 font-semibold mb-2">{docxError}</p>
                        <p className="text-xs text-red-300/80 mb-4">እባክዎ እንደገና ይሞክሩ ወይም ከአስተዳዳሪው ጋር ይገናኙ።</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-navy-deep text-xs font-bold hover:bg-gold/90 cursor-pointer transition-all shadow-md"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>እንደገና ይሞክሩ (Retry)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Structured text pages */
                <div className={`grid gap-4 sm:gap-6 w-full max-w-5xl ${twoPageView ? "lg:grid-cols-2" : "grid-cols-1 max-w-3xl"}`}>
                  {/* Left page */}
                  <div
                    className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 min-h-[60vh] flex flex-col justify-between border ${getThemeClasses()}`}
                    style={{ fontSize: `${fontSize}px`, isolation: "isolate", willChange: "transform" }}
                  >
                    <div className="relative z-1">
                      <div className="flex items-center justify-between border-b border-current/15 pb-3 mb-6 text-[11px] font-bold tracking-widest uppercase opacity-60">
                        <span className="truncate pr-4">{book.title}</span>
                        <span className="shrink-0">{activePageObj?.chapterTitle}</span>
                      </div>
                      <div className="font-serif leading-relaxed text-justify whitespace-pre-line space-y-4">
                        {activePageObj?.text}
                      </div>
                    </div>
                    <div className="relative z-1 mt-8 pt-4 border-t border-current/15 flex items-center justify-between text-xs opacity-60 font-mono">
                      <span>RABBI Digital Library</span>
                      <span>— {currentPage} —</span>
                    </div>
                  </div>

                  {/* Right page (two-page) */}
                  {twoPageView && secondPageObj && (
                    <div
                      className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 min-h-[60vh] flex flex-col justify-between border hidden lg:flex ${getThemeClasses()}`}
                      style={{ fontSize: `${fontSize}px`, isolation: "isolate", willChange: "transform" }}
                    >
                      <div className="relative z-1">
                        <div className="flex items-center justify-between border-b border-current/15 pb-3 mb-6 text-[11px] font-bold tracking-widest uppercase opacity-60">
                          <span>{secondPageObj.chapterTitle}</span>
                          <span>{book.author || "RABBI"}</span>
                        </div>
                        <div className="font-serif leading-relaxed text-justify whitespace-pre-line space-y-4">
                          {secondPageObj.text}
                        </div>
                      </div>
                      <div className="relative z-1 mt-8 pt-4 border-t border-current/15 flex items-center justify-between text-xs opacity-60 font-mono">
                        <span>— {currentPage + 1} —</span>
                        <span>{t("protectedContent")}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── BOTTOM NAVIGATION BAR ─────────────────────────────────────── */}
            <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-navy-deep/95 border-t border-gold/30 px-3 sm:px-5 py-2.5 shadow-xl backdrop-blur-sm">
              <button
                disabled={currentPage <= 1}
                onClick={handlePrevPage}
                className="flex items-center gap-1 rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-navy-deep transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t("prevPage")}</span>
              </button>

              <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5 text-xs">
                <span className="text-on-navy-muted text-[11px]">{t("page")}</span>
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-14 rounded-lg border border-gold/30 bg-white px-2 py-1 text-center font-mono text-xs text-navy focus:border-gold focus:outline-none"
                />
                <span className="text-on-navy-muted text-[11px]">{t("pageOf")} {getPageLabel(totalPages)} ({totalPages})</span>
                <button type="submit" className="rounded-lg bg-gold/20 px-2.5 py-1 text-[11px] font-bold text-gold hover:bg-gold hover:text-navy-deep cursor-pointer active:scale-95">
                  {t("go")}
                </button>
              </form>

              <button
                disabled={currentPage >= totalPages}
                onClick={handleNextPage}
                className="flex items-center gap-1 rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-navy-deep transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <span className="hidden sm:inline">{t("nextPage")}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
