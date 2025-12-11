import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    User,
    Package,
    Filter,
    Loader2,
    AlertTriangle,
    Check
} from 'lucide-react';
import { tasksService, departmentsService } from '../services/api';
import './Tasks.css';

function Tasks({ currentUser, t, language }) {
    const [tasks, setTasks] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [toast, setToast] = useState(null);

    // For EMPLOYEE, show only their tasks or department tasks
    const isEmployee = currentUser?.role === 'EMPLOYEE';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, [isEmployee]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            let tasksRes;
            if (isEmployee) {
                // For employees - fetch their tasks
                tasksRes = await tasksService.getMy();
            } else {
                // For admin/manager - fetch all tasks
                tasksRes = await tasksService.getAll({ limit: 100 });
            }

            if (tasksRes.success) {
                setTasks(tasksRes.data.tasks || []);
            } else {
                setError(tasksRes.error?.message || 'Failed to load tasks');
            }

            // Also fetch departments for filter
            if (!isEmployee) {
                const deptsRes = await departmentsService.getAll({ limit: 100 });
                if (deptsRes.success) {
                    setDepartments(deptsRes.data.departments || []);
                }
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Update task status
    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const result = await tasksService.updateStatus(taskId, newStatus);
            if (result.success) {
                setTasks(tasks.map(t =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                ));
                showToast(language === 'he' ? 'סטטוס עודכן' : 'Status updated');
            } else {
                showToast(result.error?.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to update status', 'error');
        }
    };

    // Assign task
    const handleAssign = async (taskId, userId) => {
        try {
            const result = await tasksService.assign(taskId, userId);
            if (result.success) {
                await fetchData(); // Refresh to get updated assignment info
                showToast(language === 'he' ? 'משימה הוקצתה' : 'Task assigned');
            } else {
                showToast(result.error?.message || 'Failed to assign task', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to assign task', 'error');
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesDept = departmentFilter === 'all' || task.departmentId === departmentFilter;
        return matchesStatus && matchesDept;
    });

    const statusColors = {
        PENDING: '#fee140',
        IN_PROGRESS: '#4facfe',
        COMPLETED: '#00f2fe',
        BLOCKED: '#ff6b6b',
        CANCELLED: '#8888a0'
    };

    const statusLabelsI18n = {
        he: { PENDING: 'ממתין', IN_PROGRESS: 'בביצוע', COMPLETED: 'הושלם', BLOCKED: 'חסום', CANCELLED: 'בוטל' },
        en: { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', BLOCKED: 'Blocked', CANCELLED: 'Cancelled' },
        uk: { PENDING: 'Очікує', IN_PROGRESS: 'В роботі', COMPLETED: 'Виконано', BLOCKED: 'Заблоковано', CANCELLED: 'Скасовано' }
    };

    const statusLabels = statusLabelsI18n[language] || statusLabelsI18n.he;

    const statusIcons = {
        PENDING: Clock,
        IN_PROGRESS: AlertCircle,
        COMPLETED: CheckCircle2,
        BLOCKED: AlertCircle,
        CANCELLED: Circle
    };

    // Loading state
    if (loading) {
        return (
            <div className="tasks-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען משימות...' : 'Loading tasks...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="tasks-page">
                <div className="error-container">
                    <AlertTriangle size={40} />
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>
                        {language === 'he' ? 'נסה שוב' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-page">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div className="header-info">
                    <h2>{isEmployee ? (language === 'he' ? 'המשימות שלי' : 'My Tasks') : (language === 'he' ? 'משימות' : 'Tasks')}</h2>
                    <p>{filteredTasks.length} {language === 'he' ? 'משימות' : 'tasks'}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="tasks-filters glass-card">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        {language === 'he' ? 'הכל' : 'All'}
                    </button>
                    {Object.entries(statusLabels).map(([status, label]) => (
                        <button
                            key={status}
                            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                            style={statusFilter === status ? {
                                background: `${statusColors[status]}20`,
                                borderColor: statusColors[status],
                                color: statusColors[status]
                            } : {}}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {!isEmployee && departments.length > 0 && (
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{language === 'he' ? 'כל המחלקות' : 'All Departments'}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Tasks Grid */}
            <div className="tasks-grid">
                {filteredTasks.map(task => {
                    const StatusIcon = statusIcons[task.status] || Circle;
                    return (
                        <div key={task.id} className="task-card glass-card">
                            <div className="task-header">
                                <div
                                    className="task-status-badge"
                                    style={{
                                        background: `${statusColors[task.status] || '#8888a0'}20`,
                                        color: statusColors[task.status] || '#8888a0'
                                    }}
                                >
                                    <StatusIcon size={14} />
                                    {statusLabels[task.status] || task.status}
                                </div>
                                {task.department && (
                                    <div
                                        className="task-dept-badge"
                                        style={{
                                            background: `${task.department.color || '#667eea'}20`,
                                            color: task.department.color || '#667eea'
                                        }}
                                    >
                                        {task.department.name}
                                    </div>
                                )}
                            </div>

                            <h3 className="task-title">{task.workflowStep?.name || '-'}</h3>

                            <div className="task-product">
                                <Package size={16} />
                                <span>{task.orderItem?.product?.name || '-'}</span>
                            </div>

                            <div className="task-order">
                                <span className="order-number">{task.orderItem?.order?.orderNumber || '-'}</span>
                                <span className="customer-name">{task.orderItem?.order?.customer?.name || '-'}</span>
                            </div>

                            {task.notes && (
                                <p className="task-notes">{task.notes}</p>
                            )}

                            <div className="task-footer">
                                <div className="task-duration">
                                    <Clock size={14} />
                                    {task.workflowStep?.estimatedDurationDays || 1} {language === 'he' ? 'ימים' : 'days'}
                                </div>

                                {task.assignedTo ? (
                                    <div className="task-assignee">
                                        <div
                                            className="assignee-avatar"
                                            style={{ background: task.department?.color || 'var(--primary)' }}
                                        >
                                            {task.assignedTo.firstName?.[0] || 'U'}
                                        </div>
                                        <span>{task.assignedTo.firstName}</span>
                                    </div>
                                ) : (
                                    <button className="assign-btn" onClick={() => handleAssign(task.id, currentUser?.id)}>
                                        <User size={14} />
                                        {language === 'he' ? 'הקצאה' : 'Assign'}
                                    </button>
                                )}
                            </div>

                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                                <div className="task-actions">
                                    {task.status === 'PENDING' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}>
                                            {language === 'he' ? 'התחל עבודה' : 'Start Work'}
                                        </button>
                                    )}
                                    {task.status === 'IN_PROGRESS' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}>
                                            {language === 'he' ? 'סיום משימה' : 'Complete'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && (
                <div className="empty-state glass-card">
                    <CheckCircle2 size={48} />
                    <h3>{language === 'he' ? 'אין משימות' : 'No Tasks'}</h3>
                    <p>{language === 'he' ? 'לא נמצאו משימות התואמות לסינון' : 'No tasks match the current filter'}</p>
                </div>
            )}
        </div>
    );
}

export default Tasks;
