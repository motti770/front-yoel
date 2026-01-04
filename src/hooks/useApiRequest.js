/**
 * useApiRequest Hook
 * A custom hook for handling API requests with loading, error, and data states
 * Includes retry, refetch, and caching functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

/**
 * Custom hook for API requests with built-in state management
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to call immediately on mount
 * @param {any} options.initialData - Initial data value
 * @param {string} options.cacheKey - Key for caching the response
 * @param {number} options.cacheDuration - Cache duration in milliseconds
 * @param {number} options.retryCount - Number of retries on failure
 * @param {number} options.retryDelay - Delay between retries in milliseconds
 * @param {Function} options.onSuccess - Callback on successful response
 * @param {Function} options.onError - Callback on error
 */
export function useApiRequest(apiFunction, options = {}) {
    const {
        immediate = false,
        initialData = null,
        cacheKey = null,
        cacheDuration = CACHE_DURATION,
        retryCount = 0,
        retryDelay = 1000,
        onSuccess,
        onError
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRefetching, setIsRefetching] = useState(false);

    const mountedRef = useRef(true);
    const retryCountRef = useRef(0);

    // Check cache
    const getCachedData = useCallback(() => {
        if (!cacheKey) return null;

        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheDuration) {
            return cached.data;
        }
        return null;
    }, [cacheKey, cacheDuration]);

    // Set cache
    const setCachedData = useCallback((data) => {
        if (cacheKey) {
            cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
    }, [cacheKey]);

    // Clear cache for this key
    const clearCache = useCallback(() => {
        if (cacheKey) {
            cache.delete(cacheKey);
        }
    }, [cacheKey]);

    // Execute the API request
    const execute = useCallback(async (...args) => {
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
            setData(cachedData);
            return { success: true, data: cachedData, fromCache: true };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction(...args);

            if (!mountedRef.current) return response;

            if (response.success) {
                const responseData = response.data;
                setData(responseData);
                setCachedData(responseData);
                retryCountRef.current = 0;
                onSuccess?.(responseData);
                return response;
            } else {
                throw new Error(response.error?.message || 'Request failed');
            }
        } catch (err) {
            if (!mountedRef.current) return { success: false, error: err };

            const errorMessage = err.error?.message || err.message || 'An error occurred';

            // Retry logic
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return execute(...args);
            }

            setError(errorMessage);
            onError?.(errorMessage);
            return { success: false, error: { message: errorMessage } };
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefetching(false);
            }
        }
    }, [apiFunction, getCachedData, setCachedData, retryCount, retryDelay, onSuccess, onError]);

    // Refetch (ignores cache)
    const refetch = useCallback(async (...args) => {
        setIsRefetching(true);
        clearCache();
        return execute(...args);
    }, [execute, clearCache]);

    // Reset state
    const reset = useCallback(() => {
        setData(initialData);
        setLoading(false);
        setError(null);
        setIsRefetching(false);
        retryCountRef.current = 0;
    }, [initialData]);

    // Immediate execution on mount
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        data,
        loading,
        error,
        isRefetching,
        execute,
        refetch,
        reset,
        clearCache,
        setData
    };
}

/**
 * Hook for paginated API requests
 */
export function usePaginatedRequest(apiFunction, options = {}) {
    const { pageSize = 10, ...restOptions } = options;

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [allData, setAllData] = useState([]);

    const { data, loading, error, execute, reset: baseReset } = useApiRequest(
        apiFunction,
        restOptions
    );

    const fetchPage = useCallback(async (pageNum) => {
        const response = await execute({ page: pageNum, limit: pageSize });

        if (response.success) {
            const items = response.data?.items || response.data || [];
            const total = response.data?.total || items.length;

            if (pageNum === 1) {
                setAllData(items);
            } else {
                setAllData(prev => [...prev, ...items]);
            }

            setHasMore(allData.length + items.length < total);
        }

        return response;
    }, [execute, pageSize, allData.length]);

    const loadMore = useCallback(async () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            return fetchPage(nextPage);
        }
    }, [loading, hasMore, page, fetchPage]);

    const reset = useCallback(() => {
        baseReset();
        setPage(1);
        setHasMore(true);
        setAllData([]);
    }, [baseReset]);

    const refresh = useCallback(async () => {
        reset();
        return fetchPage(1);
    }, [reset, fetchPage]);

    return {
        data: allData,
        loading,
        error,
        page,
        hasMore,
        loadMore,
        refresh,
        reset
    };
}

// Clear all cache (useful for logout)
export function clearAllCache() {
    cache.clear();
}

export default useApiRequest;
