
"use client";

import { Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = (id: string) => {
        markAsRead(id);
    };
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-reduce:animate-none"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary/80"></span>
                        </span>
                    )}
                    <span className="sr-only">Open notifications</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[440px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id)}
                                    className={cn(
                                        "p-3 rounded-lg transition-colors cursor-pointer flex gap-4 items-start",
                                        notification.read ? "bg-transparent hover:bg-muted/50" : "bg-primary/10 hover:bg-primary/20"
                                    )}
                                >
                                    <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", !notification.read ? "bg-primary" : "bg-transparent")} />
                                    <div className="grid gap-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                            <Mail className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold text-lg">No new notifications</h3>
                       </div>
                    )}
                </div>
                 {notifications.length > 0 && unreadCount > 0 && (
                    <SheetFooter className="border-t pt-4">
                        <Button variant="outline" onClick={markAllAsRead} className="w-full">
                           Mark all as read
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
