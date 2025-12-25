interface ErrorLoadingMessagesProps {
  error: string;
  onRetry: () => void;
}

export function ErrorLoadingMessages({ error, onRetry }: ErrorLoadingMessagesProps) {
  return (
    <div className="flex-1 h-full from-background via-muted/10 to-background border overflow-hidden flex flex-col">
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden relative">
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="space-y-3">
            <h3 className="text-3xl font-semibold tracking-tight text-destructive">
              Error Loading Messages
            </h3>
            <p className="text-muted-foreground/80 max-w-md mx-auto text-lg">
              {error}
            </p>
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
