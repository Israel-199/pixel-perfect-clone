import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

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
}

type AdminTab = "REQUESTS" | "MANAGE_CONTENTS" | "ADD_CONTENT" | "PRIVATE_PRAYERS" | "PROFILE";
type ContentFilterType = "ALL" | "BOOK" | "VIDEO" | "AUDIO" | "COURSE" | "ARTICLE" | "PRAYER";
type RequestFilterType = "ALL" | "BOOK" | "MEDIA" | "COURSE";

function AdminRoute() {
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("REQUESTS");

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
    setActiveTab("ADD_CONTENT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [uploading, setUploading] = useState(false);
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

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Requests (silent for background polling)
  const fetchAdminRequests = async (quiet = false) => {
    try {
      if (!quiet) setReqLoading(true);
      setIsRefreshing(true);
      const data = await fetchApi<{ requests: AdminRequestItem[] }>("/admin/requests");
      setRequests(data.requests);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load admin requests:", err);
    } finally {
      if (!quiet) setReqLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch All Contents
  const fetchAdminContents = async () => {
    try {
      setContentLoading(true);
      const data = await fetchApi<{ books: ContentItemAdmin[] }>("/books");
      setContents(data.books);
    } catch (err) {
      console.error("Failed to load contents:", err);
    } finally {
      setContentLoading(false);
    }
  };

  // Fetch Private Prayers
  const fetchPrivatePrayers = async (quiet = false) => {
    try {
      if (!quiet) setPrayerLoading(true);
      const data = await fetchApi<{ prayers: PrivatePrayerAdminItem[] }>("/private-prayers/admin/all");
      setPrivatePrayers(data.prayers || []);
    } catch (err) {
      console.error("Failed to load private prayers:", err);
    } finally {
      if (!quiet) setPrayerLoading(false);
    }
  };

  // Toggle Private Prayer Prayed Status
  const handleTogglePrayerStatus = async (id: string) => {
    try {
      const data = await fetchApi<{ prayer: PrivatePrayerAdminItem }>(`/private-prayers/admin/${id}/toggle`, {
        method: "PUT",
      });
      setPrivatePrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPrayed: data.prayer.isPrayed } : p))
      );
    } catch (err: any) {
      alert(err.message || "የጸሎት ሁኔታ መቀየር አልተሳካም።");
    }
  };

  // Delete Private Prayer
  const handleDeletePrayer = async (id: string) => {
    if (!confirm("ይህንን የግል ጸሎት መሰረዝ ይፈልጋሉ?")) return;
    try {
      await fetchApi(`/private-prayers/admin/${id}`, {
        method: "DELETE",
      });
      setPrivatePrayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "ጸሎት መሰረዝ አልተሳካም።");
    }
  };

  // Security Auth check & Real-time polling init
  useEffect(() => {
    if (!authLoading) {
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

      // Setup real-time polling every 4 seconds for requests and private prayers
      pollingRef.current = setInterval(() => {
        fetchAdminRequests(true);
        fetchPrivatePrayers(true);
      }, 4000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [user, authLoading]);

  // Update Request Status (Approve / Reject)
  const handleUpdateStatus = async (id: string, status: "PERMITTED" | "REJECTED" | "PENDING") => {
    try {
      await fetchApi(`/admin/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchAdminRequests(true);
    } catch (err: any) {
      alert(err.message || "የጥያቄ ሁኔት መቀየር አልተሳካም።");
    }
  };

  // Upload Cover Image via Cloudinary
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) {
      setEditUploading(true);
      setEditError(null);
    } else {
      setUploading(true);
      setFormError(null);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("resourceType", "image");

    try {
      const data = await fetchApi<{ url: string }>("/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (isEdit) {
        setEditCoverUrl(data.url);
        setEditMsg("የከቨር ፎቶ በተሳካ ሁኔታ ተጭኗል!");
      } else {
        setCoverUrl(data.url);
        setFormMsg("የከቨር ፎቶ በተሳካ ሁኔታ ተጭኗል!");
      }
    } catch (err: any) {
      const msg = err.message || "ፎቶ መጫን አልተሳካም።";
      if (isEdit) setEditError(msg);
      else setFormError(msg);
    } finally {
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

    if (!coverUrl.trim()) {
      setFormError("እባክዎ መጀመሪያ የከቨር ፎቶ ይጫኑ ወይም ምስል URL ያስገቡ።");
      return;
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
          description: description.trim(),
          coverUrl: coverUrl.trim(),
          sampleContent: sampleContent.trim(),
          fullContent: fullContent.trim(),
          videoUrl: videoUrl.trim() || null,
          audioUrl: audioUrl.trim() || null,
        }),
      });

      setFormMsg("አዲስ ይዘት በተሳካ ሁኔታ ወደ ስርዓቱ ተጨምሯል!");
      setTitle("");
      setDescription("");
      setSampleContent("");
      setFullContent("");
      setVideoUrl("");
      setAudioUrl("");
      setCoverUrl("");
      fetchAdminContents();
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

    setEditError(null);
    setEditMsg(null);

    try {
      await fetchApi(`/admin/books/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle.trim(),
          author: editAuthor.trim(),
          price: parseFloat(editPrice) || 0,
          mediaType: editMediaType.toUpperCase(),
          description: editDescription.trim(),
          coverUrl: editCoverUrl.trim(),
          sampleContent: editSampleContent.trim(),
          fullContent: editFullContent.trim(),
          videoUrl: editVideoUrl.trim() || null,
          audioUrl: editAudioUrl.trim() || null,
        }),
      });

      setEditMsg("ይዘቱ በተሳካ ሁኔታ ተሻሽሏል!");
      fetchAdminContents();
      setTimeout(() => {
        setEditingItem(null);
      }, 1200);
    } catch (err: any) {
      setEditError(err.message || "ማስተካከል አልተሳካም።");
    }
  };

  // Delete Content
  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await fetchApi(`/admin/books/${deletingId}`, { method: "DELETE" });
      setDeletingId(null);
      fetchAdminContents();
      fetchAdminRequests(true);
    } catch (err: any) {
      alert(err.message || "ይዘቱን መሰረዝ አልተሳካም።");
    }
  };

  // Admin Profile & Security Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMsg(null);

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
            email: profileEmail.trim(),
            fullName: profileFullName.trim(),
            phone: profilePhone.trim(),
            currentPassword: currentPassword || undefined,
            password: newPassword || undefined,
          }),
        }
      );

      login(data.token, data.user);
      setProfileMsg("የአስተዳዳሪ ፕሮፋይል እና የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setProfileError(err.message || "ፕሮፋይል ማስተካከል አልተሳካም።");
    } finally {
      setProfileLoading(false);
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
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

  // Filtered contents
  const filteredContents = contents.filter((item) => {
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

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const unprayedCount = privatePrayers.filter((p) => !p.isPrayed).length;
  const prayedCount = privatePrayers.filter((p) => p.isPrayed).length;

  const filteredPrivatePrayers = privatePrayers.filter((p) => {
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

  return (
    <div className="animate-in fade-in min-h-screen bg-navy/5 pb-20">
      {/* Top Admin Header Bar */}
      <div className="bg-navy-deep px-6 py-8 border-b border-gold/20 text-white shadow-md">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="h-4 w-4" />
              <span>የአስተዳዳሪ ማዕከል • Admin Control Center</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gold">
              የ RABBI አስተዳዳሪ ዳሽቦርድ
            </h1>
            <p className="text-xs text-on-navy-muted mt-1">
              መጽሐፍትን፣ ሚዲያዎችን፣ ኮርሶችን፣ ጽሑፎችን እና ጸሎቶችን ሙሉ በሙሉ ይቆጣጠሩ።
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Indicator */}
            <div className="flex items-center gap-2 rounded-full bg-navy-soft/80 px-3.5 py-1.5 border border-gold/30 text-xs">
              <span className="relative flex h-2.5 w-2.5">
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
              }}
              title="በእጅ አድስ (Manual Refresh)"
              className="flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold border border-gold/30 hover:bg-gold/25 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">አድስ</span>
            </button>

            {/* Link to Website (since Header is hidden on Admin) */}
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold border border-gold/40 hover:bg-gold hover:text-navy-deep transition-all cursor-pointer shadow-sm"
              title="ወደ ዋናው ድረ-ገጽ ተመለስ"
            >
              <Home className="h-3.5 w-3.5" />
              <span>ወደ ዋናው ገጽ (Website)</span>
            </Link>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-navy-soft px-3 py-1.5 border border-white/10 text-xs">
              <UserCheck className="h-4 w-4 text-gold" />
              <span className="font-bold text-white text-[11px]">{user?.email}</span>
            </div>

            {/* Logout Button (since Footer/Header are hidden on Admin) */}
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              title="ከአስተዳዳሪ ውጣ"
              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ውጣ (Logout)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 md:px-6 mt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-navy/15 scrollbar-none">
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "REQUESTS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>የይዘት ጥያቄዎች (Requests)</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-navy-deep animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("MANAGE_CONTENTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "MANAGE_CONTENTS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>ይዘቶችን አስተዳድር ({contents.length})</span>
          </button>

          <button
            onClick={() => handleAddNewContentWithCategory()}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "ADD_CONTENT"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            <Plus className="h-4 w-4 text-gold" />
            <span>አዲስ ይዘት ጨምር (Add Content)</span>
          </button>

          <button
            onClick={() => setActiveTab("PRIVATE_PRAYERS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "PRIVATE_PRAYERS"
                ? "bg-navy-deep text-gold shadow-md border border-gold/40"
                : "bg-card text-navy border border-navy/10 hover:bg-gold/10"
            }`}
          >
            <Lock className="h-4 w-4" />
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
            <KeyRound className="h-4 w-4" />
            <span>የይለፍ ቃልና ፕሮፋይል (Security)</span>
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
                      className={`rounded-2xl bg-card border p-5 shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPending
                          ? "border-amber-400/80 bg-amber-50/20"
                          : isPermitted
                            ? "border-green-500/40"
                            : "border-red-400/30"
                      }`}
                    >
                      {/* Left: User & Content details */}
                      <div className="flex items-start gap-4">
                        <img
                          src={req.book?.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"}
                          alt={req.book?.title}
                          className="h-20 w-16 rounded-xl object-cover border border-gold/30 shrink-0 shadow-sm"
                        />

                        <div>
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
                            <span>
                              <strong className="text-navy">ኢሜይል:</strong> {req.user?.email}
                            </span>
                            {req.user?.phone && (
                              <span>
                                <strong className="text-navy">ስልክ:</strong> {req.user?.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req.id, "PERMITTED")}
                              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-green-700 transition-all cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>ፍቀድ (Approve)</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all cursor-pointer active:scale-95"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>ከልክል (Reject)</span>
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
                              onClick={() => handleUpdateStatus(req.id, "PENDING")}
                              className="text-[11px] text-muted-foreground hover:text-navy underline cursor-pointer"
                            >
                              መልስ (Reset)
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
                              onClick={() => handleUpdateStatus(req.id, "PENDING")}
                              className="text-[11px] text-muted-foreground hover:text-navy underline cursor-pointer"
                            >
                              መልስ (Reset)
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-navy mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-gold" />
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
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      contentFilter === id
                        ? "bg-navy-deep text-gold font-bold shadow"
                        : "bg-navy/5 text-navy hover:bg-gold/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
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
                  className="flex items-center gap-1.5 rounded-xl bg-gold px-3.5 py-1.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer shrink-0"
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
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description || "ምንም መግለጫ የለም።"}
                      </p>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    የይዘት ምድብ (Content Category) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-semibold"
                  >
                    <option value="BOOK">መጽሐፍ (Book)</option>
                    <option value="VIDEO">ቪዲዮ ሚዲያ (Video Media)</option>
                    <option value="AUDIO">ኦዲዮ ሚዲያ (Audio Media)</option>
                    <option value="COURSE">ኮርስ / ዶርቃ ኮሌጅ & ስልጠና (Course / PDF)</option>
                    <option value="ARTICLE">መንፈሳዊ ጽሑፍ (Article)</option>
                    <option value="PRAYER">የጸሎት መመሪያና ርዕስ (Prayer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    ዋጋ በብር (Price in ETB) — 0 ለነፃ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    placeholder="250"
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-mono"
                  />
                </div>
              </div>

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
                    placeholder="የይዘቱን ርዕስ ያስገቡ"
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    ደራሲ / መምህር / አቅራቢ (Author / Provider)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="RABBI / ዶርቃ ኮሌጅ"
                    className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                  />
                </div>
              </div>

              {/* Cover Image Upload & Direct URL */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  የሽፋን ፎቶ (Cover Image) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="url"
                    required
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
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
              </div>

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

              {/* Media URLs if VIDEO or AUDIO */}
              {(mediaType === "VIDEO" || mediaType === "AUDIO" || mediaType === "COURSE") && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl bg-gold/10 border border-gold/30">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-gold" />
                      የቪዲዮ ሊንክ (YouTube/Vimeo Embed URL)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1">
                      <Music className="h-3.5 w-3.5 text-gold" />
                      የኦዲዮ ሊንክ (Audio MP3 Stream URL)
                    </label>
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  የነፃ ናሙና ንባብ (Sample Content / Outline)
                </label>
                <textarea
                  rows={3}
                  value={sampleContent}
                  onChange={(e) => setSampleContent(e.target.value)}
                  placeholder="ተጠቃሚዎች ሳይገዙ የሚያነቡት የነፃ ናሙና ክፍል..."
                  className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  ሙሉ የተጠበቀ ይዘት (Full Content / Complete Text)
                </label>
                <textarea
                  rows={6}
                  value={fullContent}
                  onChange={(e) => setFullContent(e.target.value)}
                  placeholder="ክፍያ ተፈቅዶ ሲከፈት የሚነበብ ሙሉ የመጽሐፍ፣ የኮርስ፣ የጽሑፍ ወይም የጸሎት ይዘት..."
                  className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-navy-deep shadow-md hover:bg-gold/90 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{submitting ? "በማስቀመጥ ላይ..." : "ይዘቱን ፍጠርና አስቀምጥ (Publish Content)"}</span>
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
                          onClick={() => handleTogglePrayerStatus(prayer.id)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                            !prayer.isPrayed
                              ? "bg-gold text-navy-deep hover:bg-gold/90"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            {!prayer.isPrayed
                              ? "በጸሎት ደግፌያለሁ (Mark as Prayed)"
                              : "ተጸልዮበታል ✓ (ወደ አዲስ መልስ)"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePrayer(prayer.id)}
                          title="ይህንን ጸሎት ሰርዝ"
                          className="rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <div className="flex items-center gap-2 border-b border-gold/20 pb-4 mb-6">
              <KeyRound className="h-6 w-6 text-gold" />
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  የአስተዳዳሪ ፕሮፋይል እና የይለፍ ቃል
                </h2>
                <p className="text-xs text-muted-foreground">
                  የአስተዳዳሪ ኢሜይል አድራሻዎን እና የይለፍ ቃልዎን እዚህ ይቀይሩ።
                </p>
              </div>
            </div>

            {profileMsg && (
              <div className="mb-5 rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gold" />
                  የአስተዳዳሪ ኢሜይል አድራሻ (Admin Email)
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="admin@rabbi.com"
                  className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gold" />
                  የአስተዳዳሪ ስም (Admin Full Name)
                </label>
                <input
                  type="text"
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  placeholder="RABBI Admin"
                  className="w-full rounded-xl border border-navy/20 px-3.5 py-2.5 text-xs text-navy focus:border-gold focus:outline-none bg-background"
                />
              </div>

              <div className="pt-3 border-t border-navy/10">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
                  የይለፍ ቃል መቀየሪያ (Change Password)
                </h4>

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

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                <span>{profileLoading ? "በማስቀመጥ ላይ..." : "ለውጦችን አስቀምጥ (Save Profile Changes)"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ================= EDIT CONTENT MODAL ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-gold/30 shadow-2xl p-6 md:p-8">
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
                    onChange={(e) => setEditPrice(e.target.value)}
                    min="0"
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background font-mono"
                  />
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
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">የከቨር ፎቶ URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
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
              </div>

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

              <div>
                <label className="block text-xs font-bold text-navy mb-1">የነፃ ናሙና ንባብ</label>
                <textarea
                  rows={3}
                  value={editSampleContent}
                  onChange={(e) => setEditSampleContent(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">ሙሉ ይዘት</label>
                <textarea
                  rows={5}
                  value={editFullContent}
                  onChange={(e) => setEditFullContent(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 px-3 py-2 text-xs bg-background"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 rounded-xl border border-navy/20 bg-background py-2.5 text-xs font-bold text-navy hover:bg-card cursor-pointer"
                >
                  ተመለስ (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gold py-2.5 text-xs font-bold text-navy-deep shadow hover:bg-gold/90 transition-all cursor-pointer"
                >
                  አስተካክልና አስቀምጥ (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-red-400/40 p-6 text-center shadow-2xl">
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
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-navy/20 bg-background py-2 text-xs font-bold text-navy hover:bg-card cursor-pointer"
              >
                ተመለስ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all cursor-pointer"
              >
                አዎ፣ ሰርዝ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
