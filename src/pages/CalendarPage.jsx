import { useState, useEffect } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Clock,
    Phone,
    Video,
    CheckSquare,
    Loader2,
    Trash2,
    Edit,
    X,
    Link,
    User
} from 'lucide-react';
import './CalendarPage.css';

// LocalStorage key for events
const EVENTS_STORAGE_KEY = 'calendar_events';

// Helper functions for localStorage
const loadEventsFromStorage = () => {
    try {
        const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading events from localStorage:', error);
    }
    return [];
};

const saveEventsToStorage = (events) => {
    try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
        console.error('Error saving events to localStorage:', error);
    }
};

function CalendarPage({ currentUser }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

    // Load events from localStorage on mount
    useEffect(() => {
        const loadEvents = () => {
            setLoading(true);
            const storedEvents = loadEventsFromStorage();

            // If no events exist, seed with some sample events for the current month
            if (storedEvents.length === 0) {
                const today = new Date();
                const sampleEvents = [
                    {
                        id: Date.now(),
                        title: 'פגישה עם לקוח',
                        date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
                        time: '10:00',
                        type: 'meeting',
                        description: '',
                        orderId: null,
                        customerId: null
                    },
                    {
                        id: Date.now() + 1,
                        title: 'שיחת מעקב',
                        date: new Date(today.getFullYear(), today.getMonth(), 18).toISOString(),
                        time: '14:30',
                        type: 'call',
                        description: '',
                        orderId: null,
                        customerId: null
                    },
                    {
                        id: Date.now() + 2,
                        title: 'מסירת הזמנה',
                        date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString(),
                        time: '09:00',
                        type: 'task',
                        description: '',
                        orderId: null,
                        customerId: null
                    }
                ];
                saveEventsToStorage(sampleEvents);
                setEvents(sampleEvents);
            } else {
                setEvents(storedEvents);
            }
            setLoading(false);
        };

        loadEvents();
    }, []);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    // Filter events for a specific day in current month/year
    const getEventsForDay = (day) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const hasEvent = (day) => getEventsForDay(day).length > 0;

    // Get upcoming events (next 30 days)
    const getUpcomingEvents = () => {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= now && eventDate <= thirtyDaysLater;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 10);
    };

    // Modal states
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state for add/edit
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '09:00',
        type: 'meeting',
        description: '',
        orderId: '',
        customerId: ''
    });

    // Click handlers
    const handleDayClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = getEventsForDay(day);
        setSelectedDateEvents({ date, events: dayEvents });
        setShowDayModal(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    // Open add modal with pre-filled date
    const openAddModal = (date = new Date()) => {
        setIsEditing(false);
        setFormData({
            title: '',
            date: date.toISOString().split('T')[0],
            time: '09:00',
            type: 'meeting',
            description: '',
            orderId: '',
            customerId: ''
        });
        setShowDayModal(false);
        setShowEventModal(false);
        setShowAddEditModal(true);
    };

    // Open edit modal
    const openEditModal = (event) => {
        setIsEditing(true);
        const eventDate = new Date(event.date);
        setFormData({
            title: event.title,
            date: eventDate.toISOString().split('T')[0],
            time: event.time,
            type: event.type,
            description: event.description || '',
            orderId: event.orderId || '',
            customerId: event.customerId || ''
        });
        setSelectedEvent(event);
        setShowEventModal(false);
        setShowAddEditModal(true);
    };

    // Save event (create or update)
    const handleSaveEvent = () => {
        if (!formData.title.trim()) {
            alert('נא להזין כותרת לאירוע');
            return;
        }

        const eventData = {
            id: isEditing ? selectedEvent.id : Date.now(),
            title: formData.title.trim(),
            date: new Date(formData.date).toISOString(),
            time: formData.time,
            type: formData.type,
            description: formData.description.trim(),
            orderId: formData.orderId || null,
            customerId: formData.customerId || null
        };

        let updatedEvents;
        if (isEditing) {
            updatedEvents = events.map(e => e.id === selectedEvent.id ? eventData : e);
        } else {
            updatedEvents = [...events, eventData];
        }

        setEvents(updatedEvents);
        saveEventsToStorage(updatedEvents);
        setShowAddEditModal(false);
        setSelectedEvent(null);
    };

    // Delete event
    const handleDeleteEvent = (eventId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
            const updatedEvents = events.filter(e => e.id !== eventId);
            setEvents(updatedEvents);
            saveEventsToStorage(updatedEvents);
            setShowEventModal(false);
            setSelectedEvent(null);
        }
    };

    // Quick add from day modal
    const [quickAddTitle, setQuickAddTitle] = useState('');
    const [quickAddTime, setQuickAddTime] = useState('09:00');
    const [quickAddType, setQuickAddType] = useState('meeting');

    const handleQuickAdd = () => {
        if (!quickAddTitle.trim() || !selectedDateEvents) return;

        const newEvent = {
            id: Date.now(),
            title: quickAddTitle.trim(),
            date: selectedDateEvents.date.toISOString(),
            time: quickAddTime,
            type: quickAddType,
            description: '',
            orderId: null,
            customerId: null
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        saveEventsToStorage(updatedEvents);

        // Update the day modal events
        setSelectedDateEvents({
            ...selectedDateEvents,
            events: [...selectedDateEvents.events, newEvent]
        });

        // Reset quick add form
        setQuickAddTitle('');
        setQuickAddTime('09:00');
        setQuickAddType('meeting');
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day);
            calendarDays.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday(day) ? 'today' : ''} ${hasEvent(day) ? 'has-event' : ''}`}
                    onClick={() => handleDayClick(day)}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="day-number">{day}</span>
                    {dayEvents.length > 0 && (
                        <div className="day-events">
                            {dayEvents.slice(0, 2).map(event => (
                                <div key={event.id} className={`event-dot ${event.type}`}></div>
                            ))}
                            {dayEvents.length > 2 && <span className="more-events">+{dayEvents.length - 2}</span>}
                        </div>
                    )}
                </div>
            );
        }

        return calendarDays;
    };

    const eventTypeIcons = {
        meeting: Clock,
        call: Phone,
        video: Video,
        task: CheckSquare
    };

    const eventTypeLabels = {
        meeting: 'פגישה',
        call: 'שיחה',
        video: 'וידאו',
        task: 'משימה'
    };

    if (loading) {
        return (
            <div className="calendar-page">
                <div className="loading-container glass-card">
                    <Loader2 size={48} className="spinner" />
                    <p>טוען אירועים...</p>
                </div>
            </div>
        );
    }

    const upcomingEvents = getUpcomingEvents();

    return (
        <div className="calendar-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>לוח שנה</h2>
                    <p>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                </div>
                <button className="btn btn-primary" onClick={() => openAddModal(new Date())}>
                    <Plus size={18} />
                    אירוע חדש
                </button>
            </div>

            <div className="calendar-container glass-card">
                <div className="calendar-header">
                    <button className="nav-btn" onClick={prevMonth}>
                        <ChevronRight size={20} />
                    </button>
                    <h3>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button className="nav-btn" onClick={nextMonth}>
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="calendar-grid">
                    {days.map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {renderCalendarDays()}
                </div>
            </div>

            <div className="upcoming-section glass-card">
                <div className="section-header">
                    <h3>אירועים קרובים</h3>
                </div>
                <div className="events-list">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => {
                            const Icon = eventTypeIcons[event.type];
                            const eventDate = new Date(event.date);
                            return (
                                <div key={event.id} className="event-item" onClick={() => handleEventClick(event)} style={{ cursor: 'pointer' }}>
                                    <div className={`event-icon ${event.type}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="event-content">
                                        <h4>{event.title}</h4>
                                        <div className="event-meta">
                                            <span className="event-date">{eventDate.getDate()}/{eventDate.getMonth() + 1}</span>
                                            <span className="event-time">{event.time}</span>
                                            <span className={`event-type-badge ${event.type}`}>
                                                {eventTypeLabels[event.type]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-events">
                            <p>אין אירועים קרובים</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Day Details Modal */}
            {showDayModal && selectedDateEvents && (
                <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedDateEvents.date.getDate()} ב{months[selectedDateEvents.date.getMonth()]}</h3>
                            <button className="close-btn" onClick={() => setShowDayModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {selectedDateEvents.events.length > 0 ? (
                                <div className="day-events-list">
                                    {selectedDateEvents.events.map(event => (
                                        <div key={event.id} className="event-item-card" onClick={() => {
                                            setShowDayModal(false);
                                            handleEventClick(event);
                                        }}>
                                            <div className={`status-line ${event.type}`}></div>
                                            <div className="event-info">
                                                <h4>{event.title}</h4>
                                                <div className="event-time-row">
                                                    <Clock size={14} />
                                                    <span>{event.time}</span>
                                                    <span className="badge">{eventTypeLabels[event.type]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>אין אירועים ליום זה</p>
                                </div>
                            )}

                            <div className="add-event-form">
                                <h4>הוסף אירוע מהיר</h4>
                                <input
                                    type="text"
                                    placeholder="כותרת האירוע..."
                                    className="form-input"
                                    value={quickAddTitle}
                                    onChange={(e) => setQuickAddTitle(e.target.value)}
                                />
                                <div className="form-row">
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={quickAddTime}
                                        onChange={(e) => setQuickAddTime(e.target.value)}
                                    />
                                    <select
                                        className="form-input"
                                        value={quickAddType}
                                        onChange={(e) => setQuickAddType(e.target.value)}
                                    >
                                        <option value="meeting">פגישה</option>
                                        <option value="call">שיחה</option>
                                        <option value="video">וידאו</option>
                                        <option value="task">משימה</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary full-width" onClick={handleQuickAdd}>
                                    הוסף אירוע
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {showEventModal && selectedEvent && (
                <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>פרטי אירוע</h3>
                            <button className="close-btn" onClick={() => setShowEventModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="event-detail-view">
                                <div className={`event-badge-large ${selectedEvent.type}`}>
                                    {eventTypeLabels[selectedEvent.type]}
                                </div>
                                <h2>{selectedEvent.title}</h2>
                                <div className="detail-row">
                                    <Clock size={18} />
                                    <span>
                                        {selectedEvent.time}, {new Date(selectedEvent.date).getDate()} ב{months[new Date(selectedEvent.date).getMonth()]}
                                    </span>
                                </div>
                                {selectedEvent.description && (
                                    <div className="detail-row">
                                        <CheckSquare size={18} />
                                        <span>{selectedEvent.description}</span>
                                    </div>
                                )}
                                {selectedEvent.orderId && (
                                    <div className="detail-row">
                                        <Link size={18} />
                                        <span>מקושר להזמנה: {selectedEvent.orderId}</span>
                                    </div>
                                )}
                                {selectedEvent.customerId && (
                                    <div className="detail-row">
                                        <User size={18} />
                                        <span>מקושר ללקוח: {selectedEvent.customerId}</span>
                                    </div>
                                )}
                                <div className="detail-actions">
                                    <button className="btn btn-outline" onClick={() => openEditModal(selectedEvent)}>
                                        <Edit size={16} />
                                        עריכה
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                                        <Trash2 size={16} />
                                        מחיקה
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Event Modal */}
            {showAddEditModal && (
                <div className="modal-overlay" onClick={() => setShowAddEditModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{isEditing ? 'עריכת אירוע' : 'אירוע חדש'}</h3>
                            <button className="close-btn" onClick={() => setShowAddEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>כותרת</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="הזן כותרת לאירוע..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>תאריך</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>שעה</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>סוג אירוע</label>
                                <select
                                    className="form-input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="meeting">פגישה</option>
                                    <option value="call">שיחה</option>
                                    <option value="video">וידאו</option>
                                    <option value="task">משימה</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>תיאור</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="תיאור האירוע..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>קישור להזמנה (אופציונלי)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.orderId}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                        placeholder="מספר הזמנה..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>קישור ללקוח (אופציונלי)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        placeholder="מזהה לקוח..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddEditModal(false)}>
                                ביטול
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveEvent}>
                                {isEditing ? 'עדכן' : 'צור אירוע'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarPage;
