
"use client";

import * as authLocal from './authLocal';

export interface Comment {
  id: string;
  contentId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

export function getComments(contentId: string): Comment[] {
  const allComments = authLocal.getLocal<authLocal.Comment[]>('ast_comments') || [];
  const users = authLocal.getUsers();

  const itemComments = allComments.filter(c => c.contentId === contentId);
  
  const enrichedComments: Comment[] = itemComments.map(c => {
    const author = users.find(u => u.id === c.userId);
    const authorName = author ? `${author.firstName} ${author.lastName}` : "Guest";

    return {
      id: c.id,
      contentId: c.contentId,
      text: c.body,
      createdAt: c.createdAt,
      author: {
        id: author?.id || 'guest',
        name: c.userId === 'deleted' ? '[deleted]' : authorName,
        avatar: `https://i.pravatar.cc/40?u=${author?.id || 'guest'}`,
      }
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return enrichedComments;
}

export function addComment(contentId: string, text: string, itemType: 'article' | 'podcast'): Comment | null {
  const user = authLocal.getCurrentUser();
  if (!user) {
    return null;
  }

  const allComments = authLocal.getLocal<authLocal.Comment[]>('ast_comments') || [];
  const newComment: authLocal.Comment = {
    id: authLocal.createId('comment'),
    userId: user.id,
    contentId: contentId,
    type: itemType,
    body: text,
    createdAt: new Date().toISOString(),
  };

  authLocal.setLocal('ast_comments', [newComment, ...allComments]);

  return {
    id: newComment.id,
    contentId: newComment.contentId,
    text: newComment.body,
    createdAt: newComment.createdAt,
    author: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: `https://i.pravatar.cc/40?u=${user.id}`
    }
  };
}
