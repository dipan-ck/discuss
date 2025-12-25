import { Hono } from 'hono';
import { getAllMessages } from '../controllers/message.controller.js';

const router = new Hono();



router.get("/:channelId/messages", getAllMessages);

export default router;