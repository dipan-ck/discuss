import { Hono } from "hono";
import { createServer, deleteServer, getUserServers, joinServer, leaveServer, searchServers } from "../controllers/server.controllers.js";

const router = new Hono();



router.post("/create-server", createServer);
router.get("/get-user-servers", getUserServers);
router.delete("/delete-server/:serverId", deleteServer);
router.post("/join-server/:serverId", joinServer);
router.delete("/leave-server/:serverId", leaveServer);
router.get("/search", searchServers);

export default router;