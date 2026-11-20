import { Router } from "express";
import { AdminController, handleMulterError } from "../controllers/adminController";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware";
import { upload } from "../config/cloudinary";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/stats", AdminController.getDashboardStats);
router.get("/contents-with-stats", AdminController.getContentsWithStats);
router.get("/requests", AdminController.getAllRequests);
router.put("/requests/:id", AdminController.updateRequestStatus);
router.put("/profile", AdminController.updateProfile);
router.post("/books", AdminController.createBook);
router.put("/books/:id", AdminController.updateBook);
router.delete("/books/:id", AdminController.deleteBook);
// Upload: multer error handler comes right after to surface size/type errors properly
router.post("/upload", upload.single("file"), handleMulterError, AdminController.uploadFile);
router.post("/delete-file", AdminController.deleteFile);
router.get("/admins", AdminController.getAllAdmins);
router.post("/admins", AdminController.createAdmin);
router.put("/admins/:id", AdminController.updateAdmin);
router.delete("/admins/:id", AdminController.deleteAdmin);

// User Management
router.get("/users", AdminController.getAllUsers);
router.put("/users/:id/suspend", AdminController.toggleSuspendUser);
router.delete("/users/:id", AdminController.deleteUser);
router.put("/users/:id/role", AdminController.updateUserRole);
router.put("/users/:id/reset-password", AdminController.resetUserPassword);

export default router;
