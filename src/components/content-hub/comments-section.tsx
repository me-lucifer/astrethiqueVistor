
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Comment } from '@/lib/content-hub-seeder';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { formatDistanceToNow } from 'date-fns';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment is too long.'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (commentText: string) => void;
}

export function CommentsSection({ comments, onAddComment }: CommentsSectionProps) {
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  const onSubmit = (data: CommentFormData) => {
    onAddComment(data.comment);
    form.reset();
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Add a public comment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Post Comment</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
              <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{comment.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
