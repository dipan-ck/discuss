import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createServer, fetchUserServers, leaveServer } from "@/services/server.service";
import api from "@/lib/axios";
import { use } from "react";
import { useUiStore } from "@/store/ui.store";



export function useUserServers() {
  return useQuery({
    queryKey: ["user-servers"],
    queryFn: fetchUserServers,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,   // remove this if you DO want first-time fetch
    staleTime: 1000 * 60 * 60, // 1 hour (prevents auto refetch)
  });
}




export function useCreateServer() {

  const queryClient  = useQueryClient();

  return useMutation({
     mutationFn: ({ name }: { name: string }) => createServer(name),

     onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ["user-servers"] });
     }

  })

}



export function useSearchServers(query: string) {
  return useQuery({
    queryKey: ["search-servers", query],
    queryFn: async () => {
      const res = await api.get("/server/search", {
        params: { query }
      });
      return res.data.data;
    },
    enabled: !!query,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
}



export function useJoinServer(){

   const queryClient  = useQueryClient();

   return useMutation({
      mutationFn: async (serverId: string)  => {
       const res = await api.post(`/server/join-server/${serverId}`)
        return res.data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-servers"] });
        useUiStore?.getState()?.setIsSearchServerModalOpen?.(false);
      }
   })

}


export function useLeaveServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const res = await leaveServer(serverId);
      return res;
    },

    onSuccess: (_data, serverId) => {
      // Clear selected server and channel if the left server was selected
      const currentServer = useUiStore.getState().selectedServer;
      if (currentServer?.id === serverId) {
        useUiStore.getState().setSelectedServer(null);
        useUiStore.getState().setSelectedChannel(null);
      }
      
      queryClient.invalidateQueries({ queryKey: ["user-servers"] });
      useUiStore?.getState()?.setLeaveServerModalOpen?.(false);
    }
  });
}