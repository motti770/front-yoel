import { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Clock,
    Phone,
    Video,
    CheckSquare
} from 'lucide-react';
import './CalendarPage.css';

function CalendarPage({ currentUser }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const days = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

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

    // Sample events
    const events = [
        { id: 1, date: 15, type: 'meeting', title: 'פגישה עם לקוח', time: '10:00' },
        { id: 2, date: 18, type: 'call', title: 'שיחת מעקב', time: '14:30' },
        { id: 3, date: 20, type: 'task', title: 'מסירת הזמנה', time: '09:00' },
        { id: 4, date: 22, type: 'meeting', title: 'הדגמת מוצר', time: '11:00' },
        { id: 5, date: 25, type: 'video', title: 'שיחת וידאו', time: '16:00' },
    ];

    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const hasEvent = (day) => events.some(event => event.date === day);

    const getEventsForDay = (day) => events.filter(event => event.date === day);

    // Modal state
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);

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

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day);
            days.push(
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

        return days;
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

    return (
        <div className="calendar-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>לוח שנה</h2>
                    <p>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setSelectedDateEvents({ date: new Date(), events: [] });
                    setShowDayModal(true);
                }}>
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
                    {events.map(event => {
                        const Icon = eventTypeIcons[event.type];
                        return (
                            <div key={event.id} className="event-item" onClick={() => handleEventClick(event)} style={{ cursor: 'pointer' }}>
                                <div className={`event-icon ${event.type}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="event-content">
                                    <h4>{event.title}</h4>
                                    <div className="event-meta">
                                        <span className="event-date">{event.date}/{currentDate.getMonth() + 1}</span>
                                        <span className="event-time">{event.time}</span>
                                        <span className={`event-type-badge ${event.type}`}>
                                            {eventTypeLabels[event.type]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day Details Modal */}
            {showDayModal && selectedDateEvents && (
                <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedDateEvents.date.getDate()} ב{months[selectedDateEvents.date.getMonth()]}</h3>
                            <button className="close-btn" onClick={() => setShowDayModal(false)}>×</button>
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
                                <input type="text" placeholder="כותרת האירוע..." className="form-input" />
                                <div className="form-row">
                                    <input type="time" className="form-input" />
                                    <select className="form-input">
                                        <option value="meeting">פגישה</option>
                                        <option value="call">שיחה</option>
                                        <option value="task">משימה</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary full-width">הוסף אירוע</button>
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
                            <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="event-detail-view">
                                <div className={`event-badge-large ${selectedEvent.type}`}>
                                    {eventTypeLabels[selectedEvent.type]}
                                </div>
                                <h2>{selectedEvent.title}</h2>
                                <div className="detail-row">
                                    <Clock size={18} />
                                    <span>{selectedEvent.time}, {selectedEvent.date} ב{months[currentDate.getMonth()]}</span>
                                </div>
                                <div className="detail-row">
                                    <CheckSquare size={18} />
                                    <span>סטטוס: פעיל</span>
                                </div>
                                <div className="detail-actions">
                                    <button className="btn btn-outline">עריכה</button>
                                    <button className="btn btn-danger">מחיקה</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarPage;
