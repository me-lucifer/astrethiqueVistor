
"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn, formatTimestamp } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSessionTimer } from "@/hooks/use-session-timer";
import { Lock, Pin, Trash2, FileDown, Book, Plus, Tag, Clock } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "../ui/tooltip";


interface Note {
    id: number;
    content: string;
    timestamp: number;
    tags: string[];
    isPinned: boolean;
}

interface SidePanelProps {
  isOpen: boolean;
}

const NoteComposer = ({ onSave }: { onSave: (note: Omit<Note, 'id' | 'isPinned'>) => void }) => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const { time: sessionTime } = useSessionTimer();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === '/') {
            // Placeholder for a more robust slash-command menu
            console.log("Slash command triggered");
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.endsWith('/timestamp')) {
            const newContent = value.replace('/timestamp', `[${formatTimestamp(sessionTime)}] `);
            setContent(newContent);
        } else if (value.includes('/tag ')) {
            const newContent = value.replace(/\/tag\s(\S+)\s?/, (_, newTag) => {
                if (!tags.includes(newTag)) {
                    setTags(prev => [...prev, newTag]);
                }
                return '';
            });
            setContent(newContent);
        }
        else {
            setContent(value);
        }
    };

    const handleSave = () => {
        if (content.trim() === '') return;
        onSave({ content, timestamp: sessionTime, tags });
        setContent('');
        setTags([]);
    };

    return (
        <div className="space-y-2">
            <div className="p-2 border rounded-lg bg-background">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    className="w-full border-0 focus-visible:ring-0 resize-none p-1"
                    placeholder="Type your notes here... Use / to see commands"
                />
                <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-1 flex-wrap">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" onClick={() => setTags(t => t.filter(t1 => t1 !== tag))}>#{tag}</Badge>
                        ))}
                    </div>
                    <Button size="sm" onClick={handleSave} disabled={!content.trim()}>
                        <Plus className="h-4 w-4 mr-2" /> Add Note
                    </Button>
                </div>
            </div>
            <div className="text-xs text-muted-foreground flex gap-4 px-2">
                <span><Clock className="h-3 w-3 inline-block mr-1"/> /timestamp</span>
                <span><Tag className="h-3 w-3 inline-block mr-1"/> /tag [name]</span>
            </div>
        </div>
    )
}

const NotesPanel = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [saveStatus, setSaveStatus] = useState('Saved');
    const { toast } = useToast();

    useEffect(() => {
        // Simulate loading notes
        const savedNotes = [];
        if (savedNotes.length > 0) {
            setNotes(savedNotes);
        }
    }, []);
    
    useEffect(() => {
        // Simulate autosave
        const handler = setTimeout(() => {
            setSaveStatus(`Saved • ${formatDistanceToNow(new Date(), { addSuffix: true })}`);
        }, 3000);
        return () => clearTimeout(handler);
    }, [notes]);


    const addNote = (newNote: Omit<Note, 'id' | 'isPinned'>) => {
        setNotes(prev => [...prev, { ...newNote, id: Date.now(), isPinned: false }]);
        setSaveStatus('Saving...');
    };

    const deleteNote = (id: number) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };
    
    const togglePin = (id: number) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    };

    const handleExport = (type: 'Journal' | 'PDF') => {
        toast({
            title: "Export Started",
            description: `Your notes are being exported as a ${type}.`,
        });
    }

    const pinnedNotes = notes.filter(n => n.isPinned);
    const regularNotes = notes.filter(n => !n.isPinned);


    return (
        <div className="p-4 space-y-4">
             <div className="flex justify-between items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <h3 className="font-semibold text-sm flex items-center gap-2 cursor-help">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                Your Private Notes
                            </h3>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Only you can see these notes.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span className="text-xs text-muted-foreground">{saveStatus}</span>
             </div>

            <NoteComposer onSave={addNote} />

            <div className="space-y-3 pt-4">
                {pinnedNotes.map(note => (
                    <NoteCard key={note.id} note={note} onTogglePin={togglePin} onDelete={deleteNote} />
                ))}
                {regularNotes.map(note => (
                    <NoteCard key={note.id} note={note} onTogglePin={togglePin} onDelete={deleteNote} />
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground">
                    Your notes will appear here.
                </div>
            )}
            
            {notes.length > 0 && (
                 <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleExport('Journal')}><Book className="h-4 w-4 mr-2"/>Save to Journal</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><FileDown className="h-4 w-4 mr-2"/>Export PDF</Button>
                </div>
            )}
        </div>
    )
}

const NoteCard = ({ note, onTogglePin, onDelete }: { note: Note, onTogglePin: (id: number) => void, onDelete: (id: number) => void }) => {
    return (
        <div className={cn("p-3 rounded-lg border bg-background/50", note.isPinned && "border-primary/50 bg-primary/10")}>
            <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-xs font-mono cursor-pointer hover:bg-muted">
                    {formatTimestamp(note.timestamp)}
                </Badge>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onTogglePin(note.id)}>
                        <Pin className={cn("h-3.5 w-3.5", note.isPinned ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(note.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>
            <p className="text-sm mt-2">{note.content}</p>
            {note.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                    {note.tags.map(tag => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                </div>
            )}
        </div>
    )
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
                <TabsContent value="notes" className="mt-0">
                    <NotesPanel />
                </TabsContent>
                <TabsContent value="chat" className="p-4 text-center text-sm text-muted-foreground mt-0">
                    Chat with the consultant during the session. (UI Placeholder)
                </TabsContent>
                <TabsContent value="resources" className="p-4 text-center text-sm text-muted-foreground mt-0">
                    Links and resources shared by the consultant will appear here. (UI Placeholder)
                </TabsContent>
            </div>
        </Tabs>
    </aside>
  );
}
