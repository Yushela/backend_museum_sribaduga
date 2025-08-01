import express from "express";
import { register, login, userLoggedin, getUsers, getUsersById, editUser, deleteUser, submitFeedback, getAllFeedback } from "../controller/user.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectedMiddleware, userLoggedin);
router.get("/users", protectedMiddleware, getUsers);
router.get("/user/:id", protectedMiddleware, getUsersById);
router.put("/editUser/:id", protectedMiddleware, editUser);
router.delete("/deleteUser/:id", protectedMiddleware, deleteUser);
router.post("/feedback", protectedMiddleware, submitFeedback);
router.get("/getFeedback", protectedMiddleware, getAllFeedback);

export default router;