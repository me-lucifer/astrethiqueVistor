
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSession, setSession } from '@/lib/session';
import { ContentHubItem, Comment } from '@/lib/content-hub-seeder';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Bookmark, MoreHorizontal, Share2, Flag, Clock, Eye, Calendar, BookOpen, Mic, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentHubCard } from '@/components/content-hub/card';
import { CommentsSection } from '@/components/content-hub/comments-section';
import { YouTubePlayer } from '@/components/content-hub/youtube-player';
import { format } from 'date-fns';

const Placeholder = () => (
    <div className="container py-12">
        <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-4 mb-8">
                 <Skeleton className="h-10 w-10 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                 </div>
            </div>
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
        </div>
    </div>
);

function formatViews(views?: number): string {
    if (!views || isNaN(views)) {
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

function formatDate(date?: string): string {
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

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [item, setItem] = useState<ContentHubItem | null>(null);
    const [allItems, setAllItems] = useState<ContentHubItem[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    
    const itemId = useMemo(() => {
        const slug = params.slug;
        return (slug && slug.length === 2) ? slug[1] : null;
    }, [params.slug]);


    useEffect(() => {
        if (itemId) {
            const storedItems = getSession<ContentHubItem[]>('ch_items') || [];
            setAllItems(storedItems);
            const foundItem = storedItems.find(i => i.id === itemId);

            if (foundItem && !foundItem.deleted) {
                setItem(foundItem);
                const allComments = getSession<{[key: string]: Comment[]}>('contentHub_comments_v1') || {};
                const itemComments = allComments[itemId] || [];
                itemComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setComments(itemComments);
            } else {
                setItem(null);
                setComments([]);
            }
        }
        setLoading(false);
    }, [itemId]);

    const handleAuthorClick = (authorName: string) => {
        router.push(`/content-hub?author=${encodeURIComponent(authorName)}`);
    };

    const handleTopicClick = (topic: string) => {
        router.push(`/content-hub?topics=${encodeURIComponent(topic)}`);
    }

    const updateItemInSession = useCallback((updatedItem: ContentHubItem) => {
        const updatedItems = allItems.map(i => i.id === updatedItem.id ? updatedItem : i);
        setAllItems(updatedItems);
        setItem(updatedItem); // also update the local state for the detail page
        setSession('ch_items', updatedItems);
    }, [allItems]);

    const handleToggleLike = useCallback((itemIdToLike: string) => {
        let targetItem = item && item.id === itemIdToLike ? item : allItems.find(i => i.id === itemIdToLike);
        if (!targetItem) return;

        const newLiked = !targetItem.liked;
        const newLikes = newLiked ? (targetItem.likes ?? 0) + 1 : (targetItem.likes ?? 1) - 1;
        const updatedItem = { ...targetItem, liked: newLiked, likes: newLikes };
        updateItemInSession(updatedItem);
    }, [item, allItems, updateItemInSession]);

    const handleToggleBookmark = useCallback((itemIdToBookmark: string) => {
        let targetItem = item && item.id === itemIdToBookmark ? item : allItems.find(i => i.id === itemIdToBookmark);
        if (!targetItem) return;
        
        const updatedItem = { ...targetItem, bookmarked: !targetItem.bookmarked };
        updateItemInSession(updatedItem);

        const savedIds = getSession<string[]>("savedContentIds") || [];
        const isBookmarked = savedIds.includes(targetItem.id);
        const newSavedIds = isBookmarked ? savedIds.filter(id => id !== targetItem.id) : [...savedIds, targetItem.id];
        setSession("savedContentIds", newSavedIds);

        toast({
            title: updatedItem.bookmarked ? 'Bookmarked!' : 'Bookmark removed',
        });
    }, [item, allItems, updateItemInSession, toast]);

    const handleAddComment = useCallback((text: string, displayName?: string) => {
        if (!item) return;

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            contentId: item.id,
            displayName: displayName || "Guest",
            createdAt: new Date().toISOString(),
            text,
        };
        
        const allComments = getSession<{[key: string]: Comment[]}>('contentHub_comments_v1') || {};
        const currentComments = allComments[item.id] || [];
        const updatedComments = [newComment, ...currentComments];
        
        setSession('contentHub_comments_v1', { ...allComments, [item.id]: updatedComments });
        setComments(updatedComments);

        const updatedItem = { ...item, commentCount: (item.commentCount || 0) + 1 };
        updateItemInSession(updatedItem);

        toast({
            title: "Comment posted",
        });

    }, [item, updateItemInSession, toast]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Link copied to clipboard!',
        });
    };

    const handleReport = () => {
        toast({
            title: 'Content reported',
            description: "Thanks for your feedback. We'll review it shortly.",
        });
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!item) return;

            const currentIndex = allItems.findIndex(i => i.id === item.id);
            if (currentIndex === -1) return;

            let nextIndex = -1;
            if (event.key === 'j') {
                nextIndex = allItems.findIndex((i, idx) => idx > currentIndex && !i.deleted);
            } else if (event.key === 'k') { 
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (!allItems[i].deleted) {
                        nextIndex = i;
                        break;
                    }
                }
            }
            
            if (nextIndex !== -1) {
                const nextItem = allItems[nextIndex];
                router.push(`/content-hub/${nextItem.type}/${nextItem.id}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);

    }, [item, allItems, router]);


    const moreFromAuthor = useMemo(() => {
        if (!item) return [];
        return allItems.filter(i => i.author.id === item.author.id && i.id !== item.id && !i.deleted).slice(0, 3);
    }, [item, allItems]);
    
    const relatedContent = useMemo(() => {
        if (!item) return [];
        return allItems.filter(i => 
            i.id !== item.id &&
            !i.deleted &&
            i.language === item.language &&
            i.tags.some(t => item.tags.includes(t))
        ).slice(0, 4);
    }, [item, allItems]);

    if (loading) {
        return <Placeholder />;
    }
    
    if (!item) {
        return (
            <div className="container py-16 text-center">
                 <h1 className="font-headline text-2xl font-bold">This content is no longer available.</h1>
                 <Button onClick={() => router.push('/content-hub')} className="mt-4">Back to Content Hub</Button>
            </div>
        );
    }
    
    const isPromotedAndActive = item.promotedUntil && new Date(item.promotedUntil) > new Date();

    return (
        <div className="container py-12">
            <div className="grid lg:grid-cols-[1fr_300px] gap-12">
                <main>
                    <Link href="/content-hub" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Content Hub
                    </Link>
                    <article>
                        <header className="mb-8 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1.5 capitalize">
                                    {item.type === 'article' ? <BookOpen className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                                    {item.type}
                                </Badge>
                                {item.tags.map(topic => (
                                    <Button key={topic} variant="link" className="p-0 h-auto" onClick={() => handleTopicClick(topic)}>
                                        <Badge variant="outline">{topic}</Badge>
                                    </Button>
                                ))}
                            </div>
                            
                            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{item.title}</h1>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <button onClick={() => handleAuthorClick(item.author.name)} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.author.avatar} alt={item.author.name} />
                                        <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">{item.author.name}</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleToggleLike(item.id)} className={`gap-2 ${item.liked ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        <Heart className={`h-5 w-5 ${item.liked ? 'fill-current' : ''}`} />
                                        {item.likes}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => handleToggleBookmark(item.id)} aria-label={item.bookmarked ? 'Remove bookmark' : 'Bookmark this item'}>
                                         <Bookmark className={`h-5 w-5 ${item.bookmarked ? 'fill-current text-primary' : ''}`} />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleReport}><Flag className="mr-2 h-4 w-4" />Report</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground border-t border-b py-3">
                                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {formatViews(item.views)} views</span>
                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Published {formatDate(item.publishedAt)}</span>
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatLength(item)}</span>
                                <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {item.commentCount || 0} comments</span>
                            </div>
                        </header>
                        
                        {isPromotedAndActive && (
                            <div className="mb-8 p-2 text-center text-sm bg-accent/10 text-accent-foreground border-l-4 border-accent rounded">
                                Promoted Content
                            </div>
                        )}

                        {item.type === 'podcast' ? (
                            <YouTubePlayer item={item} />
                        ) : (
                             <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
                                <Image src={item.heroImage} alt={item.title} fill className="object-cover" />
                            </div>
                        )}

                        <div 
                            className="prose prose-invert max-w-none text-foreground/80 prose-blockquote:border-primary prose-blockquote:text-foreground" 
                            dangerouslySetInnerHTML={{ __html: item.body }} 
                        />
                    </article>

                    <Separator className="my-12" />

                    <CommentsSection
                        contentId={item.id}
                        comments={comments}
                        onAddComment={handleAddComment}
                    />

                    {moreFromAuthor.length > 0 && (
                        <section className="mt-16">
                            <Separator />
                            <h2 className="font-headline text-2xl font-bold my-8">More from {item.author.name}</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {moreFromAuthor.map(related => (
                                    <ContentHubCard
                                        key={related.id}
                                        item={related}
                                        onAuthorClick={handleAuthorClick}
                                        onTopicClick={handleTopicClick}
                                        onToggleLike={handleToggleLike}
                                        onToggleBookmark={handleToggleBookmark}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {relatedContent.length > 0 && (
                        <section className="mt-16">
                            <Separator />
                            <h2 className="font-headline text-2xl font-bold my-8">You might also like</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {relatedContent.map(related => (
                                    <ContentHubCard
                                        key={related.id}
                                        item={related}
                                        onAuthorClick={handleAuthorClick}
                                        onTopicClick={handleTopicClick}
                                        onToggleLike={handleToggleLike}
                                        onToggleBookmark={handleToggleBookmark}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                    
                     <footer className="mt-16 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Button onClick={() => router.push('/content-hub')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Content Hub
                        </Button>
                        <Button asChild>
                            <Link href="/discover">Discover consultants</Link>
                        </Button>
                    </footer>
                </main>
                <aside className="hidden lg:block sticky top-24 self-start">
                    {/* Sticky side rail content goes here */}
                </aside>
            </div>
        </div>
    );
}
