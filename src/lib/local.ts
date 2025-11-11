
"use client";

import type { User } from './authLocal';
import type { MoodLogEntry } from './mood-log';

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
        type: 'topup' | 'deduction';
        amount: number;
        ts: string;
    }[];
}
const WALLET_KEY = 'ast_wallet';
export const getWallet = (): Wallet | null => getLocal<Wallet>(WALLET_KEY);
export const setWallet = (wallet: Wallet) => setLocal(WALLET_KEY, wallet);


// Mood Log
const MOOD_LOG_KEY = 'ast_mood_log';
export const getMoodLog = (): MoodLogEntry[] => getLocal<MoodLogEntry[]>(MOOD_LOG_KEY) || [];
export const setMoodLog = (log: MoodLogEntry[]) => setLocal(MOOD_LOG_KEY, log);

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
