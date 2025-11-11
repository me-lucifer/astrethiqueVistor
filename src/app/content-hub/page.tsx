
"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { seedContentHub, ContentHubItem } from '@/lib/content-hub-seeder';
import * as storage from '@/lib/storage';
import { ContentHubCard } from '@/components/content-hub/card';
import { ContentHubFilters } from '@/components/content-hub/filters';
import { EmptyState } from '@/components/content-hub/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sparkles, UserPlus } from 'lucide-react';
import { getSession } from '@/lib/session';

const ITEMS_PER_PAGE = 9;

type DailyMood = {
    [key in "Love" | "Work" | "Health" | "Money"]?: 'low' | 'medium' | 'high';
}

function ContentHubContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [allItems, setAllItems] = useState<ContentHubItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

    // Filter and sort state
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [topics, setTopics] = useState<string[]>(searchParams.get('topics')?.split(',').filter(Boolean) || []);
    const [type, setType] = useState(searchParams.get('type') || 'all');
    const [language, setLanguage] = useState(searchParams.get('lang') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [authorFilter, setAuthorFilter] = useState<string | null>(searchParams.get('author'));

    const loadAllData = useCallback(() => {
        seedContentHub();
        const items = storage.getStorageItem<ContentHubItem[]>('ch_items') || [];
        const user = storage.getCurrentUser();
        
        const updatedItems = items.map(item => ({
            ...item,
            bookmarked: user?.favorites.content.includes(item.id) || false
        }));

        setAllItems(updatedItems);

        // Check for daily mood for personalization
        const dailyMood = getSession<DailyMood>("daily_mood");
        if (dailyMood) {
            const lowMoods = Object.entries(dailyMood)
                .filter(([, mood]) => mood === 'low')
                .map(([topic]) => topic);
            setSuggestedTopics(lowMoods);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadAllData();
        window.addEventListener('storage_change', loadAllData);
        return () => window.removeEventListener('storage_change', loadAllData);
    }, [loadAllData]);

    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (topics.length) params.set('topics', topics.join(','));
        if (type !== 'all') params.set('type', type);
        if (language !== 'all') params.set('lang', language);
        if (sort !== 'newest') params.set('sort', sort);
        if (authorFilter) params.set('author', authorFilter);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [query, topics, type, language, sort, authorFilter, pathname, router]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            updateURL();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, topics, type, language, sort, authorFilter, updateURL]);


    const filteredItems = useMemo(() => {
        let items = allItems.filter(item => !item.deleted);

        if (query) {
            const lowerQuery = query.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.author.name.toLowerCase().includes(lowerQuery) ||
                item.excerpt.toLowerCase().includes(lowerQuery)
            );
        }
        
        if (authorFilter) {
            items = items.filter(item => item.author.name === authorFilter);
        }

        if (topics.length > 0) {
            items = items.filter(item => item.tags.some(t => topics.includes(t)));
        }

        if (type !== 'all') {
            items = items.filter(item => item.type === type);
        }

        if (language !== 'all') {
            items = items.filter(item => item.language === language);
        }

        switch (sort) {
            case 'most_viewed':
                items.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'most_liked':
                items.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'oldest':
                items.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
                break;
            case 'newest':
            default:
                items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
                break;
        }

        return items;
    }, [allItems, query, topics, type, language, sort, authorFilter]);
    
    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, page * ITEMS_PER_PAGE);
    }, [filteredItems, page]);

    const handleReset = () => {
        setQuery('');
        setTopics([]);
        setType('all');
        setLanguage('all');
        setSort('newest');
        setAuthorFilter(null);
        setPage(1);
    };

    const handleAuthorFilter = (authorName: string) => {
        setAuthorFilter(authorName);
        setPage(1);
    }

    const handleTopicClick = (topic: string) => {
        setTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
        setPage(1);
    }
    
    const handleToggleLike = (itemId: string) => {
        const updatedItems = allItems.map(item => {
            if (item.id === itemId) {
                const newLiked = !item.liked;
                const newLikes = newLiked ? (item.likes || 0) + 1 : (item.likes || 0) - 1;
                return { ...item, liked: newLiked, likes: newLikes };
            }
            return item;
        });
        setAllItems(updatedItems);
        const originalItems = storage.getStorageItem<ContentHubItem[]>('ch_items') || [];
        const updatedOriginalItems = originalItems.map(item => item.id === itemId ? {...item, likes: updatedItems.find(i => i.id === itemId)?.likes} : item);
        storage.setStorageItem('ch_items', updatedOriginalItems);
    }

    const handleToggleBookmark = (itemId: string) => {
        const user = storage.getCurrentUser();
        if (!user) return; // Should be handled by card, but as a safeguard.

        const allUsers = storage.getUsers();
        const updatedUsers = allUsers.map(u => {
            if (u.id === user.id) {
                const isBookmarked = u.favorites.content.includes(itemId);
                let newContentFavorites: string[];

                if (isBookmarked) {
                    newContentFavorites = u.favorites.content.filter(id => id !== itemId);
                } else {
                    newContentFavorites = [...u.favorites.content, itemId];
                }
                
                return { ...u, favorites: { ...u.favorites, content: newContentFavorites } };
            }
            return u;
        });

        storage.saveUsers(updatedUsers);
        window.dispatchEvent(new Event('storage_change'));
    }
    
    const handleSuggestedTopicClick = (topic: string) => {
        if (!topics.includes(topic)) {
            setTopics([...topics, topic]);
        }
    };

    return (
        <div className="container py-12">
            <div className="flex flex-col items-start gap-4 mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Content Hub
                </h1>
                <p className="text-lg text-foreground/80 max-w-2xl">
                    Explore articles and podcasts from our experts—filter by topic, language, and type.
                </p>
            </div>

            {suggestedTopics.length > 0 && (
                <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <p className="font-medium text-sm">Based on how you’re feeling, here’s content to lift you up.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTopics.map(topic => (
                            <Button 
                                key={topic} 
                                size="sm"
                                variant="outline"
                                className="bg-background/50"
                                onClick={() => handleSuggestedTopicClick(topic)}
                            >
                                {topic}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <ContentHubFilters
                query={query} setQuery={setQuery}
                topics={topics} setTopics={setTopics}
                type={type} setType={setType}
                language={language} setLanguage={setLanguage}
                sort={sort} setSort={setSort}
                authorFilter={authorFilter} setAuthorFilter={setAuthorFilter}
                onReset={handleReset}
            />

            <div className="mt-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : visibleItems.length > 0 ? (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {visibleItems.length} of {filteredItems.length}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleItems.map(item => (
                                <ContentHubCard
                                    key={item.id}
                                    item={item}
                                    onAuthorClick={handleAuthorFilter}
                                    onTopicClick={handleTopicClick}
                                    onToggleLike={handleToggleLike}
                                    onToggleBookmark={handleToggleBookmark}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState onClear={handleReset} />
                )}
            </div>

            {visibleItems.length < filteredItems.length && (
                <div className="text-center mt-12">
                    <Button onClick={() => setPage(p => p + 1)} variant="outline">
                        Load More
                    </Button>
                </div>
            )}

            <div className="mt-16 border-t pt-8 text-center sm:hidden">
                <p className="text-sm">
                    Looking for live sessions?{' '}
                    <Button variant="link" asChild className="p-0">
                        <Link href="/discover">Discover consultants</Link>
                    </Button>
                </p>
            </div>

            <div className="hidden sm:flex sticky bottom-0 mt-16 py-4 justify-center bg-gradient-to-t from-background via-background to-transparent">
                 <div className="flex justify-between items-center gap-4 p-4 rounded-lg bg-card border shadow-2xl w-full max-w-lg">
                    <p className="text-sm">
                        Looking for live 1-on-1 sessions?
                    </p>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/discover">Discover consultants</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register"><UserPlus className="mr-2 h-4 w-4"/>Create account</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ContentHubPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContentHubContent />
        </Suspense>
    );
}
