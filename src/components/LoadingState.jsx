import './LoadingState.css';

/**
 * LoadingState - A reusable loading indicator component
 * Supports multiple sizes, optional message, and full page mode
 * RTL and bilingual (Hebrew/English) support
 *
 * @param {Object} props
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Size of the spinner
 * @param {string} [props.message] - Optional custom loading message
 * @param {boolean} [props.fullPage=false] - Whether to display as full page overlay
 * @param {'he' | 'en'} [props.language='he'] - Language for default message
 */
function LoadingState({
  size = 'medium',
  message,
  fullPage = false,
  language = 'he'
}) {
  const defaultMessages = {
    he: 'טוען...',
    en: 'Loading...'
  };

  const displayMessage = message || defaultMessages[language] || defaultMessages.he;

  const containerClass = `loading-state loading-state--${size}${fullPage ? ' loading-state--full-page' : ''}`;

  return (
    <div
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={displayMessage}
    >
      <div className="loading-state__spinner" aria-hidden="true">
        <div className="loading-state__spinner-ring"></div>
        <div className="loading-state__spinner-ring"></div>
        <div className="loading-state__spinner-ring"></div>
      </div>
      {displayMessage && (
        <p className="loading-state__message">{displayMessage}</p>
      )}
    </div>
  );
}

export default LoadingState;
