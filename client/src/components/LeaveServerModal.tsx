"use client";

import { useUiStore } from "@/store/ui.store";
import { useLeaveServer } from "@/api/hooks/useServers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

function LeaveServerModal() {
  const isModalOpen = useUiStore((s) => s.leaveServerModalOpen);
  const setModalOpen = useUiStore((s) => s.setLeaveServerModalOpen);
  const server = useUiStore((s) => s.selectedServer);

  const { mutate: leaveServer, isPending, isError, error, reset } = useLeaveServer();

  const handleLeave = () => {
    if (!server) return;
    leaveServer(server.id);
  };

  const handleClose = () => {
    setModalOpen?.(false);
    reset(); // Reset error state when closing
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium tracking-tight">
            Leave Server
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Are you sure you want to leave{" "}
            <span className="font-medium text-foreground">
              {server?.name}
            </span>
            ?
            <br />
            <br />
            You will no longer have access to this server's channels and messages.
          </DialogDescription>
        </DialogHeader>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">
                {(error as any)?.response?.data?.message || "Failed to leave server. Please try again."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => reset()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Leaving...
              </>
            ) : (
              "Leave Server"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LeaveServerModal;
