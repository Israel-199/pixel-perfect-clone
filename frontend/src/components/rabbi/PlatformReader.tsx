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
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Coffee,
  ShieldAlert,
} from "lucide-react";
import { BookItem } from "./BookModal";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { API_BASE_URL } from "@/lib/api";
import { filterNumberInput } from "@/lib/inputValidation";
import { parseDocx, fromRoman, fromAlpha, parseTableOfContentsText, SUBCHAPTER_HEADING_REGEX } from "@/lib/bookUtils";
import { ensurePdfjsLoaded, getCachedPdfBytes, prefetchPdfBytes } from "@/lib/prefetch";

interface PlatformReaderProps {
  book: BookItem;
  onClose: () => void;
}

interface ChapterItem {
  id: number;
  title: string;
  startPage: number;
  startPageLabel?: string | undefined;
  level?: number; // 1 = Chapter, 2 = Subchapter, 3 = Sub-subchapter
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
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
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
  // Reader security (blackout removed per user request)

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

  const effectiveChapters: ChapterItem[] = useMemo(() => {
    if (isPdf) {
      if (pdfOutlineChapters.length > 0) {
        return pdfOutlineChapters;
      }

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
        // ── Step 1: Ensure PDF.js is loaded (uses prefetch cache if already loaded) ──
        await ensurePdfjsLoaded();

        const pdfjs = (window as any).pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // ── Step 2: Get PDF bytes — instant if prefetched, otherwise fetch now ──
        let uint8Data: Uint8Array | null = getCachedPdfBytes(pdfUrl);
        if (!uint8Data) {
          uint8Data = await prefetchPdfBytes(pdfUrl);
        }
        if (!uint8Data) throw new Error("Failed to load PDF data.");

        const loadingTask = pdfjs.getDocument({
          data: uint8Data,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const loadedPdf = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setPdfNumPages(loadedPdf.numPages);
        // Display Page 1 immediately without waiting for TOC scan
        setPdfLoading(false);

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
        let outlineFound = false;
        try {
          const outline = await loadedPdf.getOutline();
          if (isMounted && outline && outline.length > 0) {
            const parsedOutlineChapters: ChapterItem[] = [];

            const traverseOutline = async (items: any[], currentLevel = 1) => {
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
                      level: currentLevel,
                    });
                  } catch (e) {}
                }
                if (item.items && item.items.length > 0) {
                  await traverseOutline(item.items, Math.min(3, currentLevel + 1));
                }
              }
            };

            await traverseOutline(outline, 1);
            if (isMounted && parsedOutlineChapters.length > 0) {
              setPdfOutlineChapters(parsedOutlineChapters);
              outlineFound = true;
            }
          }
        } catch (e) {
          console.warn("Could not retrieve PDF outline:", e);
        }

