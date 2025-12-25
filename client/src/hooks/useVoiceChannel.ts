"use client";

import { useEffect } from "react";
import socket from "@/lib/socket";
import { useVoiceStore } from "@/store/voice.store";
import { useAuthStore } from "@/store/user.store";
import { useMediasoupClient } from "./useMediasoupClient";

export function useVoiceChannel(channel: any) {
  const { users, isJoined, setUsers, setJoined } = useVoiceStore();
  const currentUser = useAuthStore((s) => s.user);
  const {
    loadDevice,
    createSendTransport,
    createRecvTransport,
    produceMic,
    consume,
    cleanup,
    mute,
    unmute,
    isMuted,
  } = useMediasoupClient();

  const channelUsers = channel ? users[channel.id] || [] : [];
  const joined = channel ? isJoined[channel.id] || false : false;

  // Load users when channel changes
  useEffect(() => {
    if (!channel) return;

    socket.emit("voice:get-users", channel.id);

    const handler = (d: any) => setUsers(d.channelId, d.users);
    socket.on("voice:users-updated", handler);

    return () => {
      socket.off("voice:users-updated", handler);
      socket.emit("voice:leave-observer", channel.id);
    };
  }, [channel?.id, setUsers]);

  async function joinVoice() {
    if (!channel) return;

    try {
      await loadDevice();
      await createSendTransport(channel.id);
      await createRecvTransport(channel.id);
      await produceMic(channel.id);

      socket.emit("voice:get-producers", channel.id, async (res: any) => {
        for (const p of res.producers) {
          if (p.producerUserId === currentUser?.id) continue;
          await consume(channel.id, p.producerUserId);
        }
      });

      socket.on("voice:new-producer", async ({ producerUserId }: any) => {
        if (producerUserId === currentUser?.id) return;
        await consume(channel.id, producerUserId);
      });

      socket.emit("voice:join", channel.id);
      setJoined(channel.id, true);
    } catch (err) {
      setJoined(channel.id, false);
    }
  }  function leaveVoice() {
    if (!channel) return;
    cleanup();
    socket.emit("voice:leave", channel.id);
    setJoined(channel.id, false);
  }

  return {
    channelUsers,
    joined,
    joinVoice,
    leaveVoice,
    mute,
    unmute,
    isMuted,
  };
}
