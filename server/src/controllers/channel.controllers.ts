import { Context } from "hono";
import { channelService } from "../services/channel.service";
import { success, ZodError } from "zod";
import { serverService } from "../services/server.service";

export async function createChannel(c: Context) {
  try {
    const { name, type } = await c.req.json();
    const userId = c.get("userId");
    const serverId = c.req.param("serverId");



    // Permission check only ADMIN or OWNER can create channels
    const allowed = await serverService.verifyServerRole(
      serverId,
      userId
    );
    if (!allowed) {
      return c.json({
        message:
          "you do not have permission to create a channel in this server",
        success: false,
      }, 403);
    }

    const channelName = await channelService.validateChannelName(name);
    const channelType = await channelService.validateChannelType(type);

    const channel = await channelService.createChannel(
      channelName,
      serverId,
      channelType
    );

    return c.json({
      message: "Channel created successfully",
      data: channel,
      success: true,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({
        message: err.issues.map((issue) => issue.message).join(", "),
      }, 400);
    }

    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
}




export async function deleteChannel(c: Context) {
  try {
    const channelId = c.req.param("channelId");
    const serverId = c.req.param("serverId");
    const userId = c.get("userId");

    if (!channelId || !serverId) {
      return c.json({ message: "Missing channelId or serverId", success: false }, 400);
    }

    // Permission check only ADMIN or OWNER can delete channels
    const isAllowed = await serverService.verifyServerRole(
      serverId,
      userId
    );

    if (!isAllowed) {
      return c.json({
          message: "You do not have permission to delete this channel",
          success: false,
        }, 403);
    }

    // Verify channel belongs to server
    const channelInServer = await channelService.verifyChannelInServer(
      channelId,
      serverId
    );

    if (!channelInServer) {
        return c.json({ message: "Channel not found in server", success: false }, 404);
    }


    await channelService.deleteChannel(channelId);



    return c.json({ message: "Channel deleted successfully", success: true });
  } catch (err) {
    console.log(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
}





export async function getServerChannels(c: Context) {

  try{

    const serverId = c.req.param("serverId");
    const userId = c.get("userId");

    if(!userId){
      return c.json({message: "Unauthorized", success: false}, 401);
    }



    const channel  = await channelService.getChannelsByServerId(serverId);

    return c.json({
      message: "Channels fetched successfully",
      data: channel,
      success: true,
    });


  }catch(err){

    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);

  }

}