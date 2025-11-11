
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getLocal, setLocal, removeLocal } from "@/lib/local";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { YouTubePlayerModal } from "@/components/youtube-player-modal";
import { cn } from "@/lib/utils";
import { Calendar, Video as VideoIcon, MoreHorizontal, EyeOff, Eye, Download, Mail, RefreshCcw } from "lucide-react";
import * as ics from "ics";
import { saveAs } from "file-saver";
import { addMinutes } from "date-fns";
import type { ActivityData, ActivityItem, ActivityReplay, ActivityMeta } from "@/lib/activity";
import { seedActivityData, toRelativeTime, isJoinOpen, migratePastEvents } from "@/lib/activity";

// --- Helper hook for countdown ---
function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();
      
      const fifteenMinutes = 15 * 60 * 1000;

      if (diff <= 0) {
        setCountdown("Now");
        return;
      }
      
      if (diff <= fifteenMinutes) {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2,"0")}`);
          return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setCountdown(`${days}d ${hours}h`);
      else if (hours > 0) setCountdown(`${hours}h ${minutes}m`);
      else setCountdown(`${minutes}m`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
}


// --- Sub-components ---
interface ActivityRowUpcomingProps {
    item: ActivityItem;
    onHide: (id: string) => void;
    onAddToCalendar: (item: ActivityItem) => void;
}

function ActivityRowUpcoming({ item, onHide, onAddToCalendar }: ActivityRowUpcomingProps) {
    const countdown = useCountdown(item.startISO);
    const joinable = isJoinOpen(item.startISO);
    const relativeTime = toRelativeTime(item.startISO);
    const date = new Date(item.startISO);
    const hoursUntilStart = (date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    return (
        <Card className="p-4 flex items-start gap-4 bg-card/50 rounded-lg transition-transform hover:-translate-y-0.5 duration-150">
            <Calendar className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="flex-1 space-y-1">
                <p className="font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                    {relativeTime} • {item.length} • Host: {item.host}
                </p>
                <div className="flex gap-2 pt-1">
                    {!joinable && <Badge variant="outline" className="text-xs font-normal">Starts in {countdown}</Badge>}
                    {hoursUntilStart > 0 && hoursUntilStart <= 1 && <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">Starting soon</Badge>}
                    {hoursUntilStart > 1 && hoursUntilStart <= 24 && <Badge variant="outline" className="font-normal text-xs">Soon</Badge>}
                </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                {joinable ? (
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
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => onAddToCalendar(item)}><Download className="h-3 w-3 mr-1" />Add to calendar</Button>
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

interface ActivityRowReplayProps {
    item: ActivityReplay;
    isWatched: boolean;
    onWatchReplay: (item: ActivityReplay) => void;
    onMarkWatched: (id: string) => void;
    onHide: (id: string) => void;
}

function ActivityRowReplay({ item, isWatched, onWatchReplay, onMarkWatched, onHide }: ActivityRowReplayProps) {
    const relativeTime = toRelativeTime(item.recordedISO);
    return (
        <Card className={cn("p-4 flex items-start gap-4 bg-card/50 rounded-lg transition-transform hover:-translate-y-0.5 duration-150", isWatched && "opacity-60")}>
            <VideoIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="flex-1 space-y-1">
                <p className="font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                    {item.duration} • Host: {item.host} • {relativeTime}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Button size="sm" onClick={() => onWatchReplay(item)}>Watch recording</Button>
                <div className="flex items-center">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" asChild><Link href="/conferences">Details</Link></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onMarkWatched(item.id)}>{isWatched ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}{isWatched ? 'Mark as unwatched' : 'Mark as watched'}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onHide(item.id)}><EyeOff className="mr-2 h-4 w-4" />Hide</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Card>
    );
}


// --- MAIN COMPONENT ---

export function ActivityTab() {
  const [activities, setActivities] = useState<ActivityData>({ upcoming: [], replays: [] });
  const [activityMeta, setActivityMeta] = useState<ActivityMeta>({ hidden: [], watched: {} });
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllReplays, setShowAllReplays] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  const processActivities = useCallback(() => {
    let data = getLocal<ActivityData>("ast.activity");
    if (!data) {
        data = seedActivityData();
    }
    const meta = getLocal<ActivityMeta>("ast.activityMeta") || { hidden: [], watched: {} };
    
    const migratedData = migratePastEvents(data);

    setActivityMeta(meta);

    const visibleUpcoming = migratedData.upcoming.filter(item => !meta.hidden.includes(item.id));
    const visibleReplays = migratedData.replays.filter(item => !meta.hidden.includes(item.id));
    
    setActivities({
      upcoming: visibleUpcoming.sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()),
      replays: visibleReplays.sort((a, b) => new Date(b.recordedISO).getTime() - new Date(a.recordedISO).getTime()),
    });
  }, []);

  useEffect(() => {
    processActivities();
    window.addEventListener('storage', processActivities);
    return () => window.removeEventListener('storage', processActivities);
  }, [processActivities]);

  const updateMeta = (newMeta: Partial<ActivityMeta>) => {
    const currentMeta = getLocal<ActivityMeta>("ast.activityMeta") || { hidden: [], watched: {} };
    const updated = { ...currentMeta, ...newMeta };
    setLocal("ast.activityMeta", updated);
    processActivities();
  };
  
  const handleResetDemo = () => {
    removeLocal("ast.activity");
    removeLocal("ast.activityMeta");
    processActivities();
  }

  const handleHide = (id: string) => updateMeta({ hidden: [...new Set([...activityMeta.hidden, id])] });

  const handleMarkWatched = (id: string) => {
    const newWatched = { ...activityMeta.watched };
    if (newWatched[id]) delete newWatched[id];
    else newWatched[id] = new Date().toISOString();
    updateMeta({ watched: newWatched });
  };

  const handleAddToCalendar = (item: ActivityItem) => {
    const start = new Date(item.startISO);
    const end = addMinutes(start, parseInt(item.length));
    const event: ics.EventAttributes = {
      title: item.title,
      description: `Host: ${item.host} • Platform: ${item.platform}`,
      start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
      end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
      url: item.joinUrl,
    };
    ics.createEvent(event, (error, value) => {
      if (error) { console.error(error); return; }
      saveAs(new Blob([value], { type: "text/calendar;charset=utf-8" }), `${item.title.replace(/ /g, "_")}.ics`);
    });
  };

  const handleWatchReplay = (item: ActivityReplay) => {
    if (isDesktop) {
      setPlayerUrl(item.watchUrl);
      setIsPlayerOpen(true);
    } else {
      window.open(item.watchUrl, "_blank");
    }
    if (!activityMeta.watched[item.id]) {
      handleMarkWatched(item.id);
    }
  };

  const visibleUpcoming = showAllUpcoming ? activities.upcoming : activities.upcoming.slice(0, 3);
  const visibleReplays = showAllReplays ? activities.replays : activities.replays.slice(0, 3);
  
  if (activities.upcoming.length === 0 && activities.replays.length === 0) {
    return (
        <CardContent className="pt-6">
            <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <Mail className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No recent activity yet.</h3>
                <p className="text-muted-foreground mt-1 mb-4 text-sm">Register for a conference to see it here.</p>
                <Button asChild>
                    <Link href="/conferences">Browse Conferences</Link>
                </Button>
            </div>
        </CardContent>
    )
  }
  
  return (
    <>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {activities.upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Upcoming</h4>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{activities.upcoming.length}</Badge>
                </div>
                {isDev && <Button variant="link" size="sm" className="text-xs" onClick={handleResetDemo}><RefreshCcw className="h-3 w-3 mr-1"/>Reset demo activity</Button>}
              </div>
              <div className="space-y-2">
                {visibleUpcoming.map((item) => (
                    <ActivityRowUpcoming 
                        key={item.id}
                        item={item}
                        onHide={handleHide}
                        onAddToCalendar={handleAddToCalendar}
                    />
                ))}
              </div>
              {activities.upcoming.length > 3 && (
                <div className="text-center">
                    <Button variant="link" onClick={() => setShowAllUpcoming(!showAllUpcoming)}>
                        {showAllUpcoming ? 'Show less' : 'View all'}
                    </Button>
                </div>
              )}
            </div>
          )}
          
          {activities.replays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Replays</h4>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{activities.replays.length}</Badge>
              </div>
              <div className="space-y-2">
                {visibleReplays.map((item) => (
                    <ActivityRowReplay
                        key={item.id}
                        item={item}
                        isWatched={!!activityMeta.watched[item.id]}
                        onWatchReplay={handleWatchReplay}
                        onMarkWatched={handleMarkWatched}
                        onHide={handleHide}
                    />
                ))}
              </div>
               {activities.replays.length > 3 && (
                <div className="text-center">
                    <Button variant="link" onClick={() => setShowAllReplays(!showAllReplays)}>
                        {showAllReplays ? 'Show less' : 'View all'}
                    </Button>
                </div>
              )}
            </div>
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
