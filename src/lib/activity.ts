
export interface ActivityItem {
  id: string;
  title: string;
  host: string;
  startISO: string;
  length: string;
  platform: string;
  joinUrl: string;
  cover: string;
}

export interface ActivityReplay {
  id: string;
  title: string;
  host: string;
  recordedISO: string;
  duration: string;
  watchUrl: string;
  cover: string;
}

export interface ActivityData {
  upcoming: ActivityItem[];
  replays: ActivityReplay[];
}
