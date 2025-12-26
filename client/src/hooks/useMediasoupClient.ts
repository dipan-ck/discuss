"use client";

import { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import socket from "@/lib/socket";

export function useMediasoupClient() {
  const device = useRef<Device | null>(null);

  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const consumersRef = useRef<Map<string, any>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const micProducerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);


  // ------------------------------------------------------
  // 1) Load Device
  // ------------------------------------------------------
  async function loadDevice() {
    if (device.current && device.current.loaded) {
      return device.current;
    }

    const response: any = await new Promise((res) => {
      socket.emit("voice:get-rtp-capabilities", (data: any) => res(data));
    });

    const rtpCapabilities = response.rtpCapabilities || response;

    if (!rtpCapabilities) {
      throw new Error("No RTP capabilities received from server");
    }

    if (!device.current) {
      device.current = new Device();
    }

    await device.current.load({ routerRtpCapabilities: rtpCapabilities });

    return device.current;
  }

  // ------------------------------------------------------
  // 2) Create Send Transport
  // ------------------------------------------------------
  async function createSendTransport(channelId: string) {
    // Ensure old transport is fully cleaned up first
    if (sendTransportRef.current) {
      console.log("⚠️ Old send transport exists, cleaning up first");
      try {
        sendTransportRef.current.removeAllListeners();
        sendTransportRef.current.close();
      } catch (e) {
        console.warn("Error closing old send transport:", e);
      }
      sendTransportRef.current = null;
    }

    const response = await new Promise<any>((resolve, reject) => {
      socket.emit("voice:create-transport", channelId, (data: any) => {
        if (data.status === "error") {
          reject(new Error(data.error || "Failed to create send transport"));
        } else {
          resolve(data);
        }
      });
    });

    if (!response.transport) {
      throw new Error("No transport data received from server");
    }

    const sendTransport = device.current!.createSendTransport(response.transport);
    sendTransportRef.current = sendTransport;

    sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socket.emit(
        "voice:connect-transport",
        { dtlsParameters },
        (res: any) => {
          if (res.status === "ok") {
            console.log("✅ Send transport connected");
            callback();
          } else {
            console.error("❌ Send transport connection failed:", res.error);
            errback(new Error(res.error || "Failed to connect send transport"));
          }
        }
      );
    });

    sendTransport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
      socket.emit(
        "voice:produce",
        { channelId, kind, rtpParameters },
        (res: any) => {
          if (res.status === "ok") {
            console.log("✅ Producer created:", res.producerId);
            callback({ id: res.producerId });
          } else {
            console.error("❌ Producer creation failed:", res.error);
            errback(new Error(res.error || "Failed to produce"));
          }
        }
      );
    });

    sendTransport.on("connectionstatechange", (state) => {
      console.log("Send transport connection state:", state);
      if (state === "failed" || state === "disconnected") {
        console.error("❌ Send transport connection state:", state);
      }
    });

    return sendTransport;
  }

  // ------------------------------------------------------
  // 3) Create Recv Transport
  // ------------------------------------------------------
  async function createRecvTransport(channelId: string) {
    // Ensure old transport is fully cleaned up first
    if (recvTransportRef.current) {
      console.log("⚠️ Old recv transport exists, cleaning up first");
      try {
        recvTransportRef.current.removeAllListeners();
        recvTransportRef.current.close();
      } catch (e) {
        console.warn("Error closing old recv transport:", e);
      }
      recvTransportRef.current = null;
    }

    const response = await new Promise<any>((resolve, reject) => {
      socket.emit("voice:create-recv-transport", channelId, (data: any) => {
        if (data.status === "error") {
          reject(new Error(data.error || "Failed to create recv transport"));
        } else {
          resolve(data);
        }
      });
    });

    if (!response.transport) {
      throw new Error("No transport data received from server");
    }

    const recvTransport = device.current!.createRecvTransport(response.transport);
    recvTransportRef.current = recvTransport;

    recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socket.emit(
        "voice:connect-recv-transport",
        { dtlsParameters },
        (res: any) => {
          if (res.status === "ok") {
            console.log("✅ Recv transport connected");
            callback();
          } else {
            console.error("❌ Recv transport connection failed:", res.error);
            errback(new Error(res.error || "Failed to connect recv transport"));
          }
        }
      );
    });

    recvTransport.on("connectionstatechange", (state) => {
      console.log("Recv transport connection state:", state);
      if (state === "failed" || state === "disconnected") {
        console.error("❌ Recv transport connection state:", state);
      }
    });

    return recvTransport;
  }

  // ------------------------------------------------------
  // 4) Produce Mic Audio
  // ------------------------------------------------------
  async function produceMic(channelId: string) {
    if (!sendTransportRef.current) {
      throw new Error("Send transport not initialized");
    }

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const track = localStreamRef.current.getAudioTracks()[0];
      if (!track) {
        throw new Error("No audio track available");
      }

      const producer = await sendTransportRef.current.produce({ track });
      micProducerRef.current = producer;

      return producer;
    } catch (error) {
      // Clean up the stream if produce fails
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      throw error;
    }
  }

  // ------------------------------------------------------
  // 5) Consume Another User's Audio
  // ------------------------------------------------------
  async function consume(channelId: string, producerUserId: string) {
    const data = await new Promise<any>((res) =>
      socket.emit(
        "voice:consume",
        {
          channelId,
          producerUserId,
          rtpCapabilities: device.current!.rtpCapabilities,
        },
        res
      )
    );

    if (data.status === "error") {
      return;
    }

    const consumer = await recvTransportRef.current.consume({
      id: data.consumerId,
      producerId: data.producerId,
      kind: data.kind,
      rtpParameters: data.rtpParameters,
    });

    await consumer.resume();

    consumersRef.current.set(producerUserId, consumer);

    const audio = new Audio();
    audio.autoplay = true;
    audio.volume = 1.0;
    audio.srcObject = new MediaStream([consumer.track]);
    
    audio.play().catch((err) => {
      document.addEventListener(
        "click",
        () => audio.play().catch(console.error),
        { once: true }
      );
    });

    audioElementsRef.current.set(producerUserId, audio);

    return consumer;
  }


  useEffect(() => {
  console.log("UPDATED isMuted =", isMuted);
}, [isMuted]);


  function mute() {
  if (!micProducerRef.current) return;

  setIsMuted(true);
  socket.emit("voice:mute", { producerId: micProducerRef.current.id });
  console.log("Muting producer:", micProducerRef.current.id);
}

