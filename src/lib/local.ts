"use client";

const storage =
  typeof window !== "undefined"
    ? window.localStorage
    : {
        getItem: (): string | null => null,
        setItem: (key: string, value: string): void => {},
        removeItem: (key: string): void => {},
        clear: (): void => {},
        length: 0,
        key: (index: number): string | null => null,
      };

export function getLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from local storage for key "${key}":`, error);
    return null;
  }
}

export function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to local storage for key "${key}":`, error);
  }
}

export function removeLocal(key: string): void {
    if (typeof window === "undefined") return;
    try {
        storage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from local storage for key "${key}":`, error);
    }
}

export function seedOnce(flagKey: string, seedFn: () => void): void {
  if (typeof window === "undefined") return;
  try {
    const flag = getLocal(flagKey);
    if (!flag) {
      seedFn();
      setLocal(flagKey, true);
    }
  } catch (error) {
    console.error(`Error during seedOnce for key "${flagKey}":`, error);
  }
}
