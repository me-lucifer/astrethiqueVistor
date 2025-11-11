
"use client";

import * as storage from './storage';

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

export type CommentsStore = Record<string, Comment[]>;

export function getComments(contentId: string): Comment[] {
  const allComments = storage.getStorageItem<storage.Comment[]>('ast_comments') || [];
  const users = storage.getUsers();

  const itemComments = allComments.filter(c => c.contentId === contentId);
  
  const enrichedComments: Comment[] = itemComments.map(c => {
    const author = users.find(u => u.id === c.userId);
    return {
      id: c.id,
      contentId: c.contentId,
      text: c.body,
      createdAt: c.createdAt,
      author: {
        id: author?.id || 'guest',
        name: author?.name || 'Guest',
        avatar: `https://i.pravatar.cc/40?u=${author?.id || 'guest'}`,
      }
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return enrichedComments;
}

export function addComment(contentId: string, text: string): Comment | null {
  const user = storage.getCurrentUser();
  if (!user) {
    return null;
  }

  const allComments = storage.getStorageItem<storage.Comment[]>('ast_comments') || [];
  const newComment: storage.Comment = {
    id: storage.createId('comment'),
    userId: user.id,
    contentId: contentId,
    type: 'article', // Assuming article for now, this could be dynamic
    body: text,
    createdAt: new Date().toISOString(),
  };

  storage.setStorageItem('ast_comments', [newComment, ...allComments]);

  return {
    id: newComment.id,
    contentId: newComment.contentId,
    text: newComment.body,
    createdAt: newComment.createdAt,
    author: {
        id: user.id,
        name: user.name,
        avatar: `https://i.pravatar.cc/40?u=${user.id}`
    }
  };
}
