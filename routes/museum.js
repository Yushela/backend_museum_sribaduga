import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import { addDataMuseum, deleteDataMuseum, editDataMuseum, getAllMuseum, getDataByCategory } from "../controller/museum.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/museum", protectedMiddleware, upload.single("images"), addDataMuseum);
router.get("/museum", protectedMiddleware, getAllMuseum);
router.get("/museum/:category", protectedMiddleware, getDataByCategory);
router.delete("/museum/:id", protectedMiddleware, deleteDataMuseum);
router.post("/museum/:id", protectedMiddleware, upload.single("images"), editDataMuseum);

export default router;
