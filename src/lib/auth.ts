"use client";

const AUTH_KEY = 'astrethique_auth_v1';

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  lang?: 'EN' | 'FR';
  createdAt: string;
};

// Helper functions for localStorage that can handle server-side rendering
const storage =
  typeof window !== "undefined"
    ? window.localStorage
    : {
        getItem: (): string | null => null,
        setItem: (key: string, value: string): void => {},
        removeItem: (key: string): void => {},
      };

/**
 * Retrieves the authenticated user object from local storage.
 * @returns {AuthUser | null} The user object or null if not found.
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const item = storage.getItem(AUTH_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading user from local storage:`, error);
    return null;
  }
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user is logged in, false otherwise.
 */
export function isLoggedIn(): boolean {
  return !!getUser();
}

/**
 * Creates a new user session and saves it to local storage.
 * @param {string} name - The user's name.
 * @param {string} [email] - The user's email (optional).
 * @returns {AuthUser} The newly created user object.
 */
export function loginUser(name: string, email?: string): AuthUser {
  const newUser: AuthUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email,
    avatar: `https://i.pravatar.cc/150?u=${name}`,
    createdAt: new Date().toISOString(),
    lang: navigator.language.startsWith('fr') ? 'FR' : 'EN'
  };

  try {
    storage.setItem(AUTH_KEY, JSON.stringify(newUser));
  } catch (error) {
    console.error(`Error saving user to local storage:`, error);
  }

  return newUser;
}

/**
 * Removes the current user session from local storage.
 */
export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    storage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error(`Error removing user from local storage:`, error);
  }
}
