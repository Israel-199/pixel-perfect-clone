import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer (memory storage for stream upload to Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Types
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Auth Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
    return;
  }
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Access denied. Admin role required." });
    return;
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register Endpoint
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, email, password, confirmPassword } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Automatically make the first user or email with 'admin' an ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 || email.toLowerCase().includes("admin") ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        fullName: fullName || "",
        phone: phone || "",
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role,
      },
    });

    const token = jsonwebtoken.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const token = jsonwebtoken.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error during login." });
  }
});

// Forgot Password Request Endpoint
app.post("/api/auth/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      res.status(404).json({ error: "No account found with this email address." });
      return;
    }

    // Generate 6-digit reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    res.json({
      success: true,
      message: "Password reset code generated successfully.",
      resetToken, // Returned for UI convenience during testing/reset
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Reset Password Endpoint
app.post("/api/auth/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ error: "Email and new password are required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.resetToken && resetToken && user.resetToken !== resetToken) {
      res.status(400).json({ error: "Invalid reset token." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get Current User Profile
app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, fullName: true, phone: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: "Server error." });
  }
});

// ==================== BOOKS & MEDIA PUBLIC / USER ROUTES ====================

// Get All Books (with purchase status for current user if token present)
app.get("/api/books", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    let currentUserId: string | null = null;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
      } catch (e) {
        // Ignore token errors for public route
      }
    }

    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    let userRequests: Record<string, string> = {};
    if (currentUserId) {
      const requests = await prisma.purchaseRequest.findMany({
        where: { userId: currentUserId },
      });
      requests.forEach((r) => {
        userRequests[r.bookId] = r.status;
      });
    }

    const formattedBooks = books.map((book) => {
      const status = userRequests[book.id] || "NONE";
      const isPermitted = status === "PERMITTED";

      return {
        id: book.id,
        title: book.title,
        author: book.author || "RABBI",
        description: book.description,
        price: book.price,
        coverUrl: book.coverUrl,
        mediaType: book.mediaType || "BOOK",
        sampleContent: book.sampleContent,
        fullContent: isPermitted ? book.fullContent : null,
        videoUrl: isPermitted ? book.videoUrl : null,
        audioUrl: isPermitted ? book.audioUrl : null,
        requestStatus: status,
        isPermitted,
        createdAt: book.createdAt,
      };
    });

    res.json({ books: formattedBooks });
  } catch (error: any) {
    console.error("Get Books Error:", error);
    res.status(500).json({ error: "Failed to fetch books." });
  }
});

// Get Single Book Detail
app.get("/api/books/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers["authorization"];
    let currentUserId: string | null = null;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
      } catch (e) {}
    }

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      res.status(404).json({ error: "Book not found." });
      return;
    }

    let requestStatus = "NONE";
    if (currentUserId) {
      const reqRecord = await prisma.purchaseRequest.findFirst({
        where: { userId: currentUserId, bookId: id },
      });
      if (reqRecord) {
        requestStatus = reqRecord.status;
      }
    }

    const isPermitted = requestStatus === "PERMITTED";

    res.json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author || "RABBI",
        description: book.description,
        price: book.price,
        coverUrl: book.coverUrl,
        mediaType: book.mediaType || "BOOK",
        sampleContent: book.sampleContent,
        fullContent: isPermitted ? book.fullContent : null,
        videoUrl: isPermitted ? book.videoUrl : null,
        audioUrl: isPermitted ? book.audioUrl : null,
        requestStatus,
        isPermitted,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch book detail." });
  }
});

// Create Purchase Request
app.post("/api/requests", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, paymentProofUrl } = req.body;
    const userId = req.user!.userId;

    if (!bookId) {
      res.status(400).json({ error: "Book ID is required." });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ error: "Book not found." });
      return;
    }

    const existing = await prisma.purchaseRequest.findFirst({
      where: { userId, bookId },
    });

    if (existing) {
      res.json({ request: existing, message: "Request already exists." });
      return;
    }

    const newRequest = await prisma.purchaseRequest.create({
      data: {
        userId,
        bookId,
        status: "PENDING",
        paymentProofUrl: paymentProofUrl || null,
      },
      include: { book: true },
    });

    res.status(201).json({ request: newRequest, message: "Access request submitted successfully." });
  } catch (error: any) {
    console.error("Create Request Error:", error);
    res.status(500).json({ error: "Failed to submit request." });
  }
});

