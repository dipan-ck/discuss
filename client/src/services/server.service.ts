import api from "@/lib/axios";




export async function fetchUserServers(){
  const res = await api.get("/server/get-user-servers");
  return res.data.data;
}



export async function createServer(name: string){
  const res = await api.post("/server/create-server", { name });
return res.data;  // because backend has no "data"

}


export async function deleteServer(serverId: string) {
  const res = await api.delete(`/server/delete-server/${serverId}`);
  return res.data;
}

export async function leaveServer(serverId: string) {
  const res = await api.delete(`/server/leave-server/${serverId}`);
  return res.data;
}