
"use client";

import { Consultant } from '@/lib/consultants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceholderContent } from './placeholder-content';
import { ReactNode } from 'react';

const BioContent = ({ bio }: { bio: string }) => (
    <div className="prose prose-invert max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: bio }} />
);

const ReviewsContent = ({ reviews }: { reviews: Consultant['reviews'] }) => {
    if (reviews.length === 0) {
        return <PlaceholderContent message="Reviews for this consultant are not available yet." />;
    }
    // Simple review list for now
    return (
        <div className="space-y-4">
            {reviews.map((review, i) => (
                <div key={i} className="border-b pb-4">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-muted-foreground">{new Date(review.dateISO).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm mt-1">{`Rating: ${review.rating}/5`}</p>
                    <p className="text-foreground/80 mt-2">{review.text}</p>
                </div>
            ))}
        </div>
    );
};


const ContentSubTabs = ({ content }: { content: Consultant['content'] }) => {
    const hasContent = content.articles.length > 0 || content.podcasts.length > 0 || content.conferences.length > 0;
    if (!hasContent) {
        return <PlaceholderContent message="This consultant has not published any content yet." />;
    }

    return (
        <Tabs defaultValue="articles" className="w-full">
            <TabsList>
                {content.articles.length > 0 && <TabsTrigger value="articles">Articles ({content.articles.length})</TabsTrigger>}
                {content.podcasts.length > 0 && <TabsTrigger value="podcasts">Podcasts ({content.podcasts.length})</TabsTrigger>}
                {content.conferences.length > 0 && <TabsTrigger value="conferences">Conferences ({content.conferences.length})</TabsTrigger>}
            </TabsList>
            <TabsContent value="articles" className="py-4">
                <PlaceholderContent message="Article content would be displayed here." />
            </TabsContent>
            <TabsContent value="podcasts" className="py-4">
                 <PlaceholderContent message="Podcast content would be displayed here." />
            </TabsContent>
            <TabsContent value="conferences" className="py-4">
                 <PlaceholderContent message="Conference content would be displayed here." />
            </TabsContent>
        </Tabs>
    );
};


export function ConsultantContentTabs({ consultant }: { consultant: Consultant }) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({consultant.reviews.length})</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="py-6">
        <BioContent bio={consultant.bio} />
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
