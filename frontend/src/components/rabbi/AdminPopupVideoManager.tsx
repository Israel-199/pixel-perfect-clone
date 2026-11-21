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
  FileText,
  Play,
  Image as ImageIcon,
  Save,
  HelpCircle,
  Check,
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState("About RABBI Digital");
  const [description, setDescription] = useState("የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [ctaText, setCtaText] = useState("ስለ እኛ ተጨማሪ እወቅ");
  const [ctaLink, setCtaLink] = useState("/about");
  const [isActive, setIsActive] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing popup configuration
  const loadPopupConfig = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ popup: PopupVideoData }>("/admin/popup-video", {
        skipCache: true,
      });
      if (res?.popup) {
        setTitle(res.popup.title || "About RABBI Digital");
        setDescription(res.popup.description || "");
        setVideoUrl(res.popup.videoUrl || "");
        setThumbnailUrl(res.popup.thumbnailUrl || "");
        setCtaText(res.popup.ctaText || "ስለ እኛ ተጨማሪ እወቅ");
        setCtaLink(res.popup.ctaLink || "/about");
        setIsActive(res.popup.isActive !== undefined ? res.popup.isActive : true);
        setAutoPlay(res.popup.autoPlay !== undefined ? res.popup.autoPlay : true);
      }
    } catch (err: any) {
      console.error("Failed to load popup video config:", err);
      showToast.error("የቪዲዮ ቅንብሮችን መጫን አልተቻለም (Failed to load popup config)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopupConfig();
  }, []);

  // Handle Video File Upload via Cloudinary
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|ogg)$/i)) {
      showToast.error("እባክዎ ትክክለኛ የቪዲዮ ፋይል ይምረጡ (.mp4, .webm)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast.error("የቪዲዮው መጠን ከ50MB ማነስ አለበት (Video exceeds 50MB limit)");
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
        showToast.success("ቪዲዮው በተሳካ ሁኔታ ተጭኗል! (Video uploaded successfully)");
      }
    } catch (err: any) {
      console.error("Video upload failed:", err);
      showToast.error(err.message || "ቪዲዮውን መጫን አልተቻለም (Video upload failed)");
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Handle Thumbnail File Upload
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

  // Save changes to backend
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isActive && !videoUrl.trim()) {
      showToast.error("ማስታወቂያውን ለማስጀመር እባክዎ ቪዲዮ ይጫኑ ወይም URL ያስገቡ");
      return;
    }

    if (!description.trim()) {
      showToast.error("እባክዎ ባለአንድ መስመር መግለጫ ያስገቡ (Description is required)");
      return;
    }

    setSaving(true);
    try {
      const payload: PopupVideoData = {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        ctaText: ctaText.trim() || null,
        ctaLink: ctaLink.trim() || null,
        isActive,
        autoPlay,
      };

      const res = await fetchApi<{ success: boolean; message: string; popup: PopupVideoData }>(
        "/admin/popup-video",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (res?.success) {
        clearApiCache("/popup-video");
        showToast.success("የቪዲዮ ማስታወቂያ ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል! 🎉");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      showToast.error(err.message || "ቅንብሮቹን ማስቀመጥ አልተቻለም");
    } finally {
      setSaving(false);
    }
  };

  // Current preview data object
  const currentPreviewData: PopupVideoData = {
    title: title || "About RABBI Digital",
    description: description || "የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ",
    videoUrl: videoUrl || "",
    thumbnailUrl: thumbnailUrl || null,
    ctaText: ctaText || "ስለ እኛ ተጨማሪ እወቅ",
    ctaLink: ctaLink || "/about",
    isActive: true, // Always show in preview
    autoPlay,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-navy/10 shadow-sm text-center">
        <RefreshCw className="h-8 w-8 text-gold animate-spin mb-3" />
        <p className="text-sm font-semibold text-navy">ቅንብሮች እየተጫኑ ነው... (Loading settings...)</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-navy-deep via-navy to-navy-deep rounded-2xl border border-gold/30 text-on-navy shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Floating Widget</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-gold tracking-wide">
            የድረ-ገጽ ቪዲዮ ማስታወቂያ (Bottom-Right Video Popup)
          </h2>
          <p className="text-xs sm:text-sm text-on-navy-muted max-w-2xl">
            በድረ-ገጹ ታችኛው ቀኝ ጥግ (Bottom Right) ላይ በፕሮፌሽናል መልኩ የሚታይ አጭር የቪዲዮ ማብራሪያ። ተጠቃሚዎች ማጫወት፣ ማሳነስ (Minimize) እና መዝጋት (Close) ይችላሉ።
          </p>
        </div>

        {/* Global Active Switch */}
        <div className="flex items-center gap-3 bg-navy-deep/80 border border-gold/30 px-4 py-3 rounded-xl shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-on-navy">የቪዲዮ ሁኔታ (Status)</div>
            <div className={`text-[11px] font-semibold ${isActive ? "text-emerald-400" : "text-amber-400"}`}>
              {isActive ? "በድረ-ገጹ ላይ ነቅቷል (Active)" : "ጠፍቷል (Inactive)"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-emerald-500" : "bg-gray-600"
            }`}
            aria-label="Toggle popup video active"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Interactive Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-card rounded-2xl border border-navy/10 p-5 sm:p-6 shadow-sm space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                የቪዲዮ ርዕስ (Popup Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., About RABBI Digital / ስለ RABBI Digital"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                required
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                በቪዲዮው የላይኛው ራስጌ ላይ የሚታይ ርዕስ ነው።
              </span>
            </div>

            {/* One-Line Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                  ባለአንድ መስመር መግለጫ (One-Line Video Description)
                </label>
                <span className={`text-[10px] font-semibold ${description.length > 90 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>
                  {description.length} / 80-90 ፊደላት
                </span>
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                required
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                በቪዲዮው ታችኛው ክፍል በአንድ ንጹህ መስመር የሚታይ አጭር ማብራሪያ ነው።
              </span>
            </div>

            {/* Video Upload & URL */}
            <div className="space-y-3 pt-2 border-t border-navy/10">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                የቪዲዮ ፋይል ወይም URL (Video Source)
              </label>

              {/* Upload Dropzone */}
              <div
                onClick={() => videoInputRef.current?.click()}
                className="relative border-2 border-dashed border-navy/20 hover:border-gold/60 hover:bg-gold/5 transition-all rounded-xl p-5 text-center cursor-pointer group"
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
                    <RefreshCw className="h-7 w-7 text-gold animate-spin mx-auto" />
                    <p className="text-xs font-bold text-navy">ቪዲዮው እየተጫነ ነው... {uploadProgress}%</p>
                    <div className="w-full bg-navy/10 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                      <div
                        className="bg-gold h-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/15 text-gold mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-navy">
                      ቪዲዮ ለመጫን እዚህ ይጫኑ (Click to Upload Video)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      MP4 ወይም WebM (ከ50MB በታች) — በ Cloudinary ላይ ይቀመጣል
                    </p>
                  </div>
                )}
              </div>

              {/* Or Direct URL Input */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>ወይም ቀጥታ የቪዲዮ URL ያስገቡ (Or enter direct video link / YouTube / Vimeo):</span>
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/.../video.mp4 ወይም YouTube/Vimeo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                />
              </div>
            </div>

            {/* Poster / Thumbnail Upload */}
            <div className="space-y-3 pt-2 border-t border-navy/10">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                የቪዲዮው ሽፋን ምስል (Poster / Thumbnail - አማራጭ)
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
                  <span>ምስል ይጫኑ ({thumbProgress > 0 ? `${thumbProgress}%` : "Upload Image"})</span>
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
                  የአዝራር ጽሑፍ (CTA Button Label)
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
                  የአዝራር ማስፈንጠሪያ (CTA Link URL)
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

            {/* Autoplay setting */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy/5 border border-navy/10">
              <div>
                <div className="text-xs font-bold text-navy">ራስ-ሰር አጫውት (Autoplay Muted)</div>
                <div className="text-[11px] text-muted-foreground">
                  ድረ-ገጹ ሲከፈት ቪዲዮው በድምጽ-አልባ (Muted) ሁነታ በራስ-ሰር እንዲጀምር ይፈቅዳል
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoPlay(!autoPlay)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoPlay ? "bg-navy" : "bg-gray-400"
                }`}
                aria-label="Toggle autoplay"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoPlay ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={loadPopupConfig}
                className="px-4 py-2.5 rounded-xl border border-navy/20 text-xs font-bold text-navy hover:bg-gold/10 transition-colors cursor-pointer"
              >
                ይቅር (Reset)
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
                <span>ለውጦችን መዝግብ (Save Popup Video)</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview (5 cols) */}
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
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gold/15 text-gold border border-gold/30">
                  Interactive
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                ይህ ቪዲዮ በድረ-ገጽዎ ታችኛው ቀኝ ጥግ ላይ በትክክል እንዴት እንደሚታይ ያሳያል። Play፣ Pause፣ Minimize እና Unmute በማድረግ መሞከር ይችላሉ፦
              </p>

              {/* Website Backdrop Simulation */}
              <div className="relative rounded-xl overflow-hidden border border-navy/20 bg-gradient-to-br from-cream to-slate-200/50 p-4 min-h-[460px] flex flex-col justify-end">
                {/* Decorative mock background elements */}
                <div className="absolute top-4 left-4 space-y-2 opacity-35 select-none pointer-events-none">
                  <div className="h-3 w-36 bg-navy rounded-md" />
                  <div className="h-2 w-48 bg-navy/60 rounded-md" />
                  <div className="h-2 w-28 bg-navy/40 rounded-md" />
                  <div className="mt-4 grid grid-cols-2 gap-2 w-52">
                    <div className="h-14 bg-navy/20 rounded-lg" />
                    <div className="h-14 bg-navy/20 rounded-lg" />
                  </div>
                </div>

                {/* Render the actual PopupVideoWidget in isolated preview mode */}
                {videoUrl.trim() ? (
                  <div className="relative z-10 w-full">
                    <PopupVideoWidget previewData={currentPreviewData} isPreview={true} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-navy-deep/90 border border-gold/30 rounded-xl text-on-navy space-y-3">
                    <Video className="h-10 w-10 text-gold/60" />
                    <p className="text-xs font-bold text-gold">ቪዲዮ አልተመረጠም (No Video)</p>
                    <p className="text-[11px] text-on-navy-muted">
                      በግራ በኩል ቪዲዮ ፋይል ይጫኑ ወይም URL ያስገቡ። ቅድመ-እይታው እዚህ ወዲያውኑ ይታያል።
                    </p>
                  </div>
                )}
              </div>

              {/* Quick specs helper */}
              <div className="p-3 bg-navy-deep/5 rounded-xl border border-navy/10 text-[11px] text-navy/80 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-navy">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>UI/UX ገጽታዎች (Features Included):</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1 text-muted-foreground">
                  <li>የአጫውት/አቁም ቁልፍ (Play / Pause button with gold pulse)</li>
                  <li>የማሳነሻ ቁልፍ (Minimize into sleek floating pill badge)</li>
                  <li>የመዝጊያ ቁልፍ (Dismiss close button)</li>
                  <li>ባለአንድ መስመር መግለጫ (Single line video description)</li>
                  <li>የድምጽ ማብሪያና ማጥፊያ (Mute / Unmute controls)</li>
                  <li>ለስልክና ለኮምፒውተር ምቹ (Mobile & Desktop responsive)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
