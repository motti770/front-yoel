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
                <button className="btn btn-primary">
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
                            <div key={event.id} className="event-item">
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
        </div>
    );
}

export default CalendarPage;
