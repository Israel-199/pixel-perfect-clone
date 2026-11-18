/**
 * Helper to compute book page count from text or PDF URL
 * and format currency conversions (ETB <-> USD).
 */

// Approximate exchange rate: 1 USD ≈ 125 ETB
export const ETB_TO_USD_RATE = 161;

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

export interface ChapterItem {
  id: number;
  title: string;
  startPage: number;
  startPageLabel?: string;
  level?: number; // 1 = Chapter, 2 = Subchapter, 3 = Sub-subchapter
}

export interface DocxAnalysis {
  pageCount: number;
  pages: string[];
  fullText: string;
  paragraphs: string[];
  chapters: ChapterItem[];
  pageLabels: string[];
}

/**
 * Cache for asynchronously analyzed DOCX files by URL
 */
const docxAnalysisCache = new Map<string, DocxAnalysis>();

/**
 * Convert number to Roman numerals (e.g. 1 -> "i" or "I")
 */
export function toRoman(num: number, uppercase = false): string {
  if (num <= 0 || num > 3999) return String(num);
  const lookup: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [val, roman] of lookup) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return uppercase ? result : result.toLowerCase();
}

/**
 * Parse Roman numeral string to number (e.g. "iv" -> 4, "XII" -> 12)
 */
export function fromRoman(str: string): number | null {
  const roman = str.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(roman)) return null;
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const char1 = roman[i] || "";
    const char2 = roman[i + 1] || "";
    const cur = map[char1] || 0;
    const next = map[char2] || 0;
    if (next && next > cur) {
      total += next - cur;
      i++;
    } else {
      total += cur;
    }
  }
  return total > 0 ? total : null;
}

/**
 * Convert number to Alphabetic letter (e.g. 1 -> "A" or "a")
 */
export function toAlpha(num: number, uppercase = true): string {
  if (num <= 0 || num > 26) return String(num);
  const code = (uppercase ? 65 : 97) + (num - 1);
  return String.fromCharCode(code);
}

/**
 * Parse alphabetic page label to number (e.g. "a" -> 1, "C" -> 3)
 */
export function fromAlpha(str: string): number | null {
  const clean = str.trim();
  if (/^[a-zA-Z]$/.test(clean)) {
    const code = clean.toUpperCase().charCodeAt(0);
    return code - 64;
  }
  return null;
}

/**
 * Common regex for chapters in Amharic and English documents
 */
