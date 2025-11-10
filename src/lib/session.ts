
"use client";

// This file uses sessionStorage. For localStorage, please use `local.ts`.

let storage: Storage;

try {
  storage = typeof window !== "undefined" ? window.sessionStorage : createInMemoryStorage();
} catch (error) {
  console.warn("sessionStorage is not available. Falling back to in-memory storage.", error);
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

export function getSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from session storage for key "${key}":`, error);
    return null;
  }
}

export function setSession<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to session storage for key "${key}":`, error);
  }
}

export function removeSession(key: string): void {
    if (typeof window === "undefined") return;
    try {
        storage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from session storage for key "${key}":`, error);
    }
}
