export const API_HOSTS = {
    production: 'https://api.thienhang.com',
    local: 'http://localhost:8080'
};

/**
 * Resolves the base API URL based on the current environment.
 * Prioritizes:
 * 1. window.__API_BASE__ override
 * 2. localStorage 'API_BASE' override
 * 3. Automatic localhost detection (returns http://localhost:8080)
 * 4. Default production (https://api.thienhang.com)
 */
export function getApiBase(): string {
    try {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            if (window.__API_BASE__) return window.__API_BASE__;
            
            const stored = localStorage.getItem('API_BASE');
            if (stored) return stored;

            const host = window.location.hostname;
            if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host === '::1') {
                return API_HOSTS.local;
            }
        }
    } catch (e) {
        // ignore storage/window errors
    }

    return API_HOSTS.production;
}
