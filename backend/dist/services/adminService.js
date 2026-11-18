"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = require("../config/prisma");
const cloudinary_1 = require("../config/cloudinary");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../middlewares/validation");
const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class AdminService {
    static async getAllRequests(statusFilter) {
        const where = {};
        if (statusFilter && ["PENDING", "PERMITTED", "REJECTED"].includes(statusFilter)) {
            where.status = statusFilter;
        }
        const requests = await prisma_1.prisma.purchaseRequest.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            include: {
                user: { select: { id: true, fullName: true, phone: true, email: true } },
                book: {
                    select: {
                        id: true,
                        title: true,
                        coverUrl: true,
                        price: true,
                        mediaType: true,
                        requests: {
                            where: { status: "PERMITTED" },
                            select: { id: true, userId: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return requests.map((req) => ({
            ...req,
            book: req.book
                ? {
                    ...req.book,
                    approvedBuyersCount: req.book.requests?.length || 0,
                }
                : null,
        }));
    }
    static async getContentsWithStats() {
        const books = await prisma_1.prisma.book.findMany({
            include: {
                requests: {
                    include: {
                        user: { select: { id: true, fullName: true, phone: true, email: true } },
                    },
                    orderBy: { updatedAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return books.map((book) => {
            const approvedRequests = book.requests.filter((r) => r.status === "PERMITTED");
            const pendingRequests = book.requests.filter((r) => r.status === "PENDING");
            const rejectedRequests = book.requests.filter((r) => r.status === "REJECTED");
            const buyers = approvedRequests.map((r) => ({
                requestId: r.id,
                userId: r.user.id,
                fullName: r.user.fullName || "ስም አልተገለጸም",
                email: r.user.email,
                phone: r.user.phone || "-",
                approvedAt: r.updatedAt,
                paymentProofUrl: r.paymentProofUrl,
            }));
            return {
                id: book.id,
                title: book.title,
                author: book.author || "RABBI",
                description: book.description,
                price: book.price,
                coverUrl: book.coverUrl,
                mediaType: book.mediaType || "BOOK",
                sampleContent: book.sampleContent,
                fullContent: book.fullContent,
                videoUrl: book.videoUrl,
                audioUrl: book.audioUrl,
                createdAt: book.createdAt,
                updatedAt: book.updatedAt,
                approvedCount: approvedRequests.length,
                pendingCount: pendingRequests.length,
                rejectedCount: rejectedRequests.length,
                totalRevenue: approvedRequests.length * (book.price || 0),
                buyers,
            };
        });
    }
    static async getDashboardStats() {
        const allRequests = await prisma_1.prisma.purchaseRequest.findMany({
            include: {
                book: { select: { id: true, title: true, price: true, coverUrl: true, mediaType: true } },
            },
        });
        const approvedRequests = allRequests.filter((r) => r.status === "PERMITTED");
        const pendingRequests = allRequests.filter((r) => r.status === "PENDING");
        const rejectedRequests = allRequests.filter((r) => r.status === "REJECTED");
        const totalRevenue = approvedRequests.reduce((sum, r) => sum + (r.book?.price || 0), 0);
        const uniqueBuyerIds = new Set(approvedRequests.map((r) => r.userId));
        // Per book statistics
        const bookStatsMap = {};
        for (const req of approvedRequests) {
            if (!req.book)
                continue;
            if (!bookStatsMap[req.book.id]) {
                bookStatsMap[req.book.id] = {
                    id: req.book.id,
                    title: req.book.title,
                    price: req.book.price,
                    coverUrl: req.book.coverUrl,
                    mediaType: req.book.mediaType || "BOOK",
                    approvedCount: 0,
                    revenue: 0,
                };
            }
            bookStatsMap[req.book.id].approvedCount += 1;
            bookStatsMap[req.book.id].revenue += req.book.price || 0;
        }
        const topSellingBooks = Object.values(bookStatsMap).sort((a, b) => b.approvedCount - a.approvedCount);
        const [totalBooks, totalUsers] = await Promise.all([
            prisma_1.prisma.book.count(),
            prisma_1.prisma.user.count(),
        ]);
        return {
            totalApprovedSales: approvedRequests.length,
            totalPendingRequests: pendingRequests.length,
            totalRejectedRequests: rejectedRequests.length,
            totalRevenue,
            totalUniqueBuyers: uniqueBuyerIds.size,
            totalBooks,
            totalUsers,
            topSellingBooks,
        };
    }
    static async updateRequestStatus(id, status) {
        if (!id || !id.trim()) {
            throw new Error("የጥያቄ መታወቂያ ተገቢ ነው (Request ID is required).");
        }
        if (!["PENDING", "PERMITTED", "REJECTED"].includes(status)) {
            throw new Error("የተሳሳተ የሁኔታ እሴት (Invalid status value).");
        }
        return prisma_1.prisma.purchaseRequest.update({
            where: { id },
            data: { status },
            include: { user: true, book: true },
        });
    }
    static async createBook(data) {
        const title = (0, validation_1.validateString)(data.title, "Title", { required: true, max: 200 });
        const author = data.author ? (0, validation_1.validateName)(data.author, "Author", false) || "RABBI" : "RABBI";
        const description = (0, validation_1.stripHtml)((0, validation_1.validateString)(data.description, "Description", { max: 2000 }));
        const numPrice = (0, validation_1.validatePositiveNumber)(data.price ?? 0, "Price");
        const sampleContent = (0, validation_1.validateString)(data.sampleContent, "Sample Content", { max: 50000 });
        const fullContent = (0, validation_1.validateString)(data.fullContent, "Full Content", { max: 500000 });
        const videoUrl = (0, validation_1.validateUrl)(data.videoUrl, "Video URL");
        const audioUrl = (0, validation_1.validateUrl)(data.audioUrl, "Audio URL");
        const validMediaTypes = ["BOOK", "VIDEO", "AUDIO", "IMAGE", "COURSE", "ARTICLE", "PRAYER"];
        const mediaType = (data.mediaType || "BOOK").toUpperCase().trim();
        if (!validMediaTypes.includes(mediaType)) {
            throw new Error("Invalid content/media type.");
        }
        // Default spiritual cover placeholder by media type if admin chooses not to upload one
        const defaultCovers = {
            BOOK: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
            VIDEO: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop",
            AUDIO: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop",
            COURSE: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop",
            ARTICLE: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop",
            PRAYER: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop",
        };
        let coverUrl = (data.coverUrl && data.coverUrl.trim()) ? ((0, validation_1.validateUrl)(data.coverUrl, "Cover Image URL") || "") : "";
        if (!coverUrl) {
            coverUrl = defaultCovers[mediaType] || defaultCovers.BOOK;
        }
        return prisma_1.prisma.book.create({
            data: {
                title,
                author,
                description,
                price: numPrice,
                coverUrl,
                sampleContent,
                fullContent,
                videoUrl: videoUrl || null,
                audioUrl: audioUrl || null,
                mediaType,
            },
        });
    }
    static async updateBook(id, data) {
        if (!id || !id.trim()) {
            throw new Error("የመጽሐፍ መታወቂያ ተገቢ ነው (Book ID is required).");
        }
        // 1. Fetch existing book to detect replaced media files
        const existing = await prisma_1.prisma.book.findUnique({
            where: { id },
            select: {
                id: true,
                coverUrl: true,
                sampleContent: true,
                fullContent: true,
                videoUrl: true,
                audioUrl: true,
            },
        });
        if (!existing) {
            throw new Error("ይዘቱ አልተገኘም (Content not found).");
        }
        // Collect previous Cloudinary URLs that are being replaced
        const replacedUrls = [];
        if (data.coverUrl !== undefined && data.coverUrl.trim() !== existing.coverUrl) {
            if (existing.coverUrl)
                replacedUrls.push(existing.coverUrl);
        }
        if (data.fullContent !== undefined && data.fullContent.trim() !== existing.fullContent) {
            if (existing.fullContent)
                replacedUrls.push(existing.fullContent);
        }
        if (data.sampleContent !== undefined && data.sampleContent.trim() !== existing.sampleContent) {
            if (existing.sampleContent)
                replacedUrls.push(existing.sampleContent);
        }
        if (data.videoUrl !== undefined && (data.videoUrl?.trim() || null) !== existing.videoUrl) {
            if (existing.videoUrl)
                replacedUrls.push(existing.videoUrl);
        }
        if (data.audioUrl !== undefined && (data.audioUrl?.trim() || null) !== existing.audioUrl) {
            if (existing.audioUrl)
                replacedUrls.push(existing.audioUrl);
        }
        let parsedPrice = undefined;
        if (data.price !== undefined && data.price !== null && data.price !== "") {
            const num = parseFloat(data.price.toString());
            if (isNaN(num) || num < 0) {
                throw new Error("ዋጋው ትክክለኛ አዎንታዊ ቁጥር መሆን አለበት (Price must be a valid positive number).");
            }
            parsedPrice = num;
        }
        else if (data.price === 0 || data.price === "0") {
            parsedPrice = 0;
        }
        const updatePayload = {};
        if (data.title !== undefined)
            updatePayload.title = data.title.trim();
        if (data.author !== undefined)
            updatePayload.author = data.author.trim() || "RABBI";
        if (data.description !== undefined)
            updatePayload.description = data.description.trim();
        if (parsedPrice !== undefined)
            updatePayload.price = parsedPrice;
        if (data.coverUrl !== undefined && data.coverUrl.trim()) {
            updatePayload.coverUrl = data.coverUrl.trim();
        }
        if (data.sampleContent !== undefined)
            updatePayload.sampleContent = data.sampleContent.trim();
        if (data.fullContent !== undefined)
            updatePayload.fullContent = data.fullContent.trim();
        if (data.videoUrl !== undefined)
            updatePayload.videoUrl = data.videoUrl ? data.videoUrl.trim() : null;
        if (data.audioUrl !== undefined)
            updatePayload.audioUrl = data.audioUrl ? data.audioUrl.trim() : null;
        if (data.mediaType !== undefined && data.mediaType.trim()) {
            const validMediaTypes = ["BOOK", "VIDEO", "AUDIO", "IMAGE", "COURSE", "ARTICLE", "PRAYER"];
            const mt = data.mediaType.toUpperCase().trim();
            if (validMediaTypes.includes(mt)) {
                updatePayload.mediaType = mt;
            }
        }
        const updated = await prisma_1.prisma.book.update({
            where: { id },
            data: updatePayload,
        });
        // 2. Non-blocking background deletion of replaced Cloudinary files (zero lag for user)
        if (replacedUrls.length > 0) {
            (0, cloudinary_1.deleteFilesFromCloudinaryAsync)(replacedUrls);
        }
        return updated;
    }
    static async deleteBook(id) {
        if (!id || !id.trim()) {
            throw new Error("የመጽሐፍ መታወቂያ ተገቢ ነው (Book ID is required).");
        }
        // 1. Fetch existing content to find all attached Cloudinary assets
        const existing = await prisma_1.prisma.book.findUnique({
            where: { id },
            select: {
                id: true,
                coverUrl: true,
                sampleContent: true,
                fullContent: true,
                videoUrl: true,
                audioUrl: true,
            },
        });
        // 2. Delete database record
        const deleted = await prisma_1.prisma.book.delete({ where: { id } });
        // 3. Immediately trigger background non-blocking deletion of all media from Cloudinary
        if (existing) {
            (0, cloudinary_1.deleteFilesFromCloudinaryAsync)([
                existing.coverUrl,
                existing.sampleContent,
                existing.fullContent,
                existing.videoUrl,
                existing.audioUrl,
            ]);
        }
        return deleted;
    }
    // ---- Admin Management CRUD ----
    static async getAllAdmins(excludeUserId) {
        const admins = await prisma_1.prisma.user.findMany({
            where: { role: "ADMIN", NOT: { id: excludeUserId } },
            select: { id: true, email: true, fullName: true, phone: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });
        return admins;
    }
    static async createAdmin(data) {
        const cleanEmail = (0, validation_1.validateEmail)(data.email);
        const password = (0, validation_1.validatePassword)(data.password);
        const fullName = data.fullName ? (0, validation_1.validateName)(data.fullName, "Full Name", false) : "";
        const phone = data.phone ? (0, validation_1.validatePhone)(data.phone) : "";
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) {
            throw new Error("ይህ ኢሜይል አስቀድሞ ተጠቃሚ አለው (Email already in use).");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma_1.prisma.user.create({
            data: {
                email: cleanEmail,
                password: hashedPassword,
                fullName: fullName || null,
                phone: phone || null,
                role: "ADMIN",
            },
            select: { id: true, email: true, fullName: true, phone: true, createdAt: true },
        });
        return admin;
    }
    static async updateAdmin(id, data, requestingAdminId) {
        const target = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!target || target.role !== "ADMIN") {
            throw new Error("አስተዳዳሪ ተጠቃሚ አልተገኘም (Admin not found).");
        }
        const updateData = {};
        if (data.fullName !== undefined)
            updateData.fullName = data.fullName.trim() || null;
        if (data.phone !== undefined)
            updateData.phone = data.phone.trim() || null;
        if (data.email && data.email.trim()) {
            const cleanEmail = data.email.toLowerCase().trim();
            if (!EMAIL_REGEX.test(cleanEmail))
                throw new Error("ትክክለኛ ኢሜይል ያስገቡ.");
            if (cleanEmail !== target.email) {
                const conflict = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
                if (conflict)
                    throw new Error("ይህ ኢሜይል አስቀድሞ ጥቅም ላይ ውሏል (Email already in use).");
                updateData.email = cleanEmail;
            }
        }
        if (data.password && data.password.trim()) {
            if (data.password.length < 6)
                throw new Error("የይለፍ ቃሉ ቢያንስ 6 ፊደላት መሆን አለበት.");
            updateData.password = await bcryptjs_1.default.hash(data.password.trim(), 12);
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, fullName: true, phone: true, createdAt: true },
        });
        return updated;
    }
    static async deleteAdmin(id, requestingAdminId) {
        if (id === requestingAdminId) {
            throw new Error("ራስዎን መሰረዝ አይቻልም (Cannot delete yourself).");
        }
        const target = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!target || target.role !== "ADMIN") {
            throw new Error("አስተዳዳሪ ተጠቃሚ አልተገኘም (Admin not found).");
        }
        await prisma_1.prisma.user.delete({ where: { id } });
        return { success: true };
    }
    // ---- End Admin Management ----
    static async updateProfile(adminUserId, data) {
        const adminUser = await prisma_1.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== "ADMIN") {
            throw new Error("የአስተዳዳሪ ተጠቃሚ አልተገኘም (Admin user not found).");
        }
        const updateData = {};
        if (data.fullName && data.fullName.trim()) {
            updateData.fullName = (0, validation_1.validateName)(data.fullName, "ሙሉ ስም (Full Name)", false);
        }
        if (data.phone && data.phone.trim()) {
            updateData.phone = (0, validation_1.validatePhone)(data.phone);
        }
        // Email update
        if (data.email && data.email.trim()) {
            const cleanEmail = (0, validation_1.validateEmail)(data.email);
            if (cleanEmail !== adminUser.email) {
                const existing = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
                if (existing) {
                    throw new Error("ይህ የኢሜይል አድራሻ አስቀድሞ በሌላ ተጠቃሚ ተመዝግቧል (Email already in use).");
                }
                updateData.email = cleanEmail;
            }
        }
        // Password update
        if (data.password && data.password.trim()) {
            if (data.password.length < 6) {
                throw new Error("አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት (Password must be at least 6 characters).");
            }
            if (data.currentPassword) {
                const isValid = await bcryptjs_1.default.compare(data.currentPassword, adminUser.password);
                if (!isValid) {
                    throw new Error("ያሁኑ የይለፍ ቃል ልክ አይደለም (Current password is incorrect).");
                }
            }
            updateData.password = await bcryptjs_1.default.hash(data.password.trim(), 10);
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: adminUserId },
            data: updateData,
        });
        const token = jsonwebtoken_1.default.sign({
            userId: updatedUser.id,
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
        }, JWT_SECRET, { expiresIn: "7d" });
        return {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
            },
            token,
            message: "የአስተዳዳሪ ፕሮፋይል በተሳካ ሁኔታ ተሻሽሏል (Admin profile updated successfully).",
        };
    }
}
exports.AdminService = AdminService;
