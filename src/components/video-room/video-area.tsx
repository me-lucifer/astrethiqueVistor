
"use client";

import { motion } from "framer-motion";
import { VideoPlaceholder } from "./video-placeholder";
import { cn } from "@/lib/utils";

export function VideoArea({ isSidePanelOpen }: { isSidePanelOpen: boolean }) {
    return (
        <div className={cn("relative flex-1 bg-black transition-all duration-300", isSidePanelOpen && "lg:mr-[350px]")}>
            {/* Remote Video */}
            <VideoPlaceholder name="Consultant" />

            {/* Local Video (PIP) */}
            <motion.div
                drag
                dragMomentum={false}
                className="absolute bottom-4 right-4 w-40 h-32 md:w-56 md:h-44 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg cursor-grab active:cursor-grabbing z-20"
            >
                <VideoPlaceholder name="You" isMuted />
            </motion.div>
        </div>
    );
}
