import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 50 MB max per upload — covers large PDFs/DOCX; images rarely exceed 10 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Allow images, PDFs, Word documents, audio and video
    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
      "video/mp4", "video/webm", "video/ogg",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

export interface CloudinaryAssetInfo {
  publicId: string;
  resourceType: "image" | "raw" | "video";
}

/**
 * Accurately extracts the public_id and resource_type from a Cloudinary URL.
 * Handles folder paths, version prefixes, signatures, and transformations.
 */
export function parseCloudinaryUrl(url: string | null | undefined): CloudinaryAssetInfo | null {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return null;
  }
  try {
    const uploadIdx = url.indexOf("/upload/");
    if (uploadIdx === -1) return null;

    const prefix = url.substring(0, uploadIdx);
    let after = url.substring(uploadIdx + "/upload/".length);

    // resource_type is the segment right before /upload/
    const prefixSegments = prefix.split("/");
    let resourceType = prefixSegments[prefixSegments.length - 1].toLowerCase();
    if (resourceType !== "image" && resourceType !== "raw" && resourceType !== "video") {
      resourceType = "image";
    }

    if (after.includes("?")) {
      after = after.split("?")[0];
    }

    const segments = after.split("/");
    const cleanSegments: string[] = [];
    for (const s of segments) {
      if (!s) continue;
      // Strip signature s--...--
      if (s.startsWith("s--") && s.endsWith("--")) continue;
      // Strip version v123456
      if (/^v\d+$/.test(s)) continue;
      // Strip standard transformations like w_200,h_200,c_fill
      if (/^(?:[a-z]{1,3}_[a-z0-9_,-]+)(?:,[a-z]{1,3}_[a-z0-9_,-]+)*$/i.test(s)) continue;
      cleanSegments.push(s);
    }

    let rawPublicId = decodeURIComponent(cleanSegments.join("/"));

    // For images and videos, Cloudinary public_id does NOT contain the extension
    if (resourceType === "image" || resourceType === "video") {
      const lastDot = rawPublicId.lastIndexOf(".");
      if (lastDot > 0) {
        rawPublicId = rawPublicId.substring(0, lastDot);
      }
    }

    return {
      publicId: rawPublicId,
      resourceType: resourceType as "image" | "raw" | "video",
    };
  } catch {
    return null;
  }
}

/**
 * Deletes a single asset from Cloudinary.
 */
export async function deleteFromCloudinary(
  urlOrPublicId: string,
  resourceTypeOverride?: "image" | "raw" | "video"
): Promise<boolean> {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") return false;
  try {
    let publicId = urlOrPublicId;
    let resourceType: "image" | "raw" | "video" = resourceTypeOverride || "image";

    if (urlOrPublicId.includes("cloudinary.com")) {
      const parsed = parseCloudinaryUrl(urlOrPublicId);
      if (!parsed) return false;
      publicId = parsed.publicId;
      resourceType = resourceTypeOverride || parsed.resourceType;
    }

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return res.result === "ok";
  } catch (err: any) {
    console.warn(`[Cloudinary] Failed to delete ${urlOrPublicId}:`, err?.message || err);
    return false;
  }
}

/**
 * Fire-and-forget background deletion of multiple Cloudinary URLs.
 * Runs completely non-blocking, with zero latency added to caller.
 */
export function deleteFilesFromCloudinaryAsync(urls: (string | null | undefined)[]): void {
  const validUrls = urls.filter((u): u is string => typeof u === "string" && u.includes("cloudinary.com"));
  if (validUrls.length === 0) return;

  setImmediate(async () => {
    try {
      await Promise.allSettled(validUrls.map((u) => deleteFromCloudinary(u)));
    } catch (e: any) {
      console.warn("[Cloudinary] Async deletion error:", e?.message);
    }
  });
}

export { cloudinary };
