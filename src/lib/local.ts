
"use client";

import type { User } from './authLocal';
import type { MoodLogEntry } from './mood-log';
import { seedActivityData } from './activity';
import { subDays, format, getYear, getMonth, endOfMonth } from 'date-fns';

// --- Storage Abstraction ---

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

// --- Specific Data Models & Constants ---

export const EMERGENCY_TOPUP_LIMIT_EUR = 20;
export const SUGGEST_MIN_EUR = 10;
export const SUGGEST_MAX_EUR = 500;

export interface BudgetLock {
    enabled: boolean;
    until: string | null;
    emergency_used: boolean;
}

export interface Wallet {
    balance_cents: number;
    budget_cents: number;
    budget_set: boolean;
    spent_this_month_cents: number;
    month_key: string; // YYYY-MM
    budget_lock: BudgetLock;
}

export interface BudgetProfile {
    answers: Record<string, any>;
    suggested_cents: number;
    last_updated: string;
}

export interface SpendLogEntry {
    ts: string;
    type: "consultation" | "horoscope" | "topup" | "emergency" | "other";
    amount_cents: number;
    note: string;
    runningBalance: number;
}

export interface Metrics {
    topups: number;
    emergencies: number;
    horoscope_purchases: number;
}

const WALLET_KEY = 'ast_wallet';
const BUDGET_PROFILE_KEY = 'ast_budget_profile';
const SPEND_LOG_KEY = 'ast_spend_log';
const METRICS_KEY = 'ast_metrics';


// --- INITIALIZATION & MONTHLY RESET ---
export function initializeLocalStorage() {
  seedOnce('ast_db_seeded_v3', () => {
    // Seed Admin Config
    setLocal('ast_admin_config', { detailedHoroscopeFeeEUR: 2.5 });

    // Seed Guest Wallet (handled by getWallet default)
    getWallet(); 
    
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
    
    // Guest Favorites
    const existingGuestFavorites = getLocal(FAVORITES_KEY);
    if (!existingGuestFavorites) {
        setFavorites(['aeliana-rose', 'seraphina-moon']);
    }

    // Seed Activity Data
    seedActivityData();

    // Seed Spend Log
    const spendLog = getSpendLog();
    if (spendLog.length === 0) {
        const now = new Date();
        const initialLog = [
            { ts: subDays(now, 1).toISOString(), type: 'consultation', amount_cents: -1250, note: "Session with Aeliana Rose" },
            { ts: subDays(now, 3).toISOString(), type: 'horoscope', amount_cents: -250, note: 'Detailed Horoscope' },
            { ts: subDays(now, 7).toISOString(), type: 'topup', amount_cents: 2000, note: 'Wallet top-up' },
        ];
        setLocal(SPEND_LOG_KEY, initialLog);
    }
  });

  // Monthly Wallet Reset Logic
  const wallet = getLocal<Wallet>(WALLET_KEY);
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  if (wallet && wallet.month_key !== currentMonthKey) {
      const updatedWallet: Wallet = {
          ...wallet,
          spent_this_month_cents: 0,
          month_key: currentMonthKey,
          budget_lock: {
              enabled: wallet.budget_lock?.enabled || false,
              until: wallet.budget_lock?.enabled ? format(endOfMonth(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ssXXX') : null,
              emergency_used: false,
          }
      };
      setLocal(WALLET_KEY, updatedWallet);
  }
}


// --- Wallet Specific Helpers ---
export const getWallet = (): Wallet => {
    const wallet = getLocal<Wallet>(WALLET_KEY);
    if (!wallet) {
        const defaultWallet = {
            balance_cents: 0,
            budget_cents: 0,
            budget_set: false,
            spent_this_month_cents: 0,
            month_key: format(new Date(), 'yyyy-MM'),
            budget_lock: {
                enabled: false,
                until: null,
                emergency_used: false
            }
        };
        setLocal(WALLET_KEY, defaultWallet);
        return defaultWallet;
    }
    return wallet;
};
export const setWallet = (wallet: Wallet) => {
    setLocal(WALLET_KEY, wallet);
    window.dispatchEvent(new Event('storage'));
}

export function spendFromWallet(amount_cents: number, type: SpendLogEntry['type'], note: string, requireUnlocked = true): boolean {
    const wallet = getWallet();

    if (requireUnlocked && wallet.budget_lock?.enabled && wallet.spent_this_month_cents >= wallet.budget_cents) {
        console.warn("Budget is locked. Transaction blocked.");
        return false;
    }
    
    if (wallet.balance_cents < amount_cents) {
        console.warn("Insufficient funds.");
        return false;
    }

    const newWalletState: Wallet = {
        ...wallet,
        balance_cents: wallet.balance_cents - amount_cents,
        spent_this_month_cents: wallet.spent_this_month_cents + amount_cents,
    };
    setWallet(newWalletState);

    addSpendLogEntry({
        ts: new Date().toISOString(),
        type: type,
        amount_cents: -amount_cents,
        note: note,
    });
    
    return true;
}


// --- Budget Profile Helpers ---
export const getBudgetProfile = (): BudgetProfile | null => getLocal<BudgetProfile>(BUDGET_PROFILE_KEY);
export const setBudgetProfile = (profile: BudgetProfile) => setLocal(BUDGET_PROFILE_KEY, profile);

// --- Spend Log Helpers ---
export const getSpendLog = (): Omit<SpendLogEntry, 'runningBalance'>[] => getLocal<Omit<SpendLogEntry, 'runningBalance'>[]>(SPEND_LOG_KEY) || [];
export const addSpendLogEntry = (entry: Omit<SpendLogEntry, 'runningBalance'>) => {
    const log = getSpendLog();
    log.unshift(entry); // Add to the beginning
    setLocal(SPEND_LOG_KEY, log);
}


// Admin Config
interface AdminConfig {
    detailedHoroscopeFeeEUR: number;
}
const ADMIN_CONFIG_KEY = 'ast_admin_config';
export const getAdminConfig = (): AdminConfig | null => getLocal<AdminConfig>(ADMIN_CONFIG_KEY);
export const setAdminConfig = (config: AdminConfig) => setLocal(ADMIN_CONFIG_KEY, config);


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


// Metrics
export const getMetrics = (): Metrics => {
    return getLocal<Metrics>(METRICS_KEY) || {
        topups: 0,
        emergencies: 0,
        horoscope_purchases: 0
    };
}

export const incrementMetric = (key: keyof Metrics) => {
    const metrics = getMetrics();
    metrics[key] += 1;
    setLocal(METRICS_KEY, metrics);
}
