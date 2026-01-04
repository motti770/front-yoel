/**
 * useDebounce Hook
 * Custom hooks for debouncing values and callbacks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounce a callback function
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @param {Array} deps - Dependencies array for the callback
 * @returns {Function} - The debounced callback
 */
export function useDebouncedCallback(callback, delay = 300, deps = []) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedCallback = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cancel function
    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    // Flush function - execute immediately
    const flush = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        callbackRef.current(...args);
    }, []);

    return useMemo(() => {
        const fn = debouncedCallback;
        fn.cancel = cancel;
        fn.flush = flush;
        return fn;
    }, [debouncedCallback, cancel, flush]);
}

/**
 * Debounced search hook - specifically for search inputs
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Debounce delay (default: 300ms)
 * @returns {Object} - { value, debouncedValue, setValue, clear }
 */
export function useDebouncedSearch(initialValue = '', delay = 300) {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, delay);

    const clear = useCallback(() => {
        setValue('');
    }, []);

    const handleChange = useCallback((e) => {
        const newValue = typeof e === 'string' ? e : e.target.value;
        setValue(newValue);
    }, []);

    return {
        value,
        debouncedValue,
        setValue: handleChange,
        clear,
        isSearching: value !== debouncedValue
    };
}

/**
 * Throttle hook - limit how often a value can update
 * @param {any} value - The value to throttle
 * @param {number} limit - Minimum time between updates in milliseconds
 * @returns {any} - The throttled value
 */
export function useThrottle(value, limit = 300) {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRun = useRef(Date.now());

    useEffect(() => {
        const now = Date.now();
        const timeSinceLastRun = now - lastRun.current;

        if (timeSinceLastRun >= limit) {
            lastRun.current = now;
            setThrottledValue(value);
        } else {
            const timer = setTimeout(() => {
                lastRun.current = Date.now();
                setThrottledValue(value);
            }, limit - timeSinceLastRun);

            return () => clearTimeout(timer);
        }
    }, [value, limit]);

    return throttledValue;
}

/**
 * Throttled callback hook
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} - The throttled callback
 */
export function useThrottledCallback(callback, limit = 300) {
    const lastRun = useRef(0);
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args) => {
        const now = Date.now();
        const timeSinceLastRun = now - lastRun.current;

        if (timeSinceLastRun >= limit) {
            lastRun.current = now;
            callbackRef.current(...args);
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                lastRun.current = Date.now();
                callbackRef.current(...args);
            }, limit - timeSinceLastRun);
        }
    }, [limit]);
}

export default useDebounce;
