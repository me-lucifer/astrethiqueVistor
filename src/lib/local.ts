
"use client";

import type { User } from './authLocal';
import type { MoodLogEntry } from './mood-log';
import { subDays, format } from 'date-fns';

// --- Storage Abstraction ---

function createInMemoryStorage(): Storage {
  const store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      for (const key in store) {
        delete store[key];
      }
    },
    key: (index: number): string | null => Object.keys(store)[index] || null,
    get length(): number {
      return Object.keys(store).length;
    },
  };
}

let storage: Storage;
try {
  const testKey = 'localStorage_test';
  storage = typeof window !== "undefined" ? window.localStorage : createInMemoryStorage();
  storage.setItem(testKey, 'test');
  storage.removeItem(testKey);
} catch (error) {
  console.warn("localStorage is not available. Falling back to in-memory storage.", error);
  storage = createInMemoryStorage();
}

// --- Generic Helpers ---

export function getLocal<T>(key: string): T | null {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage for key "${key}":`, error);
    return null;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to storage for key "${key}":`, error);
  }
}

export function removeLocal(key: string): void {
    try {
        storage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from storage for key "${key}":`, error);
    }
}

export function seedOnce(flagKey: string, seedFn: () => void): void {
    const hasBeenSeeded = getLocal<boolean>(flagKey);
    if (!hasBeenSeeded) {
        seedFn();
        setLocal(flagKey, true);
    }
}

// --- INITIALIZATION ---
export function initializeLocalStorage() {
  seedOnce('ast_db_seeded_v1', () => {
    // Seed Admin Config
    setLocal('ast_admin_config', { detailedHoroscopeFeeEUR: 2.5 });

    // Seed Guest Wallet
    const existingWallet = getLocal<Wallet>(WALLET_KEY);
    if (!existingWallet || isNaN(existingWallet.balanceEUR)) {
      setLocal(WALLET_KEY, { balanceEUR: 5.00, history: [] });
    }

    // Seed Mood Log with historical data
    const existingMoodLog = getLocal<MoodLogEntry[]>(MOOD_LOG_KEY);
    if (!existingMoodLog || existingMoodLog.length === 0) {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const twoDaysAgo = subDays(today, 2);
      const seedLog: MoodLogEntry[] = [
        { dateISO: format(twoDaysAgo, 'yyyy-MM-dd'), money: 3, health: 4, work: 2, love: 5 },
        { dateISO: format(yesterday, 'yyyy-MM-dd'), money: 4, health: 3, work: 3, love: 4 },
      ];
      setLocal(MOOD_LOG_KEY, seedLog);
      setLocal(MOOD_META_KEY, { streak: 2, lastCheckIn: yesterday.toISOString() });
    }
    
    // Guest Favorites (will be overridden by user favorites on login)
    const existingGuestFavorites = getLocal(FAVORITES_KEY);
    if (!existingGuestFavorites) {
        setFavorites(['aeliana-rose', 'seraphina-moon']);
    }

  });
}

// --- Specific Data Accessors ---

// Admin Config
interface AdminConfig {
    detailedHoroscopeFeeEUR: number;
}
const ADMIN_CONFIG_KEY = 'ast_admin_config';
export const getAdminConfig = (): AdminConfig | null => getLocal<AdminConfig>(ADMIN_CONFIG_KEY);
export const setAdminConfig = (config: AdminConfig) => setLocal(ADMIN_CONFIG_KEY, config);

// Wallet
export interface Wallet {
    balanceEUR: number;
    history?: {
        type: 'topup' | 'deduction' | 'horoscope';
        amount: number;
        ts: string;
    }[];
}
const WALLET_KEY = 'ast_wallet';
export const getWallet = (): Wallet | null => {
    const wallet = getLocal<Wallet>(WALLET_KEY);
    if (wallet && isNaN(wallet.balanceEUR)) {
        return { ...wallet, balanceEUR: 0 };
    }
    return wallet;
};
export const setWallet = (wallet: Wallet) => {
    setLocal(WALLET_KEY, wallet);
    window.dispatchEvent(new Event('storage'));
}


// Mood Log
export interface MoodMeta {
    streak: number;
    lastCheckIn: string;
}
const MOOD_LOG_KEY = 'ast_mood_log';
const MOOD_META_KEY = 'ast_mood_meta';
export const getMoodLog = (): MoodLogEntry[] => getLocal<MoodLogEntry[]>(MOOD_LOG_KEY) || [];
export const setMoodLog = (log: MoodLogEntry[], meta: MoodMeta) => {
    setLocal(MOOD_LOG_KEY, log);
    setLocal(MOOD_META_KEY, meta);
    window.dispatchEvent(new Event('storage'));
}
export const getMoodMeta = (): MoodMeta | null => getLocal<MoodMeta>(MOOD_META_KEY);


// Favorites
const FAVORITES_KEY = 'ast_favorites';
export const getFavorites = (): string[] => getLocal<string[]>(FAVORITES_KEY) || [];
export const setFavorites = (favorites: string[]) => setLocal(FAVORITES_KEY, favorites);

// Leads
interface Lead {
    email: string;
    source: string;
    createdAt: string;
    lang: string;
}
const LEADS_KEY = 'leads';
export const getLeads = (): Lead[] => getLocal<Lead[]>(LEADS_KEY) || [];
export const setLeads = (leads: Lead[]) => setLocal(LEADS_KEY, leads);
