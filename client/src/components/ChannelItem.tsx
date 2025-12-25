"use client"

import { Volume2, Hash, MoreVertical, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";
import { useVoiceStore } from "@/store/voice.store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useDeleteChannel } from "@/api/hooks/useChannel";
import { Spinner } from "@/components/ui/Spinner";


// Types
type ChannelType = "VOICE" | "TEXT";

interface Channel {
    id: string;
    name: string;
    type: ChannelType;
}

interface ChannelItemProps {
    channel: Channel;
}





// ChannelItem Component
export default function ChannelItem({
    channel,
}: ChannelItemProps) {
    const Icon = channel.type === "VOICE" ? Volume2 : Hash;
    const selectedChannel = useUiStore((s) => s.selectedChannel);
    const setSelectedChannel = useUiStore((s) => s.setSelectedChannel);

    const handleChannelSelect = () => {
        setSelectedChannel(channel);
    };


    const [open, setOpen] = useState(false);
    const {isPending, mutate} = useDeleteChannel();

    const handleDeleteChannel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedServer) return;
            mutate({ serverId: selectedServer.id, channelId: channel.id }, {
            onSuccess: () => setOpen(false),
        });
    };

    const selectedServer = useUiStore(s => s.selectedServer);

    


    function checkDeleteChannelPermission() {
        const role  = selectedServer?.role;
        if (role === "OWNER") {
            return true;
        }
        return false;
    }




    return (
        <div className="relative w-full my-2 group">
            <Button
                variant={selectedChannel?.id === channel.id ? "default" : "ghost"}
                className={cn(
                    "w-full justify-start gap-2 font-normal py-2 pr-8 h-auto",
                )}
                onClick={handleChannelSelect}
                aria-pressed={selectedChannel?.id === channel.id}
                aria-label={`${channel.type.toLowerCase()} channel ${channel.name}`}
            >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate text-sm font-medium">{channel.name}</span>
            </Button>
            

            {checkDeleteChannelPermission() && (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className={`h-4 w-4 ${selectedChannel?.id === channel.id ? "text-black" : "text-muted-foreground"}`} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleDeleteChannel}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Channel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Channel</DialogTitle>
                            </DialogHeader>
                            <div>Are you sure you want to delete the channel <span className="font-semibold">{channel.name}</span>? This action cannot be undone.</div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleConfirmDelete} disabled={isPending}>
                                    {isPending ? <><Spinner className="mr-2 h-4 w-4" /> Deleting...</> : "Yes, Delete"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}

                
        </div>
    );
}