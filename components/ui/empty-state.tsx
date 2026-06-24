// components/ui/empty-state.tsx
import { Film, Upload } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4 text-center">
      <Film className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">No videos yet</h2>
      <p className="text-muted-foreground max-w-sm">
        Be the first to upload a short video and share it with the community!
      </p>
      <Link href="/upload">
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload your first video
        </Button>
      </Link>
    </div>
  );
}