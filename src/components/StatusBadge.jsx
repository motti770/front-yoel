import './StatusBadge.css';

/**
 * StatusBadge - A reusable status indicator component
 * Supports orders, leads, tasks with proper colors and labels
 * RTL and bilingual (Hebrew/English) support
 */

// Status configurations by type
const STATUS_CONFIG = {
  order: {
    colors: {
      PENDING: '#fee140',
      PENDING_PAYMENT: '#f59e0b',
      DEPOSIT_PAID: '#10b981',
      IN_PROGRESS: '#4facfe',
      READY: '#00f2fe',
      DELIVERED: '#10b981',
      COMPLETED: '#00f2fe',
      CANCELLED: '#ff6b6b'
    },
    labels: {
      he: {
        PENDING: 'ממתין',
        PENDING_PAYMENT: 'ממתין לתשלום',
        DEPOSIT_PAID: 'מקדמה שולמה',
        IN_PROGRESS: 'בביצוע',
        READY: 'מוכן',
        DELIVERED: 'נמסר',
        COMPLETED: 'הושלם',
        CANCELLED: 'בוטל'
      },
      en: {
        PENDING: 'Pending',
        PENDING_PAYMENT: 'Pending Payment',
        DEPOSIT_PAID: 'Deposit Paid',
        IN_PROGRESS: 'In Progress',
        READY: 'Ready',
        DELIVERED: 'Delivered',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      }
    }
  },
  lead: {
    colors: {
      NEW: '#4facfe',
      CONTACTED: '#fee140',
      QUALIFIED: '#f093fb',
      PROPOSAL: '#764ba2',
      NEGOTIATION: '#fa709a',
      WON: '#00f2fe',
      LOST: '#ff6b6b'
    },
    labels: {
      he: {
        NEW: 'חדש',
        CONTACTED: 'נוצר קשר',
        QUALIFIED: 'מתאים',
        PROPOSAL: 'הצעה',
        NEGOTIATION: 'משא ומתן',
        WON: 'נסגר בהצלחה',
        LOST: 'אבוד'
      },
      en: {
        NEW: 'New',
        CONTACTED: 'Contacted',
        QUALIFIED: 'Qualified',
        PROPOSAL: 'Proposal',
        NEGOTIATION: 'Negotiation',
        WON: 'Won',
        LOST: 'Lost'
      }
    }
  },
  task: {
    colors: {
      PENDING: '#fee140',
      IN_PROGRESS: '#4facfe',
      COMPLETED: '#00f2fe',
      BLOCKED: '#ff6b6b',
      ON_HOLD: '#8888a0'
    },
    labels: {
      he: {
        PENDING: 'ממתין',
        IN_PROGRESS: 'בביצוע',
        COMPLETED: 'הושלם',
        BLOCKED: 'חסום',
        ON_HOLD: 'בהמתנה'
      },
      en: {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        BLOCKED: 'Blocked',
        ON_HOLD: 'On Hold'
      }
    }
  },
  product: {
    colors: {
      ACTIVE: '#00f2fe',
      INACTIVE: '#8888a0',
      DRAFT: '#fee140',
      ARCHIVED: '#b4b4c8'
    },
    labels: {
      he: {
        ACTIVE: 'פעיל',
        INACTIVE: 'לא פעיל',
        DRAFT: 'טיוטה',
        ARCHIVED: 'בארכיון'
      },
      en: {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        DRAFT: 'Draft',
        ARCHIVED: 'Archived'
      }
    }
  }
};

/**
 * @param {Object} props
 * @param {string} props.status - Status key (e.g., 'PENDING', 'IN_PROGRESS', etc.)
 * @param {'order' | 'lead' | 'task' | 'product'} [props.type='order'] - Type of status
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Size of badge
 * @param {'he' | 'en'} [props.language='he'] - Language for label
 * @param {boolean} [props.showDot=true] - Whether to show the colored dot
 * @param {string} [props.className=''] - Additional CSS class
 */
function StatusBadge({
  status,
  type = 'order',
  size = 'medium',
  language = 'he',
  showDot = true,
  className = ''
}) {
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.order;
  const color = config.colors[status] || '#8888a0';
  const label = config.labels[language]?.[status] || config.labels.he[status] || status;

  const badgeClass = `status-badge status-badge--${size} ${className}`.trim();

  return (
    <span
      className={badgeClass}
      style={{
        '--status-color': color,
        background: `${color}20`,
        color: color,
        borderColor: `${color}40`
      }}
      role="status"
      aria-label={label}
    >
      {showDot && <span className="status-badge__dot" aria-hidden="true" />}
      <span className="status-badge__label">{label}</span>
    </span>
  );
}

// Export config for external use
export { STATUS_CONFIG };
export default StatusBadge;
