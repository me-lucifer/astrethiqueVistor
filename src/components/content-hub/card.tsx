
"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentHubItem } from "@/lib/content-hub-seeder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Mic, BookOpen, Clock, Eye, Calendar, Play, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';

type CardProps = {
    item: ContentHubItem;
    onAuthorClick?: (authorName: string) => void;
    onToggleLike?: (itemId: string) => void;
    onToggleBookmark?: (itemId: string) => void;
};

function formatViews(views: number): string {
    if (views === undefined || views === null || isNaN(views)) {
        return '0';
    }
    if (views >= 100000) {
        return (views / 1000).toFixed(0) + 'k';
    }
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
}

function formatDate(date: string): string {
    if (!date || isNaN(new Date(date).getTime())) {
        return '';
    }
    return format(new Date(date), 'MMM dd, yyyy');
}

function formatLength(item: ContentHubItem): string {
    if (item.type === 'article' && item.readMinutes) {
        return `${item.readMinutes} min read`;
    }
    if (item.type === 'podcast' && item.durationMinutes) {
        return `${item.durationMinutes} min`;
    }
    return '';
}

export function ContentHubCard({ item, onAuthorClick, onToggleLike, onToggleBookmark }: CardProps) {
    const router = useRouter();
    const isArticle = item.type === 'article';
    const detailUrl = `/content-hub/${item.type}/${item.id}`;

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAuthorClick) {
            onAuthorClick(item.author.name);
        }
    }
    
    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if(onToggleLike) onToggleLike(item.id);
    }

    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if(onToggleBookmark) onToggleBookmark(item.id);
    }
    
    const handleCTAClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(detailUrl);
    };

    const isPromotedAndActive = item.promotedUntil && new Date(item.promotedUntil) > new Date();
    
    const metaAriaLabel = `Views: ${formatViews(item.views)}. Published on: ${formatDate(item.publishedAt)}. Length: ${formatLength(item)}.`;

    return (
        <Card className="group overflow-hidden flex flex-col h-full bg-card/50 hover:bg-card transition-shadow duration-300">
            <Link href={detailUrl} className="flex flex-col h-full">
                <div className="relative">
                    <Image
                        src={item.heroImage || 'https://placehold.co/600x400/15120E/F6EBD2?text=Image'}
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
                        <h3 className="font-headline text-lg font-bold leading-tight line-clamp-2 h-[56px] group-hover:text-primary">
                            {item.title}
                        </h3>
                        
                        <div 
                            role="group"
                            aria-label={metaAriaLabel}
                            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
                        >
                            <span className="flex items-center gap-1.5" title={`${item.views} views`}><Eye className="h-3.5 w-3.5" /> {formatViews(item.views)}</span>
                            <span className="flex items-center gap-1.5" title={new Date(item.publishedAt).toLocaleDateString()}><Calendar className="h-3.5 w-3.5" /> {formatDate(item.publishedAt)}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatLength(item)}</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-[40px]">
                            {item.excerpt}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                            {item.tags && item.tags.slice(0,3).map(topic => (
                                <Badge key={topic} variant="outline" className="font-normal">{topic}</Badge>
                            ))}
                            {item.tags && item.tags.length > 3 && (
                                <Badge variant="outline" className="font-normal">+{item.tags.length - 3}</Badge>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <button onClick={handleAuthorClick} className="flex items-center gap-2 hover:text-foreground">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.avatar} alt={item.author.name} />
                                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{item.author.name}</span>
                        </button>
                    </div>
                </CardContent>

                <div className="p-4 pt-0 mt-auto border-t flex justify-between items-center">
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={handleLikeClick} className={cn("gap-2", item.liked && "text-destructive")} aria-label={item.liked ? 'Unlike' : 'Like'}>
                            <Heart className={cn("h-4 w-4", item.liked && "fill-current")} />
                            {item.likes}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBookmarkClick} aria-label={item.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                             <Bookmark className={cn("h-4 w-4", item.bookmarked && "fill-current text-primary")} />
                        </Button>
                    </div>
                    <div>
                        {isArticle ? (
                             <Button variant="outline" size="sm" onClick={handleCTAClick}>
                                Read more
                             </Button>
                        ) : (
                            <>
                                <Button variant="secondary" size="sm" onClick={handleCTAClick}>
                                    <Play className="mr-2 h-4 w-4" /> Open
                                </Button>
                                <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('https://youtube.com', '_blank')}}>
                                    <Youtube className="mr-2 h-4 w-4" /> YouTube
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    );
}
