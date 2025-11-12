
"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface SidePanelProps {
  isOpen: boolean;
}

export function SidePanel({ isOpen }: SidePanelProps) {
  return (
    <aside
      className={cn(
        "absolute top-16 bottom-0 right-0 z-10 w-full max-w-[350px] bg-background/30 border-l border-border/50 backdrop-blur-xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
        <Tabs defaultValue="notes" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent pt-2 px-2 border-b border-border/50">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
                <TabsContent value="notes" className="p-4">
                    <Textarea className="h-full min-h-[calc(100vh-200px)] bg-transparent border-0 focus-visible:ring-0" placeholder="Type your private notes here..."/>
                </TabsContent>
                <TabsContent value="chat" className="p-4 text-center text-sm text-muted-foreground">
                    Chat with the consultant during the session. (UI Placeholder)
                </TabsContent>
                <TabsContent value="resources" className="p-4 text-center text-sm text-muted-foreground">
                    Links and resources shared by the consultant will appear here. (UI Placeholder)
                </TabsContent>
            </div>
        </Tabs>
    </aside>
  );
}
