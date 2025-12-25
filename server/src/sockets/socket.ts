import { Server, Socket } from "socket.io";
import { handleChannelJoin, handleChannelLeave } from "./channel.socket.js";
import { handleSendMessage } from "./message.socket.js";
import {
  handleVoiceJoin,
  handleVoiceLeave,
  handleGetVoiceUsers,
  handleLeaveObserver,
} from "./voice.socket.js";
import {
  connectTransport,
  createConsumer,
  createProducer,
  createRecvTransport,
  createSendTransport,
  getRtpCapabilities,
  channelProducers,
} from "../lib/mediasoup.js";

interface AuthSocket extends Socket {
  user: { id: string; email: string };
}

export default function initSocket(io: Server) {
  io.on("connection", (socket) => {
    const authSocket = socket as AuthSocket;

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    socket.on("channel:join", (channelId: string, callback?: Function) => {
      handleChannelJoin(socket, channelId);
      if (callback) callback({ status: "ok" });
    });

    socket.on("channel:leave", (channelId: string) => {
      handleChannelLeave(socket, channelId);
    });

    socket.on("voice:get-users", (channelId: string) => {
      handleGetVoiceUsers(io, socket, channelId);
    });

    socket.on("voice:join", (channelId: string) => {
      handleVoiceJoin(io, socket, channelId);
    });

    socket.on("voice:leave", (channelId: string) => {
      handleVoiceLeave(io, socket, channelId);
    });

    socket.on("voice:leave-observer", (channelId: string) => {
      handleLeaveObserver(socket, channelId);
    });

    socket.on(
      "message:send",
      (data: { channelId: string; content: string }) => {
        const { channelId, content } = data;
        handleSendMessage(io, socket, channelId, content);
      }
    );

    //mediasoup handlers
    socket.on("voice:get-rtp-capabilities", (cb) => cb(getRtpCapabilities()));

    socket.on(
      "voice:create-transport",
      async (channelId: string, cb: Function) => {
        try {
          const transport: any = await createSendTransport(
            channelId,
            authSocket.user.id
          );

          cb({
            status: "ok",
            transport: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          });
        } catch (error: any) {
          cb({ status: "error", error: error.message });
        }
      }
    );

    socket.on(
      "voice:create-recv-transport",
      async (channelId: string, cb: Function) => {
        try {
          const transport: any = await createRecvTransport(
            channelId,
            authSocket.user.id
          );
          cb({
            status: "ok",
            transport: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          });
        } catch (err: any) {
          cb({ status: "error", error: err.message });
        }
      }
    );

    // 3️⃣ Connect Send Transport
    socket.on(
      "voice:connect-transport",
      async ({ dtlsParameters }: { dtlsParameters: any }, cb: Function) => {
        try {
          await connectTransport(authSocket.user.id, "send", dtlsParameters);
          cb({ status: "ok" });
        } catch (err: any) {
          cb({ status: "error", error: err.message });
        }
      }
    );

    socket.on(
      "voice:connect-recv-transport",
      async ({ dtlsParameters }: { dtlsParameters: any }, cb: Function) => {
        try {
          await connectTransport(authSocket.user.id, "recv", dtlsParameters);
          cb({ status: "ok" });
        } catch (err: any) {
          cb({ status: "error", error: err.message });
        }
      }
    );

    socket.on("voice:produce", async ({ channelId, rtpParameters }, cb) => {
      try {
        const producer = await createProducer(
          channelId,
          authSocket.user.id,
          rtpParameters
        );

        // notify others in the voice room
        const roomName = `voice:${channelId}`;
        socket.to(roomName).emit("voice:new-producer", {
          producerUserId: authSocket.user.id,
          producerId: producer.id,
        });

        cb({ status: "ok", producerId: producer.id });
      } catch (err: any) {
        cb({ status: "error", error: err.message });
      }
    });




    socket.on(
      "voice:consume",
      async ({ channelId, producerUserId, rtpCapabilities }, cb) => {
        try {
          const consumer = await createConsumer(
            channelId,
            authSocket.user.id,
            producerUserId,
            rtpCapabilities
          );

          cb({
            status: "ok",
            producerId: producerUserId,
            consumerId: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });
        } catch (err: any) {
          cb({ status: "error", error: err.message });
        }
      }
    );

    socket.on("voice:get-producers", (channelId: string, cb: Function) => {
      const producers = channelProducers[channelId] || {};
      const producerList = Object.entries(producers).map(([userId, producer]) => ({
        producerUserId: userId,
        producerId: producer.id,
      }));
      cb({ producers: producerList });
    });

    socket.on("voice:mute", async ({ producerId }) => {
      try {
        // Find and pause the producer on server side
        for (const channelId in channelProducers) {
          for (const userId in channelProducers[channelId]) {
            const producer = channelProducers[channelId][userId];
            if (producer.id === producerId) {
              await producer.pause();
              console.log(`✅ Producer ${producerId} paused (muted) for user ${userId}`);
              return;
            }
          }
        }
        console.log(`❌ Producer ${producerId} not found for muting`);
      } catch (err) {
        console.error("Error muting producer:", err);
      }
    });

    socket.on("voice:unmute", async ({ producerId }) => {
      try {
        // Find and resume the producer on server side
        for (const channelId in channelProducers) {
          for (const userId in channelProducers[channelId]) {
            const producer = channelProducers[channelId][userId];
            if (producer.id === producerId) {
              await producer.resume();
              console.log(`✅ Producer ${producerId} resumed (unmuted) for user ${userId}`);
              return;
            }
          }
        }
        console.log(`❌ Producer ${producerId} not found for unmuting`);
      } catch (err) {
        console.error("Error unmuting producer:", err);
      }
    });
  });
}
