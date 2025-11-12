
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Channels = {
    email: boolean;
    push: boolean;
    sms: boolean;
}

interface NotificationPreferences {
    general: {
        tips: { enabled: boolean; channels: Channels };
        announcements: { enabled: boolean; channels: Channels };
    };
    sessions: {
        reminders: { enabled: boolean; channels: Channels; times: { '24h': boolean; '1h': boolean; '10m': boolean } };
        conferences: { enabled: boolean; channels: Channels };
    };
    wallet: {
        lowBalance: { enabled: boolean; channels: Channels; threshold: number };
        budget80: { enabled: boolean; channels: Channels };
        budgetReached: { enabled: boolean; channels: Channels };
        summary: { enabled: boolean; channels: Channels };
    }
}

const defaultPreferences: NotificationPreferences = {
    general: {
        tips: { enabled: true, channels: { email: true, push: false, sms: false } },
        announcements: { enabled: false, channels: { email: true, push: false, sms: false } },
    },
    sessions: {
        reminders: { enabled: true, channels: { email: true, push: true, sms: false }, times: { '24h': true, '1h': true, '10m': false } },
        conferences: { enabled: true, channels: { email: true, push: true, sms: false } },
    },
    wallet: {
        lowBalance: { enabled: true, channels: { email: true, push: false, sms: false }, threshold: 5 },
        budget80: { enabled: true, channels: { email: true, push: false, sms: false } },
        budgetReached: { enabled: true, channels: { email: true, push: true, sms: false } },
        summary: { enabled: true, channels: { email: true, push: false, sms: false } },
    }
};

const ChannelSelector = ({ channels, onChannelChange }: { channels: Channels, onChannelChange: (channel: keyof Channels) => void }) => (
    <div className="flex items-center gap-2 mt-2">
        <Badge variant={channels.email ? "secondary" : "outline"} onClick={() => onChannelChange('email')}>Email</Badge>
        <Badge variant={channels.push ? "secondary" : "outline"} onClick={() => onChannelChange('push')}>Push</Badge>
        <Badge variant={channels.sms ? "secondary" : "outline"} onClick={() => onChannelChange('sms')}>SMS</Badge>
    </div>
);


