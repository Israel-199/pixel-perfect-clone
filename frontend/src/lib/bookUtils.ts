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

/**
 * Cache for asynchronously detected PDF page counts by URL
 */
const pdfPageCountCache = new Map<string, number>();

/**
 * Asynchronously fetch page count of a PDF using PDF.js
 */
export async function getPdfPageCount(pdfUrl: string): Promise<number> {
  if (!pdfUrl) return 0;
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
