
"use client";

import { getLocal, setLocal, seedOnce } from './local';

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

// --- INITIALIZATION ---
function initializeLocalStorage() {
  seedOnce('ast_admin_config_seeded', () => {
    setLocal('ast_admin_config', { detailedHoroscopeFeeEUR: 2.5 });
  });
  seedOnce('ast_wallet_seeded', () => {
    // This is a global wallet for guests, logged-in users have their own
    setLocal('ast_wallet', { balanceEUR: 5 });
  });
  seedOnce('ast_mood_log_seeded', () => {
    setLocal('ast_mood_log', []);
  });
  seedOnce('ast_favorites_seeded', () => {
    // For guest favorites
    setLocal('ast_favorites', []);
  });
}

// Ensure initialization runs once on module load
if (typeof window !== 'undefined') {
    initializeLocalStorage();
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
export const reservedPseudonyms = ["admin", "moderator", "support", "astrethique", "owner", "null", "undefined"];

export function emailExists(email: string): boolean {
    const store = getStore();
    return store.users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

export function pseudonymExists(pseudonym: string, currentUserId?: string): boolean {
    if (!pseudonym) return false;
    const n = (pseudonym||'').toLowerCase()
    const store = getStore();
    return store.users.some(u => u.id !== currentUserId && (u.pseudonym||'').toLowerCase() === n)
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
    
    let user = store.users.find(u => u.id === store.session!.userId) || null;

    if (user && user.displayNamePreference === undefined) {
        // This is a migration for older user objects.
        console.log(`Migrating user: ${user.id}`);
        // Set default display preference and compute public name
        const migratedUser = updateUser(user.id, {
            displayNamePreference: 'pseudonym', // Defaulting to pseudonym as requested
        });
        return migratedUser;
    }
    
    return user;
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

export function updateUser(userId: string, updatedFields: Partial<User>): User {
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        throw new Error("User not found for update.");
    }
    
    const currentUser = store.users[userIndex];
    const potentialUpdatedUser = { ...currentUser, ...updatedFields };

    // Recompute publicName
    const usePseudonym = potentialUpdatedUser.displayNamePreference === 'pseudonym';
    const pseudonym = (potentialUpdatedUser.pseudonym || '').trim() || undefined;
    const publicName = usePseudonym && pseudonym ? pseudonym : `${potentialUpdatedUser.firstName} ${potentialUpdatedUser.lastName}`.trim();
    
    let nameHistory = potentialUpdatedUser.nameHistory || [currentUser.publicName];
    if (nameHistory.length === 0 || nameHistory[nameHistory.length - 1] !== publicName) {
        nameHistory.push(publicName);
    }
    
    const finalUpdatedUser = {
        ...potentialUpdatedUser,
        publicName,
        nameHistory,
        updatedAt: new Date().toISOString()
    };

    store.users[userIndex] = finalUpdatedUser;
    saveStore(store);
    
    return finalUpdatedUser;
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
