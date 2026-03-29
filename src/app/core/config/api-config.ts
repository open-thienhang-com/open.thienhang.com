export const DEFAULT_API_BASE = 'https://api.thienhang.com';

export const API_HOSTS = {
    production: 'https://api.thienhang.com',
    local: 'http://localhost:8082'
};

/**
 * Set to `false` to use local API server (localhost:8082) during development.
 * Set to `true` (default) to always use the production API at api.thienhang.com.
 */
const DEV_USE_PRODUCTION_API = true;

export function getApiBase(): string {
    try {
        // Allow a runtime override for quick testing (window.__API_BASE__ = '...')
        // @ts-ignore
        if (typeof window !== 'undefined' && window.__API_BASE__) {
            // @ts-ignore
            return window.__API_BASE__;
        }
        // Allow override via localStorage key 'API_BASE'
        const stored = localStorage.getItem('API_BASE');
        if (stored) return stored;
    } catch (e) {
        // ignore
    }

    if (!DEV_USE_PRODUCTION_API) {
        // Only use local server when explicitly opted in
        try {
            if (typeof window !== 'undefined' && window.location) {
                const host = window.location.hostname;
                if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host === '::1') {
                    return API_HOSTS.local;
                }
            }
        } catch (e) { /* ignore */ }
    }

    return DEFAULT_API_BASE;
}
