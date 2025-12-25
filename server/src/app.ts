import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middlewares/auth.middleware";
import serverRoutes from "./routes/server.routes";
import channelRoutes from "./routes/channel.routes";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";

const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// CORS
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true
}));




// Routes (auth routes should be before middleware)
app.route("/api/auth", authRoutes);



// Auth middleware for protected routes
app.use('/api/*', authMiddleware);

// Protected routes
app.route("/api/server", serverRoutes);
app.route("/api/channel", channelRoutes);
app.route("/api/message", messageRoutes);

export default app;
