"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { useUiStore } from "@/store/ui.store";
import { useUserServers } from "@/api/hooks/useServers";
import UserAvatar from "./userAvatar";

interface Server {
  id: string;
  name: string;
  channels?: any[];
  members?: any[];
}

export default function ServerList() {
  const { data: servers = [], isLoading } = useUserServers();

  const selectedServer = useUiStore((s) => s.selectedServer);
  const setSelectedServer = useUiStore((s) => s.setSelectedServer);
  const setSelectedChannel = useUiStore((s) => s.setSelectedChannel);

  const getAvatarColor = (serverName: string) => {
    const colors = [
      "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
      "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6"
    ];
    const index = serverName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleServerClick = (server: Server) => {
    if (selectedServer?.id === server.id) {
      return; // Already selected
    }
    setSelectedServer(server);
    setSelectedChannel(server.channels?.[0] ?? null);
  };

  const setIsSearchServerModalOpen = useUiStore((s) => s.setIsSearchServerModalOpen);

  function handleOpenSearchServerModal() {
    if (setIsSearchServerModalOpen) {
      setIsSearchServerModalOpen(true);
    }
  }

  if (isLoading) {
    return (
      <div className="w-18 border-r bg-background p-3 space-y-2">
             {/* Logo Section */}
      <div className="flex flex-col items-center gap-1 mb-2">
        <div className="flex items-center justify-center bg-primary/40 p-2 rounded-xl">
          <MessageSquare className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
        <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
        <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
        <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-18 h-full bg-background border-r flex flex-col items-center py-3 gap-2">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-1 mb-2">
        <div className="flex items-center justify-center bg-primary/40 p-2 rounded-xl">
          <MessageSquare className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-border rounded-full mb-2" />

      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-4 px-3">
          {servers.map((server) => {
            const isSelected = selectedServer?.id === server.id;
            const bgColor = getAvatarColor(server.name);
            
            return (
              <button
                key={server.id}
                onClick={() => handleServerClick(server)}
                className={`relative group`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r transition-all duration-200 ${
                    isSelected ? "h-10" : "h-0 group-hover:h-5"
                  }`}
                />
                
                {/* Server avatar */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 ${
                    isSelected ? "rounded-2xl" : "group-hover:rounded-2xl"
                  }`}
                  style={{ backgroundColor: bgColor }}
                >
                  {server.name.charAt(0).toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <Button
        onClick={handleOpenSearchServerModal}
        size="icon"
        className="w-10 h-10"
        variant="default"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}