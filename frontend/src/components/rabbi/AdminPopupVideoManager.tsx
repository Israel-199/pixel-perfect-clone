import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ExternalLink,
  Link as LinkIcon,
  Play,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Layers,
  Check,
  X,
  Smartphone,
  Monitor,
} from "lucide-react";
import { fetchApi, clearApiCache } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { PopupVideoWidget, type PopupVideoData } from "./PopupVideoWidget";

interface AdminPopupVideoManagerProps {
  xhrUpload: (
    file: File,
    resourceType: string,
    onProgress: (pct: number) => void
  ) => Promise<{ url: string }>;
}

export function AdminPopupVideoManager({ xhrUpload }: AdminPopupVideoManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videos, setVideos] = useState<PopupVideoData[]>([]);

  // Dialog / Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [ctaText, setCtaText] = useState("ስለ እኛ ተጨማሪ እወቅ");
  const [ctaLink, setCtaLink] = useState("/about");
  const [isActive, setIsActive] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  // Upload progress states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  // Preview device mode (desktop vs mobile)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all popup videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ videos: PopupVideoData[]; popup?: PopupVideoData }>(
        "/admin/popup-video",
        { skipCache: true }
      );
      if (res?.videos && Array.isArray(res.videos)) {
        setVideos(res.videos);
      } else if (res?.popup) {
        setVideos([res.popup]);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch popup videos:", err);
      showToast.error("የቪዲዮ ቅንብሮችን መጫን አልተቻለም (Failed to load popup videos)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Open Add Video Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("About RABBI Digital");
    setDescription("የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ");
    setVideoUrl("");
    setThumbnailUrl("");
    setCtaText("ስለ እኛ ተጨማሪ እወቅ");
    setCtaLink("/about");
    setIsActive(true);
    setAutoPlay(true);
    setIsEditing(true);
  };

  // Open Edit Video Modal
  const handleOpenEdit = (v: PopupVideoData) => {
    setEditingId(v.id || null);
    setTitle(v.title || "");
    setDescription(v.description || "");
    setVideoUrl(v.videoUrl || "");
    setThumbnailUrl(v.thumbnailUrl || "");
    setCtaText(v.ctaText || "ስለ እኛ ተጨማሪ እወቅ");
    setCtaLink(v.ctaLink || "/about");
    setIsActive(v.isActive !== undefined ? v.isActive : true);
    setAutoPlay(v.autoPlay !== undefined ? v.autoPlay : true);
    setIsEditing(true);
  };

  // Video File Upload via Cloudinary
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|ogg)$/i)) {
      showToast.error("እባክዎ ትክክለኛ የቪዲዮ ፋይል ይምረጡ (.mp4, .webm)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast.error("የቪዲዮው መጠን ከ50MB ማነስ አለበት (Max 50MB)");
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(0);

    try {
      const res = await xhrUpload(file, "video", (pct) => {
        setUploadProgress(pct);
      });

      if (res?.url) {
        setVideoUrl(res.url);
        showToast.success("ቪዲዮው በተሳካ ሁኔታ ተጭኗል! (Video uploaded)");
      }
    } catch (err: any) {
      console.error("Video upload failed:", err);
      showToast.error(err.message || "ቪዲዮውን መጫን አልተቻለም");
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Thumbnail File Upload
  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("እባክዎ ምስል ፋይል ይምረጡ (Select an image file)");
      return;
    }

    setIsUploadingThumb(true);
    setThumbProgress(0);

    try {
      const res = await xhrUpload(file, "image", (pct) => {
        setThumbProgress(pct);
      });

      if (res?.url) {
        setThumbnailUrl(res.url);
        showToast.success("ምስሉ ተጭኗል! (Thumbnail uploaded)");
      }
    } catch (err: any) {
      console.error("Thumbnail upload failed:", err);
      showToast.error(err.message || "ምስሉን መጫን አልተቻለም");
    } finally {
      setIsUploadingThumb(false);
      setThumbProgress(0);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  // Save Video (Create or Update)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      showToast.error("እባክዎ ቪዲዮ ይጫኑ ወይም የቪዲዮ URL ያስገቡ");
      return;
    }

    if (!description.trim()) {
      showToast.error("እባክዎ ባለአንድ መስመር መግለጫ ያስገቡ (Description is required)");
      return;
    }

    setSaving(true);
    try {
      const payload: PopupVideoData = {
        title: title.trim() || "About RABBI Digital",
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        ctaText: ctaText.trim() || null,
        ctaLink: ctaLink.trim() || null,
        isActive,
        autoPlay,
      };

      if (editingId) {
        // Update existing
        await fetchApi(`/admin/popup-video/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast.success("ቪዲዮው በተሳካ ሁኔታ ተሻሽሏል! (Video updated)");
      } else {
        // Create new
        await fetchApi("/admin/popup-video", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast.success("አዲስ ቪዲዮ ተጨምሯል! (New video added)");
      }

      clearApiCache("/popup-video");
      setIsEditing(false);
      await fetchVideos();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast.error(err.message || "ቪዲዮውን ማስቀመጥ አልተቻለም");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Video Active Status directly from the list
  const handleToggleActive = async (v: PopupVideoData) => {
    if (!v.id) return;
    const newStatus = !v.isActive;

    // Optimistic UI update
    setVideos((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, isActive: newStatus } : item))
    );

    try {
      await fetchApi(`/admin/popup-video/${v.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: newStatus }),
      });
      clearApiCache("/popup-video");
      showToast.success(
        newStatus ? "ቪዲዮው በድረ-ገጹ ላይ ነቅቷል (Activated)" : "ቪዲዮው ጠፍቷል (Deactivated)"
      );
    } catch (err: any) {
      // Revert optimistic update
      setVideos((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, isActive: !newStatus } : item))
      );
      showToast.error("ሁኔታውን መቀየር አልተቻለም");
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("እርግጠኛ ነዎት ይህን ቪዲዮ መሰረዝ ይፈልጋሉ? (Are you sure you want to delete this video?)")) {
      return;
    }

    try {
      await fetchApi(`/admin/popup-video/${id}`, {
        method: "DELETE",
      });
      clearApiCache("/popup-video");
      showToast.success("ቪዲዮው ተሰርዟል (Video deleted)");
      setVideos((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast.error(err.message || "ቪዲዮውን መሰረዝ አልተቻለም");
    }
  };

  // Reorder Videos (Move Up / Down)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const newOrder = [...videos];
    const removed = newOrder.splice(index, 1);
    if (removed && removed[0]) {
      newOrder.splice(targetIndex, 0, removed[0]);
    }

    setVideos(newOrder);

    try {
      const orderedIds = newOrder.map((v) => v.id!).filter(Boolean);
      await fetchApi("/admin/popup-video/reorder", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
      clearApiCache("/popup-video");
      showToast.success("ቅደም ተከተሉ ተቀይሯል (Order updated)");
    } catch (err: any) {
      console.error("Reorder failed:", err);
      showToast.error("ቅደም ተከተል መቀየር አልተቻለም");
      fetchVideos();
    }
  };

  // Filter active videos for live preview
  const activeVideos = videos.filter((v) => v.isActive && v.videoUrl);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-navy/10 shadow-sm text-center">
        <RefreshCw className="h-8 w-8 text-gold animate-spin mb-3" />
        <p className="text-sm font-semibold text-navy">
          የቪዲዮ ቅንብሮች እየተጫኑ ነው... (Loading videos...)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-navy-deep via-navy to-navy-deep rounded-2xl border border-gold/30 text-on-navy shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            <span>Multi-Video Playlist Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-gold tracking-wide">
            የድረ-ገጽ ቪዲዮ ማስታወቂያዎች (Bottom-Right Video Popups)
          </h2>
          <p className="text-xs sm:text-sm text-on-navy-muted max-w-2xl">
            በድረ-ገጹ ታችኛው ቀኝ ጥግ ላይ የሚታዩ በርካታ ቪዲዮዎችን ያስተዳድሩ። ጎብኚዎች ቪዲዮዎቹን በቅደም ተከተል (Next/Prev) ማየት፣ ማሳነስ (Minimize) እና ማጫወት ይችላሉ።
          </p>
        </div>

        {/* Stats & Add Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-navy-deep/80 border border-gold/30 px-3.5 py-2 rounded-xl text-right">
            <div className="text-xs font-bold text-gold">{videos.length} ቪዲዮዎች ተጭነዋል</div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              {activeVideos.length} በድረ-ገጹ ላይ ነቅተዋል (Active)
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-soft text-navy-deep font-bold text-xs shadow-md hover:shadow-gold/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>አዲስ ቪዲዮ ጨምር</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video List on Left, Live Interactive Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video List & Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-navy flex items-center gap-2">
              <Video className="h-4 w-4 text-gold" />
              <span>የተጫኑ ቪዲዮዎች ዝርዝር ({videos.length})</span>
            </h3>

            <button
              onClick={fetchVideos}
              className="text-xs text-navy hover:text-gold flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>አድስ (Refresh)</span>
            </button>
          </div>

          {videos.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-navy/20 p-8 text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold/15 text-gold mx-auto">
                <Video className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-navy">ምንም ቪዲዮ አልተጫነም (No Videos Yet)</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                በድረ-ገጽዎ ታችኛው ቀኝ ጥግ ላይ የሚታይ የመጀመሪያውን ቪዲዮ ለመጨመር ከላይ ያለውን "አዲስ ቪዲዮ ጨምር" ቁልፍ ይጫኑ።
              </p>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-deep text-gold text-xs font-bold border border-gold/40 hover:bg-navy transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>አሁን ቪዲዮ ጫን</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((v, idx) => (
                <div
                  key={v.id || `video-${idx}`}
                  className="bg-card rounded-2xl border border-navy/10 hover:border-gold/50 p-4 transition-all duration-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Index & Order Buttons */}
                    <div className="flex flex-col items-center justify-center gap-0.5 text-navy/40 shrink-0">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:text-gold disabled:opacity-20 cursor-pointer"
                        title="ወደ ላይ ውሰድ"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-navy">{idx + 1}</span>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === videos.length - 1}
                        className="p-1 hover:text-gold disabled:opacity-20 cursor-pointer"
                        title="ወደ ታች ውሰድ"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Video / Poster Thumbnail */}
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/80 border border-navy/15 shrink-0 flex items-center justify-center">
                      {v.thumbnailUrl ? (
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={v.videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="h-4 w-4 fill-white text-white drop-shadow" />
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-display text-navy truncate">
                          {v.title}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            v.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-gray-400/10 text-gray-500 border-gray-400/30"
                          }`}
                        >
                          {v.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={v.description}
                      >
                        {v.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-navy/60">
                        {v.ctaText && (
                          <span className="truncate">CTA: {v.ctaText}</span>
                        )}
                        {v.autoPlay && (
                          <span className="bg-gold/15 text-gold px-1 rounded text-[9px] font-semibold">
                            Autoplay
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-navy/10 w-full sm:w-auto justify-end">
                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(v)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        v.isActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
                          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={v.isActive ? "ለማጥፋት ይጫኑ" : "ለማብራት ይጫኑ"}
                    >
                      {v.isActive ? "ማብሪያ (ON)" : "ማጥፊያ (OFF)"}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 rounded-lg border border-navy/15 text-navy hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-colors cursor-pointer"
                      title="አስተካክል (Edit)"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="ሰርዝ (Delete)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive Responsive Website Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="bg-card rounded-2xl border border-navy/15 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-navy/10 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gold" />
                  <h3 className="text-sm font-bold font-display text-navy">
                    ቀጥታ ቅድመ-እይታ (Live Website Preview)
                  </h3>
                </div>

                {/* Device toggle */}
                <div className="flex items-center gap-1 bg-navy/5 p-1 rounded-lg border border-navy/10">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-navy-deep text-gold shadow-sm"
                        : "text-muted-foreground hover:text-navy"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-navy-deep text-gold shadow-sm"
                        : "text-muted-foreground hover:text-navy"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                ይህ ቪዲዮ በድረ-ገጽዎ ታችኛው ቀኝ ጥግ ላይ በትክክል እንዴት እንደሚታይ ያሳያል። ቀጣይ/ቀዳሚ ቪዲዮ መቀየር፣ ማሳነስ እና ማጫወት ይችላሉ፦
              </p>

              {/* Website Backdrop Simulation */}
              <div
                className={`relative rounded-xl overflow-hidden border border-navy/20 bg-gradient-to-br from-cream to-slate-200/50 p-3 sm:p-4 min-h-[480px] flex flex-col justify-end transition-all ${
                  previewDevice === "mobile" ? "max-w-[320px] mx-auto" : "w-full"
                }`}
              >
                {/* Decorative mock background */}
                <div className="absolute top-4 left-4 space-y-2 opacity-35 select-none pointer-events-none">
                  <div className="h-3 w-32 bg-navy rounded-md" />
                  <div className="h-2 w-44 bg-navy/60 rounded-md" />
                  <div className="h-2 w-24 bg-navy/40 rounded-md" />
                </div>

                {/* Render the actual PopupVideoWidget with all active videos */}
                {activeVideos.length > 0 ? (
                  <div className="relative z-10 w-full">
                    <PopupVideoWidget
                      previewVideos={activeVideos}
                      isPreview={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-navy-deep/90 border border-gold/30 rounded-xl text-on-navy space-y-3">
                    <Video className="h-10 w-10 text-gold/60" />
                    <p className="text-xs font-bold text-gold">ነቅቶ የሚታይ ቪዲዮ የለም</p>
                    <p className="text-[11px] text-on-navy-muted">
                      በግራ በኩል ቢያንስ አንድ ቪዲዮ ያብሩ (Active ያድርጉ)። ቅድመ-እይታው እዚህ ወዲያውኑ ይታያል።
                    </p>
                  </div>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="p-3 bg-navy-deep/5 rounded-xl border border-navy/10 text-[11px] text-navy/80 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-navy">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>ምላሽ ሰጪ (Fully Responsive) ባህሪያት፦</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1 text-muted-foreground">
                  <li>የበርካታ ቪዲዮዎች ፕሌይሊስት (Multi-video carousel with Next/Prev)</li>
                  <li>በሞባይል ላይ በጣት በማንሸራተት መቀየር (Touch swipe gestures on mobile)</li>
                  <li>የቪዲዮው ሲያልቅ በራስ-ሰር ወደ ቀጣዩ መሸጋገር (Auto-advance on end)</li>
                  <li>ባለአንድ መስመር መግለጫና የርዕስ ማሳያ (One-line description & title)</li>
                  <li>ማሳነስ (Minimize) እና መዝጋት (Close with floating launcher)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT VIDEO ================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-navy/20 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-navy/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/15 text-gold border border-gold/30">
                  <Video className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold font-display text-navy">
                  {editingId ? "ቪዲዮውን አስተካክል (Edit Video)" : "አዲስ ቪዲዮ ጨምር (Add New Video)"}
                </h3>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-navy hover:bg-navy/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  የቪዲዮ ርዕስ (Video Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., About RABBI Digital / ስለ RABBI Digital"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  required
                />
              </div>

              {/* One-Line Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                    ባለአንድ መስመር መግለጫ (One-Line Video Description)
                  </label>
                  <span
                    className={`text-[10px] font-semibold ${
                      description.length > 90 ? "text-amber-600 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {description.length} / 80-90 ፊደላት
                  </span>
                </div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  required
                />
              </div>

              {/* Video Upload & URL */}
              <div className="space-y-3 pt-2 border-t border-navy/10">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                  የቪዲዮ ፋይል ወይም URL (Video Source)
                </label>

                {/* Dropzone */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="relative border-2 border-dashed border-navy/20 hover:border-gold/60 hover:bg-gold/5 transition-all rounded-xl p-4 text-center cursor-pointer group"
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/mov,video/ogg"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />

                  {isUploadingVideo ? (
                    <div className="space-y-2">
                      <RefreshCw className="h-6 w-6 text-gold animate-spin mx-auto" />
                      <p className="text-xs font-bold text-navy">
                        ቪዲዮው እየተጫነ ነው... {uploadProgress}%
                      </p>
                      <div className="w-full bg-navy/10 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                        <div
                          className="bg-gold h-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/15 text-gold mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-navy">
                        ቪዲዮ ለመጫን እዚህ ይጫኑ (Click to Upload Video)
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        MP4 ወይም WebM (ከ50MB በታች)
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Video URL input */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>ወይም ቀጥታ የቪዲዮ URL / YouTube / Vimeo ያስገቡ:</span>
                  </div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://.../video.mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Poster / Thumbnail Upload */}
              <div className="space-y-2 pt-2 border-t border-navy/10">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                  የቪዲዮው ሽፋን ምስል (Thumbnail - አማራጭ)
                </label>

                <div className="flex items-center gap-3">
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    disabled={isUploadingThumb}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-navy/20 hover:border-gold/60 text-xs font-semibold text-navy bg-card hover:bg-gold/10 transition-colors cursor-pointer"
                  >
                    {isUploadingThumb ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-gold" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-gold" />
                    )}
                    <span>ምስል ይጫኑ ({thumbProgress > 0 ? `${thumbProgress}%` : "Upload"})</span>
                  </button>

                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="ወይም የምስል URL ያስገቡ..."
                    className="flex-1 px-3 py-2 rounded-xl border border-navy/15 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Call to Action (CTA) Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-navy/10">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                    የአዝራር ጽሑፍ (CTA Label)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., ስለ እኛ ተጨማሪ እወቅ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                    የአዝራር ማስፈንጠሪያ (CTA Link)
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="e.g., /about ወይም /books"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Toggles: Active & Autoplay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-navy/10">
                <div className="flex items-center justify-between p-3 rounded-xl bg-navy/5 border border-navy/10">
                  <div>
                    <div className="text-xs font-bold text-navy">በድረ-ገጹ ላይ ይብራ (Active)</div>
                    <div className="text-[10px] text-muted-foreground">ለጎብኚዎች ይታይ</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-navy/5 border border-navy/10">
                  <div>
                    <div className="text-xs font-bold text-navy">ራስ-ሰር አጫውት (Autoplay Muted)</div>
                    <div className="text-[10px] text-muted-foreground">በድምጽ አልባ ይጀምር</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      autoPlay ? "bg-navy" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        autoPlay ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-navy/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-navy/20 text-xs font-bold text-navy hover:bg-gold/10 transition-colors cursor-pointer"
                >
                  ይቅር (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={saving || isUploadingVideo || isUploadingThumb}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-deep text-gold font-bold text-xs shadow-md hover:bg-navy hover:shadow-lg active:scale-95 transition-all border border-gold/40 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingId ? "ለውጦችን መዝግብ (Save Changes)" : "ቪዲዮውን መዝግብ (Add Video)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
