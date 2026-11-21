import { prisma } from "../config/prisma";
import { deleteFilesFromCloudinaryAsync } from "../config/cloudinary";

export interface PopupVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  isActive?: boolean;
  autoPlay?: boolean;
  order?: number;
}

export class PopupVideoService {
  /**
   * Retrieves all active popup videos for public display on the website,
   * sorted by order ascending and createdAt ascending.
   */
  static async getPublicPopupVideos() {
    try {
      const videos = await prisma.popupVideo.findMany({
        where: {
          isActive: true,
          videoUrl: { not: "" },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });

      return videos;
    } catch (error) {
      console.error("[PopupVideoService.getPublicPopupVideos] Error:", error);
      return [];
    }
  }

  /**
   * Retrieves all popup videos (active and inactive) for admin management.
   */
  static async getAllAdminPopupVideos() {
    const videos = await prisma.popupVideo.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return videos;
  }

  /**
   * Creates a new popup video.
   */
  static async createPopupVideo(input: PopupVideoInput) {
    // Count existing to assign next order
    const count = await prisma.popupVideo.count();

    const created = await prisma.popupVideo.create({
      data: {
        title: input.title?.trim() || "About RABBI Digital",
        description: input.description?.trim() || "",
        videoUrl: input.videoUrl?.trim() || "",
        thumbnailUrl: input.thumbnailUrl?.trim() || null,
        ctaText: input.ctaText?.trim() || "ስለ እኛ ተጨማሪ እወቅ",
        ctaLink: input.ctaLink?.trim() || "/about",
        isActive: input.isActive !== undefined ? input.isActive : true,
        autoPlay: input.autoPlay !== undefined ? input.autoPlay : true,
        order: input.order !== undefined ? input.order : count,
      },
    });

    return created;
  }

  /**
   * Updates an existing popup video by ID.
   */
  static async updatePopupVideo(id: string, input: PopupVideoInput) {
    const data: any = {};

    if (input.title !== undefined) data.title = String(input.title).trim();
    if (input.description !== undefined) data.description = String(input.description).trim();
    if (input.videoUrl !== undefined) data.videoUrl = String(input.videoUrl).trim();
    if (input.thumbnailUrl !== undefined) data.thumbnailUrl = input.thumbnailUrl ? String(input.thumbnailUrl).trim() : null;
    if (input.ctaText !== undefined) data.ctaText = input.ctaText ? String(input.ctaText).trim() : null;
    if (input.ctaLink !== undefined) data.ctaLink = input.ctaLink ? String(input.ctaLink).trim() : null;
    if (input.isActive !== undefined) data.isActive = Boolean(input.isActive);
    if (input.autoPlay !== undefined) data.autoPlay = Boolean(input.autoPlay);
    if (input.order !== undefined) data.order = Number(input.order);

    const updated = await prisma.popupVideo.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Deletes a popup video by ID and cleans up Cloudinary assets in background.
   */
  static async deletePopupVideo(id: string) {
    const existing = await prisma.popupVideo.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Popup video not found");
    }

    if (existing.videoUrl || existing.thumbnailUrl) {
      deleteFilesFromCloudinaryAsync([existing.videoUrl, existing.thumbnailUrl]);
    }

    await prisma.popupVideo.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Reorders multiple popup videos.
   */
  static async reorderPopupVideos(orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.popupVideo.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return { success: true };
  }
}
