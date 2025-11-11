
import { setLocal, getLocal } from './local';
import { isFuture, addMinutes, differenceInMinutes, isToday, isTomorrow, isYesterday, differenceInDays } from "date-fns";

// --- TYPES ---

export interface ActivityItem {
  id: string;
  title: string;
  host: string;
  startISO: string;
  length: string; // e.g., "60 min"
  platform: string;
  joinUrl: string;
  cover: string;
}

export interface ActivityReplay {
  id: string;
  title: string;
  host: string;
  recordedISO: string;
  duration: string; // e.g., "40 min"
  watchUrl: string;
  cover: string;
}

export interface ActivityData {
  upcoming: ActivityItem[];
  replays: ActivityReplay[];
}

export interface ActivityMeta {
  hidden: string[];
  watched: { [key: string]: string }; // id: ISO timestamp
}


// --- SEEDING ---

export function seedActivityData(): ActivityData {
    const now = new Date();
    const data: ActivityData = {
        upcoming: [
        {
            id: "conf-modern-love",
            title: "Astrology for Modern Love",
            host: "Kaelen Vance",
            startISO: addMinutes(now, 5).toISOString(), // Starts in 5 mins for testing
            length: "60 min",
            platform: "Zoom",
            joinUrl: "https://zoom.example/modern-love",
            cover: "/images/conf-modern-love.jpg"
        },
        {
            id: "conf-saturn-returns",
            title: "Navigating Saturn Returns",
            host: "Fiona Glen",
            startISO: addMinutes(now, 120).toISOString(), // Starts in 2 hours
            length: "45 min",
            platform: "Google Meet",
            joinUrl: "https://meet.example/saturn-returns",
            cover: "/images/conf-saturn.jpg"
        }
        ],
        replays: [
        {
            id: "conf-future-of-tarot",
            title: "The Future of Tarot",
            host: "Orion Blackwood",
            recordedISO: "2025-11-10T17:30:00+05:30",
            duration: "40 min",
            watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rickroll for demo
            cover: "/images/conf-future-tarot.jpg"
        },
        // This is a replay for an event that just finished, for migration testing
        {
            id: "conf-past-event",
            title: "Past Event with Replay",
            host: "Aeliana Rose",
            recordedISO: addMinutes(now, -90).toISOString(),
            duration: "60 min",
            watchUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            cover: "/images/conf-past-event.jpg"
        }
        ]
    };
    setLocal('ast.activity', data);
    return data;
}

// --- UNIT HELPERS ---

/**
 * Checks if an event is currently joinable.
 * @param startISO - The ISO string of the event's start time.
 * @param leadMinutes - How many minutes before the start time the event becomes joinable.
 * @returns boolean - True if the event is joinable.
 */
export function isJoinOpen(startISO: string, leadMinutes: number = 15): boolean {
    const now = new Date();
    const startTime = new Date(startISO);
    const diff = differenceInMinutes(startTime, now);
    // Joinable if it's within the lead time (e.g., -15 mins) and hasn't ended (assuming a long enough duration for simplicity)
    return diff <= leadMinutes;
}

/**
 * Converts an ISO date string to a user-friendly relative time string.
 * @param isoString - The ISO date string to format.
 * @returns string - The formatted relative time string.
 */
export function toRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();

    if (isToday(date)) return `Today at ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    if (isTomorrow(date)) return `Tomorrow at ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    if (isYesterday(date)) return "Yesterday";
    
    const diffDays = differenceInDays(date, now);
    if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}


/**
 * Migrates past events from 'upcoming' to 'replays' if a replay is available.
 * @param activity - The full activity data object.
 * @returns ActivityData - The updated activity data object.
 */
export function migratePastEvents(activity: ActivityData): ActivityData {
    if (!activity) return { upcoming: [], replays: [] };
    
    const now = new Date();
    const allReplaysById = new Map(activity.replays.map(r => [r.id, r]));

    const stillUpcoming: ActivityItem[] = [];
    const newlyCompletedReplays: ActivityReplay[] = [];

    activity.upcoming.forEach(item => {
        const endTime = addMinutes(new Date(item.startISO), parseInt(item.length));
        if (isFuture(endTime)) {
            stillUpcoming.push(item);
        } else {
            // Event has ended, check if a replay exists
            if (allReplaysById.has(item.id)) {
                newlyCompletedReplays.push(allReplaysById.get(item.id)!);
            }
        }
    });

    // Combine newly completed replays with existing ones, avoiding duplicates
    const combinedReplays = [...activity.replays];
    newlyCompletedReplays.forEach(newReplay => {
        if (!combinedReplays.some(existing => existing.id === newReplay.id)) {
            combinedReplays.push(newReplay);
        }
    });

    return {
        upcoming: stillUpcoming,
        replays: combinedReplays
    };
}
