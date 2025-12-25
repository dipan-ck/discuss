import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-4 w-4 animate-spin" }) {
  return <Loader2 className={className} />;
}
