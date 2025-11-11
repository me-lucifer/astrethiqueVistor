
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as storage from "@/lib/storage";

export default function PreferencesPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<storage.User | null>(null);
    const [prefs, setPrefs] = useState<storage.Preferences | null>(null);

    useEffect(() => {
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            const allPrefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
            setPrefs(allPrefs[currentUser.id] || null);
        }
    }, []);

    const handleMarketingOptInChange = (checked: boolean) => {
        if (!user || !prefs) return;
        const newPrefs = { ...prefs, marketingOptIn: checked };
        setPrefs(newPrefs);
    };

    const handleSaveChanges = () => {
        if (!user || !prefs) return;
        
        const allPrefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        allPrefs[user.id] = prefs;
        storage.setStorageItem('ast_prefs', allPrefs);

        toast({
            title: "Preferences saved",
            description: "Your notification settings have been updated.",
        });
    };
    
    if (!user || !prefs) {
        return <div>Loading preferences...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how we communicate with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="marketing-opt-in" className="font-medium">Tips & Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive occasional emails about new features and content.</p>
                    </div>
                    <Switch
                        id="marketing-opt-in"
                        checked={prefs.marketingOptIn}
                        onCheckedChange={handleMarketingOptInChange}
                    />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 opacity-60">
                    <div>
                        <Label htmlFor="session-reminders" className="font-medium">Session Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get notified before a scheduled session starts.</p>
                    </div>
                    <Switch id="session-reminders" checked disabled />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 opacity-60">
                    <div>
                        <Label htmlFor="conference-reminders" className="font-medium">Conference Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming conferences you RSVP'd to.</p>
                    </div>
                    <Switch id="conference-reminders" checked disabled />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
