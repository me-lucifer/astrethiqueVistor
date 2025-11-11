
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";

export default function PreferencesPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const currentUser = authLocal.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleMarketingOptInChange = (checked: boolean) => {
        if (!user) return;
        const updatedUser = { ...user, marketingOptIn: checked, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
    };

    const handleSaveChanges = () => {
        if (!user) return;
        
        authLocal.updateUser(user);

        toast({
            title: "Preferences saved",
            description: "Your notification settings have been updated.",
        });
    };
    
    if (!user) {
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
                        checked={user.marketingOptIn}
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
