import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorState.css';

/**
 * ErrorState - A reusable error display component
 * Shows an error icon, message, and optional retry button
 * RTL and bilingual (Hebrew/English) support
 *
 * @param {Object} props
 * @param {string} [props.error] - Error message to display
 * @param {Function} [props.onRetry] - Callback function for retry button click
 * @param {boolean} [props.fullPage=false] - Whether to display as full page
 * @param {'he' | 'en'} [props.language='he'] - Language for UI text
 * @param {string} [props.title] - Optional custom title
 */
function ErrorState({
  error,
  onRetry,
  fullPage = false,
  language = 'he',
  title
}) {
  const translations = {
    he: {
      defaultTitle: 'שגיאה',
      defaultError: 'משהו השתבש. אנא נסה שוב.',
      retryButton: 'נסה שוב'
    },
    en: {
      defaultTitle: 'Error',
      defaultError: 'Something went wrong. Please try again.',
      retryButton: 'Try Again'
    }
  };

  const t = translations[language] || translations.he;
  const displayTitle = title || t.defaultTitle;
  const displayError = error || t.defaultError;

  const containerClass = `error-state${fullPage ? ' error-state--full-page' : ''}`;

  return (
    <div
      className={containerClass}
      role="alert"
      aria-live="assertive"
    >
      <div className="error-state__icon" aria-hidden="true">
        <AlertCircle size={48} />
      </div>
      <h3 className="error-state__title">{displayTitle}</h3>
      <p className="error-state__message">{displayError}</p>
      {onRetry && (
        <button
          className="error-state__retry-btn btn btn-primary"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw size={18} />
          <span>{t.retryButton}</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
