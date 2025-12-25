"use client"

import Sidebar from "@/components/sidebar";
import ChannelContent from "@/components/ChannelContent";
import VoiceChannelDashboard from "@/components/VoiceChannelDashboard";
import SearchServerModal from "@/components/ui/SearchServerModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import DeleteServerModalOpen from "@/components/DeleteServerModalOpen";
import LeaveServerModal from "@/components/LeaveServerModal";
import UserProfileModal from "@/components/UserProfileModal";
import SocketProvider from "@/components/SocketProvider";
import { useUiStore } from "@/store/ui.store";

export default  function page() {
  const selectedChannel = useUiStore((s) => s.selectedChannel);

  const renderChannelContent = () => {
    if (!selectedChannel) {
      return <ChannelContent />;
    }

    if (selectedChannel.type === "VOICE") {
      return <VoiceChannelDashboard />;
    }

    // Default to TEXT channel
    return <ChannelContent />;
  };

  return (
    <SocketProvider>
     
        <div className="flex h-screen">
          <DeleteServerModalOpen />
          <LeaveServerModal />
          <UserProfileModal />
          <CreateChannelModal />
          <SearchServerModal />
          <Sidebar />
          {renderChannelContent()}
        </div>

    </SocketProvider>
  );
}
