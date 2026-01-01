import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    AlertTriangle,
    AlertCircle,
    Info,
    ShoppingCart,
    Package,
    Trash2,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { notificationsService } from '../services/api';
import './NotificationCenter.css';

const NOTIFICATION_TYPES = {
    STOCK_LOW: { icon: AlertTriangle, color: '#f59e0b', label: 'מלאי נמוך' },
    STOCK_CRITICAL: { icon: AlertCircle, color: '#ef4444', label: 'מלאי קריטי' },
    ORDER_CREATED: { icon: ShoppingCart, color: '#10b981', label: 'הזמנה חדשה' },
    ORDER_UPDATED: { icon: Package, color: '#4facfe', label: 'עדכון הזמנה' },
    TASK_ASSIGNED: { icon: Check, color: '#667eea', label: 'משימה חדשה' },
    SYSTEM: { icon: Info, color: '#6366f1', label: 'מערכת' }
};

const PRIORITY_CONFIG = {
    critical: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
    high: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    normal: { color: '#4facfe', glow: 'rgba(79, 172, 254, 0.3)' },
    low: { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)' }
};

function NotificationCenter({ language = 'he' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const result = await notificationsService.getAll({ limit: 20 });
            if (result.success) {
                setNotifications(result.data.notifications || []);
                setUnreadCount(result.data.unreadCount || 0);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and periodic refresh
    useEffect(() => {
        fetchNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle mark as read
    const handleMarkAsRead = async (notifId, e) => {
        e?.stopPropagation();
        try {
            await notificationsService.markAsRead(notifId);
            setNotifications(notifications.map(n =>
                n.id === notifId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Handle dismiss
    const handleDismiss = async (notifId, e) => {
        e?.stopPropagation();
        try {
            await notificationsService.dismiss(notifId);
            setNotifications(notifications.filter(n => n.id !== notifId));
            const notif = notifications.find(n => n.id === notifId);
            if (notif && !notif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to dismiss:', err);
        }
    };

    // Handle clear all
    const handleClearAll = async () => {
        try {
            await notificationsService.dismissAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to clear all:', err);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notif) => {
        if (!notif.read) {
            handleMarkAsRead(notif.id);
        }
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
            setIsOpen(false);
        }
    };

    // Format relative time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return language === 'he' ? 'עכשיו' : 'Now';
        if (diffMins < 60) return language === 'he' ? `לפני ${diffMins} דק'` : `${diffMins}m ago`;
        if (diffHours < 24) return language === 'he' ? `לפני ${diffHours} שע'` : `${diffHours}h ago`;
        if (diffDays < 7) return language === 'he' ? `לפני ${diffDays} ימים` : `${diffDays}d ago`;

        return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
    };

    // Get notification icon
    const getNotificationIcon = (notif) => {
        const config = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.SYSTEM;
        const Icon = config.icon;
        return <Icon size={18} style={{ color: config.color }} />;
    };

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, notif) => {
        const date = new Date(notif.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey;
        if (date.toDateString() === today.toDateString()) {
            groupKey = language === 'he' ? 'היום' : 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = language === 'he' ? 'אתמול' : 'Yesterday';
        } else {
            groupKey = language === 'he' ? 'קודם' : 'Earlier';
        }

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(notif);
        return groups;
    }, {});

    return (
        <div className="notification-center" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={language === 'he' ? 'התראות' : 'Notifications'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="notification-header">
                        <h3>{language === 'he' ? 'התראות' : 'Notifications'}</h3>
                        <div className="header-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="text-btn"
                                    onClick={handleMarkAllAsRead}
                                    title={language === 'he' ? 'סמן הכל כנקרא' : 'Mark all as read'}
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    className="text-btn"
                                    onClick={handleClearAll}
                                    title={language === 'he' ? 'נקה הכל' : 'Clear all'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <button
                                className="text-btn close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="notification-content">
                        {loading && notifications.length === 0 ? (
                            <div className="notification-loading">
                                <Loader2 className="spinner" size={24} />
                                <span>{language === 'he' ? 'טוען...' : 'Loading...'}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={40} />
                                <p>{language === 'he' ? 'אין התראות חדשות' : 'No new notifications'}</p>
                            </div>
                        ) : (
                            Object.entries(groupedNotifications).map(([group, groupNotifs]) => (
                                <div key={group} className="notification-group">
                                    <div className="group-header">{group}</div>
                                    {groupNotifs.map(notif => {
                                        const priorityConfig = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.normal;

                                        return (
                                            <div
                                                key={notif.id}
                                                className={`notification-item ${notif.read ? 'read' : 'unread'} priority-${notif.priority}`}
                                                onClick={() => handleNotificationClick(notif)}
                                                style={{
                                                    '--priority-color': priorityConfig.color,
                                                    '--priority-glow': priorityConfig.glow
                                                }}
                                            >
                                                <div className="notification-icon">
                                                    {getNotificationIcon(notif)}
                                                </div>
                                                <div className="notification-body">
                                                    <div className="notification-title">
                                                        {language === 'he' ? notif.title : (notif.titleEn || notif.title)}
                                                    </div>
                                                    <div className="notification-message">
                                                        {language === 'he' ? notif.message : (notif.messageEn || notif.message)}
                                                    </div>
                                                    <div className="notification-meta">
                                                        <Clock size={12} />
                                                        <span>{formatTime(notif.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="notification-actions">
                                                    {!notif.read && (
                                                        <button
                                                            className="action-btn"
                                                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                            title={language === 'he' ? 'סמן כנקרא' : 'Mark as read'}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn dismiss"
                                                        onClick={(e) => handleDismiss(notif.id, e)}
                                                        title={language === 'he' ? 'הסר' : 'Dismiss'}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    {notif.actionUrl && (
                                                        <ChevronRight size={14} className="arrow" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button
                                className="view-all-btn"
                                onClick={() => {
                                    // In the future, navigate to a full notifications page
                                    setIsOpen(false);
                                }}
                            >
                                {language === 'he' ? 'צפה בכל ההתראות' : 'View all notifications'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;
