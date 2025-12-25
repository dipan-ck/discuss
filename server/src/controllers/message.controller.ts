import { Context } from "hono";
import { messageService } from "../services/message.service.js";




export async function getAllMessages(c: Context) {
    try{

        const channelId = c.req.param("channelId");

        const limit = c.req.query("limit") || "30";
        const cursor = c.req.query("cursor");

        if(!limit){
            return c.json({ message: "Missing query parameters" }, 400);
        }


        const data = await messageService.getAllMessages(
            channelId,
            Number(limit),
            cursor as string
        );

        return c.json({data, message: "Messages fetched successfully"});



    }catch(error){
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
    }
}