export const DEFAULT_API_BASE = 'https://api.thienhang.com';

export const API_HOSTS = {
    production: 'https://api.thienhang.com',
    local: 'http://localhost:8080'
};

export function getApiBase(): string {
    // Preference order: runtime override via window.__API_BASE__, then environment stored in localStorage, fallback to DEFAULT_API_BASE
    try {
        // Allow a runtime override for quick testing
        // @ts-ignore
        if (typeof window !== 'undefined' && window.__API_BASE__) {
            // @ts-ignore
            return window.__API_BASE__;
        }
        const stored = localStorage.getItem('API_BASE');
        if (stored) return stored;
    } catch (e) {
        // ignore
    }
    return DEFAULT_API_BASE;
}
