/**
 * useToast Hook
 * A custom hook for displaying toast notifications
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import React from 'react';

// Toast types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Default durations by type
const DEFAULT_DURATIONS = {
    [TOAST_TYPES.SUCCESS]: 3000,
    [TOAST_TYPES.ERROR]: 5000,
    [TOAST_TYPES.WARNING]: 4000,
    [TOAST_TYPES.INFO]: 3000
};

/**
 * Custom hook for toast notifications
 * @param {Object} options - Configuration options
 * @param {number} options.maxToasts - Maximum number of visible toasts
 * @param {string} options.position - Position of toasts ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center')
 */
export function useToast(options = {}) {
    const { maxToasts = 5, position = 'top-right' } = options;

    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);
    const timersRef = useRef({});

    // Clear a specific toast
    const dismissToast = useCallback((id) => {
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Clear all toasts
    const dismissAll = useCallback(() => {
        Object.values(timersRef.current).forEach(clearTimeout);
        timersRef.current = {};
        setToasts([]);
    }, []);

    // Show a toast
    const showToast = useCallback((message, type = TOAST_TYPES.INFO, customOptions = {}) => {
        const id = ++toastIdRef.current;
        const duration = customOptions.duration || DEFAULT_DURATIONS[type] || 3000;

        const newToast = {
            id,
            message,
            type,
            title: customOptions.title,
            action: customOptions.action,
            createdAt: Date.now()
        };

        setToasts(prev => {
            const newToasts = [...prev, newToast];
            // Remove oldest if exceeds max
            if (newToasts.length > maxToasts) {
                const removed = newToasts.shift();
                if (timersRef.current[removed.id]) {
                    clearTimeout(timersRef.current[removed.id]);
                    delete timersRef.current[removed.id];
                }
            }
            return newToasts;
        });

        // Auto-dismiss after duration
        if (duration > 0) {
            timersRef.current[id] = setTimeout(() => {
                dismissToast(id);
            }, duration);
        }

        return id;
    }, [maxToasts, dismissToast]);

    // Convenience methods
    const toast = {
        success: (message, options) => showToast(message, TOAST_TYPES.SUCCESS, options),
        error: (message, options) => showToast(message, TOAST_TYPES.ERROR, options),
        warning: (message, options) => showToast(message, TOAST_TYPES.WARNING, options),
        info: (message, options) => showToast(message, TOAST_TYPES.INFO, options),
        dismiss: dismissToast,
        dismissAll
    };

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach(clearTimeout);
        };
    }, []);

    // Toast Component
    const ToastComponent = useCallback(() => {
        if (toasts.length === 0) return null;

        const positionStyles = {
            'top-right': { top: '1rem', right: '1rem' },
            'top-left': { top: '1rem', left: '1rem' },
            'bottom-right': { bottom: '1rem', right: '1rem' },
            'bottom-left': { bottom: '1rem', left: '1rem' },
            'top-center': { top: '1rem', left: '50%', transform: 'translateX(-50%)' },
            'bottom-center': { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }
        };

        const typeStyles = {
            [TOAST_TYPES.SUCCESS]: {
                bg: '#10B981',
                icon: '\u2713' // checkmark
            },
            [TOAST_TYPES.ERROR]: {
                bg: '#EF4444',
                icon: '\u2717' // x mark
            },
            [TOAST_TYPES.WARNING]: {
                bg: '#F59E0B',
                icon: '\u26A0' // warning
            },
            [TOAST_TYPES.INFO]: {
                bg: '#3B82F6',
                icon: '\u2139' // info
            }
        };

        return React.createElement('div', {
            style: {
                position: 'fixed',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                ...positionStyles[position]
            }
        }, toasts.map(t => {
            const style = typeStyles[t.type] || typeStyles[TOAST_TYPES.INFO];
            return React.createElement('div', {
                key: t.id,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: style.bg,
                    color: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    minWidth: '250px',
                    maxWidth: '400px',
                    animation: 'slideIn 0.3s ease-out'
                }
            }, [
                React.createElement('span', {
                    key: 'icon',
                    style: { fontSize: '1.25rem' }
                }, style.icon),
                React.createElement('div', {
                    key: 'content',
                    style: { flex: 1 }
                }, [
                    t.title && React.createElement('div', {
                        key: 'title',
                        style: { fontWeight: 600, marginBottom: '0.25rem' }
                    }, t.title),
                    React.createElement('div', {
                        key: 'message',
                        style: { fontSize: '0.875rem' }
                    }, t.message)
                ]),
                React.createElement('button', {
                    key: 'close',
                    onClick: () => dismissToast(t.id),
                    style: {
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        opacity: 0.7
                    }
                }, '\u2715')
            ]);
        }));
    }, [toasts, position, dismissToast]);

    return {
        toast,
        showToast,
        dismissToast,
        dismissAll,
        toasts,
        ToastComponent
    };
}

export default useToast;
