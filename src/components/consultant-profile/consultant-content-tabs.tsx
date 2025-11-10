
"use client";

import { useState } from 'react';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceholderContent } from './placeholder-content';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import { ContentCard } from '../content-card';
import Link from 'next/link';

const BioContent = ({ bio }: { bio: string }) => (
    <div className="prose prose-invert max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: bio }} />
);

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const ReviewsContent = ({ reviews }: { reviews: ConsultantProfile['reviews'] }) => {
    const [visibleCount, setVisibleCount] = useState(3);

    if (!reviews || reviews.length === 0) {
        return <PlaceholderContent message="Reviews for this consultant are not available yet." />;
    }

    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const visibleReviews = sortedReviews.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + 3);
    };

    return (
        <div className="space-y-6">
            {visibleReviews.map((review, index) => (
                <div key={review.id}>
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback>{getInitials(review.author)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-foreground">{review.author}</p>
                                <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-1">
                                <StarRating rating={review.stars} />
                            </div>
                            <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{review.text}</p>
                        </div>
                    </div>
                    {index < visibleReviews.length - 1 && <Separator className="my-6" />}
                </div>
            ))}
            {visibleCount < sortedReviews.length && (
                <div className="text-center mt-6">
                    <Button variant="outline" onClick={handleLoadMore}>
                        Load more reviews
                    </Button>
                </div>
            )}
        </div>
    );
};


const ContentSubTabs = ({ content }: { content: ConsultantProfile['content'] }) => {
    const hasContent = content && (content.articles?.length > 0 || content.podcasts?.length > 0 || content.conferences?.length > 0);
    if (!hasContent) {
        return <PlaceholderContent message="This consultant has not published any content yet." />;
    }

    return (
        <Tabs defaultValue="articles" className="w-full">
            <TabsList>
                {content.articles?.length > 0 && <TabsTrigger value="articles">Articles ({content.articles.length})</TabsTrigger>}
                {content.podcasts?.length > 0 && <TabsTrigger value="podcasts">Podcasts ({content.podcasts.length})</TabsTrigger>}
                {content.conferences?.length > 0 && <TabsTrigger value="conferences">Conferences ({content.conferences.length})</TabsTrigger>}
            </TabsList>
            <TabsContent value="articles" className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {content.articles.map(item => (
                        <ContentCard key={item.id} item={{...item, type: 'Article'}} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="podcasts" className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {content.podcasts.map(item => (
                        <ContentCard key={item.id} item={{...item, type: 'Podcast'}} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="conferences" className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {content.conferences.map(item => (
                        <ContentCard key={item.id} item={{...item, type: 'Conference'}} />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
};


export function ConsultantContentTabs({ consultant }: { consultant: ConsultantProfile }) {
  const bioHtml = `<p>${consultant.summary}</p>`;
    
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({consultant.reviews?.length || 0})</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="py-6">
        <BioContent bio={bioHtml} />
      </TabsContent>
      <TabsContent value="reviews" className="py-6">
        <ReviewsContent reviews={consultant.reviews} />
      </TabsContent>
      <TabsContent value="content" className="py-6">
        <ContentSubTabs content={consultant.content} />
      </TabsContent>
    </Tabs>
  );
}
