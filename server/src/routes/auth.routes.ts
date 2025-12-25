import { Hono } from "hono";
import { getUser, loginUser, logoutUser, signupUser, deleteAccount } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = new Hono();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-me", authMiddleware, getUser);
router.delete("/delete-account", authMiddleware, deleteAccount);

export default router;