// Get User's Requested Books ("የእኔ መጽሃፎች")
app.get("/api/requests/my", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const requests = await prisma.purchaseRequest.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedRequests = requests.map((r) => {
      const isPermitted = r.status === "PERMITTED";
      return {
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        book: {
          id: r.book.id,
          title: r.book.title,
          author: r.book.author || "RABBI",
          description: r.book.description,
          price: r.book.price,
          coverUrl: r.book.coverUrl,
          mediaType: r.book.mediaType || "BOOK",
          sampleContent: r.book.sampleContent,
          fullContent: isPermitted ? r.book.fullContent : null,
          videoUrl: isPermitted ? r.book.videoUrl : null,
          audioUrl: isPermitted ? r.book.audioUrl : null,
        },
      };
    });

    res.json({ requests: formattedRequests });
  } catch (error: any) {
    console.error("Get My Requests Error:", error);
    res.status(500).json({ error: "Failed to fetch user requests." });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin: Get All User Requests
app.get("/api/admin/requests", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true } },
        book: { select: { id: true, title: true, coverUrl: true, price: true, mediaType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (error: any) {
    console.error("Admin Get Requests Error:", error);
    res.status(500).json({ error: "Failed to fetch admin requests." });
  }
});

// Admin: Update Request Status (Approve / Reject)
app.put("/api/admin/requests/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, PERMITTED, REJECTED

    if (!["PENDING", "PERMITTED", "REJECTED"].includes(status)) {
      res.status(400).json({ error: "Invalid status value." });
      return;
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status },
      include: { user: true, book: true },
    });

    res.json({ request: updated, message: `Request status updated to ${status}` });
  } catch (error: any) {
    console.error("Admin Update Request Error:", error);
    res.status(500).json({ error: "Failed to update request status." });
  }
});

// Admin: Add New Book or Media Item
app.post("/api/admin/books", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, description, price, coverUrl, sampleContent, fullContent, videoUrl, audioUrl, mediaType } = req.body;

    if (!title || !coverUrl) {
      res.status(400).json({ error: "Title and cover image URL are required." });
      return;
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        author: author || "RABBI",
        description: description || "",
        price: parseFloat(price) || 0,
        coverUrl,
        sampleContent: sampleContent || "",
        fullContent: fullContent || "",
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        mediaType: mediaType || "BOOK",
      },
    });

    res.status(201).json({ book: newBook, message: "Book created successfully." });
  } catch (error: any) {
    console.error("Admin Create Book Error:", error);
    res.status(500).json({ error: "Failed to create book." });
  }
});

// Admin: Update Book
app.put("/api/admin/books/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, description, price, coverUrl, sampleContent, fullContent, videoUrl, audioUrl, mediaType } = req.body;

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        coverUrl,
        sampleContent,
        fullContent,
        videoUrl,
        audioUrl,
        mediaType,
      },
    });

    res.json({ book: updated, message: "Book updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update book." });
  }
});

// Admin: Delete Book
app.delete("/api/admin/books/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    res.json({ success: true, message: "Book deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete book." });
  }
});

// Admin Cloudinary File Upload Endpoint
app.post(
  "/api/admin/upload",
  authenticateToken,
  requireAdmin,
  upload.single("file"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided." });
        return;
      }

      const resourceType = req.body.resourceType || "auto"; // image, video, raw, auto

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "rabbi_church_assets", resource_type: resourceType },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary Upload Error:", error);
            res.status(500).json({ error: "Cloudinary upload failed." });
            return;
          }

          res.json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (error: any) {
      console.error("Upload Route Error:", error);
      res.status(500).json({ error: "Internal file upload error." });
    }
  }
);

