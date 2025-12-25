import { Server, Socket } from "socket.io";



export function handleChannelJoin(socket: Socket, channelId: string) {
    socket.join(channelId);
}



export function handleChannelLeave(socket: Socket, channelId: string) {
    socket.leave(channelId);
}