// Utility function to check if running in browser
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Utility function to check if localStorage is available
export function isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
}
