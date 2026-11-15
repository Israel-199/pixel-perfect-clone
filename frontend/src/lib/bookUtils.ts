/**
 * Helper to compute book page count from text or PDF URL
 * and format currency conversions (ETB <-> USD).
 */

// Approximate exchange rate: 1 USD ≈ 125 ETB
export const ETB_TO_USD_RATE = 125;

/**
 * Convert ETB amount to USD string format (e.g. "$2.40")
 */
export function formatEtbWithUsd(etbPrice: number | string | undefined | null): {
  etbText: string;
  usdText: string;
  combinedText: string;
} {
  const num = typeof etbPrice === "number" ? etbPrice : parseFloat(String(etbPrice || 0));
  if (isNaN(num) || num <= 0) {
    return {
      etbText: "ነፃ (Free)",
      usdText: "$0.00",
      combinedText: "ነፃ (Free)",
    };
  }

  const usd = (num / ETB_TO_USD_RATE).toFixed(2);
  return {
    etbText: `${num.toLocaleString()} ETB`,
    usdText: `≈ $${usd} USD`,
    combinedText: `${num.toLocaleString()} ETB (≈ $${usd} USD)`,
  };
}

/**
 * Calculate accurate page count from text content.
 * Splits text into chapters & pages matching the PlatformReader logic (~280 words per page).
 */
export function estimateTextPageCount(content?: string | null): number {
  if (!content) return 0;
  const raw = content.trim();
  if (!raw) return 0;

  // If content is a URL (e.g. PDF link on Cloudinary)
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.includes(".pdf")) {
    return 0; // Handled asynchronously via PDF inspector or fallback
  }

  const chapterDelimiter =
    /(?:(?:\r?\n)+(?=(?:ክፍል|ምዕራፍ|ትምህርት|Chapter|Part)\s*(?:[0-9]+|[፩-፱]+|[A-Z]+)?[:\s\-—]))/i;
  const rawChapters = raw.split(chapterDelimiter).filter(Boolean);

  let pageCounter = 0;

  if (rawChapters.length === 0) {
    const wordCount = raw.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 280));
  }

  rawChapters.forEach((chapText) => {
    const paragraphs = chapText.split(/\r?\n\s*\r?\n/);
    let currentPageText = "";

    paragraphs.forEach((para) => {
      if ((currentPageText + "\n\n" + para).split(/\s+/).filter(Boolean).length > 280) {
        if (currentPageText.trim()) {
          pageCounter++;
          currentPageText = para;
        }
      } else {
        currentPageText += (currentPageText ? "\n\n" : "") + para;
      }
    });

    if (currentPageText.trim()) {
      pageCounter++;
    }
  });

  return Math.max(1, pageCounter);
}

export interface DocxAnalysis {
  pageCount: number;
  pages: string[];
  fullText: string;
  paragraphs: string[];
}

/**
 * Cache for asynchronously analyzed DOCX files by URL
 */
const docxAnalysisCache = new Map<string, DocxAnalysis>();

export async function loadJSZip(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).JSZip) return (window as any).JSZip;
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="jszip"]');
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).JSZip));
      existing.addEventListener("error", () => reject(new Error("Failed to load JSZip")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve((window as any).JSZip);
    script.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(script);
  });
}

export async function loadMammoth(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).mammoth) return (window as any).mammoth;
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="mammoth"]');
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).mammoth));
      existing.addEventListener("error", () => reject(new Error("Failed to load Mammoth")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => resolve((window as any).mammoth);
    script.onerror = () => reject(new Error("Failed to load Mammoth"));
    document.head.appendChild(script);
  });
}

/**
 * Extract exact page count, paragraphs, and lossless pages from a DOCX file.
 * Preserves the exact page count (e.g. 1 page stays 1 page) and keeps original
 * paragraph gaps and spacing intact.
 */
