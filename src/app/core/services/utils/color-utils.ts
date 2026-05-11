/**
 * Color Utility Functions
 * Generate color palettes from a base color
 */

export interface ColorPalette {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(
    r: number,
    g: number,
    b: number
): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
        s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(
    h: number,
    s: number,
    l: number
): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Lighten a color by increasing lightness
 */
export function lighten(color: string, amount: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + amount * 100);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken a color by decreasing lightness
 */
export function darken(color: string, amount: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - amount * 100);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Adjust saturation of a color
 */
export function adjustSaturation(color: string, amount: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.max(0, Math.min(100, hsl.s + amount * 100));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Generate a complete color palette from a base color (500 shade)
 * Returns shades from 50 (lightest) to 950 (darkest)
 */
export function generatePalette(baseColor: string): ColorPalette {
    const rgb = hexToRgb(baseColor);
    if (!rgb) {
        // Return default blue palette if invalid color
        return {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
        };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Generate palette based on lightness adjustments
    const generateShade = (targetLightness: number, saturationAdjust = 0) => {
        const newHsl = {
            h: hsl.h,
            s: Math.max(0, Math.min(100, hsl.s + saturationAdjust)),
            l: targetLightness,
        };
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    };

    return {
        50: generateShade(97, -10), // Very light, less saturated
        100: generateShade(94, -8),
        200: generateShade(88, -5),
        300: generateShade(78, -3),
        400: generateShade(65, 0),
        500: baseColor, // Base color
        600: generateShade(hsl.l - 8, 5),
        700: generateShade(hsl.l - 15, 8),
        800: generateShade(hsl.l - 22, 10),
        900: generateShade(hsl.l - 30, 12),
        950: generateShade(hsl.l - 38, 15), // Very dark, more saturated
    };
}

/**
 * Check if a color is light or dark (for contrast purposes)
 */
export function isLightColor(color: string): boolean {
    const rgb = hexToRgb(color);
    if (!rgb) return true;

    // Calculate relative luminance
    const luminance =
        (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(backgroundColor: string): string {
    return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Mix two colors together
 */
export function mixColors(
    color1: string,
    color2: string,
    weight = 0.5
): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
    const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
    const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);

    return rgbToHex(r, g, b);
}
