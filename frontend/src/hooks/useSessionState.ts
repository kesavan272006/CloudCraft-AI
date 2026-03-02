import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'forge_session_v1';

/**
 * Persists a value in sessionStorage.
 * Reads the initial value from sessionStorage on mount.
 * Writes back on every change.
 */
export function useSessionState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const fullKey = `${SESSION_KEY}__${key}`;

    const [value, setValue] = useState<T>(() => {
        try {
            const stored = sessionStorage.getItem(fullKey);
            if (stored !== null) return JSON.parse(stored) as T;
        } catch {
            // ignore parse errors
        }
        return defaultValue;
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(fullKey, JSON.stringify(value));
        } catch {
            // ignore quota errors
        }
    }, [fullKey, value]);

    return [value, setValue];
}

/**
 * Saves the full forge session object at once.
 * Call saveSession() with partial updates.
 */
export function useForgeSession() {
    const getStored = (): Record<string, any> => {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    };

    const saveSession = useCallback((updates: Record<string, any>) => {
        try {
            const current = getStored();
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...updates }));
        } catch { /* ignore */ }
    }, []);

    const clearSession = useCallback(() => {
        try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    }, []);

    return { getStored, saveSession, clearSession };
}
