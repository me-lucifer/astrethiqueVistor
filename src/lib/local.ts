
"use client";

// This file uses localStorage. For sessionStorage, please use `session.ts`.

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


export function getLocal<T>(key: string): T | null {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from local storage for key "${key}":`, error);
    return null;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to local storage for key "${key}":`, error);
  }
}

export function removeLocal(key: string): void {
    try {
        storage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from local storage for key "${key}":`, error);
    }
}

export function seedOnce(key: string, seeder: () => void): void {
  if (typeof window === "undefined") return;
  const hasBeenSeeded = getLocal(key);
  if (!hasBeenSeeded) {
    seeder();
    setLocal(key, true);
  }
}
