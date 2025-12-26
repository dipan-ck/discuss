import * as mediasoup from "mediasoup";
import { types as mediasoupTypes } from "mediasoup";
import type { DtlsParameters } from "mediasoup/node/lib/types";

// Worker + Router
let worker: mediasoupTypes.Worker;
let router: mediasoupTypes.Router;

// Store transports per channel → per user → send|recv
export const channelTransports: Record<
  string,
  Record<
    string,
    {
      send?: mediasoupTypes.WebRtcTransport;
      recv?: mediasoupTypes.WebRtcTransport;
    }
  >
> = {};



// Store producers per channel per user
export const channelProducers: Record<
  string,
  Record<string, mediasoupTypes.Producer>
> = {};





export async function initMediasoup() {
  worker = await mediasoup.createWorker({
    logLevel: "warn",
      rtcMinPort: 40000,
    rtcMaxPort: 40100,
  });

  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
        
      },
    ],
  });
}


// --------------------------------------------------
// RTP Capabilities (Client loads Device)
// --------------------------------------------------
export function getRtpCapabilities() {
  if (!router) throw new Error("Router not ready");
  return { rtpCapabilities: router.rtpCapabilities };
}


// --------------------------------------------------
// Create SEND Transport
// --------------------------------------------------
export async function createSendTransport(
  channelId: string,
  userId: string
) {
  if (!router) throw new Error("Router not ready");
  const announcedIp = process.env.ANNOUNCED_IP || "127.0.0.1";

  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    
  });

  if (!channelTransports[channelId]) channelTransports[channelId] = {};
  if (!channelTransports[channelId][userId])
    channelTransports[channelId][userId] = {};

  channelTransports[channelId][userId].send = transport;

  return transport;
}


// --------------------------------------------------
// Create RECV Transport
// --------------------------------------------------
export async function createRecvTransport(
  channelId: string,
  userId: string
) {
  if (!router) throw new Error("Router not ready");

const announcedIp = process.env.ANNOUNCED_IP;
if (!announcedIp) throw new Error("ANNOUNCED_IP missing! Must be public IP.");


const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
});

  if (!channelTransports[channelId]) channelTransports[channelId] = {};
  if (!channelTransports[channelId][userId])
    channelTransports[channelId][userId] = {};

  channelTransports[channelId][userId].recv = transport;

  return transport;
}


// --------------------------------------------------
// Connect transport (DTLS)
// type = "send" or "recv"
// --------------------------------------------------
export async function connectTransport(
  userId: string,
  type: "send" | "recv",
  dtlsParameters: DtlsParameters
) {
  // Find the transport across all channels
  for (const channelId in channelTransports) {
    const transport = channelTransports[channelId]?.[userId]?.[type];
    if (transport) {
      await transport.connect({ dtlsParameters });
      return true;
    }
  }
  throw new Error(`Transport ${type} not found for user ${userId}`);
}





export async function createProducer(
  channelId: string,
  userId: string,
  rtpParameters: any
) {
  const transport = channelTransports[channelId]?.[userId]?.send;
  if (!transport) throw new Error("Send transport not found");

  const producer = await transport.produce({
    kind: "audio",
    rtpParameters,
  });

  if (!channelProducers[channelId]) channelProducers[channelId] = {};
  channelProducers[channelId][userId] = producer;

  return producer;
}





export async function createConsumer(
  channelId: string,
  consumerUserId: string,
  producerUserId: string,
  rtpCapabilities: any
) {
  const producer = channelProducers[channelId]?.[producerUserId];
  if (!producer) throw new Error("Producer not found");

  if (!router.canConsume({ producerId: producer.id, rtpCapabilities }))
    throw new Error("Client cannot consume producer");

  const recvTransport =
    channelTransports[channelId]?.[consumerUserId]?.recv;
  if (!recvTransport) throw new Error("Recv transport not found");

  const consumer = await recvTransport.consume({
    producerId: producer.id,
    rtpCapabilities,
    paused: false,
  });

  return consumer;
}
