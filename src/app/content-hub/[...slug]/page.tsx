
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ContentHubItem } from '@/lib/content-hub-seeder';
import { PlaceholderPage } from '@/components/placeholder-page';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;
    
    const [item, setItem] = useState<ContentHubItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug && slug.length === 2) {
            const itemId = slug[1];
            const allItems = getSession<ContentHubItem[]>('ch_items') || [];
            const foundItem = allItems.find(i => i.id === itemId);
            setItem(foundItem || null);
        }
        setLoading(false);
    }, [slug]);

    if (loading) {
        return (
            <div className="container py-12">
                <Skeleton className="h-8 w-48 mb-8" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                </div>
            </div>
        );
    }
    
    if (!item) {
        return <PlaceholderPage title="Content not found" description="We couldn't find the content you were looking for." />;
    }

    return (
        <div className="container py-12 max-w-4xl">
            <Button variant="ghost" onClick={() => router.push('/content-hub')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Content Hub
            </Button>
            <article>
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">{item.title}</h1>
                <p className="text-lg text-muted-foreground mb-8">{item.excerpt}</p>
                <div className="prose prose-invert max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: item.body }} />
            </article>
        </div>
    );
}
