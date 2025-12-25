import prisma from "../lib/prisma";

class MessageService {
  async getAllMessages(channelId: string, limit: number, cursor: string) {
    if (!cursor) {
      // Initial load: get the newest 30 messages
      const messages = await prisma.message.findMany({
        where: { channelId },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: {
            select: { username: true },
          },
        },
      });


      return {
        messages,
        nextCursor:
          messages.length > 0 ? messages[messages.length - 1].id : null,
      };
    }

    // PAGINATION → return older messages before cursor
    const messages = await prisma.message.findMany({
      where: {
        channelId,
        createdAt: {
          lt: await prisma.message.findUnique({
            where: { id: cursor },
            select: { createdAt: true }
          }).then(m => m?.createdAt)
        }
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: { username: true },
        },
      },
    });

    return {
      messages: messages,
      nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
    };
  }



    async saveMessage(channelId: string, userId: string, content: string) {
    const message = await prisma.message.create({
      data: {
        channelId,
        userId,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        channelId: true,
        userId: true,
        user: {
          select: { username: true },
        },
      },
    });

    return message;
  }

  }




export const messageService = new MessageService();
