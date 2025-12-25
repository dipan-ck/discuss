"use client";

import { Volume2, Mic, PhoneOff } from "lucide-react";
import { Button } from "./ui/button";
import { useUiStore } from "@/store/ui.store";
import { useVoiceChannel } from "@/hooks/useVoiceChannel";
import { useMediasoupClient } from "@/hooks/useMediasoupClient";
import { useAuthStore } from "@/store/user.store";
import { getAvatarColor, getUserInitials } from "@/lib/avatar";



function VoiceChannelDashboard() {

    const channel = useUiStore((s) => s.selectedChannel);
  const { channelUsers, joined, joinVoice, leaveVoice, mute, unmute, isMuted } =useVoiceChannel(channel);
  const currentUser = useAuthStore((state) => state.user);

  


  
  if (!channel) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No voice channel selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-1rem)] m-1 rounded-lg border border-border bg-muted/15 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="h-14 border-b px-6 flex items-center justify-between bg-background/50">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{channel.name}</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {channelUsers.length} {channelUsers.length === 1 ? "user" : "users"} connected
        </div>
      </div>

      {/* Voice Users Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {channelUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Volume2 className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No one is here yet</h3>
                <p className="text-muted-foreground">Be the first to join the voice channel</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {channelUsers.map((user) => {
              // Check if this is the current user
              const isCurrentUser = currentUser?.username === user.username;
              
              // Get avatar color - colored for current user, muted for others
              const avatarColor = isCurrentUser 
                ? getAvatarColor(user.id, currentUser?.profileColor) 
                : 'bg-muted';
              
              // Text color - white for colored avatars, foreground for muted
              const textColor = isCurrentUser ? 'text-white' : 'text-muted-foreground';
              
              const initials = getUserInitials(user.username);
              
              return (
              <div
                key={user.id}
                className="flex flex-col items-center gap-3 p-4 rounded-lg bg-background/80 border border-border hover:bg-background transition-colors"
              >
                <div className="relative">
                  <div className={`h-20 w-20 rounded-full ${avatarColor} flex items-center justify-center text-2xl font-semibold ${textColor} shadow-md`}>
                    {initials}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{user.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="h-20 border-t px-6 flex items-center justify-center gap-4 bg-background/50">
        {joined ? (
          <>
            <Button 
              variant={isMuted ? "destructive" : "outline"} 
              onClick={isMuted ? unmute : mute} 
              size="icon" 
              className="h-12 w-12 rounded-full"
            >
              {isMuted ? (
              <Mic className="h-5 w-5 line-through" />
              ) : (
              <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={leaveVoice}
              size="icon"
              className="h-12 w-12 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button onClick={joinVoice} size="lg" className="px-8">
            <Volume2 className="h-5 w-5 mr-2" />
            Join Voice Channel
          </Button>
        )}
      </div>
    </div>
  );
}

export default VoiceChannelDashboard;