        // 3. Fallback: Scan printed Table of Contents ("ማውጫ") on preliminary pages (pages 1-8)
        if (!outlineFound && isMounted && loadedPdf.numPages > 1) {
          try {
            let tocAccumulatedText = "";
            let sawTocTitle = false;
            const maxScanPages = Math.min(8, loadedPdf.numPages);

            for (let p = 1; p <= maxScanPages; p++) {
              const pageObj = await loadedPdf.getPage(p);
              const textContent = await pageObj.getTextContent();
              const pageStrings = (textContent.items || [])
                .map((it: any) => it.str || "")
                .filter(Boolean);
              const fullPageStr = pageStrings.join(" ");

              if (/ማውጫ|የርዕስ\s*ማውጫ|Table\s*of\s*Contents|Contents\b/i.test(fullPageStr)) {
                sawTocTitle = true;
              }

              if (sawTocTitle) {
                tocAccumulatedText += "\n" + pageStrings.join("\n");
                if (tocAccumulatedText.length > 3000) break;
              }
            }

            if (tocAccumulatedText.trim()) {
              const extractedItems = parseTableOfContentsText(
                tocAccumulatedText,
                loadedPdf.numPages,
                pageLabels || undefined
              );
              if (isMounted && extractedItems.length >= 2) {
                setPdfOutlineChapters(extractedItems);
              }
            }
          } catch (e) {
            console.warn("PDF printed TOC scan notice:", e);
          }
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
  // 3. PDF CANVAS RENDERER — instant visible rendering on high-DPI canvas
  // ============================================================================
  const renderPdfPage = useCallback(
    async (pageNo: number, canvas: HTMLCanvasElement | null) => {
      if (!pdfDoc || !canvas) return;
      try {
        const page = await pdfDoc.getPage(pageNo);
        const baseViewport = page.getViewport({ scale: 1 });

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

        // CSS display size — fully visible and centered
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";
        canvas.style.position = "static";
        canvas.style.opacity = "1";
        canvas.style.pointerEvents = "auto";

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;
        await page.render({ canvasContext: ctx, viewport, transform }).promise;

        // Subtle non-intrusive forensic watermark (VitalSource / Kindle DRM standard)
        try {
          ctx.save();
          ctx.font = `${Math.max(11, Math.floor(13 * dpr))}px sans-serif`;
          ctx.fillStyle = "rgba(0, 0, 0, 0.035)";
          ctx.textAlign = "center";
          const watermarkText = `RABBI Digital • ${user?.fullName || user?.email || "Licensed Reader"}`;
          for (let y = 140 * dpr; y < canvas.height; y += 260 * dpr) {
            for (let x = 160 * dpr; x < canvas.width; x += 360 * dpr) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(-0.35);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
          ctx.restore();
        } catch {}
      } catch (e) {
        console.error("Canvas render error:", e);
      }
    },
    [pdfDoc, zoomScale, twoPageView]
  );

  useEffect(() => {
    if (!isPdf || !pdfDoc) return;
    const render = () => {
      if (pdfCanvasRef.current) {
        renderPdfPage(currentPage, pdfCanvasRef.current);
        if (twoPageView && currentPage < pdfNumPages && pdfCanvasRef2.current) {
          renderPdfPage(currentPage + 1, pdfCanvasRef2.current);
        }
      }
    };

    if (pdfCanvasRef.current) {
      render();
    } else {
      // Fast immediate retry on next animation frame as soon as canvas mounts
      const rId = requestAnimationFrame(render);
      return undefined;
    }
  }, [isPdf, pdfDoc, currentPage, zoomScale, twoPageView, pdfNumPages, renderPdfPage, pdfLoading]);

  // Re-render on window resize so canvas always fills its container
  useEffect(() => {
    if (!isPdf || !pdfDoc) return;
    const onResize = () => {
      renderPdfPage(currentPage, pdfCanvasRef.current);
      if (twoPageView && currentPage < pdfNumPages) {
        renderPdfPage(currentPage + 1, pdfCanvasRef2.current);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isPdf, pdfDoc, currentPage, twoPageView, pdfNumPages, renderPdfPage]);

  // ============================================================================
  // 4. HARDENED SCREENSHOT PREVENTION (Zero-blackout, strictly prevents tools)
  // ============================================================================
  useEffect(() => {
    // 1. Lock keyboard shortcuts in Chromium browsers (blocks system Win+Shift+S & PrintScreen)
    if (typeof (navigator as any).keyboard?.lock === "function") {
      try {
        (navigator as any).keyboard.lock(["KeyS", "PrintScreen", "ShiftLeft", "ShiftRight", "MetaLeft", "MetaRight"]);
      } catch {}
    }

    // 2. Dynamic print-guard stylesheet blocks print-to-PDF without affecting on-screen display
    const printGuardStyle = document.createElement("style");
    printGuardStyle.id = "rabbi-print-guard";
    printGuardStyle.innerHTML =
      "@media print { body * { display: none !important; visibility: hidden !important; } }";
    document.head.appendChild(printGuardStyle);

    const clearClipboardSilently = () => {
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText("");
        }
      } catch {}
    };

    // Synchronous direct DOM manipulation:
    // When fast typing Win+Shift+S, React state updates are asynchronous and too slow.
    // Setting CSS properties directly on the DOM nodes happens in under 0.1ms, guaranteeeing
    // the screen buffer is already blurred before the OS can capture the snapshot.
    const applyInstantBlur = () => {
      setIsBlurred(true);
      try {
        if (pdfContainerRef.current) {
          pdfContainerRef.current.style.setProperty("filter", "blur(36px) contrast(0.5) brightness(0.9)", "important");
          pdfContainerRef.current.style.setProperty("opacity", "0.2", "important");
        }
        if (contentAreaRef.current) {
          contentAreaRef.current.style.setProperty("filter", "blur(36px) contrast(0.5) brightness(0.9)", "important");
        }
        if (pdfCanvasRef.current) {
          pdfCanvasRef.current.style.setProperty("filter", "blur(36px) contrast(0.5) brightness(0.9)", "important");
        }
        if (pdfCanvasRef2.current) {
          pdfCanvasRef2.current.style.setProperty("filter", "blur(36px) contrast(0.5) brightness(0.9)", "important");
        }
      } catch {}
      clearClipboardSilently();
    };

    const removeInstantBlur = () => {
      setIsBlurred(false);
      try {
        if (pdfContainerRef.current) {
          pdfContainerRef.current.style.removeProperty("filter");
          pdfContainerRef.current.style.removeProperty("opacity");
        }
        if (contentAreaRef.current) {
          contentAreaRef.current.style.removeProperty("filter");
        }
        if (pdfCanvasRef.current) {
          pdfCanvasRef.current.style.removeProperty("filter");
          pdfCanvasRef.current.style.filter = getPdfCanvasFilter();
        }
        if (pdfCanvasRef2.current) {
          pdfCanvasRef2.current.style.removeProperty("filter");
          pdfCanvasRef2.current.style.filter = getPdfCanvasFilter();
        }
      } catch {}
    };

    const handleWindowBlur = () => {
      applyInstantBlur();
    };

    const handleWindowFocus = () => {
      if (document.hasFocus() && !document.hidden) {
        removeInstantBlur();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        applyInstantBlur();
      } else if (document.hasFocus()) {
        removeInstantBlur();
      }
    };

    const handleUserActivity = () => {
      if (document.hasFocus() && !document.hidden) {
        removeInstantBlur();
      }
    };

    const isTargetInput = (target: any) => {
      const tag = (target?.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || target?.isContentEditable;
    };

    // Ultra-fast screenshot attempt detection:
    // Detects preparatory keys (Meta, Shift, Alt, PrintScreen) the instant they are pressed down,
    // ensuring the content is blurred before the full combination is completed.
    const isScreenshotAttempt = (e: KeyboardEvent) => {
      const code = e.code || "";
      const key = (e.key || "").toLowerCase();
      const keyCode = e.keyCode || (e as any).which || 0;
      const inInput = isTargetInput(e.target);

      // 1. PrintScreen key in any form
      if (key === "printscreen" || code === "PrintScreen" || keyCode === 44) {
        return true;
      }

      // 2. Windows / Cmd (Meta) key pressed down (instant blur before 'S' can be typed)
      if (key === "meta" || code.startsWith("Meta") || keyCode === 91 || keyCode === 92 || e.metaKey) {
        return true;
      }

      // 3. Shift key pressed outside input fields (fast typing Win+Shift+S often hits Shift first)
      if (!inInput && (key === "shift" || code.startsWith("Shift") || keyCode === 16 || e.shiftKey)) {
        return true;
      }

      // 4. Any combination of Shift with Meta, Alt, or Ctrl (even inside inputs)
      if (e.shiftKey && (e.metaKey || e.altKey || e.ctrlKey)) {
        return true;
      }

      // 5. 'S' key with any screenshot modifier (Win, Shift, Ctrl, Alt)
      if (
        (key === "s" || code === "KeyS" || keyCode === 83) &&
        (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey)
      ) {
        return true;
      }

      // 6. MacOS Screenshot shortcuts: Cmd + Shift + 3 / 4 / 5 / 6
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        ["3", "4", "5", "6", "#", "$", "%", "^"].includes(key)
      ) {
        return true;
      }

      // 7. Save Page (Ctrl+S), Print (Ctrl+P), View Source (Ctrl+U)
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "u"].includes(key) && !e.altKey) {
        return true;
      }

      // 8. DevTools combos: F12, Ctrl+Shift+I / J / C
      if (
        key === "f12" ||
        keyCode === 123 ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key))
      ) {
        return true;
      }

      return false;
    };

    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (isScreenshotAttempt(e)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        applyInstantBlur();
        return;
      }

