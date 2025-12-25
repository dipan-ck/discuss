import { Hono } from "hono";
import { createChannel, deleteChannel, getServerChannels } from "../controllers/channel.controllers.js";


const router = new Hono();



router.post("/create-channel/:serverId", createChannel);
router.delete("/delete-channel/:serverId/:channelId", deleteChannel);

router.get("/get-channel/:serverId", getServerChannels);

export default router;