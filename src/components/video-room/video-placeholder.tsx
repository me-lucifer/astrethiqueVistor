
"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlaceholderProps {
    name: string;
    isMuted?: boolean;
}

export function VideoPlaceholder({ name, isMuted = false }: VideoPlaceholderProps) {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-1/4 w-1/4 text-muted-foreground/50" />
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {name}
                {isMuted && <span className="ml-2"> (Muted)</span>}
            </div>
        </div>
    );
}
