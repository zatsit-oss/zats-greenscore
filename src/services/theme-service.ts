/**
 * Theme Service - Abstracts theme persistence and application
 *
 * Handles reading/writing theme preference to localStorage
 * and applying the theme to the document element.
 *
 * Note: Layout.astro uses an inline script (is:inline) for initial theme
 * application to prevent FOUC. This service is used by ThemeToggle.astro
 * (module script) for runtime theme changes.
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const VALID_THEMES: readonly string[] = ['light', 'dark'];

/**
 * Get the theme stored in localStorage, or null if not set / invalid
 */
export function getStoredTheme(): Theme | null {
    if (typeof localStorage === 'undefined') return null;
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && VALID_THEMES.includes(value)) {
        return value as Theme;
    }
    return null;
}

/**
 * Get the effective theme: stored preference, system preference, or fallback to 'light'
 */
export function getEffectiveTheme(): Theme {
    const stored = getStoredTheme();
    if (stored) return stored;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Set the theme: persist to localStorage and apply to document
 */
export function setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEY, theme);
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

/**
 * Toggle between light and dark themes
 * @returns the new theme after toggling
 */
export function toggleTheme(): Theme {
    const current = getEffectiveTheme();
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
}
