

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

export interface Wallet {
    balance_cents: number;
    budget_cents: number;
    spent_this_month_cents: number;
    budget_lock: {
        enabled: boolean;
        emergency_used: boolean;
        until: string | null;
    };
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
}


// --- Wallet Specific Helpers ---
export const getWallet = (): Wallet => {
    let wallet = getLocal<Wallet>(WALLET_KEY);
    const now = new Date();
    const currentMonthEnd = endOfMonth(now).toISOString();

    if (!wallet) {
        const defaultWallet: Wallet = {
            balance_cents: 0,
            budget_cents: 0,
            spent_this_month_cents: 0,
            budget_lock: { enabled: false, emergency_used: false, until: null },
            monthStart: startOfMonth(now).toISOString(),
            monthEnd: currentMonthEnd,
            wizardSeen: false,
            budget_set: false,
            aboutYou: { home: 'rent', income: 3000, household: 1, hasOther: false, otherIncome: 0 },
            essentials: { rent: 1200, utilities: 150, groceries: 400, transport: 100, debts: 0, savingsPct: 10 },
            suggestionMeta: { rate: 0.25 }
        };
        setLocal(WALLET_KEY, defaultWallet);
        return defaultWallet;
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


    // Monthly Reset Logic
    if (new Date(wallet.monthEnd) < now) {
        wallet = {
            ...wallet,
            spent_this_month_cents: 0,
            monthStart: startOfMonth(now).toISOString(),
            monthEnd: currentMonthEnd,
            budget_lock: { 
                ...wallet.budget_lock,
                enabled: false,
                emergency_used: false,
                until: null
            },
        };
        setLocal(WALLET_KEY, wallet);
    }

    return wallet;
};
export const setWallet = (wallet: Wallet) => {
    setLocal(WALLET_KEY, wallet);
    window.dispatchEvent(new Event('storage'));
}

export function spendFromWallet(amount_cents: number, type: SpendLogEntry['type'], note: string): { ok: boolean, message: string } {
    const wallet = getWallet();
    const result = { ok: false, message: "" };

    // Allow 0 amount checks (e.g. to see if wallet is locked)
    if (amount_cents > 0) {
      if (wallet.budget_lock.enabled) {
          result.message = `locked:Budget is locked until ${format(new Date(wallet.monthEnd), "MMM do")}.`;
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

    