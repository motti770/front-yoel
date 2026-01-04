import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, size = 'medium', hideHeader = false, language = 'he' }) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);

    // Get all focusable elements within the modal
    const getFocusableElements = useCallback(() => {
        if (!modalRef.current) return [];
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        return Array.from(modalRef.current.querySelectorAll(focusableSelectors));
    }, []);

    // Handle keyboard events (ESC to close, Tab trap)
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
            return;
        }

        if (e.key === 'Tab') {
            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }, [onClose, getFocusableElements]);

    // Store previous active element and set focus when modal opens
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;

            // Focus the first focusable element after a short delay
            const timer = setTimeout(() => {
                const focusableElements = getFocusableElements();
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen, getFocusableElements]);

    // Return focus to previous element when modal closes
    useEffect(() => {
        if (!isOpen && previousActiveElement.current) {
            previousActiveElement.current.focus();
            previousActiveElement.current = null;
        }
    }, [isOpen]);

    // Add keydown listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const closeButtonLabel = language === 'he' ? 'סגור' : language === 'uk' ? 'Закрити' : 'Close';

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                ref={modalRef}
                className={`modal-content ${size}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
            >
                {!hideHeader && (
                    <div className="modal-header">
                        <h2 id="modal-title">{title}</h2>
                        <button
                            className="modal-close"
                            onClick={onClose}
                            aria-label={closeButtonLabel}
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
