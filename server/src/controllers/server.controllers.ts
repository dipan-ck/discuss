import { Context } from "hono";
import { serverService } from "../services/server.service";
import { ZodError } from "zod";

export async function createServer(c: Context) {
  try {
    const { name } = await c.req.json();
    const ownerId = c.get("userId");

    const parsedName = serverService.validateServerName(name);
    const server = await serverService.createServer(parsedName, ownerId);

    await serverService.addMemberToServer(server.id, ownerId, "OWNER");

    return c.json({ message: "Server created successfully", success: true });
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



export async function getUserServers(c: Context) {
  try {
    const userId = c.get("userId");

    const servers = await serverService.getUserServers(userId);

    return c.json({
      message: "Servers fetched successfully",
      data: servers,
      success: true,
    });

  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
}




export async function deleteServer(c: Context) {
    try {
    const userId = c.get("userId");
    const serverId = c.req.param("serverId");


   //ONLY OWNER CAN DELETE THE SERVER   
    const isOwner = await serverService.verifyServerOwnerShip(serverId, userId);

    if (!isOwner) {
        return c.json({ message: "Forbidden: Only owners can delete the server" }, 403);
    }

    await serverService.deleteServer(serverId);
    return c.json({ message: "Server deleted successfully", success: true });


    } catch (error) {

    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);

    }
}



export async function joinServer(c: Context) {
    try{

        const joineeId = c.get("userId");
        const serverId = c.req.param("serverId");

        if(!joineeId || !serverId){
            return c.json({message: "Bad Request: Missing parameters", success: false}, 400);
        }
        
        //check if user is already a member
        const isMember = await serverService.isServerMember(serverId, joineeId);

        if(isMember){
            return c.json({message: "You are already a member of the server", success: false}, 400);
        }

        await serverService.addMemberToServer(serverId, joineeId, "MEMBER");

        return c.json({message: "Joined server successfully", success: true});    


    }catch(error){
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}




export async function leaveServer(c: Context) {
  try {
    const userId = c.get("userId");
    const serverId = c.req.param("serverId");

    // Cannot leave if owner
    const isOwner = await serverService.verifyServerOwnerShip(serverId, userId);
    if (isOwner) {
      return c.json({
        message: "Owner cannot leave the server. Please delete the server instead.",
        success: false,
      }, 400);
    }

    // Check if user is a member
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return c.json({
        message: "You are not a member of the server",
        success: false,
      }, 400);
    }

    // Remove user
    await serverService.removeUserFromServer(serverId, userId);

    return c.json({ message: "Left server successfully", success: true });

  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
}




export async function searchServers(c: Context) {
  try{

    const query = c.req.query("query");

    if(!query || typeof query !== "string"){
        return c.json({message: "Bad Request: Missing or invalid query", success: false}, 400);
    }

    const servers = await serverService.searchServersByName(query);

    return c.json({message: "Servers fetched successfully", data: servers, success: true});

  }catch(error){

    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);

  }
}