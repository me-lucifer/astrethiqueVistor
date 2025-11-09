"use client";

// Fallback to a mock storage object on the server
const storage =
  typeof window !== "undefined"
    ? window.sessionStorage
    : {
        getItem: (): string | null => null,
        setItem: (key: string, value: string): void => {},
        removeItem: (key: string): void => {},
        clear: (): void => {},
        length: 0,
        key: (index: number): string | null => null,
      };

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

export function seedOnce(flagKey: string, seedFn: () => void): void {
  if (typeof window === "undefined") return;
  try {
    const flag = getSession(flagKey);
    if (!flag) {
      seedFn();
      setSession(flagKey, true);
    }
  } catch (error) {
    console.error(`Error during seedOnce for key "${flagKey}":`, error);
  }
}
