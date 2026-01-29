export const DEFAULT_API_BASE = 'https://api.thienhang.com';

export const API_HOSTS = {
    production: 'https://api.thienhang.com',
    local: 'https://api.thienhang.com'
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
    // If running on localhost, prefer the local API host to avoid calling production API during development
    try {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.location && window.location.hostname) {
            // treat localhost and 127.x.x.x as local dev
            const host = window.location.hostname;
            if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host === '::1') {
                return API_HOSTS.local;
            }
        }
    } catch (e) {
        // ignore
    }

    return DEFAULT_API_BASE;
}
