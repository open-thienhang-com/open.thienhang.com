import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeSettings {
    theme: 'light' | 'dark' | 'auto';
    uiStyle: 'modern' | 'vintage' | 'flat' | 'material' | 'glass' | 'minimal';
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    layoutStyle: 'default' | 'compact' | 'comfortable' | 'spacious';
    sidebarStyle: 'default' | 'overlay' | 'push' | 'static';
    animationEnabled: boolean;
    shadowEnabled: boolean;
    backgroundPattern: 'none' | 'dots' | 'grid' | 'waves' | 'geometric';
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'app-theme-settings';

    private defaultSettings: ThemeSettings = {
        theme: 'light',
        uiStyle: 'modern',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        fontFamily: 'Inter',
        fontSize: 'medium',
        borderRadius: 'medium',
        layoutStyle: 'default',
        sidebarStyle: 'default',
        animationEnabled: true,
        shadowEnabled: true,
        backgroundPattern: 'none'
    };

    private _currentSettings = new BehaviorSubject<ThemeSettings>(this.defaultSettings);
    public readonly currentSettings$ = this._currentSettings.asObservable();

    constructor() {
        this.loadSettings();
        this.applySettings(this._currentSettings.value);
    }

    get currentSettings(): ThemeSettings {
        return this._currentSettings.value;
    }

    updateSettings(settings: Partial<ThemeSettings>): void {
        const newSettings = { ...this._currentSettings.value, ...settings };
        this._currentSettings.next(newSettings);
        this.saveSettings(newSettings);
        this.applySettings(newSettings);
    }

    resetToDefault(): void {
        this._currentSettings.next(this.defaultSettings);
        this.saveSettings(this.defaultSettings);
        this.applySettings(this.defaultSettings);
    }

    private loadSettings(): void {
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved) {
            try {
                const settings = JSON.parse(saved) as ThemeSettings;
                this._currentSettings.next({ ...this.defaultSettings, ...settings });
            } catch (error) {
                console.error('Error loading theme settings:', error);
            }
        }
    }

    private saveSettings(settings: ThemeSettings): void {
        localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
    }

    private applySettings(settings: ThemeSettings): void {
        const root = document.documentElement;

        // Apply theme
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else if (settings.theme === 'light') {
            root.classList.remove('dark');
        } else {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Apply UI style classes
        root.classList.remove('ui-modern', 'ui-vintage', 'ui-flat', 'ui-material', 'ui-glass', 'ui-minimal');
        root.classList.add(`ui-${settings.uiStyle}`);

        // Apply layout style
        root.classList.remove('layout-default', 'layout-compact', 'layout-comfortable', 'layout-spacious');
        root.classList.add(`layout-${settings.layoutStyle}`);

        // Apply font size
        root.classList.remove('font-small', 'font-medium', 'font-large');
        root.classList.add(`font-${settings.fontSize}`);

        // Apply border radius
        root.classList.remove('radius-none', 'radius-small', 'radius-medium', 'radius-large', 'radius-full');
        root.classList.add(`radius-${settings.borderRadius}`);

        // Apply background pattern
        root.classList.remove('bg-pattern-none', 'bg-pattern-dots', 'bg-pattern-grid', 'bg-pattern-waves', 'bg-pattern-geometric');
        root.classList.add(`bg-pattern-${settings.backgroundPattern}`);

        // Apply animations
        if (settings.animationEnabled) {
            root.classList.add('animations-enabled');
        } else {
            root.classList.remove('animations-enabled');
        }

        // Apply shadows
        if (settings.shadowEnabled) {
            root.classList.add('shadows-enabled');
        } else {
            root.classList.remove('shadows-enabled');
        }

        // Apply CSS custom properties
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--accent-color', settings.accentColor);
        root.style.setProperty('--font-family', settings.fontFamily);
    }

    // Color presets
    getColorPresets() {
        return [
            { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
            { name: 'Green', value: '#10B981', class: 'bg-green-500' },
            { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
            { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
            { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
            { name: 'Orange', value: '#F59E0B', class: 'bg-orange-500' },
            { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
            { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' }
        ];
    }

    // Font presets
    getFontPresets() {
        return [
            { name: 'Inter', value: 'Inter', class: 'font-inter' },
            { name: 'Roboto', value: 'Roboto', class: 'font-roboto' },
            { name: 'Poppins', value: 'Poppins', class: 'font-poppins' },
            { name: 'Source Sans Pro', value: 'Source Sans Pro', class: 'font-source-sans' },
            { name: 'Open Sans', value: 'Open Sans', class: 'font-open-sans' },
            { name: 'Lato', value: 'Lato', class: 'font-lato' },
            { name: 'Nunito', value: 'Nunito', class: 'font-nunito' },
            { name: 'Montserrat', value: 'Montserrat', class: 'font-montserrat' }
        ];
    }
}
