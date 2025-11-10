
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSession, setSession } from "@/lib/session";
import { Separator } from "../ui/separator";

const topicOptions = ["Love", "Work", "Health", "Money", "Life Path", "Astrology", "Tarot", "Numerology", "Spirituality", "Beginner", "Advanced"];
const typeOptions = [
    { value: 'all', label: 'Articles & Podcasts' },
    { value: 'article', label: 'Articles' },
    { value: 'podcast', label: 'Podcasts' },
];
const langOptions = [
    { value: 'all', label: 'EN & FR' },
    { value: 'EN', label: 'EN' },
    { value: 'FR', label: 'FR' },
];
const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'most_liked', label: 'Most Liked' },
];


type FilterProps = {
    query: string;
    setQuery: (q: string) => void;
    topics: string[];
    setTopics: (t: string[]) => void;
    type: string;
    setType: (t: string) => void;
    language: string;
    setLanguage: (l: string) => void;
    sort: string;
    setSort: (s: string) => void;
    authorFilter: string | null;
    setAuthorFilter: (a: string | null) => void;
    onReset: () => void;
}

export function ContentHubFilters({
    query, setQuery, topics, setTopics,
    type, setType, language, setLanguage, sort, setSort,
    authorFilter, setAuthorFilter, onReset
}: FilterProps) {

    const { toast } = useToast();

    const handleSaveSearch = () => {
        const currentFilters = { query, topics, type, language, sort };
        let savedSearches = getSession<any[]>("ch_saved_searches") || [];
        savedSearches.push(currentFilters);
        setSession("ch_saved_searches", savedSearches);
        toast({
            title: "Search saved",
            description: "You can find your saved searches in your profile.",
        });
    }

    const hasActiveFilters = query || topics.length > 0 || type !== 'all' || language !== 'all' || authorFilter;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search articles, podcasts, or authors…"
                        className="pl-10 h-11 text-base sm:text-sm"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full sm:w-auto h-11">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-full sm:w-auto h-11">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {langOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9">
                                Topics ({topics.length > 0 ? topics.length : 'All'})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0">
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        {topicOptions.map((topic) => (
                                            <CommandItem
                                                key={topic}
                                                onSelect={() => {
                                                    const newTopics = topics.includes(topic)
                                                        ? topics.filter(t => t !== topic)
                                                        : [...topics, topic];
                                                    setTopics(newTopics);
                                                }}
                                            >
                                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${topics.includes(topic) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                                   <X className="h-4 w-4" />
                                                </div>
                                                {topic}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {authorFilter && (
                         <Badge variant="secondary" className="gap-1.5 pl-1.5">
                            Author: {authorFilter}
                            <button onClick={() => setAuthorFilter(null)} className="rounded-full hover:bg-background/50">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {topics.map(topic => (
                         <Badge key={topic} variant="secondary" className="gap-1.5 pl-1.5">
                            {topic}
                             <button onClick={() => setTopics(topics.filter(t => t !== topic))} className="rounded-full hover:bg-background/50">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full sm:w-[160px] h-9">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSaveSearch}>
                        <Star className="h-5 w-5" />
                        <span className="sr-only">Save search</span>
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="link" onClick={onReset} className="px-2 text-muted-foreground">
                            Reset all
                        </Button>
                    )}
                </div>
            </div>
             <Separator />
        </div>
    )
}
