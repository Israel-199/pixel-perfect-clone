import { Router } from "express";
import { BookController } from "../controllers/bookController";

const router = Router();

router.get("/", BookController.getAll);
router.get("/pdf-proxy", BookController.proxyPdf);
router.get("/:id", BookController.getById);

export default router;