// Seed Initial Data if database is empty
async function seedInitialBooks() {
  try {
    const count = await prisma.book.count();
    if (count === 0) {
      console.log("Seeding initial spiritual books into database...");

      const booksToSeed = [
        {
          title: "ከእምነት ወደ እምነት",
          author: "መጋቢ ካስሁብ መሰሎን",
          description: "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።",
          price: 250,
          coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `ክፍል 1: የእምነት መሠረት

እምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ፥ የማናየውንም ነገር የሚያስረዳ ነው። (ዕብራውያን 11:1)

በዚህ ምዕራፍ የምንማረው ስለ እምነት ሕይወት፣ በእግዚአብሔር ቃል ላይ ስለመቆም እና በየዕለቱ እምነታችንን ስለማደስ ነው። 

ገጽ 1:
እግዚአብሔርን ማመን ለሰው ልጅ ሕይወት ትልቁ ቁልፍ ነው። እምነት በቃል ውስጥ የሚገኝና የሚበቅል ዘር ነው። ቃሉን ባነበብንና በሰማን ቁጥር እምነታችን ያድጋል።

ገጽ 2:
በፈተና ጊዜ እምነታችን ይፈተናል። እንደ አብርሃም በእግዚአብሔር ተስፋ ላይ ማመን ማለት የማይቻለውን የሚችል አምላክ እንዳለን ማወቅ ነው።

ገጽ 3:
የእምነት ፍሬዎች፡ ሰላም፣ እረፍት፣ እና በክርስቶስ ያለን ሙሉ እርግጠኝነት ናቸው።

--- Sample Preview End ---`,
          fullContent: `ክፍል 1: የእምነት መሠረት

እምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ፥ የማናየውንም ነገር የሚያስረዳ ነው። (ዕብራውያን 11:1)

በዚህ ምዕራፍ የምንማረው ስለ እምነት ሕይወት፣ በእግዚአብሔር ቃል ላይ ስለመቆም እና በየዕለቱ እምነታችንን ስለማደስ ነው። 

ገጽ 1:
እግዚአብሔርን ማመን ለሰው ልጅ ሕይወት ትልቁ ቁልፍ ነው። እምነት በቃል ውስጥ የሚገኝና የሚበቅል ዘር ነው። ቃሉን ባነበብንና በሰማን ቁጥር እምነታችን ያድጋል።

ገጽ 2:
በፈተና ጊዜ እምነታችን ይፈተናል። እንደ አብርሃም በእግዚአብሔር ተስፋ ላይ ማመን ማለት የማይቻለውን የሚችል አምላክ እንዳለን ማወቅ ነው።

ገጽ 3:
የእምነት ፍሬዎች፡ ሰላም፣ እረፍት፣ እና በክርስቶስ ያለን ሙሉ እርግጠኝነት ናቸው።

================ UNLOCKED FULL CONTENT ================

ምዕራፍ 2: የእግዚአብሔር ድምፅ ማዳመጥ
በመንፈስ ቅዱስ አምራችነት መመራት እንዴት ይቻላል? የእግዚአብሔር ድምፅ የሰላም፣ የእውነት እና የብርሃን ድምፅ ነው።

ምዕራፍ 3: የጸሎት ኃይል
ጸሎት ከእግዚአብሔር ጋር የምናደርገው ጥልቅ ውይይት ነው። በጸሎት ሕይወትህ ውስጥ የሚከሰቱ ታላላቅ ተአምራት።

ምዕራፍ 4: በድል የመኖር ምስጢር
ክርስቶስ ባደረገልን መስዋዕትነት የተነሳ እኛ አሸናፊዎች ነን! በሕይወትህ ውስጥ ሁሉንም தடைகள் የሚሰብረው የእግዚአብሔር ቃል ኃይል ነው።`,
        },
        {
          title: "የጸሎት ሕይወትና ምስጢር",
          author: "RABBI Ministry",
          description: "ከእግዚአብሔር ጋር ጥልቅ ህብረት ለማድረግ የሚረዳ የጸሎት ትምህርት።",
          price: 200,
          coverUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `የጸሎት መግቢያ፡
ጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው። ያለ ጸሎት መንፈሳዊ ሕይወት ሊኖር አይችልም።

ገጽ 1:
ጸሎት ማለት ለምንጸልየው አምላክ ልባችንን መክፈት ነው።`,
          fullContent: `የጸሎት መግቢያ፡
ጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው። ያለ ጸሎት መንፈሳዊ ሕይወት ሊኖር አይችልም።

ገጽ 1:
ጸሎት ማለት ለምንጸልየው አምላክ ልባችንን መክፈት ነው።

================ UNLOCKED FULL CONTENT ================

ምዕራፍ 1: የጸሎት ዓይነቶች
1. የምስጋና ጸሎት
2. የንስሐ ጸሎት
3. የማልዶ ጸሎት

ምዕራፍ 2: የጸሎት መሰናክሎችና መፍትሔዎቻቸው
ትኩረት ማጣት፣ መጠራጠር እና በእምነት አለመቆም የጸሎት መሰናክሎች ናቸው።`,
        },
        {
          title: "የእሁድ ትምህርት - ቪዲዮና ድምፅ",
          author: "RABBI Academy",
          description: "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።",
          price: 300,
          coverUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop",
          mediaType: "VIDEO",
          sampleContent: "የቪዲዮና ኦዲዮ ትምህርት አጭር መግለጫ። ሙሉውን ለመመልከት እና ለማዳመጥ መጀመሪያ ግዢውን ያረጋግጡ።",
          fullContent: "እንኳን ደስ አለዎት! ሙሉውን የትምህርት ቪዲዮ እና ኦዲዮ ከታች ይመልከቱ።",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
      ];

      for (const b of booksToSeed) {
        await prisma.book.create({ data: b });
      }

      console.log("Initial books seeded successfully!");
    }
  } catch (e) {
    console.error("Seeding Error:", e);
  }
}

// Start Express Server
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await seedInitialBooks();
});
