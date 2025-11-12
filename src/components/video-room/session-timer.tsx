
"use client";

import { Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

export function SessionTimer({ time }: { time: number }) {
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <Badge variant="outline" className="flex items-center gap-2 font-mono text-sm font-semibold h-9">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{formatTime(time)}</span>
        </Badge>
    );
}
