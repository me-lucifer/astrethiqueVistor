
"use client";

// --- DATA STRUCTURES ---
export interface User {
    id: string;
    role: 'visitor' | 'consultant';
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    language: "EN" | "FR";
    timezone: string;
    marketingOptIn: boolean;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
    wallet: { balanceCents: number };
    favorites: { consultants: string[]; content: [] };
}

export interface Session {
    userId: string;
    role: 'visitor' | 'consultant';
    createdAt: string; // ISO Date
}


// --- STORAGE KEYS ---
const KEYS = {
    USERS: 'astro.users',
    SESSION: 'astro.session',
};


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

function getStorageItem<T>(key: string): T | null {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage for key "${key}":`, error);
    return null;
  }
}

function setStorageItem<T>(key: string, value: T): void {
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


// --- SESSION MANAGEMENT ---

export function createSession(user: User): void {
    const session: Session = {
        userId: user.id,
        role: user.role,
        createdAt: new Date().toISOString(),
    };
    setStorageItem(KEYS.SESSION, session);
    window.dispatchEvent(new Event('storage'));
}

export function getSession(): Session | null {
    return getStorageItem<Session>(KEYS.SESSION);
}

export function clearSession(): void {
    storage.removeItem(KEYS.SESSION);
    window.dispatchEvent(new Event('storage'));
}

export function getCurrentUser(): User | null {
    const session = getSession();
    if (!session) return null;
    return getUsers().find(u => u.id === session.userId) || null;
}

export function isLoggedIn(): boolean {
    return !!getSession();
}


// --- INITIAL SEEDING ---

function seedInitialData() {
    if (getStorageItem(KEYS.USERS) === null) {
        setStorageItem(KEYS.USERS, []);
    }
}

// Run seeding logic on module load
if (typeof window !== 'undefined') {
    seedInitialData();
}