export async function parseDocx(docxUrlOrBuffer: string | ArrayBuffer): Promise<DocxAnalysis> {
  const isUrl = typeof docxUrlOrBuffer === "string";
  if (isUrl && docxAnalysisCache.has(docxUrlOrBuffer as string)) {
    return docxAnalysisCache.get(docxUrlOrBuffer as string)!;
  }

  let arrayBuffer: ArrayBuffer;
  if (isUrl) {
    const res = await fetch(docxUrlOrBuffer as string);
    if (!res.ok) throw new Error(`Failed to fetch DOCX file: ${res.status}`);
    arrayBuffer = await res.arrayBuffer();
  } else {
    arrayBuffer = docxUrlOrBuffer as ArrayBuffer;
  }

  const [JSZip, mammoth] = await Promise.all([
    loadJSZip().catch(() => null),
    loadMammoth().catch(() => null),
  ]);

  let declaredPageCount = 0;
  let explicitPageBreakCount = 0;
  let rawText = "";

  // 1. Inspect docx internal XML via JSZip
  if (JSZip) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // docProps/app.xml holds the official Word-saved page count
      const appXml = await zip.file("docProps/app.xml")?.async("text");
      if (appXml) {
        const pageMatch = appXml.match(/<Pages>(\d+)<\/Pages>/i);
        if (pageMatch) {
          declaredPageCount = parseInt(pageMatch[1], 10);
        }
      }

      // word/document.xml holds page breaks
      const docXml = await zip.file("word/document.xml")?.async("text");
      if (docXml) {
        const pageBreaks = docXml.match(/<w:br[^>]+w:type=["']page["']|<w:lastRenderedPageBreak\b/gi);
        if (pageBreaks) {
          explicitPageBreakCount = pageBreaks.length;
        }
      }
    } catch (e) {
      console.warn("JSZip docx inspection notice:", e);
    }
  }

  // 2. Extract text with paragraphs using Mammoth
  if (mammoth) {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      rawText = (result.value || "").trim();
    } catch (e) {
      console.warn("Mammoth extraction notice:", e);
    }
  }

  if (!rawText) {
    const emptyResult: DocxAnalysis = {
      pageCount: declaredPageCount || 1,
      pages: [""],
      fullText: "",
      paragraphs: [],
    };
    if (isUrl) docxAnalysisCache.set(docxUrlOrBuffer as string, emptyResult);
    return emptyResult;
  }

  // 3. Preserve paragraph gaps:
  // Split strictly by paragraph breaks (empty lines / double newlines)
  // so all original paragraph gaps and line spacing remain 100% intact.
  const paragraphs = rawText
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;

  // 4. Calculate final page count:
  // - If Word's app.xml explicitly declared Pages (e.g. 1), that is respected.
  // - If explicit page breaks exist, page count = breaks + 1.
  // - Otherwise, standard density is ~450 words/page (so 1-page documents stay 1 page!).
  let finalPageCount = 1;
  if (declaredPageCount > 0) {
    finalPageCount = declaredPageCount;
  } else if (explicitPageBreakCount > 0) {
    finalPageCount = explicitPageBreakCount + 1;
  } else {
    finalPageCount = Math.max(1, Math.ceil(wordCount / 450));
  }

  // 5. Build pages preserving gaps:
  let pages: string[] = [];
  if (finalPageCount <= 1 || paragraphs.length <= 1) {
    // Single page document: keep ALL paragraphs and gaps together on Page 1!
    pages = [paragraphs.join("\n\n")];
  } else {
    const parasPerPage = Math.max(1, Math.ceil(paragraphs.length / finalPageCount));
    for (let i = 0; i < paragraphs.length; i += parasPerPage) {
      const pageParas = paragraphs.slice(i, i + parasPerPage);
      pages.push(pageParas.join("\n\n"));
    }
    if (pages.length === 0) {
      pages = [paragraphs.join("\n\n")];
    }
  }

  const analysis: DocxAnalysis = {
    pageCount: finalPageCount,
    pages,
    fullText: rawText,
    paragraphs,
  };

  if (isUrl) {
    docxAnalysisCache.set(docxUrlOrBuffer as string, analysis);
  }

  return analysis;
}

/**
 * Cache for asynchronously detected PDF page counts by URL
 */
const pdfPageCountCache = new Map<string, number>();

/**
 * Asynchronously fetch page count of a PDF using PDF.js
 */
export async function getPdfPageCount(pdfUrl: string): Promise<number> {
  if (!pdfUrl) return 0;
  if (/\.docx?(\?|$)/i.test(pdfUrl)) return 0;
  if (pdfPageCountCache.has(pdfUrl)) {
    return pdfPageCountCache.get(pdfUrl)!;
  }

  try {
    if (typeof window === "undefined") return 0;

    // Ensure PDF.js is loaded
    if (!(window as any).pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("PDF.js load error"));
        document.head.appendChild(script);
      });
    }

    const pdfjs = (window as any).pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const response = await fetch(pdfUrl);
    if (!response.ok) return 0;
    const arrayBuffer = await response.arrayBuffer();
    const uint8Data = new Uint8Array(arrayBuffer);

    const doc = await pdfjs.getDocument({
      data: uint8Data,
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    }).promise;

    const count = doc.numPages || 0;
    if (count > 0) {
      pdfPageCountCache.set(pdfUrl, count);
    }
    return count;
  } catch (err) {
    console.warn("Failed to get PDF page count:", err);
    return 0;
  }
}
