
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Comment } from '@/lib/comments';
import * as storage from '@/lib/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { formatDistanceToNow } from 'date-fns';
import { AuthModal } from '../auth-modal';

const commentSchema = z.object({
  text: z.string().trim().min(3, 'Comment must be at least 3 characters.').max(600, 'Comment must be 600 characters or less.'),
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
  const [user, setUser] = useState<storage.User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const checkUser = () => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    checkUser();
    window.addEventListener('storage_change', checkUser);
    return () => {
      window.removeEventListener('storage_change', checkUser);
    }
  }, []);
  
  const handleLogout = () => {
      storage.setCurrentUser(null);
      checkUser();
  }

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
    mode: 'onChange',
  });
  
  const onLoginSuccess = () => {
    checkUser();
  }

  const handleCommentAttempt = () => {
    if (!user) {
        setIsAuthModalOpen(true);
    }
  }

  const onSubmit = (data: CommentFormData) => {
    if (!user || !user.emailVerified) {
        setIsAuthModalOpen(true);
        return;
    }
    onAddComment(data.text);
    form.reset();
  };
  
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return "G";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const visibleComments = comments.slice(0, visibleCount);
  const commentText = form.watch('text');

  return (
    <>
      <section className="max-w-3xl mx-auto">
        <h2 className="font-headline text-2xl font-bold mb-6">
          Comments ({comments.length})
        </h2>
        
        <div className="mb-8">
          {user && user.emailVerified ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className='text-sm text-muted-foreground flex justify-between items-center'>
                    <span>Commenting as <span className="font-semibold text-foreground">{user.name}</span></span>
                    <button type="button" onClick={handleLogout} className="text-xs hover:underline">Sign out</button>
                </div>
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Add a public comment..." {...field} />
                      </FormControl>
                      <div className='flex justify-between items-center'>
                        <FormMessage />
                        <span className="text-xs text-muted-foreground ml-auto">{commentText?.length || 0}/600</span>
                      </div>
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
            <div className="text-center py-6 px-4 border-2 border-dashed rounded-lg">
              <h3 className="font-semibold">Sign in to add a comment.</h3>
              <Button onClick={() => setIsAuthModalOpen(true)} className="mt-2">Sign In</Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {comments.length === 0 ? (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Be the first to share your thoughts.</p>
             </div>
          ) : (
            <>
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
                    <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
                    <div className="mt-1">
                        <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto">Report</Button>
                    </div>
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
            </>
          )}
        </div>
      </section>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={onLoginSuccess} />
    </>
  );
}
