
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
import { Briefcase, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const CollapsibleBio = ({ bio }: { bio: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(true);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (contentRef.current && contentRef.current.scrollHeight > 420) {
            setIsClamped(true);
        } else {
            setIsClamped(false);
        }
    }, [bio]);

    return (
        <div>
            <div
                ref={contentRef}
                className={cn(
                    "prose prose-invert max-w-none text-foreground/80 relative transition-[max-height] duration-500 ease-in-out overflow-hidden",
                    !isExpanded && "max-h-[420px]"
                )}
                style={{ maxHeight: isExpanded ? contentRef.current?.scrollHeight : '420px' }}
            >
                <div dangerouslySetInnerHTML={{ __html: bio }} />
                {!isExpanded && isClamped && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                )}
            </div>
            {isClamped && (
                <div className="mt-4">
                    <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="p-0 text-base">
                        {isExpanded ? 'Show less' : 'Read more'}
                        <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                    </Button>
                </div>
            )}
        </div>
    );
};

const BioContent = ({ bio, years, country }: { bio: string, years: number, country: string }) => (
    <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/90">
            <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{years} years of experience</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>From {country}</span>
            </div>
        </div>
        <CollapsibleBio bio={bio} />
    </div>
);

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const formatAuthorName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return name;
}

const ReviewsContent = ({ reviews }: { reviews: ConsultantProfile['reviews'] }) => {
    const [visibleCount, setVisibleCount] = useState(3);

    if (!reviews || reviews.length === 0) {
        return <PlaceholderContent message="No reviews yet. After your session, you’ll be invited to leave one." />;
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
                                <p className="font-semibold text-foreground">{formatAuthorName(review.author)}</p>
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
    
    const getDefaultTab = () => {
        if(content.articles && content.articles.length > 0) return 'articles';
        if(content.podcasts && content.podcasts.length > 0) return 'podcasts';
        if(content.conferences && content.conferences.length > 0) return 'conferences';
        return 'articles';
    }

    return (
        <Tabs defaultValue={getDefaultTab()} className="w-full">
            <TabsList>
                {content.articles?.length > 0 && <TabsTrigger value="articles">Articles ({content.articles.length})</TabsTrigger>}
                {content.podcasts?.length > 0 && <TabsTrigger value="podcasts">Podcasts ({content.podcasts.length})</TabsTrigger>}
                {content.conferences?.length > 0 && <TabsTrigger value="conferences">Conferences ({content.conferences.length})</TabsTrigger>}
            </TabsList>
            <TabsContent value="articles" className="py-6">
                 {content.articles && content.articles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {content.articles.map(item => (
                            <ContentCard key={item.id} item={{...item, type: 'Article'}} />
                        ))}
                    </div>
                ) : (
                    <PlaceholderContent message="This consultant hasn't published any articles yet." />
                )}
            </TabsContent>
            <TabsContent value="podcasts" className="py-6">
                 {content.podcasts && content.podcasts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {content.podcasts.map(item => (
                            <ContentCard key={item.id} item={{...item, type: 'Podcast'}} />
                        ))}
                    </div>
                 ) : (
                    <PlaceholderContent message="This consultant hasn't published any podcasts yet." />
                 )}
            </TabsContent>
            <TabsContent value="conferences" className="py-6">
                 {content.conferences && content.conferences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {content.conferences.map(item => (
                            <ContentCard key={item.id} item={{...item, type: 'Conference'}} />
                        ))}
                    </div>
                ) : (
                    <PlaceholderContent message="This consultant hasn't published any conferences yet." />
                )}
            </TabsContent>
        </Tabs>
    );
};


export function ConsultantContentTabs({ consultant }: { consultant: ConsultantProfile }) {
  const contentCount = (consultant.content?.articles?.length || 0) + (consultant.content?.podcasts?.length || 0) + (consultant.content?.conferences?.length || 0);
    
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({consultant.reviews?.length || 0})</TabsTrigger>
        <TabsTrigger value="content">Content ({contentCount})</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="py-6">
        <BioContent bio={consultant.aboutHtml} years={consultant.yearsExperience} country={consultant.country} />
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

