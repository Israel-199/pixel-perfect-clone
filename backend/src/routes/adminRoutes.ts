import { Router } from "express";
import { AdminController } from "../controllers/adminController";
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
router.post("/upload", upload.single("file"), AdminController.uploadFile);
router.get("/admins", AdminController.getAllAdmins);
router.post("/admins", AdminController.createAdmin);
router.put("/admins/:id", AdminController.updateAdmin);
router.delete("/admins/:id", AdminController.deleteAdmin);

export default router;
