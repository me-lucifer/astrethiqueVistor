"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Comment } from '@/lib/content-hub-seeder';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '../ui/input';
import { formatDistanceToNow } from 'date-fns';

const commentSchema = z.object({
  displayName: z.string().optional(),
  text: z.string().min(3, 'Comment must be at least 3 characters.').max(600, 'Comment must be 600 characters or less.'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  contentId: string;
  comments: Comment[];
  onAddComment: (commentText: string, displayName?: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function CommentsSection({ contentId, comments, onAddComment }: CommentsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { displayName: '', text: '' },
  });

  const onSubmit = (data: CommentFormData) => {
    onAddComment(data.text, data.displayName);
    form.reset();
  };
  
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return "G";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const visibleComments = comments.slice(0, visibleCount);

  return (
    <section className="max-w-3xl mx-auto">
      <h2 className="font-headline text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>
      
      <div className="mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="sr-only">Your comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a public comment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!form.formState.isValid}>Post Comment</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-8">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage />
              <AvatarFallback>{getInitials(comment.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{comment.displayName || "Guest"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
         {visibleCount < comments.length && (
            <div className="text-center">
                <Button variant="outline" onClick={() => setVisibleCount(visibleCount + ITEMS_PER_PAGE)}>
                    Load More
                </Button>
            </div>
        )}
      </div>
    </section>
  );
}
