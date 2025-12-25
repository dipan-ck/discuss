import { Server, Socket } from "socket.io";

export async function handleGetVoiceUsers(io: Server, socket: Socket, channelId: string) {
    const roomName = `voice:${channelId}`;
    const observerRoom = `voice-observer:${channelId}`;
    
    // Join observer room to get updates even when not in voice
    socket.join(observerRoom);
    
    const socketsInRoom = await io.in(roomName).fetchSockets();
    const usersInRoom = socketsInRoom.map((s: any) => s.user);
    
    socket.emit("voice:users-updated", {
        channelId,
        users: usersInRoom,
    });
}

export async function handleVoiceJoin(io: Server, socket: Socket, channelId: string) {
    
    const roomName = `voice:${channelId}`;
    const observerRoom = `voice-observer:${channelId}`;
    
    socket.join(roomName);

    // Notify all users (both in voice and observers) that a new user joined
    const socketsInRoom = await io.in(roomName).fetchSockets();
    const usersInRoom = socketsInRoom.map((s: any) => s.user);
    
    // Emit to both voice room and observer room
    io.to(roomName).emit("voice:users-updated", {
        channelId,
        users: usersInRoom,
    });
    
    io.to(observerRoom).emit("voice:users-updated", {
        channelId,
        users: usersInRoom,
    });
}

export async function handleVoiceLeave(io: Server, socket: Socket, channelId: string) {
    const roomName = `voice:${channelId}`;
    const observerRoom = `voice-observer:${channelId}`;
    
    // Leave the voice room first
    socket.leave(roomName);

    // Then fetch the updated list (without the user who just left)
    const socketsInRoom = await io.in(roomName).fetchSockets();
    const usersInRoom = socketsInRoom.map((s: any) => s.user);

    // Notify both voice room and observers
    io.to(roomName).emit("voice:users-updated", {
        channelId,
        users: usersInRoom,
    });
    
    io.to(observerRoom).emit("voice:users-updated", {
        channelId,
        users: usersInRoom,
    });
}

export async function handleLeaveObserver(socket: Socket, channelId: string) {
    const observerRoom = `voice-observer:${channelId}`;
    socket.leave(observerRoom);
}
