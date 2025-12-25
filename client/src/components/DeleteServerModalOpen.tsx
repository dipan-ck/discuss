"use client";

import { useUiStore } from "@/store/ui.store";
import { useState } from "react";
import { deleteServer } from "@/services/server.service";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function DeleteServerModal() {
  const isModalOpen = useUiStore((s) => s.deleteServerModalOpen);
  const setModalOpen = useUiStore((s) => s.setDeleteServerModalOpen);
  const server = useUiStore((s) => s.selectedServer);

const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!server) return;

    try {
      setLoading(true);
      await deleteServer(server.id);

      // Close modal
      setModalOpen?.(false);
    } finally {
         queryClient.invalidateQueries({ queryKey: ["user-servers"] });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium tracking-tight">
            Delete Server
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {server?.name}
            </span>
            ? <br />
            <br />
            <span className="text-red-500 font-medium">
              This action is permanent. All channels, messages, and data will be
              permanently deleted.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Server"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setModalOpen?.(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteServerModal;
