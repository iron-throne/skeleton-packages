import { EStorageKey } from "$lib/types";
import { browser } from '$app/environment';

// Save a value to localStorage
export function setItem(key: EStorageKey, value: string): void {
    localStorage.setItem(key, value);
}

// Get a value from localStorage
export function getItem(key: EStorageKey): string | null {
    if (!browser) return '';
    return localStorage.getItem(key);
}

// Remove a specific key
export function removeItem(key: EStorageKey): void {
    localStorage.removeItem(key);
}

// Check if a key exists
export function hasItem(key: EStorageKey): boolean {
    return localStorage.getItem(key) !== null;
}

// Clear only your app's keys (safe)
export function clearAppStorage(): void {
    Object.values(EStorageKey).forEach((key) => localStorage.removeItem(key));
}