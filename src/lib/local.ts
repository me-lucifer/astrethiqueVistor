

"use client";

import type { User } from './authLocal';
import type { MoodLogEntry } from './mood-log';
import { seedActivityData } from './activity';
import { subDays, format, getYear, getMonth, endOfMonth, startOfMonth } from 'date-fns';

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
    window.dispatchEvent(new Event('storage_change'));
  } catch (error) {
    console.error(`Error writing to storage for key "${key}":`, error);
  }
}

export function removeLocal(key: string): void {
    try {
        storage.removeItem(key);
        window.dispatchEvent(new Event('storage_change'));
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

export interface Wallet {
    balance_cents: number;
    budget_cents: number;
    spent_this_month_cents: number;
    budget_lock: {
        enabled: boolean;
        emergency_used: boolean;
        until: string | null;
    };
    month: string; // YYYY-MM format
    monthStart: string;
    monthEnd: string;
    wizardSeen: boolean;
    budget_set: boolean;
    aboutYou: {
        home: "own" | "rent";
        income: number;
        household: number;
        hasOther: boolean;
        otherIncome?: number;
    };
    essentials: {
        rent: number;
        utilities: number;
        groceries: number;
        transport: number;
        debts: number;
        savingsPct: number;
    };
    suggestionMeta: {
        rate: number;
    };
}


export interface SpendLogEntry {
    ts: string;
    type: "consultation" | "horoscope" | "topup" | "emergency" | "other";
    amount_cents: number;
    note: string;
    runningBalance?: number;
}

export interface Metrics {
    topups: number;
    emergencies: number;
    horoscope_purchases: number;
}

const WALLET_KEY = 'ast_wallet';
const SPEND_LOG_KEY = 'ast_spend_log';
const METRICS_KEY = 'ast_metrics';

// --- INITIALIZATION ---
// This part can be moved to a main app entry point if needed
seedOnce('ast_db_seeded_v3', () => {
  setLocal('ast_admin_config', { detailedHoroscopeFeeEUR: 2.5 });
  // Other app-wide seeding can go here
});

// --- Wallet Specific Helpers ---
export const getWallet = (): Wallet => {
    let wallet = getLocal<Wallet>(WALLET_KEY);
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');

    if (!wallet) {
        const newWallet: Wallet = {
            balance_cents: 0,
            budget_cents: 0,
            spent_this_month_cents: 0,
            budget_lock: { enabled: false, emergency_used: false, until: null },
            month: currentMonth,
            monthStart: startOfMonth(now).toISOString(),
            monthEnd: endOfMonth(now).toISOString(),
            wizardSeen: false,
            budget_set: false,
            aboutYou: { home: 'rent', income: 3000, household: 1, hasOther: false, otherIncome: 0 },
            essentials: { rent: 1200, utilities: 150, groceries: 400, transport: 100, debts: 0, savingsPct: 10 },
            suggestionMeta: { rate: 0.25 }
        };
        setLocal(WALLET_KEY, newWallet);
        return newWallet;
    }

    // Monthly Reset Logic
    if (wallet.month !== currentMonth) {
        wallet = {
            ...wallet,
            spent_this_month_cents: 0,
            month: currentMonth,
            monthStart: startOfMonth(now).toISOString(),
            monthEnd: endOfMonth(now).toISOString(),
            budget_lock: {
                ...wallet.budget_lock,
                enabled: false, // Reset lock at start of new month
                emergency_used: false,
                until: null
            },
        };
        setLocal(WALLET_KEY, wallet);
    }
    
    // Data migration/guarding for older wallet objects
    if (!wallet.budget_lock) {
        wallet.budget_lock = { enabled: false, emergency_used: false, until: null };
    }
    if (typeof wallet.budget_set === 'undefined') {
        wallet.budget_set = wallet.wizardSeen || wallet.budget_cents > 0;
    }
    if(!wallet.aboutYou) {
        wallet.aboutYou = { home: 'rent', income: 3000, household: 1, hasOther: false, otherIncome: 0 };
    }
    if(!wallet.essentials) {
        wallet.essentials = { rent: 1200, utilities: 150, groceries: 400, transport: 100, debts: 0, savingsPct: 10 };
    }
     if(!wallet.suggestionMeta) {
        wallet.suggestionMeta = { rate: 0.25 };
    }


    return wallet;
};

export const setWallet = (wallet: Wallet) => {
    setLocal(WALLET_KEY, wallet);
}

export const removeWallet = () => {
    removeLocal(WALLET_KEY);
}

export function spendFromWallet(amount_cents: number, type: SpendLogEntry['type'], note: string): { ok: boolean, message: string } {
    const wallet = getWallet();
    const result = { ok: false, message: "" };

    if (amount_cents > 0) {
      if (wallet.budget_lock.enabled) {
          result.message = `locked:Budget is locked until ${wallet.monthEnd ? format(new Date(wallet.monthEnd), "MMM do") : 'the end of the month'}.`;
          console.log("Spend failed:", result.message);
          return result;
      }

      if (wallet.budget_set && (wallet.spent_this_month_cents + amount_cents) > wallet.budget_cents) {
          result.message = "This transaction exceeds your monthly budget.";
          console.log("Spend failed:", result.message);
          return result;
      }

      if (wallet.balance_cents < amount_cents) {
          result.message = "Insufficient funds in your wallet.";
          console.log("Spend failed:", result.message);
          return result;
      }
    }
    
    const newWalletState: Wallet = {
        ...wallet,
        balance_cents: wallet.balance_cents - amount_cents,
        spent_this_month_cents: wallet.spent_this_month_cents + amount_cents,
    };
    setWallet(newWalletState);

    if (amount_cents > 0) {
        addSpendLogEntry({
            ts: new Date().toISOString(),
            type: type,
            amount_cents: -amount_cents,
            note: note,
        });
    }
    
    result.ok = true;
    result.message = "Transaction successful.";
    console.log("Spend successful:", { result, amount: amount_cents, newBalance: newWalletState.balance_cents });
    return result;
}

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

    
