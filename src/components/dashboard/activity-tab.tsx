
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, isToday, isYesterday, isPast, isFuture, differenceInMinutes, addMinutes, isTomorrow } from "date-fns";
import * as ics from "ics";
import { saveAs } from "file-saver";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getLocal, setLocal } from "@/lib/local";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { YouTubePlayerModal } from "@/components/youtube-player-modal";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Video as VideoIcon,
  MoreHorizontal,
  EyeOff,
  Eye,
  Download,
} from "lucide-react";
import type { ActivityData, ActivityItem, ActivityReplay } from "@/lib/activity";

// Helper hook for countdown
function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState("");
  const [isJoinable, setIsJoinable] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();
      
      const fifteenMinutes = 15 * 60 * 1000;

      if (diff <= fifteenMinutes) {
        setIsJoinable(true);
        if (diff <= 0) {
          setCountdown("Now");
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
              2,
              "0"
            )}`
          );
        }
        return;
      }

      setIsJoinable(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setCountdown(`${days}d ${hours}h`);
      else if (hours > 0) setCountdown(`${hours}h ${minutes}m`);
      else setCountdown(`${minutes}m`);
    };

    calculate();
    const interval = setInterval(calculate, 1000); // Update every second

    return () => clearInterval(interval);
  }, [targetDate]);

  return { countdown, isJoinable };
}

// Helper for date formatting
function formatRelativeDate(date: Date) {
  if (isToday(date)) return `Today at ${format(date, "p")}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "p")}`;
  if (isYesterday(date)) return "Yesterday";
  const diffDays = Math.ceil(differenceInMinutes(date, new Date()) / 1440);
  if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return format(date, "EEE, MMM dd · p");
}

// Props definitions
interface ActivityMeta {
  hidden: string[];
  watched: { [id: string]: string }; // id: watchedAt ISO string
}

interface ActivityRowUpcomingProps {
  item: ActivityItem;
  onAddToCalendar: (item: ActivityItem) => void;
  onHide: (id: string) => void;
}

interface ActivityRowReplayProps {
  item: ActivityReplay;
  isWatched: boolean;
  onWatchReplay: (item: ActivityReplay) => void;
  onMarkWatched: (id: string) => void;
  onHide: (id: string) => void;
}

// Standalone sub-components
function ActivityRowUpcoming({ item, onAddToCalendar, onHide }: ActivityRowUpcomingProps) {
  const { countdown, isJoinable } = useCountdown(item.startISO);
  const date = new Date(item.startISO);

  return (
    <Card className="p-4 flex items-start gap-4 bg-card/50">
        <Calendar className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div className="flex-1 space-y-1">
            <p className="font-semibold leading-tight">{item.title}</p>
            <p className="text-xs text-muted-foreground">
                {formatRelativeDate(date)} • {item.length} • Host: {item.host}
            </p>
            {!isJoinable && <Badge variant="outline" className="text-xs font-normal mt-1">Starts in {countdown}</Badge>}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isJoinable ? (
                <Button size="sm" asChild>
                    <a href={item.joinUrl} target="_blank" rel="noopener noreferrer">Join</a>
                </Button>
            ) : (
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild><span tabIndex={0}><Button size="sm" disabled>Join</Button></span></TooltipTrigger>
                      <TooltipContent><p>Join available 15 minutes before start.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            )}
            <div className="flex items-center">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => onAddToCalendar(item)}><Download className="h-3 w-3 mr-1" />Add to calendar</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onHide(item.id)}><EyeOff className="mr-2 h-4 w-4" />Hide</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </Card>
  );
}

function ActivityRowReplay({ item, isWatched, onWatchReplay, onMarkWatched, onHide }: ActivityRowReplayProps) {
  const date = new Date(item.recordedISO);
  return (
    <Card className={cn("p-4 flex items-start gap-4 bg-card/50", isWatched && "opacity-60")}>
        <VideoIcon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div className="flex-1 space-y-1">
            <p className="font-semibold leading-tight">{item.title}</p>
            <p className="text-xs text-muted-foreground">
                {item.duration} • Host: {item.host} • {formatDistanceToNow(date, { addSuffix: true })}
            </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Button size="sm" onClick={() => onWatchReplay(item)}>Watch recording</Button>
            <div className="flex items-center">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild><Link href="/conferences">Details</Link></Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onMarkWatched(item.id)}>{isWatched ? <Eye className="mr-2 h-4 w-4" />Mark as unwatched : <EyeOff className="mr-2 h-4 w-4" />Mark as watched}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onHide(item.id)}><EyeOff className="mr-2 h-4 w-4" />Hide</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </Card>
  );
}


export function ActivityTab() {
  const [activities, setActivities] = useState<{
    upcoming: ActivityItem[];
    replays: ActivityReplay[];
  }>({ upcoming: [], replays: [] });
  const [activityMeta, setActivityMeta] = useState<ActivityMeta>({
    hidden: [],
    watched: {},
  });
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const updateMeta = (newMeta: Partial<ActivityMeta>) => {
    const currentMeta = getLocal<ActivityMeta>("ast.activityMeta") || {
      hidden: [],
      watched: {},
    };
    const updated = { ...currentMeta, ...newMeta };
    setActivityMeta(updated);
    setLocal("ast.activityMeta", updated);
  };

  const handleHide = (id: string) => {
    const currentMeta = getLocal<ActivityMeta>("ast.activityMeta") || {
      hidden: [],
      watched: {},
    };
    updateMeta({ hidden: [...currentMeta.hidden, id] });
  };

  const handleMarkWatched = (id: string) => {
    const currentMeta = getLocal<ActivityMeta>("ast.activityMeta") || {
      hidden: [],
      watched: {},
    };
    const newWatched = { ...currentMeta.watched };
    if (newWatched[id]) {
      delete newWatched[id];
    } else {
      newWatched[id] = new Date().toISOString();
    }
    updateMeta({ watched: newWatched });
  };

  const handleAddToCalendar = (item: ActivityItem) => {
    const start = new Date(item.startISO);
    const end = addMinutes(start, parseInt(item.length));

    const event: ics.EventAttributes = {
      title: item.title,
      description: `Host: ${item.host}\nPlatform: ${item.platform}`,
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ],
      url: item.joinUrl,
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, `${item.title.replace(/ /g, "_")}.ics`);
    });
  };

  const handleWatchReplay = (item: ActivityReplay) => {
    if (isDesktop) {
      setPlayerUrl(item.watchUrl);
      setIsPlayerOpen(true);
    } else {
      window.open(item.watchUrl, "_blank");
    }
    // Mark as watched when replay is opened
    handleMarkWatched(item.id);
  };

  useEffect(() => {
    const data = getLocal<ActivityData>("ast.activity");
    const meta = getLocal<ActivityMeta>("ast.activityMeta") || {
      hidden: [],
      watched: {},
    };
    setActivityMeta(meta);

    if (data) {
      const now = new Date();
      
      const upcoming = data.upcoming
        .filter(item => {
          const endTime = addMinutes(new Date(item.startISO), parseInt(item.length));
          return isFuture(endTime) && !meta.hidden.includes(item.id);
        })
        .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());

      // Find events from 'upcoming' that are now in the past
      const completedEvents = data.upcoming
        .filter(item => {
          const endTime = addMinutes(new Date(item.startISO), parseInt(item.length));
          return isPast(endTime);
        });

      // Get replay info for these completed events
      const completedReplays = completedEvents
        .map(item => data.replays.find(r => r.id === item.id))
        .filter((r): r is ActivityReplay => !!r);

      // Combine with other replays, filter out hidden ones and duplicates
      const allReplays = [...data.replays.filter(r => !completedEvents.some(c => c.id === r.id)), ...completedReplays]
        .filter(item => !meta.hidden.includes(item.id))
        .sort((a, b) => new Date(b.recordedISO).getTime() - new Date(a.recordedISO).getTime());
            
      setActivities({ upcoming, replays: allReplays });
    }
  }, [activityMeta.hidden, activityMeta.watched]);


  return (
    <>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {activities.upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Upcoming</h4>
                <Badge variant="secondary">{activities.upcoming.length}</Badge>
              </div>
              <div className="space-y-2">
                {activities.upcoming.map((item) => (
                  <ActivityRowUpcoming
                    key={item.id}
                    item={item}
                    onAddToCalendar={handleAddToCalendar}
                    onHide={handleHide}
                  />
                ))}
              </div>
            </div>
          )}
          {activities.replays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Replays</h4>
                <Badge variant="secondary">{activities.replays.length}</Badge>
              </div>
              <div className="space-y-2">
                {activities.replays.map((item) => (
                  <ActivityRowReplay
                    key={item.id}
                    item={item}
                    onWatchReplay={handleWatchReplay}
                    onMarkWatched={handleMarkWatched}
                    onHide={handleHide}
                    isWatched={!!activityMeta.watched[item.id]}
                  />
                ))}
              </div>
            </div>
          )}
          {activities.upcoming.length === 0 &&
            activities.replays.length === 0 && (
              <p className="text-sm text-muted-foreground text-center p-4">
                No recent activity yet.
              </p>
            )}
        </div>
      </CardContent>
      <YouTubePlayerModal
        isOpen={isPlayerOpen}
        onOpenChange={setIsPlayerOpen}
        url={playerUrl}
      />
    </>
  );
}
