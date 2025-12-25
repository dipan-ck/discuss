import prisma from "../lib/prisma.js";
import z from "zod";

class ChannelService {
  private nameSchema = z
    .string()
    .min(3, { message: "Channel name must be at least 3 characters" })
    .max(30, { message: "Channel name cannot exceed 30 characters" });

  private typeSchema = z.enum(["TEXT", "VOICE"], {
    message: "Channel type must be either TEXT or VOICE",
  });

  async validateChannelName(name: string) {
    return this.nameSchema.parse(name);
  }

  async validateChannelType(type: "TEXT" | "VOICE") {
    return this.typeSchema.parse(type);
  }

  async createChannel(name: string, serverId: string, type: "TEXT" | "VOICE") {
    return await prisma.channel.create({
      data: {
        name,
        serverId,
        type,
      },
    });
  }


  async verifyChannelInServer(channelId: string, serverId: string) {

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
    });

    if (!channel) {
      return false;
    }

    return true;
  }


  async deleteChannel(channelId: string) {
    await prisma.channel.delete({
      where: {
        id: channelId,
      },
    });
  }



  async getChannelsByServerId(serverId: string) {
    return await prisma.channel.findMany({
      where: {serverId : serverId}
    })
  }

}

export const channelService = new ChannelService();
