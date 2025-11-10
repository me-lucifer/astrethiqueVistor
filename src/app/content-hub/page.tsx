
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { seedContentHub, ContentHubItem } from '@/lib/content-hub-seeder';
import { getSession, setSession } from '@/lib/session';
import { ContentHubCard } from '@/components/content-hub/card';
import { ContentHubFilters } from '@/components/content-hub/filters';
import { EmptyState } from '@/components/content-hub/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const ITEMS_PER_PAGE = 9;

export default function ContentHubPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [allItems, setAllItems] = useState<ContentHubItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Filter and sort state
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [topics, setTopics] = useState<string[]>(searchParams.get('topics')?.split(',') || []);
    const [type, setType] = useState(searchParams.get('type') || 'all');
    const [language, setLanguage] = useState(searchParams.get('lang') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [authorFilter, setAuthorFilter] = useState<string | null>(searchParams.get('author'));

    useEffect(() => {
        seedContentHub();
        const items = getSession<ContentHubItem[]>('ch_items') || [];
        setAllItems(items);
        setIsLoading(false);
    }, []);

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
            items = items.filter(item => item.topics.some(t => topics.includes(t)));
        }

        if (type !== 'all') {
            items = items.filter(item => item.type === type);
        }

        if (language !== 'all') {
            items = items.filter(item => item.language === language);
        }

        switch (sort) {
            case 'most_liked':
                items.sort((a, b) => b.likes - a.likes);
                break;
            case 'featured':
                items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
            case 'newest':
            default:
                items.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
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
    
    const handleToggleLike = (itemId: string) => {
        const updatedItems = allItems.map(item => {
            if (item.id === itemId) {
                const newLiked = !item.liked;
                const newLikes = newLiked ? item.likes + 1 : item.likes - 1;
                return { ...item, liked: newLiked, likes: newLikes };
            }
            return item;
        });
        setAllItems(updatedItems);
        setSession('ch_items', updatedItems);
    }

    const handleToggleBookmark = (itemId: string) => {
        const updatedItems = allItems.map(item => {
            if (item.id === itemId) {
                return { ...item, bookmarked: !item.bookmarked };
            }
            return item;
        });
        setAllItems(updatedItems);
        setSession('ch_items', updatedItems);
    }

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleItems.map(item => (
                            <ContentHubCard
                                key={item.id}
                                item={item}
                                onAuthorClick={handleAuthorFilter}
                                onToggleLike={handleToggleLike}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                    </div>
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

            <div className="mt-16 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm">
                    Looking for live sessions?{' '}
                    <Button variant="link" asChild className="p-0">
                        <Link href="/discover">Discover consultants</Link>
                    </Button>
                </p>
                <Button asChild>
                    <Link href="/register">Create account</Link>
                </Button>
            </div>
        </div>
    );
}
