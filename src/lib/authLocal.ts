
"use client";

// --- DATA STRUCTURES ---
export interface User {
    id: string;
    role: 'visitor' | 'consultant';
    firstName: string;
    lastName: string;
    pseudonym?: string;
    displayNamePreference: 'realName' | 'pseudonym';
    email: string;
    passwordHash: string;
    language: "EN" | "FR";
    timezone: string;
    marketingOptIn: boolean;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
    emailVerified: boolean;
    wallet: { balanceCents: number, budgetLock?: number };
    favorites: { consultants: string[]; content: string[] };
    publicName: string;
    nameHistory: string[];
}

export interface Comment {
    id: string;
    userId: string;
    contentId: string;
    type: 'article' | 'podcast';
    body: string;
    createdAt: string;
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
// These now use getLocal/setLocal but are kept for semantic clarity
// and to ensure a single namespace is used for the store.

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
export const reservedPseudonyms = ["admin", "moderator", "support", "astrethique", "owner", "null", "undefined"];

export function emailExists(email: string): boolean {
    const store = getStore();
    return store.users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

export function pseudonymExists(pseudonym: string): boolean {
    if (!pseudonym) return false;
    const n = (pseudonym||'').toLowerCase()
    const store = getStore();
    return store.users.some(u => (u.pseudonym||'').toLowerCase() === n)
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
    pseudonym?: string;
    displayNamePreference: 'realName' | 'pseudonym';
    email: string;
    password: string;
    language: "EN" | "FR";
    timezone: string;
    marketingOptIn: boolean;
}): Promise<User> {
    if (emailExists(payload.email)) {
        throw new Error("An account with this email already exists. Login instead.");
    }

    const usePseudonym = payload.displayNamePreference === 'pseudonym';
    const pseudonym = (payload.pseudonym || '').trim() || undefined;

    if (usePseudonym && pseudonym) {
        if (pseudonymExists(pseudonym)) {
             throw new Error("That pseudonym is taken. Try another.");
        }
        if (reservedPseudonyms.includes(pseudonym.toLowerCase())) {
            throw new Error("This word isn’t allowed as a pseudonym.");
        }
    }
    
    const store = getStore();
    const passwordHash = await hashPassword(payload.password);
    const now = new Date().toISOString();

    const publicName = usePseudonym && pseudonym ? pseudonym : `${payload.firstName} ${payload.lastName}`.trim();

    const newUser: User = {
        id: createId("usr"),
        role: 'visitor',
        firstName: payload.firstName,
        lastName: payload.lastName,
        pseudonym: pseudonym,
        displayNamePreference: payload.displayNamePreference,
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
        publicName: publicName,
        nameHistory: [publicName],
    };

    store.users.push(newUser);
    
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

export function getUsers(): User[] {
    return getStore().users;
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
        
        // Recompute publicName
        const usePseudonym = updatedUser.displayNamePreference === 'pseudonym';
        const pseudonym = (updatedUser.pseudonym || '').trim() || undefined;
        const publicName = usePseudonym && pseudonym ? pseudonym : `${updatedUser.firstName} ${updatedUser.lastName}`.trim();
        
        let nameHistory = updatedUser.nameHistory || [store.users[userIndex].publicName];
        if (nameHistory[nameHistory.length - 1] !== publicName) {
            nameHistory.push(publicName);
        }

        store.users[userIndex] = {
            ...updatedUser,
            publicName,
            nameHistory
        };
        
        saveStore(store);
    }
}

export async function login(email: string, plainPassword: string):Promise<User> {
    const user = findUserByEmail(email);
    if (!user) {
        throw new Error("No account found with this email.");
    }
    
    const passwordHash = await hashPassword(plainPassword);
    if (passwordHash !== user.passwordHash) {
        // Fallback for legacy passwords
        if (`legacy:${btoa(plainPassword)}` !== user.passwordHash) {
            throw new Error("Incorrect password.");
        }
    }

    createSession(user);
    return user;
}


export async function changePassword(
    userId: string, 
    currentPassword: string | null, 
    newPassword: string,
    isAdminReset: boolean = false
): Promise<void> {
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        throw new Error("User not found.");
    }

    const user = store.users[userIndex];

    if (!isAdminReset && currentPassword) {
        const currentPasswordHash = await hashPassword(currentPassword);
        if (currentPasswordHash !== user.passwordHash && `legacy:${btoa(currentPassword)}` !== user.passwordHash) {
            throw new Error("Your current password does not match.");
        }
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    store.users[userIndex] = { ...user, passwordHash: newPasswordHash, updatedAt: new Date().toISOString() };
    saveStore(store);
}

export function deleteUser(userId: string): void {
    const store = getStore();
    store.users = store.users.filter(u => u.id !== userId);
    
    if (store.session && store.session.userId === userId) {
        store.session = null;
    }
    
    saveStore(store);
}

// --- HELPERS FROM DEPRECATED local.ts for comments ---
// These are included to avoid breaking the comments feature.
// They should be refactored to use the new store if comments are kept.
export function getLocal<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return null;
  }
}

export function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}
