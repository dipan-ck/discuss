"use client";

import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/user.store";
import { getAvatarColor } from "@/lib/avatar";
import { useState } from "react";
import { deleteAccount } from "@/services/user.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, X, Calendar, Mail } from "lucide-react";

function UserProfileModal() {
  const isModalOpen = useUiStore((s) => s.userProfileModalOpen);
  const setModalOpen = useUiStore((s) => s.setUserProfileModalOpen);
  const user = useAuthStore((s) => s.user);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setModalOpen?.(false);
    setIsDeleteMode(false);
    setDeleteConfirmation("");
    setError(null);
  };

  const getGradientForProfile = () => {
    // Determine gradient based on profile color or default to a nice one
    const color = user?.profileColor || "";
    if (color.includes("blue")) return "from-blue-500 to-cyan-400";
    if (color.includes("purple")) return "from-purple-500 to-pink-400";
    if (color.includes("green")) return "from-green-500 to-emerald-400";
    if (color.includes("red")) return "from-red-500 to-orange-400";
    if (color.includes("yellow")) return "from-yellow-400 to-orange-300";
    return "from-indigo-500 to-purple-400";
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteAccount();
      
      // Force reload to clear state and redirect
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  if (!user) return null;

  const avatarColor = getAvatarColor(user.id, user.profileColor);
  const bgGradient = getGradientForProfile();

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-card">
        {/* Header Background */}
        <div className={`h-32 bg-gradient-to-r ${bgGradient} relative`}>
          <Button 
            className="absolute top-2 right-2 rounded-full bg-black/20 hover:bg-black/40 border-none text-white p-2 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          {/* Avatar - overlapping header */}
          <div className="-mt-12 mb-4">
            <div className={`h-24 w-24 rounded-full ${avatarColor} border-4 border-card flex items-center justify-center shadow-lg`}>
              <span className="text-4xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {!isDeleteMode ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                  Online
                </div>
              </div>

              <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                  <span className="text-foreground font-medium">{user.email}</span>
                </div>
                
                {/* Account Age - We don't have createdAt in user store yet, so skipping or using a placeholder if needed. 
                    Assuming user object might have it if updated, otherwise just showing email is good for now.
                 */}
                 <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-muted-foreground">Joined recently</span>
                 </div>
              </div>

              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start h-auto py-3 px-4"
                  onClick={() => setIsDeleteMode(true)}
                >
                  <Trash className="h-4 w-4 mr-3" />
                  <span className="font-medium">Delete Account</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="text-destructive font-bold text-lg mb-2 flex items-center">
                  <Trash className="h-5 w-5 mr-2" /> Delete Account
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This action is permanent and cannot be undone. All your servers, messages, and membership data will be permanently deleted.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Type <span className="text-destructive font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50"
                    placeholder="DELETE"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDeleteMode(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteConfirmation !== "DELETE" || loading}
                  onClick={handleDeleteAccount}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileModal;
