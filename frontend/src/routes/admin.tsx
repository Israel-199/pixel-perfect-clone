import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Plus,
  BookOpen,
  Trash2,
  Edit3,
  Video,
  Music,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  GraduationCap,
  FileText,
  KeyRound,
  Mail,
  User,
  ExternalLink,
  Send,
  AlertTriangle,
  X,
  Sparkles,
  Heart,
  Lock,
  EyeOff,
  Check,
  Home,
  LogOut,
  Users,
  ShoppingBag,
  TrendingUp,
  Coins,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchApi, clearApiCache, API_BASE_URL } from "@/lib/api";
import { formatEtbWithUsd } from "@/lib/bookUtils";
import {
  filterNameInput,
  filterNumberInput,
  filterPhoneInput,
  validateName,
  validateNumber,
  validateEmail,
} from "@/lib/inputValidation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — RABBI Digital" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

interface ContentBuyer {
  requestId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  approvedAt: string;
  paymentProofUrl?: string | null;
}

interface PrivatePrayerAdminItem {
  id: string;
  title: string;
  description: string;
  submittedBy?: string | null;
  contactInfo?: string | null;
  isPrayed: boolean;
  createdAt: string;
}

interface AdminRequestItem {
  id: string;
  status: "PENDING" | "PERMITTED" | "REJECTED";
  paymentProofUrl?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName?: string;
    phone?: string;
    email: string;
  };
  book: {
    id: string;
    title: string;
    coverUrl: string;
    price: number;
    mediaType: string;
    approvedBuyersCount?: number;
  };
}

interface ContentItemAdmin {
  id: string;
  title: string;
  author?: string;
  description?: string;
  price: number;
  mediaType: string;
  coverUrl: string;
  sampleContent?: string;
  fullContent?: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  approvedCount?: number;
  pendingCount?: number;
  rejectedCount?: number;
  totalRevenue?: number;
  buyers?: ContentBuyer[];
}

interface DashboardStats {
  totalApprovedSales: number;
  totalPendingRequests: number;
  totalRejectedRequests: number;
  totalRevenue: number;
  totalUniqueBuyers: number;
  totalBooks: number;
  totalUsers: number;
  topSellingBooks: Array<{
    id: string;
    title: string;
    price: number;
    coverUrl: string;
    mediaType: string;
    approvedCount: number;
    revenue: number;
  }>;
}

type AdminTab = "REQUESTS" | "MANAGE_CONTENTS" | "TRACKING" | "ADD_CONTENT" | "PRIVATE_PRAYERS" | "PROFILE" | "MANAGE_ADMINS";
type ContentFilterType = "ALL" | "BOOK" | "VIDEO" | "AUDIO" | "COURSE" | "ARTICLE" | "PRAYER";
type RequestFilterType = "ALL" | "BOOK" | "MEDIA" | "COURSE";

