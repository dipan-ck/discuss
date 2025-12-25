
import ServerList from "./ServerList";
import ChannelList from "./ChannelList";

function Sidebar() {
  return (
    <div className="flex h-[calc(100vh-1rem)] m-1 border rounded-lg bg-background overflow-hidden">
      <ServerList />
      <ChannelList />
    </div>
  );
}

export default Sidebar;