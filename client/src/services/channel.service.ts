import api from "@/lib/axios";




export async function createChannel(serverId: string, name: string, type: string) {
    const res = await api.post(`/channel/create-channel/${serverId}`, { name, type });
    return res.data
}


export async function deleteChannel(serverId: string, channelId: string) {
    const res = await api.delete(`/channel/delete-channel/${serverId}/${channelId}`);
    return res.data;
}