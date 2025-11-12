
"use client";

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
  const testKey = 'sessionStorage_test';
  storage = typeof window !== "undefined" ? window.sessionStorage : createInMemoryStorage();
  storage.setItem(testKey, 'test');
  storage.removeItem(testKey);
} catch (error) {
  console.warn("sessionStorage is not available. Falling back to in-memory storage.", error);
  storage = createInMemoryStorage();
}

export function getSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from sessionStorage for key "${key}":`, error);
    return null;
  }
}

export function setSession<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to sessionStorage for key "${key}":`, error);
  }
}

export function removeSession(key: string): void {
    if (typeof window === 'undefined') return;
    try {
        storage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from sessionStorage for key "${key}":`, error);
    }
}

export function seedOnce(flagKey: string, seedFn: () => void): void {
    if (typeof window === 'undefined') return;
    const hasBeenSeeded = getSession<boolean>(flagKey);
    if (!hasBeenSeeded) {
        seedFn();
        setSession(flagKey, true);
    }
}
