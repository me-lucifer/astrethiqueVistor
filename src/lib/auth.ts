
"use client";

import { getSession, setSession, removeSession } from './session';
import * as storage from './storage';


/**
 * Retrieves the currently "logged in" user from local storage.
 * @returns The user object or null if no user is logged in.
 */
export function getCurrentUser(): storage.User | null {
    return storage.getCurrentUser();
}

/**
 * Logs out the user by clearing the current user ID from storage.
 */
export function logoutUser(): void {
    storage.setCurrentUser(null);
    // Optionally, you might want to clear session-specific data too
    removeSession('userRegistered'); // Example
}

/**
 * A simple login function for the demo.
 * In a real app, this would involve server-side validation.
 */
export async function loginUser(email: string, password_plain: string): Promise<storage.User | { error: string }> {
    const user = storage.findUserByEmail(email);
    if (!user) {
        return { error: "No account found with this email." };
    }

    const passwordHash = await storage.hashPassword(password_plain);
    if (user.passwordHash !== passwordHash) {
        return { error: "Incorrect password." };
    }
    
    storage.setCurrentUser(user.id);
    
    // Also set a session flag for components that use sessionStorage
    setSession("userRegistered", "true");

    return user;
}
