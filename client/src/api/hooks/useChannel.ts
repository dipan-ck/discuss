import api from "@/lib/axios";
import { createChannel } from "@/services/channel.service";
import { deleteChannel } from "@/services/channel.service";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";




export function useCreateChannel () {

      return useMutation({
           mutationFn: ({serverId, name, type}: {serverId: string, name: string, type: string}) => createChannel(serverId, name, type)

      })
}


export function useDeleteChannel() {
      const queryClient = useQueryClient();
      return useMutation({
            mutationFn: ({ serverId, channelId }: { serverId: string, channelId: string }) =>
                  deleteChannel(serverId, channelId),
            onSuccess: (_data, variables) => {
                  queryClient.invalidateQueries({ queryKey: ["server-channels", variables.serverId] });
            },
      });
}




export function useGetServerChannels(serverId: string) {
      return useQuery({
            queryKey: ["server-channels", serverId],
            queryFn: async () => {
                  const res = await api.get(`/channel/get-channel/${serverId}`);
                  return res.data;
            },
            enabled: !!serverId,
            staleTime: 1000 * 60 * 5,
      });
}





