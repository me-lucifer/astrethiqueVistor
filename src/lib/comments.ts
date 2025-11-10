"use client";

import { getLocal, setLocal } from "./local";
import { removeSession, getSession } from "./session";
import { getUser, AuthUser } from "./auth";

const COMMENTS_KEY = "astrethique_comments_v1";

export interface Comment {
  id: string;
  contentId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string; // ISO
}

export type CommentsStore = {
  [contentId: string]: Comment[];
};

// One-time migration from sessionStorage
function migrateIfNeeded(): void {
    if (typeof window === "undefined") return;
    const oldKey = "contentHub_comments_v1";
    const oldSessionData = getSession<{[key: string]: any[]}>(oldKey);
    const newLocalData = getLocal<CommentsStore>(COMMENTS_KEY);

    if (oldSessionData && !newLocalData) {
        const migratedStore: CommentsStore = {};
        
        for (const contentId in oldSessionData) {
            migratedStore[contentId] = oldSessionData[contentId].map((oldComment: any) => ({
                id: oldComment.id,
                contentId: oldComment.contentId,
                author: {
                    id: 'guest-id', // Placeholder ID
                    name: oldComment.displayName || 'Guest',
                },
                text: oldComment.text,
                createdAt: oldComment.createdAt,
            }));
        }
        
        saveComments(migratedStore);
        removeSession(oldKey); // Clean up old session data
    }
}

// Run migration on module load
migrateIfNeeded();


/**
 * Retrieves all comments for a specific content ID.
 * @param {string} contentId - The ID of the content item.
 * @returns {Comment[]} An array of comments, newest first.
 */
export function getComments(contentId: string): Comment[] {
  const store = getLocal<CommentsStore>(COMMENTS_KEY) || {};
  const comments = store[contentId] || [];
  return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Adds a new comment to the store for a given content ID.
 * This function assumes the user is logged in.
 * @param {string} contentId - The ID of the content item.
 * @param {string} text - The text of the comment.
 * @returns {Comment | null} The newly created comment or null if user is not logged in.
 */
export function addComment(contentId: string, text: string): Comment | null {
  const user = getUser();
  if (!user) {
    console.error("User must be logged in to comment.");
    return null;
  }

  const newComment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    contentId,
    author: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    },
    text,
    createdAt: new Date().toISOString(),
  };

  const store = getLocal<CommentsStore>(COMMENTS_KEY) || {};
  const existingComments = store[contentId] || [];
  const updatedComments = [...existingComments, newComment];
  
  saveComments({ ...store, [contentId]: updatedComments });
  
  return newComment;
}

/**
 * Persists the entire comment store to localStorage.
 * @param {CommentsStore} store - The comment store object.
 */
export function saveComments(store: CommentsStore): void {
  setLocal(COMMENTS_KEY, store);
}
