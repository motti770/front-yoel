import { Inbox } from 'lucide-react';
import './EmptyState.css';

/**
 * EmptyState - A reusable empty state display component
 * Shows an icon, title, description, and optional action button
 * RTL and bilingual (Hebrew/English) support
 *
 * @param {Object} props
 * @param {React.ComponentType} [props.icon=Inbox] - Lucide icon component to display
 * @param {string} [props.title] - Title text
 * @param {string} [props.description] - Description text
 * @param {string} [props.actionLabel] - Label for action button
 * @param {Function} [props.onAction] - Callback function for action button click
 * @param {'he' | 'en'} [props.language='he'] - Language for default text
 */
function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  language = 'he'
}) {
  const translations = {
    he: {
      defaultTitle: 'אין נתונים להצגה',
      defaultDescription: 'לא נמצאו פריטים'
    },
    en: {
      defaultTitle: 'No data to display',
      defaultDescription: 'No items found'
    }
  };

  const t = translations[language] || translations.he;
  const displayTitle = title || t.defaultTitle;
  const displayDescription = description || t.defaultDescription;

  return (
    <div
      className="empty-state"
      role="status"
      aria-label={displayTitle}
    >
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={48} />
      </div>
      <h3 className="empty-state__title">{displayTitle}</h3>
      {displayDescription && (
        <p className="empty-state__description">{displayDescription}</p>
      )}
      {actionLabel && onAction && (
        <button
          className="empty-state__action-btn btn btn-primary"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
