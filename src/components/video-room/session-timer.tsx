
"use client";

import { Clock } from 'lucide-react';

export function SessionTimer({ time }: { time: number }) {
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm font-semibold">{formatTime(time)}</span>
        </div>
    );
}
