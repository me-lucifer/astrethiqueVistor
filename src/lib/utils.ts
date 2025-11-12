import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}
