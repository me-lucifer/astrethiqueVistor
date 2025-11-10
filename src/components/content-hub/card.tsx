
"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentHubItem } from "@/lib/content-hub-seeder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Mic, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type CardProps = {
    item: ContentHubItem;
    onAuthorClick: (authorName: string) => void;
    onToggleLike: (itemId: string) => void;
    onToggleBookmark: (itemId: string) => void;
};

export function ContentHubCard({ item, onAuthorClick, onToggleLike, onToggleBookmark }: CardProps) {
    const isArticle = item.type === 'article';
    const timeValue = isArticle ? item.readMinutes : item.durationMinutes;
    const timeUnit = isArticle ? 'min read' : 'min';

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAuthorClick(item.author.name);
    }
    
    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleLike(item.id);
    }

    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleBookmark(item.id);
    }

    const isPromotedAndActive = item.promoted && item.promotionDaysRemaining > 0;

    return (
        <Card className="group overflow-hidden flex flex-col h-full bg-card/50 hover:bg-card transition-shadow duration-300">
            <Link href={`/content-hub/${item.type}/${item.id}`} className="flex flex-col h-full">
                <div className="relative">
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="gap-1.5">
                            {isArticle ? <BookOpen className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                            {item.type}
                        </Badge>
                    </div>
                     <div className="absolute top-3 right-3 flex gap-2">
                        {item.featured && <Badge variant="default">Featured</Badge>}
                        {isPromotedAndActive && <Badge variant="outline" className="bg-background/80">Worth Reading</Badge>}
                    </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-1 mb-2">
                            {item.topics.map(topic => (
                                <Badge key={topic} variant="outline" className="font-normal">{topic}</Badge>
                            ))}
                        </div>
                        <h3 className="font-headline text-lg font-bold leading-tight line-clamp-2 h-[56px] group-hover:text-primary">
                            {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-[40px]">
                            {item.excerpt}
                        </p>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <button onClick={handleAuthorClick} className="flex items-center gap-2 hover:text-foreground">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.avatarUrl} alt={item.author.name} />
                                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{item.author.name}</span>
                        </button>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {timeValue} {timeUnit}</span>
                        <Badge variant="outline">{item.language}</Badge>
                    </div>
                </CardContent>

                <div className="p-4 pt-0 mt-auto border-t flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={handleLikeClick} className={cn("gap-2", item.liked && "text-destructive")}>
                        <Heart className={cn("h-4 w-4", item.liked && "fill-current")} />
                        {item.likes}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBookmarkClick}>
                             <Bookmark className={cn("h-4 w-4", item.bookmarked && "fill-current text-primary")} />
                        </Button>
                        <Button variant="outline" size="sm">
                            {isArticle ? 'Read more' : 'Listen now'}
                        </Button>
                    </div>
                </div>
            </Link>
        </Card>
    );
}
