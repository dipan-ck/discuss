import 'dotenv/config';
import { Server } from 'socket.io';
import { createServer } from 'http';
import  {serve}  from '@hono/node-server';
import app from './app';
import initSocket from './sockets/socket';
import { authSocket } from './middlewares/soccketAuth.middleware';
import { initMediasoup } from './lib/mediasoup';
import type { Server as HTTPServer } from "node:http";



const PORT = process.env.PORT || 8000;
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const httpServer = serve({
    fetch: app.fetch,
    port: PORT!,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});




const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // frontend URL
    credentials: true,
  },
});




io.use(authSocket);
initSocket(io);


async function startMidiasoup() {
  await initMediasoup();
}


startMidiasoup()