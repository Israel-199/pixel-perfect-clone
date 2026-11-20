/**
 * prefetch.ts — Smart content prefetching for PlatformReader
 *
 * Strategy:
 * - Preload PDF.js script tag as soon as a permitted book is detected
 * - Cache raw PDF bytes in memory keyed by URL so PlatformReader opens instantly
 * - Expose a hook to prefetch on hover / on page load for PERMITTED books
 */

import { API_BASE_URL } from "./api";

const PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// In-memory byte cache: url → Uint8Array
const pdfByteCache = new Map<string, Uint8Array>();
const inFlightPdf = new Map<string, Promise<Uint8Array | null>>();
let pdfjsLoading = false;
let pdfjsReady = false;

/** Clear cached bytes for a given url */
export function clearCachedPdf(url: string): void {
  pdfByteCache.delete(url);
}

/**
 * Returns cached bytes as a fresh cloned Uint8Array.
 * Clones the buffer so PDF.js Web Worker postMessage transfers
 * will never detach the cached master ArrayBuffer.
 */
export function getCachedPdfBytes(url: string): Uint8Array | null {
  const cached = pdfByteCache.get(url);
  if (!cached) return null;
  // If buffer has been detached, purge from cache
  if (cached.byteLength === 0 || cached.buffer.byteLength === 0) {
    pdfByteCache.delete(url);
    return null;
  }
  try {
    return new Uint8Array(cached);
  } catch {
    pdfByteCache.delete(url);
    return null;
  }
}

/** Inject PDF.js script once globally (idempotent) */
export function ensurePdfjsLoaded(): Promise<void> {
  if (pdfjsReady || (window as any).pdfjsLib) {
    pdfjsReady = true;
    return Promise.resolve();
  }
  if (pdfjsLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if ((window as any).pdfjsLib) { clearInterval(check); pdfjsReady = true; resolve(); }
      }, 50);
    });
  }
  pdfjsLoading = true;
  return new Promise<void>((resolve, reject) => {
    // Also add worker as a preload link
    const workerLink = document.createElement("link");
    workerLink.rel = "preload";
    workerLink.as = "script";
    workerLink.href = PDFJS_WORKER;
    document.head.appendChild(workerLink);

    const script = document.createElement("script");
    script.src = PDFJS_SRC;
    script.onload = () => {
      pdfjsReady = true;
      pdfjsLoading = false;
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve();
    };
    script.onerror = () => {
      pdfjsLoading = false;
      reject(new Error("PDF.js failed to prefetch"));
    };
    document.head.appendChild(script);
  });
}

/** Fetch PDF bytes and cache them (idempotent, deduped). Always returns a clone. */
export function prefetchPdfBytes(contentUrl: string): Promise<Uint8Array | null> {
  if (pdfByteCache.has(contentUrl)) {
    const cached = pdfByteCache.get(contentUrl);
    if (cached && cached.byteLength > 0 && cached.buffer.byteLength > 0) {
      try {
        return Promise.resolve(new Uint8Array(cached));
      } catch {
        pdfByteCache.delete(contentUrl);
      }
    } else {
      pdfByteCache.delete(contentUrl);
    }
  }

  if (inFlightPdf.has(contentUrl)) return inFlightPdf.get(contentUrl)!;

  const promise = (async (): Promise<Uint8Array | null> => {
    try {
      const isCloudinary = contentUrl.includes("cloudinary.com");
      const proxyUrl = `${API_BASE_URL}/books/pdf-proxy?url=${encodeURIComponent(contentUrl)}`;
      const urlsToTry = isCloudinary ? [proxyUrl, contentUrl] : [contentUrl, proxyUrl];

      for (const u of urlsToTry) {
        try {
          const res = await fetch(u);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            pdfByteCache.set(contentUrl, bytes);
            return new Uint8Array(bytes);
          }
        } catch {}
      }
      return null;
    } finally {
      inFlightPdf.delete(contentUrl);
    }
  })();

  inFlightPdf.set(contentUrl, promise);
  return promise;
}

/** Determine if a content string looks like a PDF URL */
export function isPdfUrl(content: string): boolean {
  const c = (content || "").trim();
  return (
    /\.(pdf)(\?|$)/i.test(c) ||
    (c.startsWith("http") && c.includes("cloudinary.com") && !c.includes(".docx"))
  );
}

/**
 * Prefetch everything needed to open the reader instantly:
 * 1. PDF.js library
 * 2. PDF binary bytes
 */
export async function prefetchBookContent(book: {
  fullContent?: string | null;
  sampleContent?: string | null;
  mediaType?: string;
  videoUrl?: string | null;
  isPermitted?: boolean;
}): Promise<void> {
  if (!book.isPermitted) return;

  const content = (book.fullContent || book.sampleContent || "").trim();
  if (!content) return;

  const looksLikePdf = isPdfUrl(content) || book.mediaType === "PDF";
  if (!looksLikePdf) return;

  // Fire & forget — do not await so calling code doesn't block
  ensurePdfjsLoaded().catch(() => {});
  if (content.startsWith("http")) {
    prefetchPdfBytes(content).catch(() => {});
  }
}
