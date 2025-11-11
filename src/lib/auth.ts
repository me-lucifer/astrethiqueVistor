
"use client";

import { getSession, setSession, removeSession } from './session';

export interface AuthUser {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
}

const USER_KEY = 'authUser';

/**
 * "Logs in" a user by creating a simple user object and storing it in session storage.
 * This is a simplified demo implementation.
 * @param name The user's display name.
 * @param email The user's optional email.
 */
export function loginUser(name: string, email?: string): AuthUser {
    const userId = name.toLowerCase().replace(/\s/g, '_');
    const user: AuthUser = {
        id: userId,
        name,
        email,
        avatar: `https://i.pravatar.cc/40?u=${userId}`,
    };
    setSession(USER_KEY, user);
    setSession("userRegistered", "true");
    return user;
}

/**
 * "Logs out" the user by removing their data from session storage.
 */
export function logoutUser(): void {
    removeSession(USER_KEY);
}

/**
 * Retrieves the currently "logged in" user from session storage.
 * @returns The user object or null if no user is logged in.
 */
export function getUser(): AuthUser | null {
    return getSession<AuthUser>(USER_KEY);
}
