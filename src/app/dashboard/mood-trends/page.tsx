
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocal } from "@/lib/local";
import { MoodLogEntry } from "@/lib/mood-log";
import { subDays, format } from "date-fns";
import { MoodChart } from "./mood-chart";
import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { LineChart } from "lucide-react";
import * as authLocal from "@/lib/authLocal";

type TimeRange = "7d" | "30d" | "90d";

export default function MoodTrendsPage() {
  const router = useRouter();
  const [log, setLog] = useState<MoodLogEntry[]>([]);
  const [range, setRange] = useState<TimeRange>("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLocal.getCurrentUser()) {
        router.push('/dashboard');
        return;
    }
    const moodLog = getLocal<MoodLogEntry[]>("ast_mood_log") || [];
    setLog(moodLog);
    setLoading(false);
  }, [router]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let days: number;
    switch (range) {
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "7d":
      default:
        days = 7;
        break;
    }

    const startDate = subDays(now, days - 1);
    startDate.setHours(0, 0, 0, 0);

    // Filter log for the selected range
    const rangeLog = log.filter(entry => new Date(entry.dateISO) >= startDate);
    
    // Create a map of dates in the range
    const dateMap = new Map<string, MoodLogEntry | null>();
    for (let i = 0; i < days; i++) {
        const date = subDays(now, i);
        const formattedDate = format(date, "yyyy-MM-dd");
        dateMap.set(formattedDate, null);
    }

    // Populate the map with actual log entries
    rangeLog.forEach(entry => {
        const formattedDate = format(new Date(entry.dateISO), "yyyy-MM-dd");
        if (dateMap.has(formattedDate)) {
            dateMap.set(formattedDate, entry);
        }
    });

    // Convert map to array and format for the chart
    const chartData = Array.from(dateMap.entries()).map(([dateStr, entry]) => ({
      date: format(new Date(dateStr), "MMM d"),
      ...entry,
    })).reverse(); // Reverse to show oldest to newest

    return chartData;
  }, [log, range]);
  
  if (loading) {
      return <PlaceholderPage title="Loading Mood Trends..." />;
  }
  
  if (log.length === 0) {
    return (
        <div className="container py-16 text-center">
            <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
             <h1 className="mt-4 font-headline text-2xl font-bold">No mood data recorded yet.</h1>
             <p className="mt-2 text-muted-foreground">Log today’s mood on your dashboard to start seeing your trends.</p>
             <Button asChild className="mt-4">
                <Link href="/dashboard">Back to Dashboard</Link>
             </Button>
        </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Mood Trends
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl">
          Visualize your well-being over time across key areas of your life.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Your Mood Over Time</CardTitle>
                <CardDescription>Last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} days</CardDescription>
            </div>
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <Button size="sm" variant={range === '7d' ? "background" : "ghost"} onClick={() => setRange("7d")}>7 Days</Button>
              <Button size="sm" variant={range === '30d' ? "background" : "ghost"} onClick={() => setRange("30d")}>30 Days</Button>
              <Button size="sm" variant={range === '90d' ? "background" : "ghost"} onClick={() => setRange("90d")}>90 Days</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MoodChart data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
