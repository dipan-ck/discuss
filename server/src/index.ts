import 'dotenv/config.js';
import { Server } from 'socket.io';
import  {serve}  from '@hono/node-server';
import app from './app.js';
import initSocket from './sockets/socket.js';
import { authSocket } from './middlewares/soccketAuth.middleware.js';
import { initMediasoup } from './lib/mediasoup.js';



const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
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