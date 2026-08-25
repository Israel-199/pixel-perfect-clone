import { Router } from "express";
import { RequestController } from "../controllers/requestController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateToken, RequestController.create);
router.get("/my", authenticateToken, RequestController.getMyRequests);

export default router;
