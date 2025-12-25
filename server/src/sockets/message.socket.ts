import { Server, Socket } from "socket.io";
import { messageService } from "../services/message.service";



export async function handleSendMessage(
  io: Server,
  socket: Socket,
  channelId: string,
  content: string
) {

    if (!channelId || !content.trim()) return;

    //get userId
    const user = socket.user;

  try {
    // Create optimistic message with fake ID
    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      content: content.trim(),
      createdAt: new Date(),
      channelId,
      userId: user.id,
      user: {
        username: user.username || user.email,
      },
    };

    // Immediately emit optimistic message to all users in the channel
    io.to(channelId).emit("message:new", optimisticMessage);

    // Save message to database in background
    messageService.saveMessage(
      channelId,
      user.id,
      content.trim()
    ).catch((error) => {
      console.error("Error saving message to database:", error);
    });

  } catch (error) {
    console.error("Error handling send message:", error);
    socket.emit("message:error", "Failed to send message");
  }
}
