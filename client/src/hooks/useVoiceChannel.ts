"use client";

import { useEffect, useRef } from "react";
import socket from "@/lib/socket";
import { useVoiceStore } from "@/store/voice.store";
import { useAuthStore } from "@/store/user.store";
import { useMediasoupClient } from "./useMediasoupClient";

export function useVoiceChannel(channel: any) {
  const { users, isJoined, setUsers, setJoined } = useVoiceStore();
  const currentUser = useAuthStore((s) => s.user);
  const isJoiningRef = useRef(false);
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
    
    // Prevent multiple simultaneous join attempts
    if (isJoiningRef.current) {
      console.log("⚠️ Join already in progress, skipping");
      return;
    }

    isJoiningRef.current = true;

    // Always cleanup previous resources before joining a new channel
    cleanup();

    try {
      console.log("🎤 Starting voice join process for channel:", channel.id);
      
      await loadDevice();
      console.log("✅ Device loaded");
      
      await createSendTransport(channel.id);
      console.log("✅ Send transport created");
      
      await createRecvTransport(channel.id);
      console.log("✅ Recv transport created");
      
      await produceMic(channel.id);
      console.log("✅ Mic producer created");

      socket.emit("voice:get-producers", channel.id, async (res: any) => {
        try {
          for (const p of res.producers) {
            if (p.producerUserId === currentUser?.id) continue;
            await consume(channel.id, p.producerUserId);
          }
        } catch (err) {
          console.error("Error consuming existing producers:", err);
        }
      });

      socket.on("voice:new-producer", async ({ producerUserId }: any) => {
        try {
          if (producerUserId === currentUser?.id) return;
          await consume(channel.id, producerUserId);
        } catch (err) {
          console.error("Error consuming new producer:", err);
        }
      });

      socket.emit("voice:join", channel.id);
      setJoined(channel.id, true);
      console.log("✅ Successfully joined voice channel");
    } catch (err) {
      console.error("❌ Error joining voice channel:", err);
      setJoined(channel.id, false);
      // Cleanup on error
      cleanup();
    } finally {
      isJoiningRef.current = false;
    }
  }

  function leaveVoice() {
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
