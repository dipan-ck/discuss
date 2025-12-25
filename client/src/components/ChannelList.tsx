"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui.store";
import ChannelItem from "./ChannelItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Delete, Plus, Trash } from "lucide-react";
import { useGetServerChannels } from "@/api/hooks/useChannel";
import UserAvatar from "./userAvatar";

export default function ChannelList() {
  const selectedServer = useUiStore((s) => s.selectedServer);
  const {data, isLoading} = useGetServerChannels(selectedServer?.id || null);

  const channels = data?.data || [];

  
  

  if (!selectedServer) {
    return (
      <div className="w-60 h-full bg-muted/15 border-r flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a server</p>
        </div>
        <UserAvatar />
      </div>
    );
  }

  const handleCreateChannel = () => {
     useUiStore.getState().setIsCreateChannelModalOpen?.(true);

  };

  const handleDeleteServer = () => {
     useUiStore.getState().setDeleteServerModalOpen?.(true);
  };

  const handleLeaveServer = () => {
    useUiStore.getState().setLeaveServerModalOpen?.(true);
  };



  const checkCreateChannelPermission = () => {
    const role = selectedServer.role;
    return role === "ADMIN" || role === "OWNER";
  };

  const checkDeleteServerPermission = () => {
    const role = selectedServer.role;
    return role === "OWNER";
  };

  const checkLeaveServerPermission = () => {
    const role = selectedServer.role;
    return role === "MEMBER" || role === "ADMIN";
  };



    if (isLoading) {
    return (
      <div className="w-60 h-full bg-muted/15 border-r flex flex-col">
        <div className="h-12 border-b px-4 flex items-center">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <UserAvatar />
      </div>
    );
  }

  



  return (
    <div className="w-60 h-full bg-muted/15 border-r flex flex-col">
      {/* Server Header */}
      <div className="h-12 border-b px-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0 h-auto font-semibold">
              <span className="truncate">{selectedServer.name}</span>
              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {checkCreateChannelPermission() && (
              <DropdownMenuItem onClick={handleCreateChannel}>
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </DropdownMenuItem>
            )}

            {checkDeleteServerPermission() && (
              <DropdownMenuItem
                onClick={handleDeleteServer}
                className="text-destructive "
              >
                <Trash className="h-4 w-4 mr-2 text-destructive" />
                Delete Server
              </DropdownMenuItem>
            )}

            {checkLeaveServerPermission() && (
              <DropdownMenuItem
                onClick={handleLeaveServer}
                className="text-destructive"
              >
                Leave Server
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
            Text Channels
          </div>
          {channels.length > 0 ? (
            channels
              .filter((channel: any) => channel.type === "TEXT")
              .map((channel: any) => (
                <ChannelItem key={channel.id} channel={channel} />
              ))
          ) : (
            <p className="text-xs text-muted-foreground italic px-2 py-1">
              No text channels
            </p>
          )}

          {channels?.some((ch: any) => ch.type === "VOICE") && (
            <>
              <div className="px-2 py-1 mt-4 text-xs font-semibold text-muted-foreground uppercase">
                Voice Channels
              </div>
              {channels
                .filter((channel: any) => channel.type === "VOICE")
                .map((channel: any) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
            </>
          )}
        </div>
      </ScrollArea>
      
      {/* User Info - Always at bottom */}
      <UserAvatar />
    </div>
  );
}
