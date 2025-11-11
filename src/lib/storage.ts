
"use client";

// --- STORAGE KEYS ---
const KEYS = {
    USERS: 'ast_users',
    CURRENT_USER_ID: 'ast_currentUserId',
    PREFERENCES: 'ast_prefs',
    FAVORITES: 'ast_favorites',
    WALLETS: 'ast_wallets',
    COMMENTS: 'ast_comments',
    METRICS: 'ast_metrics',
};

// --- DATA STRUCTURES ---
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'visitor' | 'consultant';
    createdAt: string; // ISO Date
    emailVerified: boolean;
    kycStatus: "pending" | "verified" | "rejected" | "n/a";
}

export interface Preferences {
    language: "EN" | "FR";
    timezone: string;
    marketingOptIn: boolean;
}

export interface Favorites {
    consultants: string[];
    content: string[];
    conferences: string[];
}

export interface Wallet {
    balance: number;
    currency: '€';
    budgetLock?: number;
}

export interface Comment {
    id: string;
    userId: string;
    contentId: string;
    type: 'article' | 'podcast';
    body: string;
    createdAt: string; // ISO date
}

export interface Metrics {
    registrations: {
        visitor: number;
        consultant: number;
    };
    logins: number;
    comments: number;
    favorites: number;
}


// --- CORE STORAGE HELPERS ---

let storage: Storage;
try {
  storage = typeof window !== "undefined" ? window.localStorage : createInMemoryStorage();
} catch (error) {
  console.warn("localStorage is not available. Falling back to in-memory storage.", error);
  storage = createInMemoryStorage();
}

function createInMemoryStorage(): Storage {
    const store: { [key: string]: string } = {};
    return {
        getItem: (key: string): string | null => store[key] || null,
        setItem: (key: string, value: string): void => { store[key] = value; },
        removeItem: (key: string): void => { delete store[key]; },
        clear: (): void => { for (const key in store) { delete store[key]; } },
        key: (index: number): string | null => Object.keys(store)[index] || null,
        get length(): number { return Object.keys(store).length; },
    };
}

export function getStorageItem<T>(key: string): T | null {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage for key "${key}":`, error);
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to storage for key "${key}":`, error);
  }
}

// --- UTILITY FUNCTIONS ---

export function createId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function hashPassword(plain: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
        console.warn("Web Crypto API not available. Storing password as base64. (FOR DEMO ONLY)");
        return btoa(plain);
    }
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch(e) {
        console.error("Password hashing failed. Storing as base64 as fallback. (FOR DEMO ONLY)", e);
        return btoa(plain);
    }
}


// --- USER MANAGEMENT ---

export function getUsers(): User[] {
    return getStorageItem<User[]>(KEYS.USERS) || [];
}

export function saveUsers(users: User[]): void {
    setStorageItem(KEYS.USERS, users);
}

export function findUserByEmail(email: string): User | undefined {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getCurrentUserId(): string | null {
    return getStorageItem<string>(KEYS.CURRENT_USER_ID);
}

export function setCurrentUser(userId: string | null): void {
    if (userId === null) {
        storage.removeItem(KEYS.CURRENT_USER_ID);
    } else {
        setStorageItem(KEYS.CURRENT_USER_ID, userId);
    }
}

export function getCurrentUser(): User | null {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return getUsers().find(u => u.id === userId) || null;
}

export function isLoggedIn(): boolean {
    return !!getCurrentUser();
}

// --- METRICS ---
export function getMetrics(): Metrics {
    const defaultMetrics: Metrics = {
        registrations: { visitor: 0, consultant: 0 },
        logins: 0,
        comments: 0,
        favorites: 0
    };
    return getStorageItem<Metrics>(KEYS.METRICS) || defaultMetrics;
}

export function trackMetric(
    key: 'registrations.visitor' | 'registrations.consultant' | 'logins' | 'comments' | 'favorites'
) {
    const metrics = getMetrics();
    const keys = key.split('.');
    if (keys.length === 2) {
        (metrics[keys[0] as 'registrations'] as any)[keys[1]]++;
    } else {
        (metrics[key as keyof Metrics] as number)++;
    }
    setStorageItem(KEYS.METRICS, metrics);
}


// --- INITIAL SEEDING ---

function seedInitialData() {
    if (getStorageItem(KEYS.USERS) === null) {
        setStorageItem(KEYS.USERS, []);
    }
    if (getStorageItem(KEYS.PREFERENCES) === null) {
        setStorageItem(KEYS.PREFERENCES, {});
    }
    if (getStorageItem(KEYS.FAVORITES) === null) {
        setStorageItem(KEYS.FAVORITES, {});
    }
    if (getStorageItem(KEYS.WALLETS) === null) {
        setStorageItem(KEYS.WALLETS, {});
    }
     if (getStorageItem(KEYS.COMMENTS) === null) {
        setStorageItem(KEYS.COMMENTS, []);
    }
     if (getStorageItem(KEYS.METRICS) === null) {
        setStorageItem(KEYS.METRICS, { registrations: { visitor: 0, consultant: 0 }, logins: 0, comments: 0, favorites: 0 });
    }
}

// Run seeding logic on module load
if (typeof window !== 'undefined') {
    seedInitialData();
}