function unmute() {
  if (!micProducerRef.current) return;

  setIsMuted(false);
  socket.emit("voice:unmute", { producerId: micProducerRef.current.id });
  console.log("Unmuting producer:", micProducerRef.current.id);
}



  // ------------------------------------------------------
  // 6) Cleanup State
  // ------------------------------------------------------
  function cleanup() {
    console.log("🧹 Cleaning up mediasoup resources");
    
    audioElementsRef.current.forEach((el) => {
      el.pause();
      el.srcObject = null;
    });
    audioElementsRef.current.clear();

    consumersRef.current.forEach((c) => {
      try {
        c.close();
      } catch (e) {
        console.warn("Error closing consumer:", e);
      }
    });
    consumersRef.current.clear();

    if (micProducerRef.current) {
      try {
        micProducerRef.current.close();
      } catch (e) {
        console.warn("Error closing mic producer:", e);
      }
      micProducerRef.current = null;
    }

    if (sendTransportRef.current) {
      try {
        sendTransportRef.current.removeAllListeners();
        sendTransportRef.current.close();
      } catch (e) {
        console.warn("Error closing send transport:", e);
      }
      sendTransportRef.current = null;
    }

    if (recvTransportRef.current) {
      try {
        recvTransportRef.current.removeAllListeners();
        recvTransportRef.current.close();
      } catch (e) {
        console.warn("Error closing recv transport:", e);
      }
      recvTransportRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setIsMuted(false);
    socket.off("voice:new-producer");
  }

  return {
    loadDevice,
    createSendTransport,
    createRecvTransport,
    produceMic,
    isMuted,
    mute,
    unmute,
    consume,
    cleanup,
  };
}