export default function PreferencesPage() {
    const { toast } = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

    useEffect(() => {
        const currentUser = authLocal.getCurrentUser();
        if (currentUser && currentUser.preferences) {
            // Deep merge to ensure new properties are added to old user objects
            const userPrefs = currentUser.preferences as NotificationPreferences;
            const mergedPrefs = {
                general: { ...defaultPreferences.general, ...userPrefs.general },
                sessions: { ...defaultPreferences.sessions, ...userPrefs.sessions },
                wallet: { ...defaultPreferences.wallet, ...userPrefs.wallet },
            }
            setPreferences(mergedPrefs);
        } else {
            setPreferences(defaultPreferences);
        }
    }, []);

    const handleToggle = (path: string, value: boolean) => {
        const keys = path.split('.');
        setPreferences(prev => {
            const newPrefs = JSON.parse(JSON.stringify(prev)); // Deep copy to prevent mutation
            let current: any = newPrefs;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newPrefs;
        });
    };
    
    const handleChannelChange = (path: string, channel: keyof Channels) => {
        const keys = path.split('.');
        setPreferences(prev => {
            const newPrefs = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newPrefs;
            keys.forEach(key => {
                current = current[key];
            });
            current.channels[channel] = !current.channels[channel];
            return newPrefs;
        });
    };

    const handleReminderTimeChange = (time: '24h' | '1h' | '10m') => {
        setPreferences(prev => {
            const newPrefs = JSON.parse(JSON.stringify(prev));
            newPrefs.sessions.reminders.times[time] = !newPrefs.sessions.reminders.times[time];
            return newPrefs;
        });
    };


    const handleSaveChanges = () => {
        const currentUser = authLocal.getCurrentUser();
        if (!currentUser) return;
        
        authLocal.updateUser(currentUser.id, { preferences: preferences } as Partial<authLocal.User>);

        toast({
            title: "Preferences saved",
            description: "Your notification settings have been updated.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how we communicate with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* General Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">General</h3>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="tips" className="font-medium">Tips & Updates</Label>
                                <p className="text-sm text-muted-foreground">Receive occasional emails about new features and content.</p>
                            </div>
                            <Switch id="tips" checked={preferences.general.tips.enabled} onCheckedChange={(c) => handleToggle('general.tips.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.general.tips.channels} onChannelChange={(c) => handleChannelChange('general.tips', c)} />
                    </div>
                     <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="announcements" className="font-medium">Product announcements</Label>
                                <p className="text-sm text-muted-foreground">Get notified about major new features and platform news.</p>
                            </div>
                            <Switch id="announcements" checked={preferences.general.announcements.enabled} onCheckedChange={(c) => handleToggle('general.announcements.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.general.announcements.channels} onChannelChange={(c) => handleChannelChange('general.announcements', c)} />
                    </div>
                </div>

                <Separator />

                {/* Sessions & Events Section */}
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Sessions & Events</h3>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="session-reminders" className="font-medium">Session Reminders</Label>
                                <p className="text-sm text-muted-foreground">Get notified before a scheduled session starts.</p>
                            </div>
                            <Switch id="session-reminders" checked={preferences.sessions.reminders.enabled} onCheckedChange={(c) => handleToggle('sessions.reminders.enabled', c)} />
                        </div>
                         <div className="flex items-center gap-2 mt-3">
                            <Badge variant={preferences.sessions.reminders.times['24h'] ? "secondary" : "outline"} onClick={() => handleReminderTimeChange('24h')}>24h before</Badge>
                            <Badge variant={preferences.sessions.reminders.times['1h'] ? "secondary" : "outline"} onClick={() => handleReminderTimeChange('1h')}>1h before</Badge>
                            <Badge variant={preferences.sessions.reminders.times['10m'] ? "secondary" : "outline"} onClick={() => handleReminderTimeChange('10m')}>10m before</Badge>
                        </div>
                        <ChannelSelector channels={preferences.sessions.reminders.channels} onChannelChange={(c) => handleChannelChange('sessions.reminders', c)} />
                    </div>
                     <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="conference-reminders" className="font-medium">Conference Reminders</Label>
                                <p className="text-sm text-muted-foreground">Get notified about upcoming conferences you RSVP'd to.</p>
                            </div>
                            <Switch id="conference-reminders" checked={preferences.sessions.conferences.enabled} onCheckedChange={(c) => handleToggle('sessions.conferences.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.sessions.conferences.channels} onChannelChange={(c) => handleChannelChange('sessions.conferences', c)} />
                    </div>
                </div>

                <Separator />
                
                {/* Wallet & Budget Section */}
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Wallet & Budget</h3>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="low-balance" className="font-medium flex items-center gap-2">
                                    Low balance alert
                                    <Badge variant="outline" className="cursor-pointer">€{preferences.wallet.lowBalance.threshold}</Badge>
                                </Label>
                                <p className="text-sm text-muted-foreground">Notify me when my wallet balance is low.</p>
                            </div>
                            <Switch id="low-balance" checked={preferences.wallet.lowBalance.enabled} onCheckedChange={(c) => handleToggle('wallet.lowBalance.enabled', c)} />
                        </div>
                         <ChannelSelector channels={preferences.wallet.lowBalance.channels} onChannelChange={(c) => handleChannelChange('wallet.lowBalance', c)} />
                    </div>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="budget-80" className="font-medium">Budget at 80% used</Label>
                                <p className="text-sm text-muted-foreground">Get an alert when you're approaching your monthly limit.</p>
                            </div>
                            <Switch id="budget-80" checked={preferences.wallet.budget80.enabled} onCheckedChange={(c) => handleToggle('wallet.budget80.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.wallet.budget80.channels} onChannelChange={(c) => handleChannelChange('wallet.budget80', c)} />
                    </div>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="budget-reached" className="font-medium">Budget reached / Wallet locked</Label>
                                <p className="text-sm text-muted-foreground">Instant alert when your monthly budget is hit.</p>
                            </div>
                            <Switch id="budget-reached" checked={preferences.wallet.budgetReached.enabled} onCheckedChange={(c) => handleToggle('wallet.budgetReached.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.wallet.budgetReached.channels} onChannelChange={(c) => handleChannelChange('wallet.budgetReached', c)} />
                    </div>
                    <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="monthly-summary" className="font-medium">Monthly spend summary</Label>
                                <p className="text-sm text-muted-foreground">Receive a summary of your spending at the end of each month.</p>
                            </div>
                            <Switch id="monthly-summary" checked={preferences.wallet.summary.enabled} onCheckedChange={(c) => handleToggle('wallet.summary.enabled', c)} />
                        </div>
                        <ChannelSelector channels={preferences.wallet.summary.channels} onChannelChange={(c) => handleChannelChange('wallet.summary', c)} />
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
