
"use client";

import { Consultant } from '@/lib/consultants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceholderContent } from './placeholder-content';
import { ReactNode } from 'react';

const BioContent = ({ bio }: { bio: string }) => (
    <div className="prose prose-invert max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: bio }} />
);

const ReviewsContent = () => (
    <div>
        <PlaceholderContent message="Reviews are not available in this demo." />
    </div>
);

const ContentSubTabs = () => (
     <div>
        <PlaceholderContent message="Consultant-specific content is not available in this demo." />
    </div>
);


export function ConsultantContentTabs({ consultant }: { consultant: Consultant }) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="py-6">
        <BioContent bio={consultant.bio} />
      </TabsContent>
      <TabsContent value="reviews" className="py-6">
        <ReviewsContent />
      </TabsContent>
      <TabsContent value="content" className="py-6">
        <ContentSubTabs />
      </TabsContent>
    </Tabs>
  );
}
