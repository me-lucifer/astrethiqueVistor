
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
  const testKey = 'localStorage_test';
  storage = typeof window !== "undefined" ? window.localStorage : createInMemoryStorage();
  storage.setItem(testKey, 'test');
  storage.removeItem(testKey);
} catch (error) {
  console.warn("localStorage is not available. Falling back to in-memory storage.", error);
  storage = createInMemoryStorage();
}

export function getLocal<T>(key: string): T | null {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    // This can happen if JSON parsing fails
    console.error(`Error reading from storage for key "${key}":`, error);
    return null;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // This can happen if storage is full or the object is too large
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
