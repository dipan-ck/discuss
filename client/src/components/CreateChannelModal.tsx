"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Hash, Volume2 } from "lucide-react";
import { useUiStore } from "@/store/ui.store";
import { useCreateChannel } from "@/api/hooks/useChannel";
import { useQueryClient } from "@tanstack/react-query";

function CreateChannelModal() {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"TEXT" | "VOICE">("TEXT");
  const queryClient = useQueryClient();

  const isModalOpen = useUiStore((s) => s.isCreateChannelModalOpen);
  const setModalOpen = useUiStore((s) => s.setIsCreateChannelModalOpen);
  const selectedServer = useUiStore((s) => s.selectedServer);

  const { mutate: createChannel, isPending, error } = useCreateChannel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServer) return;
    createChannel({serverId: selectedServer.id, name: channelName, type: channelType}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["server-channels", selectedServer.id] });
      }
    });

    setChannelName("");
    setModalOpen?.(false);

  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Channel
          </DialogTitle>
          <DialogDescription>
            Create a new text or voice channel for your server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              placeholder="new-channel"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
            />
          </div>

          {/* TYPE */}
          <div className="space-y-3">
            <Label>Channel Type</Label>

            <RadioGroup
              value={channelType}
              onValueChange={(v: "TEXT" | "VOICE") => setChannelType(v)}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                <RadioGroupItem value="TEXT" id="text" />
                <Label htmlFor="text" className="flex items-center gap-2 flex-1">
                  <Hash className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Text</p>
                    <p className="text-xs text-muted-foreground">
                      Send messages, images, and more
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                <RadioGroupItem value="VOICE" id="voice" />
                <Label
                  htmlFor="voice"
                  className="flex items-center gap-2 flex-1"
                >
                  <Volume2 className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Voice</p>
                    <p className="text-xs text-muted-foreground">
                      Hang out together with voice and video
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          {
            error && (<p className="text-sm text-red-500">{error.response?.data?.message}</p>
            )
          }

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen?.(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending   }
              className="flex-1"
            >
              {isPending ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateChannelModal;
