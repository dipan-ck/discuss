import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middlewares/auth.middleware";
import serverRoutes from "./routes/server.routes";
import channelRoutes from "./routes/channel.routes";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";

const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];


app.use('*', cors({
  origin: allowedOrigins,
  credentials: true
}));





app.route("/api/auth", authRoutes);




app.use('/api/*', authMiddleware);


app.route("/api/server", serverRoutes);
app.route("/api/channel", channelRoutes);
app.route("/api/message", messageRoutes);

export default app;