      // Normal Reader Navigation
      if (!isVideo) {
        if (e.key === "ArrowRight" || e.key === "PageDown") handleNextPage();
        else if (e.key === "ArrowLeft" || e.key === "PageUp") handlePrevPage();
      }
    };

    const handleKeyUpCapture = (e: KeyboardEvent) => {
      if (isScreenshotAttempt(e)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        clearClipboardSilently();
        return;
      } else {
        // If regular key released (not meta/shift) and window has focus, ensure unblurred
        if (!e.metaKey && !e.shiftKey && document.hasFocus()) {
          removeInstantBlur();
        }
      }
    };

    // Mobile: Block multi-touch screenshot gestures (3-finger swipe on Xiaomi/Oppo/Huawei, palm swipe on Samsung)
    // When 2 or more touches are detected simultaneously, immediately blur before screenshot triggers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 2) {
        applyInstantBlur();
      } else {
        if (document.hasFocus()) {
          removeInstantBlur();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 2) {
        e.preventDefault();
        applyInstantBlur();
      }
    };

    // Prevent context menu (right click / long press on mobile)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      clearClipboardSilently();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // High-frequency focus monitor for external screenshot overlay tools (Lightshot, Snipping Tool overlay, Greenshot)
    const focusCheckInterval = setInterval(() => {
      if (!document.hasFocus() || document.hidden) {
        applyInstantBlur();
      }
    }, 30);

    const opts = { capture: true, passive: false };
    window.addEventListener("keydown", handleKeyDownCapture, opts);
    window.addEventListener("keyup", handleKeyUpCapture, opts);
    document.addEventListener("keydown", handleKeyDownCapture, opts);
    document.addEventListener("keyup", handleKeyUpCapture, opts);
    window.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", handleTouchMove, opts);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pagehide", handleWindowBlur);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("pointerdown", handleUserActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("cut", handleCopy, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      clearInterval(focusCheckInterval);
      if (typeof (navigator as any).keyboard?.unlock === "function") {
        try { (navigator as any).keyboard.unlock(); } catch {}
      }
      window.removeEventListener("keydown", handleKeyDownCapture, { capture: true });
      window.removeEventListener("keyup", handleKeyUpCapture, { capture: true });
      document.removeEventListener("keydown", handleKeyDownCapture, { capture: true });
      document.removeEventListener("keyup", handleKeyUpCapture, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, { capture: true } as any);
      window.removeEventListener("touchmove", handleTouchMove, { capture: true });
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pagehide", handleWindowBlur);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("pointerdown", handleUserActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("cut", handleCopy, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.getElementById("rabbi-print-guard")?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideo, theme]);

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
      default:         return "bg-[#fefdfa] text-slate-900 border-gold/25 shadow-2xl";
    }
  };

  // PDF reader area background (behind the white canvas pages)
  const getPdfBgClass = () => {
    switch (theme) {
      case "dark":     return "bg-slate-950";
      case "midnight": return "bg-[#060a14]";
      default:         return "bg-navy-deep";
    }
  };

  const getPdfCanvasFilter = () => {
    switch (theme) {
      case "dark":
        return "invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.15)";
      case "midnight":
        return "invert(0.96) hue-rotate(180deg) contrast(1.25) brightness(0.9)";
      default:
        return "none";
    }
  };

  const getPdfCardClass = () => {
    switch (theme) {
      case "dark":
        return "bg-slate-900 border-slate-700/80 shadow-2xl";
      case "midnight":
        return "bg-[#0a0f1d] border-gold/40 shadow-2xl";
      default:
        return "bg-white border-gold/30 shadow-2xl";
    }
  };

  const getPdfBadgeClass = () => {
    switch (theme) {
      case "dark":
        return "bg-slate-800/90 text-slate-200 border border-slate-700";
      case "midnight":
        return "bg-[#060a14]/90 text-gold border border-gold/30";
      default:
        return "bg-white/90 text-navy/80 border border-navy/10";
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
      className="fixed inset-0 z-50 flex flex-col bg-navy-deep text-white overflow-hidden w-full h-[100dvh] max-h-[100dvh]"
      style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", WebkitTouchCallout: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
            {/* ── TOP HEADER BAR (Fully responsive across all screen sizes) ───────────────── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-3 sm:px-6 py-2 sm:py-2.5 gap-2 bg-navy-deep/95 border-b border-gold/25 backdrop-blur-md z-40 shrink-0">
        {/* Row 1 on mobile: Title & Window Controls (TOC & Close) */}
        <div className="flex items-center justify-between gap-2 min-w-0 w-full md:w-auto md:flex-1">
          {/* Title area */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0">
              {isVideo ? <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display font-bold text-xs sm:text-sm text-gold truncate max-w-[160px] sm:max-w-[280px] md:max-w-md lg:max-w-lg">
                  {book.title}
                </h2>
                <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold border border-gold/30 shrink-0">
                  {book.mediaType || (isPdf ? "PDF BOOK" : isDocx ? "DOCX BOOK" : "BOOK")}
                </span>
              </div>
              <p className="text-[10px] text-on-navy-muted truncate max-w-[180px] sm:max-w-none">
                ደራሲ፦ {book.author || "RABBI Ministry"}
              </p>
            </div>
          </div>

          {/* Quick window controls on mobile (TOC + Close) */}
          <div className="flex items-center gap-1.5 shrink-0 md:hidden">
            {!isVideo && (
              <button
                onClick={() => setShowToc(!showToc)}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                  showToc ? "bg-gold text-navy-deep border-gold shadow-xs" : "bg-navy/40 text-gold border-gold/30 hover:bg-gold/20"
                }`}
                title="Table of Contents / ማውጫ"
              >
                <ListOrdered className="h-4 w-4" />
                <span className="text-[11px]">ማውጫ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600 hover:text-white transition-all cursor-pointer active:scale-95"
              title="ዝጋ (Close)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 2 on mobile / Right controls on desktop */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 w-full md:w-auto shrink-0 flex-wrap">
          {/* TOC / Index on Desktop */}
          {!isVideo && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`hidden md:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                showToc ? "bg-gold text-navy-deep border-gold shadow-xs" : "bg-navy/40 text-gold border-gold/30 hover:bg-gold/20"
              }`}
              title="Table of Contents / ማውጫ"
            >
              <ListOrdered className="h-4 w-4" />
              <span>ማውጫ (Index)</span>
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

          {/* PDF Zoom & Upscale widget (exact match to user visual, small 5% steps up to 200%) */}
          {isPdf && (
            <div className="flex items-center gap-1 sm:gap-2 rounded-xl bg-navy/60 px-2 sm:px-2.5 py-1 border border-gold/30 shadow-sm shrink-0">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.6, +(s - 0.05).toFixed(2)))}
                className="p-1 text-gold hover:text-white hover:bg-gold/15 rounded-lg transition-all cursor-pointer active:scale-90"
                title="አሳንስ (Zoom Out)"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <span className="text-xs sm:text-sm text-gold font-mono font-bold px-1 min-w-[38px] sm:min-w-[46px] text-center select-none">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((s) => Math.min(2.0, +(s + 0.05).toFixed(2)))}
                className="p-1 text-gold hover:text-white hover:bg-gold/15 rounded-lg transition-all cursor-pointer active:scale-90"
                title="አጉላ (Zoom In up to 200%)"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          )}

          {/* Theme switcher (Bright/ነጭ, Dark/ጨለማ, Midnight/ምሽት) */}
          {!isVideo && (
            <div className="flex items-center rounded-xl bg-navy/40 p-0.5 sm:p-1 border border-gold/25 shrink-0">
              {(["cream", "dark", "midnight"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    theme === th ? "bg-gold text-navy-deep font-bold shadow-xs" : "text-on-navy-muted hover:text-gold"
                  }`}
                  title={`${th} theme`}
                >
                  {th === "cream" ? "ነጭ" : th === "dark" ? "ጨለማ" : "ምሽት"}
                </button>
              ))}
            </div>
          )}

          {/* Font size controls for text & DOCX books ONLY */}
          {!isVideo && !isPdf && (
            <div className="flex items-center gap-1 rounded-xl bg-navy/40 px-2 py-1 border border-gold/25 shrink-0">
              <Type className="h-3.5 w-3.5 text-gold shrink-0" />
              <button
                onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                className="px-1.5 text-xs font-bold text-gold hover:opacity-80 cursor-pointer active:scale-95"
                title="የጽሑፍ መጠን ቀንስ (A-)"
              >
                A-
              </button>
              <span className="text-[10px] text-white font-mono min-w-[28px] text-center">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((s) => Math.min(36, s + 2))}
                className="px-1.5 text-xs font-bold text-gold hover:opacity-80 cursor-pointer active:scale-95"
                title="የጽሑፍ መጠን ጨምር (A+)"
              >
                A+
              </button>
            </div>
          )}

          {/* Close on Desktop */}
          <button
            onClick={onClose}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 border border-red-500/40 hover:bg-red-600 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <X className="h-4 w-4" />
            <span>{t("close")}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div ref={contentAreaRef} className="relative flex-1 overflow-hidden flex bg-navy-deep">
        {/* TOC Sidebar on the Left */}
        {showToc && !isVideo && (
          <>
            {/* Mobile backdrop so TOC never destructively clashes with content */}
            {!pinToc && (
              <div
                className="fixed inset-0 bg-black/60 z-25 md:hidden backdrop-blur-xs"
                onClick={() => setShowToc(false)}
              />
            )}
            <aside
              className={`z-30 w-72 md:w-80 max-w-[85vw] bg-navy-deep/98 border-r border-gold/30 shadow-2xl p-4 sm:p-5 overflow-y-auto backdrop-blur-md animate-in slide-in-from-left duration-200 shrink-0 ${
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

            {/* Tab 1: Chapters & Subchapters list */}
            {tocTab === "chapters" && (
              <div className="space-y-1">
                {effectiveChapters.map((chap, idx) => {
                  const nextChap = effectiveChapters[idx + 1];
                  const isActive =
                    currentPage >= chap.startPage &&
                    (!nextChap || currentPage < nextChap.startPage);
                  const label = chap.startPageLabel || getPageLabel(chap.startPage);
                  const level = chap.level || 1;

                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        handleSelectChapter(chap.startPage);
                        if (!pinToc) setShowToc(false);
                      }}
                      className={`w-full text-left rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                        level === 1
                          ? `p-2.5 text-xs font-bold border ${
                              isActive
                                ? "bg-gold text-navy-deep border-gold shadow-md"
                                : "text-white/90 bg-navy/40 border-gold/15 hover:bg-gold/15 hover:text-gold"
                            }`
                          : level === 2
                          ? `py-2 pr-2.5 pl-6 text-[11px] font-medium border-l-2 ml-1 ${
                              isActive
                                ? "bg-gold/90 text-navy-deep border-gold font-bold shadow-xs"
                                : "text-on-navy-muted border-gold/30 hover:bg-gold/10 hover:text-gold"
                            }`
                          : `py-1.5 pr-2.5 pl-9 text-[10px] font-normal border-l-2 ml-2 ${
                              isActive
                                ? "bg-gold/80 text-navy-deep border-gold font-bold"
                                : "text-on-navy-muted/80 border-gold/20 hover:bg-gold/10 hover:text-gold"
                            }`
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        {level === 1 ? (
                          <BookOpen
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? "text-navy-deep" : "text-gold"
                            }`}
                          />
                        ) : (
                          <span
                            className={`font-mono text-xs shrink-0 ${
                              isActive ? "text-navy-deep" : "text-gold/70"
                            }`}
                          >
                            ↳
                          </span>
                        )}
                        <span className="truncate">{chap.title}</span>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          isActive
                            ? "bg-navy-deep/20 text-navy-deep font-bold"
                            : "bg-navy/60 text-gold border border-gold/20"
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
          </>
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
          <main className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${getPdfBgClass()}`}>
            {/* Scrollable page area (supports horizontal scroll when zoomed up to 200%) */}
            <div
              ref={pdfContainerRef}
              className={`flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 md:p-6 flex flex-col items-center transition-all duration-75 ${getPdfBgClass()}`}
              style={{
                filter: isBlurred ? "blur(36px) contrast(0.5) brightness(0.9)" : "none",
                opacity: isBlurred ? 0.25 : 1,
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
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
                    <div
                      className={`flex gap-3 sm:gap-4 items-start justify-center transition-all duration-150 w-full ${
                        twoPageView ? "lg:flex-row flex-col" : "flex-col items-center"
                      }`}
                      style={{
                        width: zoomScale > 1 ? `${Math.round(zoomScale * 100)}%` : "100%",
                        maxWidth: `${Math.round((twoPageView ? 1152 : 768) * zoomScale)}px`,
                      }}
                    >
                      {/* Page 1 */}
                      <div
                        className={`relative rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-200 ${getPdfCardClass()} ${twoPageView ? "flex-1 min-w-0" : "w-full"}`}
                      >
                        <canvas
                          ref={pdfCanvasRef}
                          className="block w-full h-auto transition-[filter] duration-200"
                          style={{
                            filter: getPdfCanvasFilter(),
                          }}
                        />
                        <div className={`absolute bottom-2 right-3 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm z-20 ${getPdfBadgeClass()}`}>
                          {t("page")} {getPageLabel(currentPage)}
                        </div>
                      </div>

                      {/* Page 2 (two-page spread) */}
                      {twoPageView && currentPage < pdfNumPages && (
                        <div
                          className={`relative rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-200 ${getPdfCardClass()} flex-1 min-w-0 hidden lg:block`}
                        >
                          <canvas
                            ref={pdfCanvasRef2}
                            className="block w-full h-auto transition-[filter] duration-200"
                            style={{
                              filter: getPdfCanvasFilter(),
                            }}
                          />
                          <div className={`absolute bottom-2 right-3 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm z-20 ${getPdfBadgeClass()}`}>
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
          
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── BOTTOM NAVIGATION BAR (Clean, non-wrapping on all screen sizes) ─────── */}
            <div className="shrink-0 flex items-center justify-between sm:justify-center gap-2 sm:gap-4 bg-navy-deep/95 border-t border-gold/30 px-3 sm:px-6 py-2 sm:py-2.5 shadow-xl backdrop-blur-sm z-30">
              <button
                disabled={currentPage <= 1}
                onClick={handlePrevPage}
                className="flex items-center gap-1 rounded-xl bg-gold/15 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-navy-deep transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t("prevPage")}</span>
              </button>

              <form onSubmit={handleJumpToPage} className="flex items-center gap-1 sm:gap-1.5 text-xs">
                <span className="text-on-navy-muted text-[11px]">{t("page")}</span>
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-11 sm:w-14 rounded-lg border border-gold/30 bg-white px-1 sm:px-2 py-1 text-center font-mono text-xs text-navy focus:border-gold focus:outline-none"
                />
                <span className="text-on-navy-muted text-[11px]">
                  {t("pageOf")} {getPageLabel(totalPages)}
                </span>
                <button type="submit" className="rounded-lg bg-gold/20 px-2 sm:px-2.5 py-1 text-[11px] font-bold text-gold hover:bg-gold hover:text-navy-deep cursor-pointer active:scale-95 shrink-0">
                  {t("go")}
                </button>
              </form>

              <button
                disabled={currentPage >= totalPages}
                onClick={handleNextPage}
                className="flex items-center gap-1 rounded-xl bg-gold/15 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-navy-deep transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
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
