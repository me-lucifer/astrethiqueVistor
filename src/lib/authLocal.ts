
"use client";

// --- DATA STRUCTURES ---
interface User {
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
    emailVerified: boolean;
    wallet: { balanceCents: number };
    favorites: { consultants: string[]; content: string[] };
}

interface Session {
    userId: string;
    role: 'visitor' | 'consultant';
    createdAt: string; // ISO Date
}

interface AstroStore {
    users: User[];
    session: Session | null;
}


// --- STORAGE HELPERS ---

function getStore(): AstroStore {
    if (typeof window === 'undefined') {
        return { users: [], session: null };
    }
    try {
        const item = localStorage.getItem('astro');
        return item ? JSON.parse(item) : { users: [], session: null };
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return { users: [], session: null };
    }
}

function saveStore(store: AstroStore): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('astro', JSON.stringify(store));
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Error writing to localStorage:", error);
    }
}


// --- CORE AUTH FUNCTIONS ---

export function emailExists(email: string): boolean {
    const store = getStore();
    return store.users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function hashPassword(plain: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
        console.warn("Web Crypto API not available. Using legacy fallback.");
        return `legacy:${btoa(plain)}`;
    }
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (e) {
        console.error("Password hashing failed. Using legacy fallback.", e);
        return `legacy:${btoa(plain)}`;
    }
}

export function createId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function registerVisitor(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    language: "EN" | "FR";
    timezone: string;
    marketingOptIn: boolean;
}): Promise<User> {
    if (emailExists(payload.email)) {
        throw new Error("An account with this email already exists. Login instead.");
    }
    
    const store = getStore();
    const passwordHash = await hashPassword(payload.password);
    const now = new Date().toISOString();

    const newUser: User = {
        id: createId("usr"),
        role: 'visitor',
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        language: payload.language,
        timezone: payload.timezone,
        marketingOptIn: payload.marketingOptIn,
        createdAt: now,
        updatedAt: now,
        emailVerified: false,
        wallet: { balanceCents: 0 },
        favorites: { consultants: [], content: [] },
    };

    store.users.push(newUser);
    
    // Create session immediately after registration
    store.session = {
        userId: newUser.id,
        role: newUser.role,
        createdAt: now,
    };

    saveStore(store);

    return newUser;
}

export function getCurrentUser(): User | null {
    const store = getStore();
    if (!store.session) return null;
    return store.users.find(u => u.id === store.session!.userId) || null;
}

export function createSession(user: User): void {
    const store = getStore();
    store.session = {
        userId: user.id,
        role: user.role,
        createdAt: new Date().toISOString(),
    };
    saveStore(store);
}

export function clearSession(): void {
    const store = getStore();
    store.session = null;
    saveStore(store);
}

export function isLoggedIn(): boolean {
    const store = getStore();
    return !!store.session;
}

export function findUserByEmail(email: string): User | undefined {
    const store = getStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUser(updatedUser: User): void {
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        store.users[userIndex] = updatedUser;
        saveStore(store);
    }
}

export function deleteUser(userId: string): void {
    const store = getStore();
    const updatedUsers = store.users.filter(u => u.id !== userId);
    store.users = updatedUsers;
    
    if (store.session && store.session.userId === userId) {
        store.session = null;
    }
    
    saveStore(store);
}
