
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YouTubePlayer } from "@/components/content-hub/youtube-player";

interface YouTubePlayerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
}

export function YouTubePlayerModal({ isOpen, onOpenChange, url }: YouTubePlayerModalProps) {
  // A simple item structure for the YouTubePlayer component
  const item = {
    youtubeUrl: url,
    title: "Video Replay",
    type: "podcast",
    id: 'replay-modal'
  } as any;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 border-0 bg-transparent">
        <div className="aspect-video">
          {isOpen && <YouTubePlayer item={item} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
