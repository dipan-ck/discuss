// Server related types
export interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "VOICE";
  serverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Server {
  id: string;
  name: string;
  imageUrl?: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  channels: Channel[];
}

export interface UserServersResponse {
  data: Server[];
}
