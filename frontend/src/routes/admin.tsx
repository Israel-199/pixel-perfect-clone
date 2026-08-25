import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, CheckCircle2, XCircle, Clock, Upload, Plus, BookOpen, Trash2, Edit3, Image, Video, Music, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

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

interface BookItemAdmin {
  id: string;
  title: string;
  author?: string;
  price: number;
  mediaType: string;
  coverUrl: string;
  createdAt: string;
}

function AdminRoute() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"REQUESTS" | "ADD_BOOK" | "MANAGE_BOOKS">("REQUESTS");

  // Requests state
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [reqLoading, setReqLoading] = useState(true);

  // Books state
  const [books, setBooks] = useState<BookItemAdmin[]>([]);
  const [bookLoading, setBookLoading] = useState(false);

  // Add Book Form state
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

  const [uploading, setUploading] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Requests
  const fetchAdminRequests = async () => {
    try {
      setReqLoading(true);
      const data = await fetchApi<{ requests: AdminRequestItem[] }>("/admin/requests");
      setRequests(data.requests);
    } catch (err) {
      console.error("Failed to load admin requests:", err);
    } finally {
      setReqLoading(false);
    }
  };

  // Load Books
  const fetchAdminBooks = async () => {
    try {
      setBookLoading(true);
      const data = await fetchApi<{ books: BookItemAdmin[] }>("/books");
      setBooks(data.books);
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setBookLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "ADMIN") {
        navigate({ to: "/" });
        return;
      }
      fetchAdminRequests();
      fetchAdminBooks();
    }
  }, [user, authLoading]);

  // Update Request Status (Approve / Reject)
  const handleUpdateStatus = async (id: string, status: "PERMITTED" | "REJECTED" | "PENDING") => {
    try {
      await fetchApi(`/admin/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchAdminRequests();
    } catch (err: any) {
      alert(err.message || "የጥያቄ ሁኔት መቀየር አልተሳካም።");
    }
  };

  // Upload Cover Image to Cloudinary via backend endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("resourceType", "image");

    try {
      const data = await fetchApi<{ url: string }>("/admin/upload", {
        method: "POST",
        body: formData,
      });
      setCoverUrl(data.url);
      setFormMsg("የከቨር ፎቶ በተሳካ ሁኔታ ተጭኗል!");
    } catch (err: any) {
      setFormError(err.message || "ፎቶ መጫን አልተሳካም።");
    } finally {
      setUploading(false);
    }
  };

  // Submit New Book Form
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMsg(null);

    if (!coverUrl) {
      setFormError("እባክዎ መጀመሪያ የከቨር ፎቶ ይጫኑ ወይም URL ያስገቡ።");
      return;
    }

    try {
      await fetchApi("/admin/books", {
        method: "POST",
        body: JSON.stringify({
          title,
          author,
          price: parseFloat(price),
          mediaType,
          description,
          coverUrl,
          sampleContent,
          fullContent,
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
        }),
      });

      setFormMsg("አዲስ መጽሐፍ/ሚዲያ በተሳካ ሁኔታ ተጨምሯል!");
      setTitle("");
      setDescription("");
      setSampleContent("");
      setFullContent("");
      setVideoUrl("");
      setAudioUrl("");
      setCoverUrl("");
      fetchAdminBooks();
    } catch (err: any) {
      setFormError(err.message || "መጽሐፍ መጨመር አልተሳካም።");
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: string) => {
    if (!confirm("እርግጠኛ ነዎት ይህንን መጽሐፍ መሰረዝ ይፈልጋሉ?")) return;

    try {
      await fetchApi(`/admin/books/${id}`, { method: "DELETE" });
      fetchAdminBooks();
    } catch (err: any) {
      alert(err.message || "መሰረዝ አልተሳካም።");
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-navy-deep via-navy to-navy-deep p-6 md:p-8 text-white shadow-xl border border-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gold flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-gold" />
            <span>አድሚን ዳሽቦርድ (Admin Portal)</span>
          </h1>
          <p className="mt-1 text-sm text-on-navy-muted">
            የተጠቃሚዎችን የግዢ ጥያቄዎች ያረጋግጡ፣ አዲስ መንፈሳዊ መጽሐፍትና ሚዲያዎች በCloudinary ይጫኑ።
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-gold/20 pb-4">
        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-gold text-navy-deep shadow"
              : "bg-card text-navy hover:bg-gold/10 border border-gold/10"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>የተጠቃሚዎች ጥያቄዎች ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ADD_BOOK")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "ADD_BOOK"
              ? "bg-gold text-navy-deep shadow"
              : "bg-card text-navy hover:bg-gold/10 border border-gold/10"
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>አዲስ መጽሐፍ / ሚዲያ ጨምር</span>
        </button>

        <button
          onClick={() => setActiveTab("MANAGE_BOOKS")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "MANAGE_BOOKS"
              ? "bg-gold text-navy-deep shadow"
              : "bg-card text-navy hover:bg-gold/10 border border-gold/10"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>የነበሩ መጽሐፍት ({books.length})</span>
        </button>
      </div>

      {/* TAB 1: User Purchase Requests */}
      {activeTab === "REQUESTS" && (
        <div className="rounded-2xl bg-card border border-gold/20 shadow-card overflow-hidden">
          <div className="p-6 border-b border-gold/10 flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-navy">የግዢ ጥያቄዎች ዝርዝር</h3>
            <button
              onClick={fetchAdminRequests}
              className="text-xs font-semibold text-gold hover:underline"
            >
              ማደስ (Refresh)
            </button>
          </div>

          {reqLoading ? (
            <div className="py-12 text-center text-sm text-navy">በመጫን ላይ...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              ምንም የተላከ ጥያቄ የለም።
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy">
                <thead className="bg-navy-deep/5 text-xs uppercase tracking-wider text-navy border-b border-gold/10">
                  <tr>
                    <th className="px-6 py-4">ተጠቃሚ (User)</th>
                    <th className="px-6 py-4">ስልክ / ኢሜይል</th>
                    <th className="px-6 py-4">የተጠየቀው መጽሐፍ</th>
                    <th className="px-6 py-4">ዋጋ</th>
                    <th className="px-6 py-4">ቀን</th>
                    <th className="px-6 py-4">ሁኔታ (Status)</th>
                    <th className="px-6 py-4 text-right">ድርጊት (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-navy">
                        {r.user.fullName || "ስም አልተገለጸም"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div>{r.user.phone || "-"}</div>
                        <div>{r.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-navy flex items-center gap-2">
                        <img
                          src={r.book.coverUrl}
                          alt={r.book.title}
                          className="h-9 w-7 object-cover rounded shadow"
                        />
                        <span>{r.book.title}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-navy-deep">{r.book.price} ETB</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {r.status === "PERMITTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-700 border border-green-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>ተፈቅዷል (Paid)</span>
                          </span>
                        )}
                        {r.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>በመጠባበቅ ላይ</span>
                          </span>
                        )}
                        {r.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-700 border border-red-300">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>ተሰርዟል</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status !== "PERMITTED" && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, "PERMITTED")}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition-all shadow"
                            >
                              ፈቅድ (Approve)
                            </button>
                          )}

                          {r.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-500/30 transition-all border border-red-300"
                            >
                              ሰርዝ (Reject)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Add New Book / Media */}
      {activeTab === "ADD_BOOK" && (
        <div className="rounded-2xl bg-card border border-gold/20 shadow-card p-6 md:p-8 max-w-3xl">
          <h3 className="font-display text-xl font-bold text-navy mb-6">
            አዲስ መንፈሳዊ መጽሐፍ ወይም ሚዲያ መጫኛ
          </h3>

          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {formError}
            </div>
          )}

          {formMsg && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs text-green-800 border border-green-200">
              {formMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleCreateBook}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">የመጽሐፉ/ሚዲያው ርዕስ (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ ከእምነት ወደ እምነት"
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">ደራሲ / አቅራቢ (Author)</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="RABBI Ministry"
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">ዋጋ (Price ETB)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250"
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">የሚዲያ ዓይነት (Media Type)</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none bg-white"
                >
                  <option value="BOOK">መጽሐፍ (BOOK)</option>
                  <option value="VIDEO">ቪዲዮ (VIDEO)</option>
                  <option value="AUDIO">ኦዲዮ (AUDIO)</option>
                  <option value="IMAGE">ምስል (IMAGE)</option>
                </select>
              </div>
            </div>

            {/* Cloudinary Cover Image Upload */}
            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                የከቨር ፎቶ (Cover Image Upload to Cloudinary)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-navy file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-navy-deep hover:file:bg-gold/90 cursor-pointer"
                />
                {uploading && <span className="text-xs text-gold">በመጫን ላይ...</span>}
              </div>
              {coverUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={coverUrl} alt="Cover Preview" className="h-12 w-10 object-cover rounded shadow" />
                  <span className="text-xs text-green-700 font-medium">✓ Cloudinary URL ተዘጋጅቷል</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">አጭር ማብራሪያ (Description)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ስለ መጽሐፉ አጭር ማብራሪያ..."
                className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>

            {/* Free Sample Preview Text */}
            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                የነፃ ናሙና ጽሑፍ (4-5 Free Preview Pages)
              </label>
              <textarea
                rows={4}
                value={sampleContent}
                onChange={(e) => setSampleContent(e.target.value)}
                placeholder="ያለ ክፍያ የሚነበብ የ 4-5 ገጽ ናሙና ይዘት..."
                className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none font-sans"
              />
            </div>

            {/* Full Unlocked Content */}
            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                ሙሉ የተቆለፈ ይዘት (Full Unlocked Content for Paid Users)
              </label>
              <textarea
                rows={6}
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                placeholder="ክፍያ ለፈጸሙ ተጠቃሚዎች ብቻ የሚከፈት ሙሉ መጽሐፍ ይዘት..."
                className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none font-sans"
              />
            </div>

            {/* Optional Links for Video/Audio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">ቪዲዮ URL (ለ VIDEO ዓይነት)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">ኦዲዮ URL (ለ AUDIO ዓይነት)</label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://.../audio.mp3"
                  className="w-full rounded-lg border border-navy/20 px-3.5 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-deep hover:bg-gold/90 shadow transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>መጽሐፉን/ሚዲያውን መዝግብ</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Manage Existing Books */}
      {activeTab === "MANAGE_BOOKS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => (
            <div key={b.id} className="rounded-2xl bg-card border border-gold/20 shadow-card p-5 flex flex-col justify-between">
              <div className="flex gap-4">
                <img src={b.coverUrl} alt={b.title} className="h-20 w-16 object-cover rounded shadow border border-gold/20" />
                <div>
                  <h4 className="font-bold text-navy font-display line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-gold font-semibold">{b.author || "RABBI"}</p>
                  <p className="text-xs font-bold text-navy-deep mt-1">{b.price} ETB</p>
                  <span className="inline-block mt-2 rounded bg-navy-deep/10 px-2 py-0.5 text-[0.68rem] font-bold text-navy">
                    {b.mediaType}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gold/10 flex justify-end">
                <button
                  onClick={() => handleDeleteBook(b.id)}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>ሰርዝ (Delete)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