function AdminRoute() {
  const { user, token: authContextToken, login, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("REQUESTS");

  // Real-time tracking and dashboard stats state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedBookForBuyers, setSelectedBookForBuyers] = useState<ContentItemAdmin | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [trackingSearch, setTrackingSearch] = useState("");
  const [trackingTypeFilter, setTrackingTypeFilter] = useState<string>("ALL");
  const [trackingBuyerFilter, setTrackingBuyerFilter] = useState<"ALL" | "HAS_BUYERS" | "NO_BUYERS">("ALL");

  // Action Loading states for buttons (Approve / Reject / Delete / Toggle Prayer)
  const [actionLoadingId, setActionLoadingId] = useState<{ id: string; action: "PERMITTED" | "REJECTED" | "PENDING" } | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [togglingPrayerId, setTogglingPrayerId] = useState<string | null>(null);
  const [deletingPrayerId, setDeletingPrayerId] = useState<string | null>(null);

  // Private Prayers state
  const [privatePrayers, setPrivatePrayers] = useState<PrivatePrayerAdminItem[]>([]);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerFilter, setPrayerFilter] = useState<"ALL" | "UNPRAYED" | "PRAYED">("ALL");
  const [prayerSearch, setPrayerSearch] = useState("");

  // Requests state with real-time polling
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState<RequestFilterType>("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contents state
  const [contents, setContents] = useState<ContentItemAdmin[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Content Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("RABBI");
  const [price, setPrice] = useState("250");
  const [mediaType, setMediaType] = useState("BOOK");
  const [description, setDescription] = useState("");
  const [sampleContent, setSampleContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  // Helper to open Add Content tab with exact category pre-selected
  const handleAddNewContentWithCategory = (cat?: ContentFilterType) => {
    const chosen = cat || contentFilter;
    let targetType = "BOOK";
    if (chosen === "VIDEO") targetType = "VIDEO";
    else if (chosen === "AUDIO") targetType = "AUDIO";
    else if (chosen === "COURSE") targetType = "COURSE";
    else if (chosen === "ARTICLE") targetType = "ARTICLE";
    else if (chosen === "PRAYER") targetType = "PRAYER";
    else targetType = "BOOK";

    setMediaType(targetType);
    if (targetType === "ARTICLE" || targetType === "PRAYER") {
      setPrice("0");
    }
    setActiveTab("ADD_CONTENT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Editing modal state
  const [editingItem, setEditingItem] = useState<ContentItemAdmin | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editMediaType, setEditMediaType] = useState("BOOK");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editSampleContent, setEditSampleContent] = useState("");
  const [editFullContent, setEditFullContent] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Admin Profile Settings state
  const [profileEmail, setProfileEmail] = useState("");
  const [profileFullName, setProfileFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Admin Management state
  const [adminsList, setAdminsList] = useState<Array<{ id: string; email: string; fullName?: string | null; phone?: string | null; createdAt: string }>>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminFullName, setNewAdminFullName] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [newAdminLoading, setNewAdminLoading] = useState(false);
  const [newAdminMsg, setNewAdminMsg] = useState<string | null>(null);
  const [newAdminError, setNewAdminError] = useState<string | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<{ id: string; email: string; fullName?: string | null; phone?: string | null } | null>(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminFullName, setEditAdminFullName] = useState("");
  const [editAdminPhone, setEditAdminPhone] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editAdminLoading, setEditAdminLoading] = useState(false);
  const [editAdminMsg, setEditAdminMsg] = useState<string | null>(null);
  const [editAdminError, setEditAdminError] = useState<string | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [deletingAdminLoading, setDeletingAdminLoading] = useState(false);

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Dashboard Stats (Real-time tracking)
  const fetchDashboardStats = async (quiet = false) => {
    try {
      if (!quiet) setStatsLoading(true);
      const data = await fetchApi<{ stats: DashboardStats }>("/admin/stats", { skipCache: true });
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      if (!quiet) setStatsLoading(false);
    }
  };

  // Fetch Requests (silent for background polling)
  const fetchAdminRequests = async (quiet = false) => {
    try {
      if (!quiet) {
        setReqLoading(true);
        setIsRefreshing(true);
      }
      const data = await fetchApi<{ requests: AdminRequestItem[] }>("/admin/requests", { skipCache: true });
      setRequests(data.requests);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load admin requests:", err);
    } finally {
      if (!quiet) {
        setReqLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  // Fetch All Contents with stats (approvedCount, revenue, buyers)
  const fetchAdminContents = async (quiet = false) => {
    try {
      if (!quiet) setContentLoading(true);
      const data = await fetchApi<{ contents: ContentItemAdmin[] }>("/admin/contents-with-stats", { skipCache: true });
      setContents(data.contents || []);
    } catch (err) {
      console.error("Failed to load contents with stats:", err);
      try {
        const fallback = await fetchApi<{ books: ContentItemAdmin[] }>("/books", { skipCache: true });
        setContents(fallback.books || []);
      } catch (e) {}
    } finally {
      if (!quiet) setContentLoading(false);
    }
  };

  // Fetch Private Prayers
  const fetchPrivatePrayers = async (quiet = false) => {
    try {
      if (!quiet) setPrayerLoading(true);
      const data = await fetchApi<{ prayers: PrivatePrayerAdminItem[] }>("/private-prayers/admin/all", { skipCache: true });
      setPrivatePrayers(data.prayers || []);
    } catch (err) {
      console.error("Failed to load private prayers:", err);
    } finally {
      if (!quiet) setPrayerLoading(false);
    }
  };

  // Toggle Private Prayer Prayed Status (Optimistic UI for instantaneous response)
  const handleTogglePrayerStatus = async (id: string) => {
    const prevPrayers = [...privatePrayers];
    // Optimistic: toggle checkmark immediately (0ms lag)
    setPrivatePrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPrayed: !p.isPrayed } : p))
    );
    setTogglingPrayerId(id);
    try {
      const data = await fetchApi<{ prayer: PrivatePrayerAdminItem }>(`/private-prayers/admin/${id}/toggle`, {
        method: "PUT",
      });
      clearApiCache();
      setPrivatePrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPrayed: data.prayer.isPrayed } : p))
      );
    } catch (err: any) {
      setPrivatePrayers(prevPrayers);
      alert(err.message || "የጸሎት ሁኔታ መቀየር አልተሳካም።");
    } finally {
      setTogglingPrayerId(null);
    }
  };

  // Delete Private Prayer (Optimistic UI for instantaneous response)
  const handleDeletePrayer = async (id: string) => {
    if (!confirm("ይህንን የግል ጸሎት መሰረዝ ይፈልጋሉ?")) return;
    const prevPrayers = [...privatePrayers];
    // Optimistic: remove row immediately (0ms lag)
    setPrivatePrayers((prev) => prev.filter((p) => p.id !== id));
    setDeletingPrayerId(id);
    try {
      await fetchApi(`/private-prayers/admin/${id}`, {
        method: "DELETE",
      });
      clearApiCache();
    } catch (err: any) {
      setPrivatePrayers(prevPrayers);
      alert(err.message || "ጸሎት መሰረዝ አልተሳካም።");
    } finally {
      setDeletingPrayerId(null);
    }
  };

  // Security Auth check & Real-time polling init
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "ADMIN") {
      navigate({ to: "/" });
      return;
    }

    setProfileEmail(user.email || "");
    setProfileFullName(user.fullName || "");
    setProfilePhone(user.phone || "");

    fetchAdminRequests();
    fetchAdminContents();
    fetchPrivatePrayers();
    fetchDashboardStats();
    fetchAdmins();

    // Setup real-time polling every 12 seconds only when tab is active (prevents thread thrashing)
    pollingRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchAdminRequests(true);
      fetchPrivatePrayers(true);
      fetchAdminContents(true);
      fetchDashboardStats(true);
    }, 12000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user, authLoading]);

  // Update Request Status (Approve / Reject / Reset) - fast execution, buttons active/disabled exactly with API response
  const handleUpdateStatus = async (id: string, status: "PERMITTED" | "REJECTED" | "PENDING") => {
    try {
      // 1. Immediately disable button and activate loading spinner on the clicked action
      setActionLoadingId({ id, action: status });

      // 2. Send API request
      const data = await fetchApi<{ request: AdminRequestItem }>(`/admin/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      // 3. Exactly when the API responds: update requests state with the new status
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: data?.request?.status || status } : r))
      );
      clearApiCache();

      // Silently refresh stats and contents in background without delaying button
      fetchAdminContents(true);
      fetchDashboardStats(true);
    } catch (err: any) {
      alert(err.message || "የጥያቄ ሁኔታ መቀየር አልተሳካም።");
    } finally {
      // 4. Release button loading and disabled state exactly when API finished
      setActionLoadingId(null);
    }
  };

  // ── Fast XHR upload with real progress ────────────────────────────────────────
  const xhrUpload = useCallback(
    (
      file: File,
      resourceType: string,
      onProgress: (pct: number) => void,
      token?: string | null
    ): Promise<{ url: string }> =>
      new Promise((resolve, reject) => {
        const resolvedToken =
          token ||
          authContextToken ||
          (typeof window !== "undefined"
            ? localStorage.getItem("rabbi_auth_token") ||
              localStorage.getItem("rabbi_token")
            : null);

        if (!resolvedToken) {
          reject(new Error("የማረጋገጫ ምልክት (Token) አልተገኘም። እባክዎ እንደገና ይግቡ። (Session token missing. Please log in again.)"));
          return;
        }

        const uploadUrl = `${API_BASE_URL}/admin/upload?token=${encodeURIComponent(resolvedToken)}`;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl, true);
        xhr.setRequestHeader("Authorization", `Bearer ${resolvedToken}`);
        xhr.setRequestHeader("x-auth-token", resolvedToken);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error("Invalid server response")); }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || `Upload failed (${xhr.status})`));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        };
        xhr.onerror = () => {
          // Fallback to fetchApi if XHR encounters any network error
          const fd = new FormData();
          fd.append("file", file);
          fd.append("resourceType", resourceType);
          fetchApi<{ url: string }>(`/admin/upload?token=${encodeURIComponent(resolvedToken)}`, {
            method: "POST",
            body: fd,
          })
            .then(resolve)
            .catch(reject);
        };
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.timeout = 120000; // 2 min
        const fd = new FormData();
        fd.append("file", file);
        fd.append("resourceType", resourceType);
        xhr.send(fd);
      }),
    [authContextToken]
  );

  // Delete orphaned or replaced Cloudinary asset in background (0ms lag)
  const deleteCloudinaryAsset = useCallback((url?: string | null) => {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return;
    fetchApi("/admin/delete-file", {
      method: "POST",
      body: JSON.stringify({ url }),
    }).catch((e) => console.warn("Background file cleanup warning:", e));
  }, []);

  // Upload Cover Image via Cloudinary
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check (10 MB for images)
    if (file.size > 10 * 1024 * 1024) {
      const msg = "የምስሉ ፋይል ከ10MB አይበልጥ። (Image must be under 10 MB.)";
      if (isEdit) setEditError(msg); else setFormError(msg);
      return;
    }

    if (isEdit) {
      setEditUploading(true);
      setEditUploadProgress(0);
      setEditError(null);
    } else {
      setUploading(true);
      setUploadProgress(0);
      setFormError(null);
    }

    try {
      const token = typeof localStorage !== "undefined"
        ? (localStorage.getItem("rabbi_auth_token") || localStorage.getItem("rabbi_token")) : null;
      const data = await xhrUpload(
        file,
        "image",
        (pct) => { if (isEdit) setEditUploadProgress(pct); else setUploadProgress(pct); },
        token
      );
      if (isEdit) {
        const oldUrl = editCoverUrl;
        setEditCoverUrl(data.url);
        setEditMsg("የከቨር ፎቶ በተሳካ ሁኔታ ተጭኗል!");
        setEditUploadProgress(0);
        // If an intermediate file was uploaded before saving, delete previous one from Cloudinary immediately
        if (oldUrl && oldUrl !== data.url && oldUrl !== editingItem?.coverUrl) {
          deleteCloudinaryAsset(oldUrl);
        }
      } else {
        const oldUrl = coverUrl;
        setCoverUrl(data.url);
        setFormMsg("የከቨር ፎቶ በተሳካ ሁኔታ ተጭኗል!");
        setUploadProgress(0);
        // Delete previous uploaded cover image so it's not orphaned
        if (oldUrl && oldUrl !== data.url) {
          deleteCloudinaryAsset(oldUrl);
        }
      }
    } catch (err: any) {
      const msg = err.message || "ፎቶ መጫን አልተሳካም።";
      if (isEdit) setEditError(msg); else setFormError(msg);
      if (isEdit) setEditUploadProgress(0); else setUploadProgress(0);
    } finally {
      if (isEdit) setEditUploading(false);
      else setUploading(false);
    }
  };

  // Upload Book PDF or DOCX via Cloudinary
  const handleBookPdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check (50 MB for documents)
    if (file.size > 50 * 1024 * 1024) {
      const msg = "ፋይሉ ከ50MB አይበልጥ። (File must be under 50 MB.)";
      if (isEdit) setEditError(msg); else setFormError(msg);
      return;
    }

    if (isEdit) {
      setEditUploading(true);
      setEditUploadProgress(0);
      setEditError(null);
    } else {
      setUploading(true);
      setUploadProgress(0);
      setFormError(null);
    }

    const isDocx = /\.docx?$/i.test(file.name);
    const successMessage = isDocx
      ? "የመጽሐፉ DOCX ፋይል በተሳካ ሁኔታ ተጭኗል! (DOCX uploaded successfully)"
      : "የመጽሐፉ PDF በተሳካ ሁኔታ ተጭኗል! (PDF uploaded successfully)";

    try {
      const token = typeof localStorage !== "undefined"
        ? (localStorage.getItem("rabbi_auth_token") || localStorage.getItem("rabbi_token")) : null;
      const data = await xhrUpload(
        file,
        "raw",
        (pct) => { if (isEdit) setEditUploadProgress(pct); else setUploadProgress(pct); },
        token
      );
      if (isEdit) {
        const oldUrl = editFullContent;
        setEditFullContent(data.url);
        setEditMsg(successMessage);
        setEditUploadProgress(0);
        // If an intermediate file was uploaded before saving, delete previous one from Cloudinary immediately
        if (oldUrl && oldUrl !== data.url && oldUrl !== editingItem?.fullContent) {
          deleteCloudinaryAsset(oldUrl);
        }
      } else {
        const oldUrl = fullContent;
        setFullContent(data.url);
        setFormMsg(successMessage);
        setUploadProgress(0);
        // Delete previous uploaded PDF/DOCX so it's not orphaned
        if (oldUrl && oldUrl !== data.url) {
          deleteCloudinaryAsset(oldUrl);
        }
      }
    } catch (err: any) {
      const msg = err.message || "ፋይል መጫን አልተሳካም።";
      if (isEdit) setEditError(msg); else setFormError(msg);
      if (isEdit) setEditUploadProgress(0); else setUploadProgress(0);
    } finally {
      if (e.target) e.target.value = "";
      if (isEdit) setEditUploading(false);
      else setUploading(false);
    }
  };

  // Submit New Content (መጽሐፍት፣ ሚዲያ፣ ኮርስ፣ ጽሑፍ፣ ጸሎት)
  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMsg(null);

    if (!title.trim()) {
      setFormError("እባክዎ የይዘቱን ርዕስ ያስገቡ።");
      return;
    }



    if (author.trim()) {
      const authorErr = validateName(author, "ደራሲ / አቅራቢ (Author/Speaker)");
      if (authorErr) {
        setFormError(authorErr);
        return;
      }
    }

    setSubmitting(true);

    try {
      await fetchApi("/admin/books", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || "RABBI",
          price: parseFloat(price) || 0,
          mediaType: mediaType.toUpperCase(),
          description: description, // Preserve every horizontal and vertical space exactly as admin typed
          coverUrl: coverUrl.trim(),
          sampleContent: sampleContent, // Preserve every horizontal and vertical space exactly as admin typed
          fullContent: fullContent, // Preserve every horizontal and vertical space exactly as admin typed
          videoUrl: videoUrl.trim() || null,
          audioUrl: audioUrl.trim() || null,
        }),
      });

      setFormMsg("አዲስ ይዘት በተሳካ ሁኔታ ወደ ስርዓቱ ተጨምሯል!");
      setTitle("");
      setAuthor("");
      setPrice("0");
      setDescription("");
      setSampleContent("");
      setFullContent("");
      setVideoUrl("");
      setAudioUrl("");
      setCoverUrl("");
      await Promise.all([
        fetchAdminContents(true),
        fetchDashboardStats(true),
      ]);
    } catch (err: any) {
      setFormError(err.message || "ይዘቱን መጨመር አልተሳካም።");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ContentItemAdmin) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAuthor(item.author || "RABBI");
    setEditPrice(item.price.toString());
    setEditMediaType(item.mediaType || "BOOK");
    setEditDescription(item.description || "");
    setEditCoverUrl(item.coverUrl || "");
    setEditSampleContent(item.sampleContent || "");
    setEditFullContent(item.fullContent || "");
    setEditVideoUrl(item.videoUrl || "");
    setEditAudioUrl(item.audioUrl || "");
    setEditMsg(null);
    setEditError(null);
  };

  // Submit Edit Content
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim()) {
      setEditError("እባክዎ የይዘቱን ርዕስ ያስገቡ።");
      return;
    }



    setEditError(null);
    setEditMsg(null);
    setEditSubmitting(true);

    try {
      await fetchApi(`/admin/books/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle.trim(),
          author: editAuthor.trim() || "RABBI",
          price: parseFloat(editPrice) || 0,
          mediaType: editMediaType.toUpperCase(),
          description: editDescription, // Preserve every horizontal and vertical space
          coverUrl: editCoverUrl.trim(),
          sampleContent: editSampleContent, // Preserve every horizontal and vertical space
          fullContent: editFullContent, // Preserve every horizontal and vertical space
          videoUrl: editVideoUrl.trim() || null,
          audioUrl: editAudioUrl.trim() || null,
        }),
      });

      setEditMsg("ይዘቱ በተሳካ ሁኔታ ተሻሽሏል!");
      await Promise.all([
        fetchAdminContents(true),
        fetchDashboardStats(true),
      ]);
      setTimeout(() => {
        setEditingItem(null);
      }, 800);
    } catch (err: any) {
      setEditError(err.message || "ማስተካከል አልተሳካም።");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Content with optimistic removal (0ms lag)
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const targetId = deletingId;
    const prevContents = [...contents];

    // Optimistic: remove row from table immediately
    setContents((prev) => prev.filter((item) => item.id !== targetId));
    setDeletingId(null);
    setDeletingLoading(true);

    try {
      await fetchApi(`/admin/books/${targetId}`, { method: "DELETE" });
      clearApiCache();
      fetchDashboardStats(true);
      fetchAdminRequests(true);
    } catch (err: any) {
      setContents(prevContents);
      alert(err.message || "ይዘቱን መሰረዝ አልተሳካም።");
    } finally {
      setDeletingLoading(false);
    }
  };

  // Fetch Admins List
  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const data = await fetchApi<{ admins: any[] }>("/admin/admins");
      setAdminsList(data.admins || []);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setAdminsLoading(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminError(null);
    setNewAdminMsg(null);
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      setNewAdminError("ኢሜይልና የይለፍ ቃል ሁለቱም ያስፈልጋሉ።");
      return;
    }
    setNewAdminLoading(true);
    try {
      await fetchApi("/admin/admins", {
        method: "POST",
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          password: newAdminPassword.trim(),
          fullName: newAdminFullName.trim() || undefined,
          phone: newAdminPhone.trim() || undefined,
        }),
      });
      setNewAdminMsg("አዲስ አስተዳዳሪ በተሳካ ሁኔታ ተፈጥሯል!");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminFullName("");
      setNewAdminPhone("");
      fetchAdmins();
    } catch (err: any) {
      setNewAdminError(err.message || "አስተዳዳሪ መፍጠር አልተሳካም።");
    } finally {
      setNewAdminLoading(false);
    }
  };

  // Open edit admin
  const handleOpenEditAdmin = (admin: { id: string; email: string; fullName?: string | null; phone?: string | null; createdAt: string }) => {
    setEditingAdmin(admin);
    setEditAdminEmail(admin.email);
    setEditAdminFullName(admin.fullName || "");
    setEditAdminPhone(admin.phone || "");
    setEditAdminPassword("");
    setEditAdminMsg(null);
    setEditAdminError(null);
  };

  // Save admin edit
  const handleSaveAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditAdminError(null);
    setEditAdminMsg(null);
    setEditAdminLoading(true);
    try {
      await fetchApi(`/admin/admins/${editingAdmin.id}`, {
        method: "PUT",
        body: JSON.stringify({
          email: editAdminEmail.trim() || undefined,
          fullName: editAdminFullName.trim() || undefined,
          phone: editAdminPhone.trim() || undefined,
          password: editAdminPassword.trim() || undefined,
        }),
      });
      setEditAdminMsg("አስተዳዳሪ በተሳካ ሁኔታ ተሻሽሏል!");
      fetchAdmins();
      setTimeout(() => setEditingAdmin(null), 800);
    } catch (err: any) {
      setEditAdminError(err.message || "አስተዳዳሪ ማስተካከል አልተሳካም።");
    } finally {
      setEditAdminLoading(false);
    }
  };

  // Delete admin with optimistic removal (0ms lag)
  const handleDeleteAdmin = async () => {
    if (!deletingAdminId) return;
    const targetId = deletingAdminId;
    const prevList = [...adminsList];

    // Optimistic: remove admin row immediately
    setAdminsList((prev) => prev.filter((a) => a.id !== targetId));
    setDeletingAdminId(null);
    setDeletingAdminLoading(true);

    try {
      await fetchApi(`/admin/admins/${targetId}`, { method: "DELETE" });
      clearApiCache();
    } catch (err: any) {
      setAdminsList(prevList);
      alert(err.message || "አስተዳዳሪ መሰረዝ አልተሳካም።");
    } finally {
      setDeletingAdminLoading(false);
    }
  };

  // Admin Profile & Security Update (Full Name, Email, Password)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMsg(null);

    const cleanEmail = profileEmail.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setProfileError("እባክዎ ትክክለኛ የአስተዳዳሪ ኢሜይል አድራሻ ያስገቡ (Valid email is required).");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileError("አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት።");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("አዲሱ የይለፍ ቃል እና ማረጋገጫው አይመሳሰሉም።");
      return;
    }

    setProfileLoading(true);

    try {
      const data = await fetchApi<{ user: any; token: string; message: string }>(
        "/admin/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            email: cleanEmail,
            fullName: profileFullName.trim(),
            phone: profilePhone.trim(),
            currentPassword: currentPassword || undefined,
            password: newPassword || undefined,
          }),
        }
      );

      login(data.token, data.user);
      setProfileMsg("የአስተዳዳሪ ፕሮፋይል፣ ኢሜይል እና የይለፍ ቃል በተሳካ ሁኔታ ተሻሽሏል! (Admin profile & email updated successfully)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setProfileError(err.message || "ፕሮፋይል ማስተካከል አልተሳካም።");
    } finally {
      setProfileLoading(false);
    }
  };

  // Filtered requests (Memoized to prevent unnecessary re-filtering on unrelated state changes)
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (requestFilter === "ALL") return true;
      const type = (r.book?.mediaType || "").toUpperCase();
      const title = (r.book?.title || "").toLowerCase();
      if (requestFilter === "BOOK") return type === "BOOK" && !title.includes("ኮርስ");
      if (requestFilter === "MEDIA") return type === "VIDEO" || type === "AUDIO";
      if (requestFilter === "COURSE") {
        return (
          type === "COURSE" ||
          title.includes("ኮርስ") ||
          title.includes("ስልጠና") ||
          title.includes("pdf")
        );
      }
      return true;
    });
  }, [requests, requestFilter]);

  // Filtered contents (Memoized for high typing performance in search inputs)
  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchFilter =
        contentFilter === "ALL"
          ? true
          : contentFilter === "COURSE"
            ? item.mediaType === "COURSE" ||
              item.title.toLowerCase().includes("ኮርስ") ||
              item.title.toLowerCase().includes("ስልጠና")
            : item.mediaType === contentFilter;

      const matchSearch =
        searchQuery.trim() === ""
          ? true
          : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchFilter && matchSearch;
    });
  }, [contents, contentFilter, searchQuery]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === "PENDING").length, [requests]);

  const unprayedCount = useMemo(() => privatePrayers.filter((p) => !p.isPrayed).length, [privatePrayers]);
  const prayedCount = useMemo(() => privatePrayers.filter((p) => p.isPrayed).length, [privatePrayers]);

  const filteredPrivatePrayers = useMemo(() => {
    return privatePrayers.filter((p) => {
      if (prayerFilter === "UNPRAYED" && p.isPrayed) return false;
      if (prayerFilter === "PRAYED" && !p.isPrayed) return false;
      if (prayerSearch.trim()) {
        const q = prayerSearch.toLowerCase();
        const matchTitle = (p.title || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        const matchBy = (p.submittedBy || "").toLowerCase().includes(q);
        const matchContact = (p.contactInfo || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchBy && !matchContact) return false;
      }
      return true;
    });
  }, [privatePrayers, prayerFilter, prayerSearch]);

  // Real-time tracking calculations (Memoized)
  const totalApprovedSales = useMemo(() => {
    return stats?.totalApprovedSales ?? requests.filter((r) => r.status === "PERMITTED").length;
  }, [stats?.totalApprovedSales, requests]);

  const totalRevenue = useMemo(() => {
    return (
      stats?.totalRevenue ??
      requests
        .filter((r) => r.status === "PERMITTED")
        .reduce((sum, r) => sum + (r.book?.price || 0), 0)
    );
  }, [stats?.totalRevenue, requests]);

  const totalPending = stats?.totalPendingRequests ?? pendingCount;

  const totalUniqueBuyers = useMemo(() => {
    return (
      stats?.totalUniqueBuyers ??
      new Set(requests.filter((r) => r.status === "PERMITTED").map((r) => r.user?.id || r.id)).size
    );
  }, [stats?.totalUniqueBuyers, requests]);

  // Filtered contents for Tracking tab (Memoized)
  const filteredTrackingContents = useMemo(() => {
    return contents.filter((item) => {
      const matchType =
        trackingTypeFilter === "ALL"
          ? true
          : item.mediaType === trackingTypeFilter;

      const buyersCount = item.approvedCount || 0;
      const matchBuyer =
        trackingBuyerFilter === "ALL"
          ? true
          : trackingBuyerFilter === "HAS_BUYERS"
            ? buyersCount > 0
            : buyersCount === 0;

      const matchSearch =
        trackingSearch.trim() === ""
          ? true
          : item.title.toLowerCase().includes(trackingSearch.toLowerCase()) ||
            (item.author && item.author.toLowerCase().includes(trackingSearch.toLowerCase()));

      return matchType && matchBuyer && matchSearch;
    });
  }, [contents, trackingTypeFilter, trackingBuyerFilter, trackingSearch]);

  return (
    <div className="animate-in fade-in min-h-screen bg-navy/5 pb-20">
      {/* Top Admin Header Bar */}
      <div className="bg-navy-deep px-4 sm:px-6 py-6 sm:py-8 border-b border-gold/20 text-white shadow-md">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>የአስተዳዳሪ ማዕከል • Admin Control Center</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gold">
              የ RABBI አስተዳዳሪ ዳሽቦርድ
            </h1>
            <p className="text-xs text-on-navy-muted mt-1 leading-relaxed">
              መጽሐፍትን፣ ሚዲያዎችን፣ ኮርሶችን፣ ጽሑፎችን፣ የገዢዎች ክትትልና ጸሎቶችን ሙሉ በሙሉ ይቆጣጠሩ።
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Real-time Indicator */}
            <div className="flex items-center gap-2 rounded-full bg-navy-soft/80 px-3 py-1.5 border border-gold/30 text-xs">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[11px] text-green-300 font-semibold">
                ቀጥታ ክትትል (Live Sync)
              </span>
            </div>

            {/* Quick Refresh Button */}
            <button
              onClick={() => {
                fetchAdminRequests();
                fetchAdminContents();
                fetchPrivatePrayers();
                fetchDashboardStats();
              }}
              title="በእጅ አድስ (Manual Refresh)"
              className="flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">አድስ</span>
            </button>

            {/* Link to Website */}
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold border border-gold/40 hover:bg-gold hover:text-navy-deep transition-all cursor-pointer shadow-sm active:scale-95"
              title="ወደ ዋናው ድረ-ገጽ ተመለስ"
            >
              <Home className="h-3.5 w-3.5" />
              <span>ወደ ዋናው ገጽ (Website)</span>
            </Link>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-1.5 rounded-xl bg-navy-soft px-3 py-1.5 border border-white/10 text-xs max-w-[160px] sm:max-w-[220px]">
              <UserCheck className="h-3.5 w-3.5 text-gold shrink-0" />
              <span className="font-bold text-white text-[11px] truncate">{user?.email}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              title="ከአስተዳዳሪ ውጣ"
              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ውጣ (Logout)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 mt-6 sm:mt-8">
        {/* ================= REAL-TIME TRACKING DASHBOARD STATS ================= */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold shrink-0" />
              <h2 className="font-display text-base sm:text-lg font-bold text-navy">
                የቀጥታ ሽያጭና የገዢዎች ክትትል (Live Sales & Buyers Tracking)
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              በየ 4 ሴኮንዱ በቀጥታ የሚታደስ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Approved Sales */}
            <div className="rounded-2xl bg-card border border-gold/20 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  የተፈቀዱ ግዢዎች
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-navy">
                  {totalApprovedSales}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  የተፈቀደላቸው የይዘት ጥያቄዎች
                </p>
              </div>
            </div>

            {/* Card 2: Total Revenue */}
            <div className="rounded-2xl bg-card border border-gold/30 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-br from-card via-card to-gold/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  ጠቅላላ የተገኘ ገቢ
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-navy-deep">
                  <span>{totalRevenue.toLocaleString()} <span className="text-sm font-bold text-gold">ETB</span></span><span className="text-xs font-bold text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30 ml-2">{formatEtbWithUsd(totalRevenue).usdText}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ከተፈቀዱ ግዢዎች የተሰበሰበ
                </p>
              </div>
            </div>

            {/* Card 3: Pending Requests */}
            <div className="rounded-2xl bg-card border border-gold/20 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  በመጠባበቅ ላይ
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl md:text-3xl font-extrabold text-navy">
                    {totalPending}
                  </span>
                  {totalPending > 0 && (
                    <span className="rounded-full bg-amber-500/20 text-amber-700 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                      ማረጋገጫ ይጠብቃል
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ፍቃድ የሚጠብቁ ጥያቄዎች
                </p>
              </div>
            </div>

            {/* Card 4: Unique Buyers */}
            <div className="rounded-2xl bg-card border border-gold/20 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  የገዙ ተጠቃሚዎች
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-navy">
                  {totalUniqueBuyers}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ቢያንስ 1 ይዘት የገዙ ተጠቃሚዎች
                </p>
              </div>
            </div>
          </div>

          {/* Top Selling Quick Ribbon */}
          {stats?.topSellingBooks && stats.topSellingBooks.length > 0 && (
            <div className="mt-3 rounded-xl bg-card border border-gold/20 p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-navy shrink-0">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>በብዛት የተገዙ ይዘቶች (Top Sellers)፦</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0 touch-pan-x">
                {stats.topSellingBooks.slice(0, 4).map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 rounded-lg bg-navy/5 px-2.5 py-1 border border-navy/10 shrink-0"
                  >
                    <span className="font-bold text-gold text-[11px]">#{idx + 1}</span>
                    <span className="font-bold text-navy text-[11px] max-w-[130px] truncate">
                      {b.title}
                    </span>
                    <span className="rounded-md bg-green-100 text-green-800 px-1.5 py-0.2 text-[10px] font-bold">
                      {b.approvedCount} ገዢዎች
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs Bar with Edge-to-Edge Mobile Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-navy/15 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 touch-pan-x">
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "REQUESTS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {reqLoading && activeTab === "REQUESTS" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>የይዘት ጥያቄዎች</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-navy-deep animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("MANAGE_CONTENTS")}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "MANAGE_CONTENTS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {contentLoading && activeTab === "MANAGE_CONTENTS" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            <span>ይዘቶችን አስተዳድር ({contents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("TRACKING")}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "TRACKING"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {contentLoading && activeTab === "TRACKING" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 text-gold" />
            )}
            <span>የሽያጭና የገዢዎች ክትትል</span>
          </button>

          <button
            onClick={() => handleAddNewContentWithCategory()}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "ADD_CONTENT"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            <Plus className="h-4 w-4 text-gold" />
            <span>አዲስ ይዘት ጨምር</span>
          </button>

          <button
            onClick={() => setActiveTab("PRIVATE_PRAYERS")}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "PRIVATE_PRAYERS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {prayerLoading && activeTab === "PRIVATE_PRAYERS" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span>የግል ጸሎቶች ({privatePrayers.length})</span>
            {unprayedCount > 0 ? (
              <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                {unprayedCount} አዲስ
              </span>
            ) : (
              <span className="rounded-full bg-navy/10 text-navy-deep px-2 py-0.5 text-[10px] font-bold">
                {privatePrayers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "PROFILE"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {profileLoading && activeTab === "PROFILE" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            <span>የይለፍ ቃልና ፕሮፋይል (Security)</span>
          </button>

          <button
            onClick={() => { setActiveTab("MANAGE_ADMINS"); fetchAdmins(); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "MANAGE_ADMINS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            {adminsLoading && activeTab === "MANAGE_ADMINS" ? (
              <RefreshCw className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            <span>አስተዳዳሪዎች ({adminsList.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: REQUESTS ================= */}
        {activeTab === "REQUESTS" && (
          <div className="space-y-6">
            {/* Filter Bar for Requests */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-gold/20 shadow-sm">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-navy mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-gold" />
                  የጥያቄ ዓይነት፦
                </span>
                {[
                  { id: "ALL", label: `ሁሉም (${requests.length})` },
                  { id: "BOOK", label: "መጽሐፍት" },
                  { id: "MEDIA", label: "ሚዲያ" },
                  { id: "COURSE", label: "ኮርስ / ስልጠና" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setRequestFilter(id as RequestFilterType)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      requestFilter === id
                        ? "bg-navy-deep text-gold font-bold shadow"
                        : "bg-navy/5 text-navy hover:bg-gold/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-muted-foreground">
                የመጨረሻ የታየው፦ {lastRefreshed.toLocaleTimeString()} (በየ 4 ሴኮንዱ ይቀየራል)
              </span>
            </div>

            {/* Requests Table */}
            {reqLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center shadow-card">
                <Clock className="h-10 w-10 text-gold/60 mx-auto mb-3" />
                <h4 className="font-display text-base font-bold text-navy mb-1">
                  ምንም ጥያቄ አልተገኘም
                </h4>
                <p className="text-xs text-muted-foreground">
                  ተጠቃሚዎች ለመጽሐፍት፣ ሚዲያ ወይም ኮርስ ጥያቄ ሲያቀርቡ እዚህ በቅጽበት ይታያል።
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => {
                  const isPending = req.status === "PENDING";
                  const isPermitted = req.status === "PERMITTED";
                  const isRejected = req.status === "REJECTED";

                  return (
                    <div
                      key={req.id}
                      className={`rounded-2xl bg-card border p-4 sm:p-5 shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPending
                          ? "border-amber-400/80 bg-amber-50/20"
                          : isPermitted
                            ? "border-green-500/40"
                            : "border-red-400/30"
                      }`}
                    >
                      {/* Left: User & Content details */}
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 flex-1">
                        <img
                          src={req.book?.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"}
                          alt={req.book?.title}
                          className="h-20 w-16 rounded-xl object-cover border border-gold/30 shrink-0 shadow-sm"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="rounded-md bg-navy-deep px-2 py-0.5 text-[10px] font-bold text-gold">
                              {req.book?.mediaType || "ይዘት"}
                            </span>
                            <span className="text-xs font-bold text-navy-deep">
                              {req.book?.price > 0 ? `${req.book.price} ETB` : "ነፃ (Free)"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              • {new Date(req.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="font-display text-base font-bold text-navy">
                            {req.book?.title || "ርዕስ አልተገኘም"}
                          </h3>

                          {/* Requester Info */}
                          <div className="mt-2 text-xs text-navy/90 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                              <strong className="text-navy">ተጠቃሚ:</strong> {req.user?.fullName || "ስም አልተመዘገበም"}
                            </span>
                            <span className="break-all">
                              <strong className="text-navy">ኢሜይል:</strong> {req.user?.email}
                            </span>
                            {req.user?.phone && (
                              <span>
                                <strong className="text-navy">ስልክ:</strong> {req.user?.phone}
                              </span>
                            )}
                          </div>

                          {/* Real Tracking Info on Request Item */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-bold text-navy-deep border border-gold/30">
                              <Users className="h-3.5 w-3.5 text-gold shrink-0" />
                              <span>ይህንን ይዘት እስካሁን የገዙ፦ <strong className="text-gold font-extrabold">{req.book?.approvedBuyersCount ?? 0}</strong></span>
                            </span>

                            {req.paymentProofUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewReceiptUrl(req.paymentProofUrl!)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-navy-deep px-2.5 py-1 text-xs font-bold text-gold border border-gold/40 hover:bg-navy transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>የክፍያ ደረሰኝ እይ (Receipt)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-stretch md:self-center justify-end shrink-0">
                        {isPending && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              disabled={actionLoadingId?.id === req.id}
                              onClick={() => handleUpdateStatus(req.id, "PERMITTED")}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-green-700 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                            >
                              {actionLoadingId?.id === req.id && actionLoadingId?.action === "PERMITTED" ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span>
                                {actionLoadingId?.id === req.id && actionLoadingId?.action === "PERMITTED"
                                  ? "በማጽደቅ ላይ..."
                                  : "ፍቀድ (Approve)"}
                              </span>
                            </button>

                            <button
                              disabled={actionLoadingId?.id === req.id}
                              onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                            >
                              {actionLoadingId?.id === req.id && actionLoadingId?.action === "REJECTED" ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <span>
                                {actionLoadingId?.id === req.id && actionLoadingId?.action === "REJECTED"
                                  ? "በመከልከል ላይ..."
                                  : "ከልክል (Reject)"}
                              </span>
                            </button>
                          </div>
                        )}

                        {isPermitted && (
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-green-100 border border-green-300 px-3.5 py-1.5 text-xs font-bold text-green-800 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ተፈቅዷል (Approved)
                            </span>
                            <button
                              disabled={actionLoadingId?.id === req.id}
                              onClick={() => handleUpdateStatus(req.id, "PENDING")}
                              className="text-[11px] text-muted-foreground hover:text-navy underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoadingId?.id === req.id && actionLoadingId?.action === "PENDING" && (
                                <RefreshCw className="h-3 w-3 animate-spin text-amber-600" />
                              )}
                              <span>መልስ (Reset)</span>
                            </button>
                          </div>
                        )}

                        {isRejected && (
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-red-100 border border-red-300 px-3.5 py-1.5 text-xs font-bold text-red-800 flex items-center gap-1.5">
                              <XCircle className="h-4 w-4 text-red-600" />
                              ተከልክሏል (Rejected)
                            </span>
                            <button
                              disabled={actionLoadingId?.id === req.id}
                              onClick={() => handleUpdateStatus(req.id, "PENDING")}
                              className="text-[11px] text-muted-foreground hover:text-navy underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoadingId?.id === req.id && actionLoadingId?.action === "PENDING" && (
                                <RefreshCw className="h-3 w-3 animate-spin text-amber-600" />
                              )}
                              <span>መልስ (Reset)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MANAGE CONTENTS ================= */}
        {activeTab === "MANAGE_CONTENTS" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-gold/20 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0 touch-pan-x">
                <span className="text-xs font-bold text-navy mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="h-3.5 w-3.5 text-gold shrink-0" />
                  የይዘት ምድብ፦
                </span>
                {[
                  { id: "ALL", label: `ሁሉም (${contents.length})` },
                  { id: "BOOK", label: "መጽሐፍት" },
                  { id: "VIDEO", label: "ቪዲዮ" },
                  { id: "AUDIO", label: "ኦዲዮ" },
                  { id: "COURSE", label: "ኮርስ" },
                  { id: "ARTICLE", label: "ጽሑፎች" },
                  { id: "PRAYER", label: "ጸሎት" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setContentFilter(id as ContentFilterType)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      contentFilter === id
                        ? "bg-navy-deep text-gold font-bold shadow"
                        : "bg-navy/5 text-navy hover:bg-gold/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="relative min-w-[200px] flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="በርዕስ ወይም በደራሲ ይፈልጉ..."
                    className="w-full rounded-xl border border-navy/20 pl-8 pr-4 py-1.5 text-xs focus:border-gold focus:outline-none bg-background"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddNewContentWithCategory()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gold px-3.5 py-2 sm:py-1.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    {contentFilter !== "ALL"
                      ? `አዲስ ${
                          contentFilter === "BOOK"
                            ? "መጽሐፍ"
                            : contentFilter === "VIDEO"
                              ? "ቪዲዮ"
                              : contentFilter === "AUDIO"
                                ? "ኦዲዮ"
                                : contentFilter === "COURSE"
                                  ? "ኮርስ"
                                  : contentFilter === "ARTICLE"
                                    ? "ጽሑፍ"
                                    : "ጸሎት"
                        } ጨምር`
                      : "አዲስ ጨምር"}
                  </span>
                </button>
              </div>
            </div>

            {/* Content List */}
            {contentLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center shadow-card">
                <BookOpen className="h-10 w-10 text-gold/60 mx-auto mb-3" />
                <h4 className="font-display text-base font-bold text-navy mb-1">
                  ምንም ይዘት አልተገኘም
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  "አዲስ ይዘት ጨምር" የሚለውን በመጠቀም መጽሐፍ፣ ሚዲያ፣ ኮርስ፣ ጽሑፍ ወይም ጸሎት ይጨምሩ።
                </p>
                <button
                  type="button"
                  onClick={() => handleAddNewContentWithCategory()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {contentFilter !== "ALL"
                      ? `አዲስ ${
                          contentFilter === "BOOK"
                            ? "መጽሐፍ"
                            : contentFilter === "VIDEO"
                              ? "ቪዲዮ"
                              : contentFilter === "AUDIO"
                                ? "ኦዲዮ"
                                : contentFilter === "COURSE"
                                  ? "ኮርስ"
                                  : contentFilter === "ARTICLE"
                                    ? "ጽሑፍ"
                                    : "ጸሎት"
                        } ጨምር`
                      : "አዲስ ይዘት ጨምር"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredContents.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-card border border-gold/20 shadow-card p-4 flex flex-col justify-between hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-navy/5 mb-3 border border-gold/20">
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-2 left-2 rounded-md bg-navy-deep/85 px-2 py-0.5 text-[10px] font-bold text-gold">
                          {item.mediaType}
                        </span>
                        <span className="absolute top-2 right-2 rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-deep">
                          {item.price > 0 ? `${item.price} ETB` : "ነፃ"}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-navy line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gold font-semibold mt-0.5">
                        ደራሲ/መምህር: {item.author || "RABBI"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                        {item.description || "ምንም መግለጫ የለም።"}
                      </p>

                      {/* Real Tracking Info for this content */}
                      <div className="mt-3 rounded-xl bg-navy/5 border border-gold/20 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-navy">
                            <Users className="h-4 w-4 text-gold" />
                            <span>የገዙ ተጠቃሚዎች፦</span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              (item.approvedCount || 0) > 0
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-navy/10 text-muted-foreground"
                            }`}
                          >
                            {item.approvedCount || 0} ተጠቃሚዎች
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-navy/10">
                          <span>
                            ገቢ፦{" "}
                            <strong className="text-navy font-bold">
                              {((item.approvedCount || 0) * (item.price || 0)).toLocaleString()} ETB
                            </strong>
                          </span>
                          {(item.pendingCount || 0) > 0 && (
                            <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 text-[10px]">
                              {item.pendingCount} በመጠባበቅ ላይ
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBookForBuyers(item)}
                          className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-lg bg-navy-deep py-1.5 text-[11px] font-bold text-gold hover:bg-navy transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>የገዢዎች ዝርዝር ({item.approvedCount || 0})</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex items-center gap-1 rounded-lg bg-navy/5 px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-gold" />
                          <span>አስተካክል</span>
                        </button>

                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>ሰርዝ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: SALES & BUYERS TRACKING ================= */}
        {activeTab === "TRACKING" && (
          <div className="space-y-6">
            {/* Header / Filter bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-gold/20 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-base font-bold text-navy">
                    የይዘቶች ሽያጭና የገዢዎች ዝርዝር ክትትል (Book & Content Sales Tracker)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  ለእያንዳንዱ መጽሐፍ፣ ኮርስ ወይም ሚዲያ ስንት ተጠቃሚዎች እንደገዙ እና ያመጣውን ገቢ በቀጥታ ይከታተሉ።
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div className="relative min-w-[180px] flex-1 md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value)}
                    placeholder="በርዕስ ወይም ደራሲ ፈልግ..."
                    className="w-full rounded-xl border border-navy/20 pl-8 pr-3 py-1.5 text-xs focus:border-gold focus:outline-none bg-background"
                  />
                </div>

                <select
                  value={trackingTypeFilter}
                  onChange={(e) => setTrackingTypeFilter(e.target.value)}
                  className="rounded-xl border border-navy/20 px-3 py-1.5 text-xs bg-background text-navy focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ሁሉም ምድቦች</option>
                  <option value="BOOK">መጽሐፍት (Books)</option>
                  <option value="VIDEO">ቪዲዮ (Videos)</option>
                  <option value="AUDIO">ኦዲዮ (Audios)</option>
                  <option value="COURSE">ኮርስ (Courses)</option>
                  <option value="ARTICLE">ጽሑፎች (Articles)</option>
                  <option value="PRAYER">ጸሎት (Prayers)</option>
                </select>

                <select
                  value={trackingBuyerFilter}
                  onChange={(e) => setTrackingBuyerFilter(e.target.value as any)}
                  className="rounded-xl border border-navy/20 px-3 py-1.5 text-xs bg-background text-navy focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ሁሉም ይዘቶች ({contents.length})</option>
                  <option value="HAS_BUYERS">የተገዙ ብቻ (With Buyers)</option>
                  <option value="NO_BUYERS">ያልተገዙ (No Buyers Yet)</option>
                </select>
              </div>
            </div>

            {/* Tracking Table */}
            {filteredTrackingContents.length === 0 ? (
              <div className="rounded-2xl border border-gold/20 bg-card p-12 text-center shadow-card">
                <ShoppingBag className="h-10 w-10 text-gold/60 mx-auto mb-3" />
                <h4 className="font-display text-base font-bold text-navy mb-1">
                  ምንም ይዘት አልተገኘም
                </h4>
                <p className="text-xs text-muted-foreground">
                  የተመረጠውን ማጣሪያ የሚያሟላ መጽሐፍ ወይም ይዘት አልተገኘም።
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-gold/20 shadow-card overflow-hidden">
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-navy-deep text-gold font-bold uppercase tracking-wider text-[11px] border-b border-gold/20">
                      <tr>
                        <th className="px-4 py-3.5">ይዘት / መጽሐፍ</th>
                        <th className="px-4 py-3.5">ምድብ</th>
                        <th className="px-4 py-3.5">የአንዱ ዋጋ</th>
                        <th className="px-4 py-3.5 text-center">የገዙ ተጠቃሚዎች</th>
                        <th className="px-4 py-3.5">ጠቅላላ ገቢ</th>
                        <th className="px-4 py-3.5">በመጠባበቅ ላይ</th>
                        <th className="px-4 py-3.5 text-right">የገዢዎች ዝርዝር</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/10">
                      {filteredTrackingContents.map((item) => {
                        const buyersCount = item.approvedCount || 0;
                        const pendingReqCount = item.pendingCount || 0;
                        const revenue = buyersCount * (item.price || 0);

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gold/5 transition-all text-navy"
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.coverUrl}
                                  alt={item.title}
                                  className="h-12 w-10 rounded-lg object-cover border border-gold/30 shrink-0 shadow-xs"
                                />
                                <div>
                                  <div className="font-bold text-navy text-xs line-clamp-1 max-w-[220px]">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">
                                    ደራሲ: {item.author || "RABBI"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="rounded-md bg-navy/5 px-2 py-0.5 text-[10px] font-bold text-navy-deep border border-navy/10">
                                {item.mediaType}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-bold text-navy">
                              {item.price > 0 ? `${item.price} ETB` : "ነፃ (Free)"}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs ${
                                  buyersCount > 0
                                    ? "bg-green-100 text-green-800 border border-green-300 shadow-xs"
                                    : "bg-navy/5 text-muted-foreground"
                                }`}
                              >
                                <Users className="h-3.5 w-3.5 text-green-700" />
                                {buyersCount} ተጠቃሚዎች
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-extrabold text-navy-deep">
                              {revenue > 0 ? (
                                <span className="text-gold font-bold">
                                  {revenue.toLocaleString()} ETB
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0 ETB</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              {pendingReqCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse">
                                  <Clock className="h-3 w-3" />
                                  {pendingReqCount} በመጠባበቅ ላይ
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">-</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedBookForBuyers(item)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-navy-deep px-3.5 py-1.5 text-xs font-bold text-gold hover:bg-navy transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>ገዢዎችን እይ ({buyersCount})</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ADD CONTENT ================= */}
        {activeTab === "ADD_CONTENT" && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-card border border-gold/30 p-6 md:p-10 shadow-card">
            <div className="flex items-center gap-2 border-b border-gold/20 pb-4 mb-6">
              <Plus className="h-6 w-6 text-gold" />
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  አዲስ ይዘት ጨምር (Add New Content)
                </h2>
                <p className="text-xs text-muted-foreground">
                  መጽሐፍት፣ ቪዲዮ/ኦዲዮ ሚዲያ፣ ኮርስ፣ መንፈሳዊ ጽሑፍ ወይም ጸሎት ይፍጠሩ።
                </p>
              </div>
            </div>

            {formMsg && (
              <div className="mb-5 rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>{formMsg}</span>
              </div>
            )}

            {formError && (
              <div className="mb-5 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateContent} className="space-y-5">
              {/* Row 1: Category + Price */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    የይዘት ምድብ (Content Category) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMediaType(v);
                      if (v === "ARTICLE" || v === "PRAYER") setPrice("0");
                    }}
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-semibold"
                  >
                    <option value="BOOK">📖 መጽሐፍ (Book)</option>
                    <option value="VIDEO">🎬 ቪዲዮ ሚዲያ (Video Media)</option>
                    <option value="AUDIO">🎵 ኦዲዮ ሚዲያ (Audio Media)</option>
                    <option value="COURSE">🎓 ኮርስ / ዶርቃ ኮሌጅ &amp; ስልጠና (Course / PDF)</option>
                    <option value="ARTICLE">📝 መንፈሳዊ ጽሑፍ (Article)</option>
                    <option value="PRAYER">🙏 የጸሎት መመሪያና ርዕስ (Prayer)</option>
                  </select>
                </div>

                {/* Price — locked to 0 for ARTICLE & PRAYER */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    ዋጋ በብር (Price in ETB) — 0 ለነፃ <span className="text-red-500">*</span>
                    {(mediaType === "ARTICLE" || mediaType === "PRAYER") && (
                      <span className="ml-2 text-[11px] text-green-700 font-normal">(ሁልጊዜ ነፃ)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(filterNumberInput(e.target.value, true))}
                    min="0"
                    placeholder="250"
                    readOnly={mediaType === "ARTICLE" || mediaType === "PRAYER"}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none font-mono ${
                      mediaType === "ARTICLE" || mediaType === "PRAYER"
                        ? "bg-green-50 border-green-300 cursor-not-allowed opacity-70"
                        : "bg-background border-navy/20"
                    }`}
                  />
                  {price && Number(price) > 0 && (
                    <p className="mt-1.5 text-[11px] font-bold text-gold flex items-center gap-1.5">
                      <span>የዶላር ዋጋ (USD Equivalent):</span>
                      <span className="bg-gold/15 px-2 py-0.5 rounded-md border border-gold/30 text-navy-deep font-mono">
                        {formatEtbWithUsd(price).usdText}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Title + Author (Author hidden for PRAYER) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    ርዕስ (Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      mediaType === "PRAYER"  ? "የጸሎቱ ርዕስ ያስገቡ..." :
                      mediaType === "BOOK"    ? "የመጽሐፉ ስም..." :
                      mediaType === "VIDEO"   ? "የቪዲዮ ትምህርት ርዕስ..." :
                      mediaType === "AUDIO"   ? "የኦዲዮ ርዕስ..." :
                      mediaType === "COURSE"  ? "የኮርሱ ስም..." :
                                               "የጽሑፉ ርዕስ..."
                    }
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                  />
                </div>

                {mediaType !== "PRAYER" && (
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      {mediaType === "BOOK"   ? "ደራሲ (Author)" :
                       mediaType === "VIDEO" || mediaType === "AUDIO" ? "አቅራቢ (Speaker / Provider)" :
                       mediaType === "COURSE" ? "አስተማሪ (Instructor)" :
                                               "ጸሐፊ (Writer)"}
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(filterNameInput(e.target.value))}
                      placeholder="RABBI / ዶርቃ ኮሌጅ"
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                    />
                  </div>
                )}
              </div>

              {/* Cover Image — completely removed for ARTICLE, PRAYER, AUDIO, VIDEO (only for BOOK and COURSE) */}
              {(mediaType === "BOOK" || mediaType === "COURSE") && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    የሽፋን ፎቶ (Cover Image) <span className="text-muted-foreground font-normal text-[11px]">(አማራጭ / Optional)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://... ወይም 'ፎቶ ስቀል' የሚለውን ይጫኑ (አማራጭ)"
                      className="flex-1 rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-mono"
                    />
                    <label className="rounded-xl bg-gold/15 border border-gold/40 px-4 py-2.5 text-xs font-bold text-navy hover:bg-gold hover:text-navy-deep transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? "በመጫን ላይ..." : "ፎቶ ስቀል"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploading && uploadProgress > 0 && (
                    <div className="mt-1.5 w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gold rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Description — hidden for PRAYER */}
              {mediaType !== "PRAYER" && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    አጭር ማጠቃለያ መግለጫ (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="የይዘቱ አጭር መግለጫ..."
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                  />
                </div>
              )}

              {/* ===== VIDEO-specific fields ===== */}
              {mediaType === "VIDEO" && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <p className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                    🎬 <span>YouTube Embed URL ያስገቡ</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-gold" />
                      የቪዲዮ Embed ሊንክ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {"💡 YouTube → Share → Embed → ሊንኩን ቅዱ (https://www.youtube.com/embed/...)"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Music className="h-3.5 w-3.5 text-gold" />
                      የኦዲዮ ሊንክ (Audio MP3 — አማራጭ)
                    </label>
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/sermon.mp3 (አማራጭ)"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የናሙና / ማጠቃለያ (Sample Notes — አማራጭ)
                    </label>
                    <textarea
                      rows={2}
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder="ተጠቃሚዎች ሳይገዙ የሚያዩት ማጠቃለያ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                    />
                  </div>
                </div>
              )}

              {/* ===== AUDIO-specific fields ===== */}
              {mediaType === "AUDIO" && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                  <p className="text-[11px] font-bold text-purple-800 flex items-center gap-1.5">
                    🎵 <span>MP3 Audio URL ያስገቡ</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Music className="h-3.5 w-3.5 text-gold" />
                      የኦዲዮ ሊንክ (MP3 Stream URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-gold" />
                      የቪዲዮ ሊንክ (YouTube Embed — አማራጭ)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/... (አማራጭ)"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የናሙና ቅንጭብ (Sample — አማራጭ)
                    </label>
                    <textarea
                      rows={2}
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder="የኦዲዮ ናሙና ወይም ማጠቃለያ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                    />
                  </div>
                </div>
              )}

              {/* ===== BOOK-specific fields ===== */}
              {mediaType === "BOOK" && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                    📖 <span>የመጽሐፍ ናሙናና ሙሉ ይዘት ያስገቡ</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የነፃ ናሙና ንባብ (Free Sample Preview)
                    </label>
                    <textarea
                      rows={3}
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder="ተጠቃሚዎች ሳይገዙ የሚያነቡት የነፃ ናሙና ምዕራፍ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background leading-relaxed"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-navy">
                        ሙሉ የመጽሐፍ ይዘት (Full Book Content)
                      </label>
                      <label className="rounded-lg bg-navy-deep px-3 py-1 text-[11px] font-bold text-gold hover:bg-navy transition-all cursor-pointer flex items-center gap-1.5 shadow-xs">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploading ? "ፋይል በመጫን ላይ..." : "PDF / DOCX ስቀል"}</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                          disabled={uploading}
                          onChange={(e) => handleBookPdfUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploading && uploadProgress > 0 && (
                      <div className="mb-2 w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-gold rounded-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    <textarea
                      rows={5}
                      value={fullContent}
                      onChange={(e) => setFullContent(e.target.value)}
                      placeholder="ሙሉ ጽሑፍ እዚህ ይጻፉ ወይም ከላይ PDF / DOCX ስቀሉ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ===== COURSE-specific fields ===== */}
              {mediaType === "COURSE" && (
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <p className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                    🎓 <span>ኮርስ / ዶርቃ ኮሌጅ — ቪዲዮ ሊንክ ወይም PDF ያስገቡ</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-gold" />
                      ዋና ቪዲዮ Embed URL (አማራጭ)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/... (አማራጭ)"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የኮርሱ አወቃቀር / ዝርዝር (Outline — አማራጭ)
                    </label>
                    <textarea
                      rows={3}
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder={"ምዕራፍ 1፡ መግቢያ\nምዕራፍ 2፡ ..."}
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background leading-relaxed"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-navy">
                        ሙሉ ይዘት / PDF ሊንክ (Full Content)
                      </label>
                      <label className="rounded-lg bg-navy-deep px-3 py-1 text-[11px] font-bold text-gold hover:bg-navy transition-all cursor-pointer flex items-center gap-1.5 shadow-xs">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploading ? "ፋይል በመጫን ላይ..." : "PDF / DOCX ስቀል"}</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                          disabled={uploading}
                          onChange={(e) => handleBookPdfUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      value={fullContent}
                      onChange={(e) => setFullContent(e.target.value)}
                      placeholder="ሙሉ ይዘት እዚህ ይጻፉ ወይም PDF / DOCX ሊንክ ያስገቡ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ===== ARTICLE-specific fields ===== */}
              {mediaType === "ARTICLE" && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                    📝 <span>ጽሑፍ — ዋጋ ሁልጊዜ ነፃ (0 ብር)</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <span>{"የመጽሐፍ ቅዱስ ጥቅስና ቃል (Scripture Verse & Citation)"}</span>
                      <span className="text-gold font-bold text-[11px]">{"(በመነሻ ገጽ 'የዛሬ ቃል' ሆኖ ይወጣል)"}</span>
                    </label>
                    <input
                      type="text"
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder={"ለምሳሌ፡ ኢሳይያስ 30:15 — 'በመመለስና በማረፍ ትድናላችሁ፤'"}
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-serif shadow-xs"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      {"💡 ጥቅሱን (ኢሳ 30:15) እና ቃሉን እዚህ ያስገቡ።"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      ሙሉ የጽሑፉ ይዘት (Full Article Content) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={fullContent}
                      onChange={(e) => setFullContent(e.target.value)}
                      placeholder="የጽሑፉን ሙሉ ይዘትና ትምህርት እዚህ ይጻፉ..."
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ===== PRAYER-specific fields ===== */}
              {mediaType === "PRAYER" && (
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3">
                  <p className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5">
                    🙏 <span>ጸሎት — ዋጋ ሁልጊዜ ነፃ፣ ደራሲ አይጠፈልግም</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የጸሎቱ ሙሉ ጽሑፍ (Prayer Text) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={fullContent}
                      onChange={(e) => setFullContent(e.target.value)}
                      placeholder={"የጸሎቱን ሙሉ ጽሑፍ እዚህ ያስገቡ...\n\nጌታ ሆይ፣ ..."}
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background leading-relaxed font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      የጸሎት ናሙና (Short Preview — አማራጭ)
                    </label>
                    <textarea
                      rows={2}
                      value={sampleContent}
                      onChange={(e) => setSampleContent(e.target.value)}
                      placeholder="አጭር የጸሎት ቅንጭብ..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-navy-deep" />
                    <span>ይዘቱን በማስቀመጥ ላይ...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>ይዘቱን ፍጠርና አስቀምጥ (Publish Content)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB: PRIVATE PRAYERS ================= */}
        {activeTab === "PRIVATE_PRAYERS" && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-card p-6 rounded-3xl border border-gold/30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-gold/15 p-3.5 text-navy-deep border border-gold/30 shadow-sm shrink-0">
                  <Lock className="h-7 w-7 text-navy-deep" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200 mb-1">
                    <EyeOff className="h-3 w-3" />
                    <span>ምስጢራዊና የግል ጥያቄዎች (Confidential)</span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-navy">
                    የተጠቃሚዎች የግል ጸሎት ጥያቄዎች
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
                    እነዚህ ጸሎቶች በምስጢር ለእናንተ ብቻ የቀረቡ ናቸው፤ በማኅበረሰቡ ዘንድ አይታዩም። በጸሎት ከደገፉ በኋላ 
                    "ተጸልዮበታል" የሚለውን ምልክት ማድረግ ይችላሉ።
                  </p>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl bg-navy-deep text-white px-4 py-2.5 text-center border border-gold/30">
                  <span className="block text-lg font-bold text-gold font-mono">{privatePrayers.length}</span>
                  <span className="text-[10px] text-on-navy-muted">ጠቅላላ</span>
                </div>
                <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-center">
                  <span className="block text-lg font-bold text-rose-700 font-mono">{unprayedCount}</span>
                  <span className="text-[10px] text-rose-600 font-semibold">አዲስ (ያልተጸለየበት)</span>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-2.5 text-center">
                  <span className="block text-lg font-bold text-green-700 font-mono">{prayedCount}</span>
                  <span className="text-[10px] text-green-600 font-semibold">የተጸለየባቸው</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-gold/20 shadow-sm">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-navy mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-gold" />
                  ማጣሪያ፦
                </span>
                {[
                  { id: "ALL", label: `ሁሉም (${privatePrayers.length})` },
                  { id: "UNPRAYED", label: `አዲስ / ያልተጸለየበት (${unprayedCount})` },
                  { id: "PRAYED", label: `የተጸለየበት (${prayedCount})` },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setPrayerFilter(id as any)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      prayerFilter === id
                        ? "bg-navy-deep text-gold font-bold shadow"
                        : "bg-navy/5 text-navy hover:bg-gold/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={prayerSearch}
                  onChange={(e) => setPrayerSearch(e.target.value)}
                  placeholder="በርዕስ፣ ዝርዝር ወይም ስም ፈልግ..."
                  className="w-full rounded-xl border border-navy/20 pl-8 pr-3 py-1.5 text-xs bg-background focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Prayers List */}
            {prayerLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
              </div>
            ) : filteredPrivatePrayers.length === 0 ? (
              <div className="rounded-3xl border border-gold/20 bg-card p-12 text-center shadow-card">
                <Lock className="h-12 w-12 text-gold/50 mx-auto mb-3" />
                <h4 className="font-display text-lg font-bold text-navy mb-1">
                  ምንም የግል ጸሎት አልተገኘም
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  ተጠቃሚዎች ከጸሎት ገጹ ላይ የግል ጸሎት በምስጢር ሲልኩ እዚህ በቅጽበት ይደርሰዎታል።
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPrivatePrayers.map((prayer) => {
                  return (
                    <div
                      key={prayer.id}
                      className={`rounded-3xl bg-card border-2 p-6 shadow-card transition-all flex flex-col justify-between ${
                        !prayer.isPrayed
                          ? "border-rose-400/60 bg-rose-50/10 shadow-md"
                          : "border-green-500/40 bg-card"
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                !prayer.isPrayed
                                  ? "bg-rose-500/15 text-rose-700 border border-rose-300"
                                  : "bg-green-500/15 text-green-700 border border-green-300"
                              }`}
                            >
                              {!prayer.isPrayed ? "● አዲስ (ያልተጸለየበት)" : "✓ ተጸልዮበታል (Prayed)"}
                            </span>
                            <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-[10px] font-bold text-navy border border-navy/10 flex items-center gap-1">
                              <Lock className="h-3 w-3 text-gold" />
                              ምስጢራዊ
                            </span>
                          </div>

                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(prayer.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-lg font-bold text-navy mb-2">
                          {prayer.title}
                        </h3>

                        {/* Submitter & Contact Card */}
                        {(prayer.submittedBy || prayer.contactInfo) && (
                          <div className="mb-3 rounded-xl bg-navy/5 p-2.5 border border-navy/10 flex items-center justify-between text-xs text-navy/80">
                            <div>
                              <span className="font-semibold text-navy">አቅራቢ፦ </span>
                              <span>{prayer.submittedBy || "በስውር (Anonymous)"}</span>
                            </div>
                            {prayer.contactInfo && (
                              <div>
                                <span className="font-semibold text-navy">አድራሻ፦ </span>
                                <span className="font-mono text-[11px]">{prayer.contactInfo}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        <div className="rounded-2xl bg-background/80 p-4 border border-navy/10 text-xs md:text-sm text-navy/90 font-sans leading-relaxed whitespace-pre-wrap">
                          {prayer.description}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-5 pt-4 border-t border-navy/10 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          disabled={togglingPrayerId === prayer.id}
                          onClick={() => handleTogglePrayerStatus(prayer.id)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-60 ${
                            !prayer.isPrayed
                              ? "bg-gold text-navy-deep hover:bg-gold/90"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {togglingPrayerId === prayer.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {togglingPrayerId === prayer.id
                              ? "በማዘመን ላይ..."
                              : !prayer.isPrayed
                                ? "በጸሎት ደግፌያለሁ (Mark as Prayed)"
                                : "ተጸልዮበታል ✓ (ወደ አዲስ መልስ)"}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingPrayerId === prayer.id}
                          onClick={() => handleDeletePrayer(prayer.id)}
                          title="ይህንን ጸሎት ሰርዝ"
                          className="rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingPrayerId === prayer.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: ADMIN PROFILE & SECURITY ================= */}
        {activeTab === "PROFILE" && (
          <div className="max-w-xl mx-auto rounded-3xl bg-card border border-gold/30 p-6 md:p-10 shadow-card">
            <div className="flex items-center gap-3 border-b border-gold/20 pb-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30 shadow-xs">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  የአስተዳዳሪ ፕሮፋይል፣ ኢሜይል እና የይለፍ ቃል
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  የአስተዳዳሪ ኢሜይል አድራሻዎን፣ ስምዎን፣ ስልክዎን ወይም የይለፍ ቃልዎን እዚህ ይቀይሩ።
                </p>
              </div>
            </div>

            {profileMsg && (
              <div className="mb-5 rounded-xl bg-green-50 p-4 border border-green-200 text-xs text-green-800 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 rounded-xl bg-red-50 p-4 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* SECTION 1: ADMIN INFO & EMAIL */}
              <div className="rounded-2xl bg-navy/5 border border-gold/20 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-navy/10 pb-2">
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gold" />
                    <span>የአስተዳዳሪ መረጃ እና ኢሜይል (Admin Info & Email)</span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">ቀጥታ ይሻሻላል</span>
                </div>

                {/* Email Change Notice */}
                <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-900 leading-relaxed">
                  <strong>💡 ማሳሰቢያ፦</strong> የአስተዳዳሪ ኢሜይልዎን ሲቀይሩ አዲሱ ኢሜይል በቀጥታ ተቀባይነት የሚያገኝ ሲሆን በሚቀጥለው ጊዜ ወደ ዳሽቦርድ ለመግባት በአዲሱ ኢሜይል መግባት አለብዎት።
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gold" />
                    <span>የአስተዳዳሪ ኢሜይል አድራሻ (Admin Email)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="admin@rabbi.com"
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-mono shadow-xs"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gold" />
                      <span>የአስተዳዳሪ ስም (Admin Full Name)</span>
                    </label>
                    <input
                      type="text"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(filterNameInput(e.target.value))}
                      placeholder="RABBI Admin"
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                      <span className="text-gold font-bold">📱</span>
                      <span>ስልክ ቁጥር (Phone Number)</span>
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(filterPhoneInput(e.target.value))}
                      placeholder="+251..."
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CHANGE PASSWORD (OPTIONAL) */}
              <div className="rounded-2xl bg-navy/5 border border-gold/20 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-navy/10 pb-2">
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-gold" />
                    <span>የይለፍ ቃል መቀየሪያ (Change Password — አማራጭ)</span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">ካስፈለገ ብቻ</span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  የይለፍ ቃልዎን መቀየር ካልፈለጉ እነዚህን ሳጥኖች ክፍት ይተዉዋቸው።
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">
                      ያሁኑ የይለፍ ቃል (Current Password)
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-navy/20 px-3.5 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        አዲስ የይለፍ ቃል (New Password — ቢያንስ 6 ፊደላት)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-navy/20 px-3.5 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        አዲሱን የይለፍ ቃል ያረጋግጡ (Confirm New Password)
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-navy/20 px-3.5 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button with Loading Spinner */}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-xs font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {profileLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-navy-deep" />
                    <span>የአስተዳዳሪ መረጃና ኢሜይል በማስቀመጥ ላይ...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>ለውጦችን አስቀምጥ (Save Profile & Email Changes)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB: MANAGE ADMINS ================= */}
        {activeTab === "MANAGE_ADMINS" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 bg-card p-5 rounded-2xl border border-gold/30 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-navy">አስተዳዳሪዎችን አስተዳድር (Manage Admins)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">አዲስ አስተዳዳሪ ፍጠር፣ ያሉትን አስተዳዳሪዎች አስተካክል ወይም ሰርዝ።</p>
              </div>
            </div>

            {/* Add New Admin Form */}
            <div className="rounded-2xl bg-card border border-gold/20 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2 mb-4 pb-2 border-b border-navy/10">
                <Plus className="h-4 w-4 text-gold" />
                አዲስ አስተዳዳሪ ጨምር (Add New Admin)
              </h3>

              {newAdminMsg && (
                <div className="mb-4 rounded-xl bg-green-50 p-3 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>{newAdminMsg}</span>
                </div>
              )}
              {newAdminError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{newAdminError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-gold" />
                    ኢሜይል (Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="newadmin@rabbi.com"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs focus:border-gold focus:outline-none bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-gold" />
                    የይለፍ ቃል (Password) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-gold" />
                    ሙሉ ስም (Full Name)
                  </label>
                  <input
                    type="text"
                    value={newAdminFullName}
                    onChange={(e) => setNewAdminFullName(filterNameInput(e.target.value))}
                    placeholder="Admin Name"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">📱 ስልክ (Phone)</label>
                  <input
                    type="tel"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(filterPhoneInput(e.target.value))}
                    placeholder="+251..."
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs focus:border-gold focus:outline-none bg-background"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={newAdminLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {newAdminLoading ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /><span>በመፍጠር ላይ...</span></>
                    ) : (
                      <><Plus className="h-4 w-4" /><span>አዲስ አስተዳዳሪ ፍጠር (Create Admin)</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Admins List */}
            <div className="rounded-2xl bg-card border border-gold/20 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy/10">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  ያሉ አስተዳዳሪዎች ({adminsList.length})
                </h3>
                <button
                  onClick={fetchAdmins}
                  className="flex items-center gap-1 rounded-lg bg-navy/5 px-2.5 py-1 text-xs text-navy hover:bg-gold/10 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${adminsLoading ? "animate-spin text-gold" : ""}`} />
                  አድስ
                </button>
              </div>

              {adminsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                </div>
              ) : adminsList.length === 0 ? (
                <div className="rounded-xl border border-navy/10 bg-background/50 p-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">ሌሎች አስተዳዳሪዎች አልተገኙም። ከላይ ያለውን ቅጽ ተጠቅመው አዲስ ይፍጠሩ።</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminsList.map((admin) => (
                    <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-background border border-gold/20 hover:border-gold/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold text-sm shrink-0 border border-gold/30">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-navy text-sm">{admin.fullName || "ስም አልተመዘገበም"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{admin.email}</div>
                          {admin.phone && <div className="text-xs text-muted-foreground">📱 {admin.phone}</div>}
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            የተፈጠረበት: {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEditAdmin(admin)}
                          className="flex items-center gap-1 rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-gold" />
                          አስተካክል
                        </button>
                        <button
                          onClick={() => setDeletingAdminId(admin.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ሰርዝ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ================= EDIT ADMIN MODAL ================= */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-gold/30 shadow-2xl p-5 sm:p-7">
            <button
              onClick={() => setEditingAdmin(null)}
              className="absolute top-4 right-4 rounded-full bg-navy/10 p-1.5 text-navy hover:bg-gold/20 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 border-b border-gold/20 pb-3 mb-5">
              <Edit3 className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-bold text-navy">አስተዳዳሪ አስተካክል</h3>
            </div>
            {editAdminMsg && (
              <div className="mb-4 rounded-xl bg-green-50 p-3 border border-green-200 text-xs text-green-800">{editAdminMsg}</div>
            )}
            {editAdminError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">{editAdminError}</div>
            )}
            <form onSubmit={handleSaveAdminEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">ኢሜይል (Email)</label>
                <input
                  type="email"
                  value={editAdminEmail}
                  onChange={(e) => setEditAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">ሙሉ ስም</label>
                <input
                  type="text"
                  value={editAdminFullName}
                  onChange={(e) => setEditAdminFullName(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">ስልክ</label>
                <input
                  type="tel"
                  value={editAdminPhone}
                  onChange={(e) => setEditAdminPhone(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">አዲስ የይለፍ ቃል (ካስፈለገ ብቻ)</label>
                <input
                  type="password"
                  value={editAdminPassword}
                  onChange={(e) => setEditAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background focus:border-gold focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={editAdminLoading}
                  onClick={() => setEditingAdmin(null)}
                  className="flex-1 rounded-xl border border-navy/20 py-2.5 text-xs font-bold text-navy hover:bg-card cursor-pointer disabled:opacity-50"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={editAdminLoading}
                  className="flex-1 rounded-xl bg-gold py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editAdminLoading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /><span>በማስቀመጥ ላይ...</span></>
                  ) : (
                    <><Edit3 className="h-3.5 w-3.5" /><span>አስቀምጥ</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE ADMIN CONFIRMATION ================= */}
      {deletingAdminId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-red-400/40 p-5 sm:p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-navy mb-1">አስተዳዳሪውን ሰርዝ?</h3>
            <p className="text-xs text-muted-foreground mb-5">ይህ አስተዳዳሪ ቋሚ ሆኖ ይሰረዛል። ወደ ኋላ መመለስ አይቻልም።</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deletingAdminLoading}
                onClick={() => setDeletingAdminId(null)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-card cursor-pointer disabled:opacity-50"
              >
                ተመለስ
              </button>
              <button
                type="button"
                disabled={deletingAdminLoading}
                onClick={handleDeleteAdmin}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAdminLoading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /><span>በመሰረዝ...</span></>
                ) : (
                  <><Trash2 className="h-4 w-4" /><span>አዎ፣ ሰርዝ</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT CONTENT MODAL ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card border border-gold/30 shadow-2xl p-4 sm:p-6 md:p-8">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 rounded-full bg-navy/10 p-2 text-navy hover:bg-gold/20 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-gold/20 pb-3 mb-5">
              <Edit3 className="h-5 w-5 text-gold" />
              <h3 className="font-display text-xl font-bold text-navy">
                ይዘት አስተካክል (Edit Content)
              </h3>
            </div>

            {editMsg && (
              <div className="mb-4 rounded-xl bg-green-50 p-3 border border-green-200 text-xs text-green-800">
                {editMsg}
              </div>
            )}
            {editError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">የይዘት ምድብ</label>
                  <select
                    value={editMediaType}
                    onChange={(e) => setEditMediaType(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-semibold"
                  >
                    <option value="BOOK">መጽሐፍ (Book)</option>
                    <option value="VIDEO">ቪዲዮ ሚዲያ (Video)</option>
                    <option value="AUDIO">ኦዲዮ ሚዲያ (Audio)</option>
                    <option value="COURSE">ኮርስ / ስልጠና (Course / PDF)</option>
                    <option value="ARTICLE">መንፈሳዊ ጽሑፍ (Article)</option>
                    <option value="PRAYER">የጸሎት መመሪያ (Prayer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">ዋጋ በብር (ETB)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(filterNumberInput(e.target.value, true))}
                    min="0"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                  />
                  {editPrice && Number(editPrice) > 0 && (
                    <p className="mt-1 text-[11px] font-bold text-gold">
                      ≈ {formatEtbWithUsd(editPrice).usdText}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">ርዕስ (Title)</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">ደራሲ / መምህር</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(filterNameInput(e.target.value))}
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Cover Image — completely removed for ARTICLE, PRAYER, AUDIO, VIDEO (only for BOOK and COURSE) */}
              {(editMediaType === "BOOK" || editMediaType === "COURSE") && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    የከቨር ፎቶ URL <span className="text-muted-foreground font-normal text-[11px]">(አማራጭ / Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editCoverUrl}
                      onChange={(e) => setEditCoverUrl(e.target.value)}
                      placeholder="https://... (አማራጭ)"
                      className="flex-1 rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                    <label className="rounded-xl bg-gold/15 px-3 py-2 text-xs font-bold text-navy hover:bg-gold transition-all cursor-pointer shrink-0 flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{editUploading ? "..." : "ቀይር"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={editUploading}
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editUploading && editUploadProgress > 0 && (
                    <div className="mt-1.5 w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gold rounded-full transition-all duration-150"
                        style={{ width: `${editUploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy mb-1">አጭር መግለጫ</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                />
              </div>

              {(editMediaType === "VIDEO" || editMediaType === "AUDIO" || editMediaType === "COURSE") && (
                <div className="grid gap-3 sm:grid-cols-2 p-3 rounded-xl bg-navy/5 border border-gold/20">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">የቪዲዮ ሊንክ</label>
                    <input
                      type="url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      className="w-full rounded-xl border border-navy/20 px-3 py-1.5 text-xs bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">የኦዲዮ ሊንክ</label>
                    <input
                      type="url"
                      value={editAudioUrl}
                      onChange={(e) => setEditAudioUrl(e.target.value)}
                      className="w-full rounded-xl border border-navy/20 px-3 py-1.5 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              )}

              {editMediaType === "ARTICLE" ? (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    <span>የመጽሐፍ ቅዱስ ጥቅስና ቃል (Scripture Verse & Citation)</span>
                  </label>
                  <input
                    type="text"
                    value={editSampleContent}
                    onChange={(e) => setEditSampleContent(e.target.value)}
                    placeholder="ለምሳሌ፡ ኢሳይያስ 30:15 — 'በመመለስና በማረፍ ትድናላችሁ፤ በጸጥታና በመታመን ኃይል ይሆንላችኋል፤'"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-serif"
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    ጥቅሱንና ቃሉን እዚህ ያስገቡ (መነሻ ገጽ ላይ 'የዛሬ ቃል' ሆኖ ይወጣል)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">የነፃ ናሙና ንባብ</label>
                  <textarea
                    rows={3}
                    value={editSampleContent}
                    onChange={(e) => setEditSampleContent(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy">
                    {editMediaType === "ARTICLE" ? "ሙሉ የጽሑፉ ይዘት (Full Article)" : "ሙሉ ይዘት"}
                  </label>
                  {(editMediaType === "BOOK" || editMediaType === "COURSE" || editMediaType === "ARTICLE") && (
                    <label className="rounded-lg bg-navy-deep px-2.5 py-0.5 text-[10px] font-bold text-gold hover:bg-navy transition-all cursor-pointer flex items-center gap-1 shadow-xs">
                      <Upload className="h-3 w-3" />
                      <span>{editUploading ? "..." : "PDF / DOCX ስቀል"}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                        disabled={editUploading}
                        onChange={(e) => handleBookPdfUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {editUploading && editUploadProgress > 0 && (
                  <div className="mb-2 w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-gold rounded-full transition-all duration-150"
                      style={{ width: `${editUploadProgress}%` }}
                    />
                  </div>
                )}
                <textarea
                  rows={5}
                  value={editFullContent}
                  onChange={(e) => setEditFullContent(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={editSubmitting}
                  onClick={() => setEditingItem(null)}
                  className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-card cursor-pointer disabled:opacity-50"
                >
                  ተመለስ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || editUploading}
                  className="flex-1 rounded-xl bg-gold py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-navy-deep" />
                      <span>በማስቀመጥ ላይ...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>አስተካክልና አስቀምጥ (Save Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-red-400/40 p-5 sm:p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-navy mb-1">
              ይዘቱን በእርግጠኝነት መሰረዝ ይፈልጋሉ?
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              ይህ ተግባር ወደ ኋላ መመለስ አይቻልም። ይዘቱ እና ተያያዥ ጥያቄዎች በቋሚነት ይሰረዛሉ።
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deletingLoading}
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-card cursor-pointer disabled:opacity-50"
              >
                ተመለስ
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>በመሰረዝ ላይ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>አዎ፣ ሰርዝ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BUYERS LIST MODAL ================= */}
      {selectedBookForBuyers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card border border-gold/40 p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gold/20 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBookForBuyers.coverUrl}
                  alt={selectedBookForBuyers.title}
                  className="h-16 w-12 rounded-xl object-cover border border-gold/30 shrink-0 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-navy-deep px-2 py-0.5 text-[10px] font-bold text-gold">
                      {selectedBookForBuyers.mediaType}
                    </span>
                    <span className="text-xs font-bold text-navy">
                      {selectedBookForBuyers.price > 0 ? `${selectedBookForBuyers.price} ETB` : "ነፃ (Free)"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-navy line-clamp-1">
                    {selectedBookForBuyers.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ደራሲ/መምህር፦ {selectedBookForBuyers.author || "RABBI"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBookForBuyers(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-navy/10 hover:text-navy transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Book Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-navy/5 border border-gold/20">
              <div className="text-center">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">
                  የገዙ ተጠቃሚዎች
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-navy mt-1">
                  {selectedBookForBuyers.approvedCount || 0}
                </div>
              </div>

              <div className="text-center border-x border-navy/10">
                <div className="text-[11px] font-bold text-gold uppercase">
                  የተገኘ ገቢ
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-navy-deep mt-1">
                  {((selectedBookForBuyers.approvedCount || 0) * (selectedBookForBuyers.price || 0)).toLocaleString()}{" "}
                  <span className="text-xs text-gold">ETB</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">
                  በመጠባበቅ ላይ
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-amber-600 mt-1">
                  {selectedBookForBuyers.pendingCount || 0}
                </div>
              </div>
            </div>

            {/* Buyers List Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-navy text-sm">
                <Users className="h-4 w-4 text-gold" />
                <span>የተፈቀደላቸውና የገዙ ተጠቃሚዎች ዝርዝር</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ጠቅላላ፦ {selectedBookForBuyers.buyers?.length || 0}
              </span>
            </div>

            {/* Buyers List Content */}
            {!selectedBookForBuyers.buyers || selectedBookForBuyers.buyers.length === 0 ? (
              <div className="rounded-2xl border border-navy/10 bg-background/50 p-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <h5 className="font-bold text-navy text-sm mb-1">
                  ይህንን ይዘት እስካሁን የገዛ ተጠቃሚ የለም
                </h5>
                <p className="text-xs text-muted-foreground">
                  ተጠቃሚዎች ጥያቄ ሲያቀርቡና በአስተዳዳሪው ፍቃድ (Approve) ሲያገኙ እዚህ በስም፣ በስልክና በኢሜይል ዝርዝር ይታያሉ።
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {selectedBookForBuyers.buyers.map((buyer, idx) => (
                  <div
                    key={buyer.requestId || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-background border border-gold/20 shadow-xs hover:border-gold/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy text-sm">
                            {buyer.fullName}
                          </span>
                          <span className="rounded-md bg-green-100 text-green-800 px-2 py-0.2 text-[10px] font-bold flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-600" />
                            ተፈቅዷል (Approved)
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span>📧 {buyer.email}</span>
                          {buyer.phone && buyer.phone !== "-" && (
                            <span>📱 {buyer.phone}</span>
                          )}
                          <span>
                            📅 {new Date(buyer.approvedAt).toLocaleDateString()} ({new Date(buyer.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>
                      </div>
                    </div>

                    {buyer.paymentProofUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptUrl(buyer.paymentProofUrl!)}
                        className="self-end sm:self-center inline-flex items-center gap-1 rounded-lg bg-navy/5 px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 hover:text-navy-deep transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-gold" />
                        <span>ደረሰኝ እይ</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gold/20 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBookForBuyers(null)}
                className="rounded-xl bg-navy-deep px-5 py-2 text-xs font-bold text-gold hover:bg-navy transition-all cursor-pointer shadow-sm"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAYMENT RECEIPT PREVIEW MODAL ================= */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full rounded-2xl bg-card border border-gold/40 p-3.5 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy/10">
              <h4 className="font-display text-sm font-bold text-navy flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-gold" />
                የክፍያ ማረጋገጫ ደረሰኝ (Payment Proof Receipt)
              </h4>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-navy/10 hover:text-navy cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-xl bg-navy/5 p-2">
              <img
                src={previewReceiptUrl}
                alt="Payment proof receipt"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-navy/10">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                በሙሉ መጠን ክፈት (Open Full Size)
              </a>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="rounded-xl bg-navy-deep px-4 py-1.5 text-xs font-bold text-gold hover:bg-navy cursor-pointer shadow-sm"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
