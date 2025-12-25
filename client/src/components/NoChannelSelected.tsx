export function NoChannelSelected() {
  return (
    <div className="flex-1 p-4 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center" />
      
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="flex justify-center">
          <img 
            src="/no-channel-svg.svg" 
            alt="No channel selected" 
            className="w-64 h-64 object-contain opacity-80"
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-3xl font-semibold tracking-tight">
            No Channel Selected
          </h3>
          <p className="text-muted-foreground/80 max-w-md mx-auto text-lg">
            Choose a channel from the sidebar to dive into the conversation
          </p>
        </div>
      </div>
    </div>
  );
}