export const CHAPTER_HEADING_REGEX =
  /^(?:#+\s*|(?:ምዕራፍ|ክፍል|ትምህርት|Chapter|Section|Part|Unit)\s*(?:[0-9]+|[፩-፱]+|[IVXLCDMivxlcdm]+|[A-Za-z]+)?[:\s\-—.]|^(?:[IVXLCDM]+|[፩-፱]+|[0-9]+)[\.\:\-—]\s+[^\n]+)/i;

/**
 * Common regex for subchapters (e.g. 1.1, 1.2, 2.1, ንዑስ ርዕስ, Subsection)
 */
export const SUBCHAPTER_HEADING_REGEX =
  /^(?:#+#+\s*|(?:\d+\.\d+|\b[a-z]\b|[፩-፱]+\.[፩-፱]+)[\.\:\s\-—]|(?:ንዑስ\s*(?:ክፍል|ርዕስ)|Sub-?chapter|Subsection)\s*(?:[0-9]+|[A-Za-z]+)?[:\s\-—.]|(?:\d+\.\d+)\s+[^\n]+)/i;

/**
 * Robust Table of Contents ("ማውጫ") parser for both PDF text and DOCX text.
 * Automatically parses chapter titles, subchapters (level 1 vs level 2 vs level 3),
 * and maps each to its exact target page and label.
 */
export function parseTableOfContentsText(
  tocText: string,
  totalPagesCount = 9999,
  pageLabels?: string[]
): ChapterItem[] {
  if (!tocText) return [];
  const lines = tocText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: ChapterItem[] = [];

  // Match: Title + separator (dots, dashes, spaces, tabs) + Page number / Roman numeral
  const tocLineRegex = /^(.*?)(?:[\s\.\-—_]{2,}|\t+)([0-9]+|[ivxlcdm]+|[፩-፱]+)\s*$/i;

  const parseNum = (val: string): number => {
    if (/^\d+$/.test(val)) return parseInt(val, 10);
    const roman = fromRoman(val);
    if (roman !== null) return roman;
    return parseInt(val, 10) || 1;
  };

  let inToc = false;

  for (const line of lines) {
    if (/^(?:#+\s*)?(?:ማውጫ|የርዕስ\s*ማውጫ|Table\s*of\s*Contents|Contents|Index)\b/i.test(line)) {
      inToc = true;
      continue;
    }

    if (!inToc && items.length === 0) {
      if (!tocLineRegex.test(line)) continue;
    }

    const match = line.match(tocLineRegex);
    if (match) {
      const rawTitle = (match[1] || "").replace(/^[#\*\-•\s]+/, "").trim();
      const rawPage = (match[2] || "").trim();
      const pageNo = Math.min(totalPagesCount, Math.max(1, parseNum(rawPage)));

      if (!rawTitle || rawTitle.length < 2) continue;

      const isSub =
        /^(?:\d+\.\d+|[a-z]\b|[፩-፱]+\.[፩-፱]+|ንዑስ|Sub)/i.test(rawTitle) ||
        line.startsWith(" ") ||
        line.startsWith("\t");

      const isSubSub = /^\d+\.\d+\.\d+/i.test(rawTitle);
      const level = isSubSub ? 3 : isSub ? 2 : 1;

      items.push({
        id: items.length + 1,
        title: rawTitle,
        startPage: pageNo,
        startPageLabel: pageLabels?.[pageNo - 1] || rawPage,
        level,
      });
    } else if (inToc && items.length > 0 && /^(?:መቅድም|መግቢያ|ምዕራፍ|ክፍል|Chapter|Part|Section)\b/i.test(line)) {
      if (line.length > 80) break;
    }
  }

  return items;
}


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
  let numberingFormat: "roman" | "lowerRoman" | "upperLetter" | "lowerLetter" | "decimal" =
    "decimal";

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

      // word/document.xml holds page breaks, sections and numbering format
      const docXml = await zip.file("word/document.xml")?.async("text");
      if (docXml) {
        const pageBreaks = docXml.match(
          /<w:br[^>]+w:type=["']page["']|<w:lastRenderedPageBreak\b/gi,
        );
        if (pageBreaks) {
          explicitPageBreakCount = pageBreaks.length;
        }

        // Check for page numbering format in section properties (e.g. w:fmt="roman" | "lowerRoman" | "upperLetter")
        const numFormatMatch = docXml.match(/<w:pgNumType[^>]*w:fmt=["']([^"']+)["']/i);
        if (numFormatMatch) {
          const fmt = numFormatMatch[1].toLowerCase();
          if (fmt === "roman") numberingFormat = "roman";
          else if (fmt === "lowerroman") numberingFormat = "lowerRoman";
          else if (fmt === "upperletter") numberingFormat = "upperLetter";
          else if (fmt === "lowerletter") numberingFormat = "lowerLetter";
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
      chapters: [{ id: 1, title: "መግቢያ", startPage: 1, startPageLabel: "1" }],
      pageLabels: ["1"],
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
  // - If Word's app.xml explicitly declared Pages (e.g. 1), that is strictly respected.
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

  // 6. Build Page Labels (Roman, Alphabetic, or Decimal numbers):
  const pageLabels: string[] = [];
  for (let i = 1; i <= pages.length; i++) {
    if (numberingFormat === "roman") {
      pageLabels.push(toRoman(i, true));
    } else if (numberingFormat === "lowerRoman") {
      pageLabels.push(toRoman(i, false));
    } else if (numberingFormat === "upperLetter") {
      pageLabels.push(toAlpha(i, true));
    } else if (numberingFormat === "lowerLetter") {
      pageLabels.push(toAlpha(i, false));
    } else {
      pageLabels.push(String(i));
    }
  }

  // 7. Extract Chapters & Subchapters with starting page mapping:
  // First, check if document has an explicit Table of Contents section ("ማውጫ" / "Table of Contents")
  const extractedToc = parseTableOfContentsText(rawText, pages.length, pageLabels);
  let chapters: ChapterItem[] = [];

  if (extractedToc.length >= 2) {
    // Exact Table of Contents found in document!
    chapters = extractedToc;
  } else {
    // Scan pages for Chapter (Level 1) and Subchapter (Level 2) headings
    pages.forEach((pageContent, pageIdx) => {
      const lines = pageContent
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (line.length <= 110) {
          const isChap = CHAPTER_HEADING_REGEX.test(line);
          const isSub = !isChap && SUBCHAPTER_HEADING_REGEX.test(line);

          if (isChap || isSub) {
            const cleanTitle = line.replace(/^[#\*\-•\s]+/, "").trim();
            if (!chapters.some((c) => c.title.toLowerCase() === cleanTitle.toLowerCase())) {
              chapters.push({
                id: chapters.length + 1,
                title: cleanTitle,
                startPage: pageIdx + 1,
                startPageLabel: pageLabels[pageIdx] || String(pageIdx + 1),
                level: isSub ? 2 : 1,
              });
            }
          }
        }
      }
    });
  }

  // If no explicit chapters matched, add a default chapter
  if (chapters.length === 0) {
    chapters.push({
      id: 1,
      title: paragraphs[0] && paragraphs[0].length <= 80 ? paragraphs[0] : "ምዕራፍ 1",
      startPage: 1,
      startPageLabel: pageLabels[0] || "1",
      level: 1,
    });
  }

  const analysis: DocxAnalysis = {
    pageCount: pages.length,
    pages,
    fullText: rawText,
    paragraphs,
    chapters,
    pageLabels,
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
