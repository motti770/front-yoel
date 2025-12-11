import { useState } from 'react';
import {
    LayoutGrid,
    List,
    Table2,
    Calendar as CalendarIcon,
    GanttChart,
    Kanban
} from 'lucide-react';
import './ViewSwitcher.css';

const VIEW_TYPES = {
    TABLE: 'table',
    GRID: 'grid',
    LIST: 'list',
    KANBAN: 'kanban',
    CALENDAR: 'calendar',
    GANTT: 'gantt'
};

const VIEW_ICONS = {
    [VIEW_TYPES.TABLE]: Table2,
    [VIEW_TYPES.GRID]: LayoutGrid,
    [VIEW_TYPES.LIST]: List,
    [VIEW_TYPES.KANBAN]: Kanban,
    [VIEW_TYPES.CALENDAR]: CalendarIcon,
    [VIEW_TYPES.GANTT]: GanttChart
};

const VIEW_LABELS = {
    he: {
        [VIEW_TYPES.TABLE]: 'טבלה',
        [VIEW_TYPES.GRID]: 'קוביות',
        [VIEW_TYPES.LIST]: 'רשימה',
        [VIEW_TYPES.KANBAN]: 'קנבן',
        [VIEW_TYPES.CALENDAR]: 'לוח שנה',
        [VIEW_TYPES.GANTT]: 'גאנט'
    },
    uk: {
        [VIEW_TYPES.TABLE]: 'Таблиця',
        [VIEW_TYPES.GRID]: 'Сітка',
        [VIEW_TYPES.LIST]: 'Список',
        [VIEW_TYPES.KANBAN]: 'Канбан',
        [VIEW_TYPES.CALENDAR]: 'Календар',
        [VIEW_TYPES.GANTT]: 'Гант'
    },
    en: {
        [VIEW_TYPES.TABLE]: 'Table',
        [VIEW_TYPES.GRID]: 'Grid',
        [VIEW_TYPES.LIST]: 'List',
        [VIEW_TYPES.KANBAN]: 'Kanban',
        [VIEW_TYPES.CALENDAR]: 'Calendar',
        [VIEW_TYPES.GANTT]: 'Gantt'
    }
};

function ViewSwitcher({
    currentView,
    onViewChange,
    availableViews = [VIEW_TYPES.TABLE, VIEW_TYPES.GRID, VIEW_TYPES.LIST, VIEW_TYPES.KANBAN, VIEW_TYPES.CALENDAR],
    language = 'he'
}) {
    const [showTooltip, setShowTooltip] = useState(null);
    const labels = VIEW_LABELS[language] || VIEW_LABELS.he;

    return (
        <div className="view-switcher">
            {availableViews.map(viewType => {
                const Icon = VIEW_ICONS[viewType];
                const isActive = currentView === viewType;

                return (
                    <button
                        key={viewType}
                        className={`view-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onViewChange(viewType)}
                        onMouseEnter={() => setShowTooltip(viewType)}
                        onMouseLeave={() => setShowTooltip(null)}
                        title={labels[viewType]}
                    >
                        <Icon size={18} />
                        {showTooltip === viewType && (
                            <span className="view-tooltip">{labels[viewType]}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export { ViewSwitcher, VIEW_TYPES };
export default ViewSwitcher;
