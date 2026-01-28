import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ApiEnvironment = 'local' | 'production';

export interface ApiConfig {
    environment: ApiEnvironment;
    host: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    private readonly configs: Record<ApiEnvironment, ApiConfig> = {
        local: {
            environment: 'local',
            host: 'http://localhost:8081',
            name: 'Local Development'
        },
        production: {
            environment: 'production',
            host: 'https://test-api.routing-deviation.ghn.tech',
            name: 'Production API'
        }
    };

    private currentConfigSubject = new BehaviorSubject<ApiConfig>(this.configs.local);
    public currentConfig$ = this.currentConfigSubject.asObservable();

    constructor() {
        // Load saved configuration from localStorage
        this.loadSavedConfig();
    }

    /**
     * Get current API configuration
     */
    getCurrentConfig(): ApiConfig {
        return this.currentConfigSubject.value;
    }

    /**
     * Get current API host
     */
    getHost(): string {
        return this.getCurrentConfig().host;
    }

    /**
     * Get current environment
     */
    getEnvironment(): ApiEnvironment {
        return this.getCurrentConfig().environment;
    }

    /**
     * Switch to a specific environment
     */
    switchEnvironment(environment: ApiEnvironment): void {
        const config = this.configs[environment];
        if (config) {
            this.currentConfigSubject.next(config);
            this.saveConfig(config);
            console.log(`[API Config] Switched to ${config.name} (${config.host})`);
        }
    }

    /**
     * Get all available configurations
     */
    getAvailableConfigs(): ApiConfig[] {
        return Object.values(this.configs);
    }

    /**
     * Check if current environment is local
     */
    isLocal(): boolean {
        return this.getEnvironment() === 'local';
    }

    /**
     * Check if current environment is production
     */
    isProduction(): boolean {
        return this.getEnvironment() === 'production';
    }

    /**
     * Test connection to current API host
     */
    testConnection(): Observable<any> {
        const host = this.getHost();
        const testUrl = `${host}/_`;

        return new Observable(observer => {
            fetch(testUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
                .then(response => {
                    if (response.ok) {
                        observer.next({ success: true, host });
                    } else {
                        observer.next({ success: false, host, status: response.status });
                    }
                    observer.complete();
                })
                .catch(error => {
                    observer.next({ success: false, host, error: error.message });
                    observer.complete();
                });
        });
    }

    /**
     * Load saved configuration from localStorage
     */
    private loadSavedConfig(): void {
        try {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = localStorage.getItem('api-config');
                if (saved) {
                    const config = JSON.parse(saved);
                    if (config.environment && this.configs[config.environment as ApiEnvironment]) {
                        this.currentConfigSubject.next(this.configs[config.environment as ApiEnvironment]);
                    }
                }
            }
        } catch (error) {
            console.warn('[API Config] Failed to load saved config:', error);
        }
    }

    /**
     * Save configuration to localStorage
     */
    private saveConfig(config: ApiConfig): void {
        try {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('api-config', JSON.stringify({
                    environment: config.environment
                }));
            }
        } catch (error) {
            console.warn('[API Config] Failed to save config:', error);
        }
    }
}