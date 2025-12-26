import * as mediasoup from "mediasoup";
import { types as mediasoupTypes } from "mediasoup";
import type { DtlsParameters, RtpParameters, RtpCapabilities } from "mediasoup/node/lib/types";

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
      sendState?: string;
      recvState?: string;
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
  
  // Clean up old send transport across ALL channels for this user
  for (const chId in channelTransports) {
    const oldTransport = channelTransports[chId]?.[userId]?.send;
    if (oldTransport) {
      try {
        oldTransport.close();
        delete channelTransports[chId][userId].send;
        console.log(`🧹 Closed old send transport for user ${userId} in channel ${chId}`);
      } catch (e) {
        console.warn("Error closing old send transport:", e);
      }
    }
  }

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

  // Clean up old recv transport across ALL channels for this user
  for (const chId in channelTransports) {
    const oldTransport = channelTransports[chId]?.[userId]?.recv;
    if (oldTransport) {
      try {
        oldTransport.close();
        delete channelTransports[chId][userId].recv;
        console.log(`🧹 Closed old recv transport for user ${userId} in channel ${chId}`);
      } catch (e) {
        console.warn("Error closing old recv transport:", e);
      }
    }
  }

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
      // Only skip if actually connected
      const state =
        type === "send"
          ? channelTransports[channelId][userId].sendState
          : channelTransports[channelId][userId].recvState;

      if (state === "connected") {
        console.log(`✅ Transport ${type} for user ${userId} already connected`);
        return true;
      }

      // Don't allow connecting if in connecting state
      if (state === "connecting") {
        throw new Error(`Transport ${type} for user ${userId} is already connecting`);
      }
      
      await transport.connect({ dtlsParameters });
      console.log(`✅ Connected ${type} transport for user ${userId}`);
      return true;
    }
  }
  throw new Error(`Transport ${type} not found for user ${userId}`);
}

// --------------------------------------------------
// Create Producer
// --------------------------------------------------
export async function createProducer(
  channelId: string,
  userId: string,
  rtpParameters: RtpParameters
) {
  const transport = channelTransports[channelId]?.[userId]?.send;
  if (!transport) throw new Error("Send transport not found");

  // Clean up old producer across ALL channels for this user
  for (const chId in channelProducers) {
    const oldProducer = channelProducers[chId]?.[userId];
    if (oldProducer) {
      try {
        oldProducer.close();
        delete channelProducers[chId][userId];
        console.log(`🧹 Closed old producer for user ${userId} in channel ${chId}`);
      } catch (e) {
        console.warn("Error closing old producer:", e);
      }
    }
  }

  const producer = await transport.produce({
    kind: "audio",
    rtpParameters,
  });

  if (!channelProducers[channelId]) channelProducers[channelId] = {};
  channelProducers[channelId][userId] = producer;

  return producer;
}

// --------------------------------------------------
// Create Consumer
// --------------------------------------------------
export async function createConsumer(
  channelId: string,
  consumerUserId: string,
  producerUserId: string,
  rtpCapabilities: RtpCapabilities
) {
  const producer = channelProducers[channelId]?.[producerUserId];
  if (!producer) throw new Error("Producer not found");

  if (!router.canConsume({ producerId: producer.id, rtpCapabilities }))
    throw new Error("Client cannot consume producer");

  const recvTransport = channelTransports[channelId]?.[consumerUserId]?.recv;
  if (!recvTransport) throw new Error("Recv transport not found");

  const consumer = await recvTransport.consume({
    producerId: producer.id,
    rtpCapabilities,
    paused: false,
  });

  return consumer;
}

// --------------------------------------------------
// Cleanup user resources in a channel
// --------------------------------------------------
export async function cleanupUserResources(channelId: string, userId: string) {
  console.log(`🧹 Cleaning up resources for user ${userId} in channel ${channelId}`);
  
  // Clean up producer
  if (channelProducers[channelId]?.[userId]) {
    try {
      const producer = channelProducers[channelId][userId];
      producer.close();
      delete channelProducers[channelId][userId];
      console.log(`✅ Closed producer for user ${userId} in channel ${channelId}`);
    } catch (e) {
      console.warn("Error closing producer:", e);
    }
  }

  // Clean up transports
  if (channelTransports[channelId]?.[userId]) {
    const transports = channelTransports[channelId][userId];
    
    if (transports.send) {
      try {
        transports.send.close();
        console.log(`✅ Closed send transport for user ${userId} in channel ${channelId}`);
      } catch (e) {
        console.warn("Error closing send transport:", e);
      }
    }
    
    if (transports.recv) {
      try {
        transports.recv.close();
        console.log(`✅ Closed recv transport for user ${userId} in channel ${channelId}`);
      } catch (e) {
        console.warn("Error closing recv transport:", e);
      }
    }
    
    delete channelTransports[channelId][userId];
  }

  // Clean up empty channel entries
  if (channelTransports[channelId] && Object.keys(channelTransports[channelId]).length === 0) {
    delete channelTransports[channelId];
  }
  
  if (channelProducers[channelId] && Object.keys(channelProducers[channelId]).length === 0) {
    delete channelProducers[channelId];
  }
}