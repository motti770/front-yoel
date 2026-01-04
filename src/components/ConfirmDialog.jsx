import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog - A reusable confirmation dialog component
 * Supports keyboard navigation (ESC to close, Enter to confirm)
 * Includes focus trap for accessibility
 * RTL and bilingual (Hebrew/English) support
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {string} [props.title] - Dialog title
 * @param {string} [props.message] - Dialog message
 * @param {string} [props.confirmLabel] - Label for confirm button
 * @param {string} [props.cancelLabel] - Label for cancel button
 * @param {Function} props.onConfirm - Callback function when user confirms
 * @param {Function} props.onCancel - Callback function when user cancels
 * @param {boolean} [props.danger=false] - Whether this is a dangerous action
 * @param {'he' | 'en'} [props.language='he'] - Language for default text
 */
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
  language = 'he'
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const translations = {
    he: {
      defaultTitle: 'אישור פעולה',
      defaultMessage: 'האם אתה בטוח שברצונך לבצע פעולה זו?',
      defaultConfirm: 'אישור',
      defaultCancel: 'ביטול'
    },
    en: {
      defaultTitle: 'Confirm Action',
      defaultMessage: 'Are you sure you want to perform this action?',
      defaultConfirm: 'Confirm',
      defaultCancel: 'Cancel'
    }
  };

  const t = translations[language] || translations.he;
  const displayTitle = title || t.defaultTitle;
  const displayMessage = message || t.defaultMessage;
  const displayConfirmLabel = confirmLabel || t.defaultConfirm;
  const displayCancelLabel = cancelLabel || t.defaultCancel;

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onCancel?.();
        break;
      case 'Enter':
        // Only confirm if not focused on cancel button
        if (document.activeElement !== cancelButtonRef.current) {
          e.preventDefault();
          onConfirm?.();
        }
        break;
      case 'Tab':
        // Focus trap
        handleFocusTrap(e);
        break;
      default:
        break;
    }
  }, [isOpen, onCancel, onConfirm]);

  // Focus trap implementation
  const handleFocusTrap = (e) => {
    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Set up keyboard listener and focus management
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);

      // Focus the appropriate button based on danger mode
      setTimeout(() => {
        if (danger) {
          cancelButtonRef.current?.focus();
        } else {
          confirmButtonRef.current?.focus();
        }
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, danger]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`confirm-dialog ${danger ? 'confirm-dialog--danger' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="confirm-dialog__close"
          onClick={onCancel}
          type="button"
          aria-label={language === 'he' ? 'סגור' : 'Close'}
        >
          <X size={18} />
        </button>

        <div className="confirm-dialog__content">
          {danger && (
            <div className="confirm-dialog__icon" aria-hidden="true">
              <AlertTriangle size={32} />
            </div>
          )}

          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {displayTitle}
          </h2>

          <p id="confirm-dialog-message" className="confirm-dialog__message">
            {displayMessage}
          </p>
        </div>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            className="confirm-dialog__btn confirm-dialog__btn--cancel btn btn-outline"
            onClick={onCancel}
            type="button"
          >
            {displayCancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            className={`confirm-dialog__btn confirm-dialog__btn--confirm btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            type="button"
          >
            {displayConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
