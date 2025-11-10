
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Comment } from '@/lib/comments';
import { getLocal } from '@/lib/local';
import { AuthUser } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '../ui/input';
import { formatDistanceToNow } from 'date-fns';

const commentSchema = z.object({
  text: z.string().min(3, 'Comment must be at least 3 characters.').max(600, 'Comment must be 600 characters or less.'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  contentId: string;
  comments: Comment[];
  onAddComment: (commentText: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function CommentsSection({ contentId, comments, onAddComment }: CommentsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // In a real app, this would be context or a hook.
    const storedUser = getLocal<AuthUser>('astrethique_auth_v1');
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = (data: CommentFormData) => {
    onAddComment(data.text);
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
        {isLoggedIn && user ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span>Commenting as <span className="font-semibold">{user.name}</span></span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add a public comment..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting} aria-label="Post your comment">
                  Post Comment
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <h3 className="font-semibold">Join the conversation</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">
              You must be logged in to post a comment.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{comment.author.name || "Guest"}</p>
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
