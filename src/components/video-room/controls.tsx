
"use client";

import { Mic, MicOff, Video, VideoOff, NotepadText, PhoneOff } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useState, useEffect } from "react";

interface ControlsProps {
    onEndCall: () => void;
    isSidePanelOpen: boolean;
    onToggleNotes: () => void;
}

const ControlButton = ({ tooltip, hotkey, onClick, children, variant = "ghost", className = "" }: { tooltip: string, hotkey?: string, onClick?: () => void, children: React.ReactNode, variant?: "ghost" | "destructive", className?: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant={variant} size="icon" className={`w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white ${className}`} onClick={onClick} disabled={!onClick}>
                {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
            <p>{tooltip} {hotkey && <span className="ml-2 bg-background/50 border rounded-sm px-1.5 py-0.5 text-xs">{hotkey}</span>}</p>
        </TooltipContent>
    </Tooltip>
)

export function Controls({ onEndCall, isSidePanelOpen, onToggleNotes }: ControlsProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.key.toLowerCase() === 'm') setIsMuted(prev => !prev);
            if (e.key.toLowerCase() === 'c') setIsCameraOff(prev => !prev);
            if (e.key.toLowerCase() === 'n') onToggleNotes();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onToggleNotes]);

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center z-10">
            <TooltipProvider>
                <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/10">
                    <ControlButton tooltip={isMuted ? "Unmute" : "Mute"} hotkey="M" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </ControlButton>
                    <ControlButton tooltip={isCameraOff ? "Turn camera on" : "Turn camera off"} hotkey="C" onClick={() => setIsCameraOff(!isCameraOff)}>
                        {isCameraOff ? <VideoOff /> : <Video />}
                    </ControlButton>
                    
                    <ControlButton tooltip={isSidePanelOpen ? "Close notes panel" : "Open notes panel"} hotkey="N" onClick={onToggleNotes}>
                        <NotepadText className={isSidePanelOpen ? "text-primary" : ""} />
                    </ControlButton>

                    <div className="h-10 w-px bg-white/20 mx-2" />

                    <ControlButton tooltip="End Call" hotkey="Esc" onClick={onEndCall} variant="destructive" className="bg-destructive hover:bg-destructive/80">
                        <PhoneOff />
                    </ControlButton>
                </div>
            </TooltipProvider>
        </div>
    );
}
