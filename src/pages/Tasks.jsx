import { useState } from 'react';
import {
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    User,
    Package,
    Filter
} from 'lucide-react';
import { mockTasks, getMyTasks, getDepartmentTasks, mockDepartments } from '../data/mockData';
import './Tasks.css';

function Tasks({ currentUser }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    // For EMPLOYEE, show only their tasks or department tasks
    const isEmployee = currentUser.role === 'EMPLOYEE';

    let baseTasks = mockTasks;
    if (isEmployee) {
        if (currentUser.departmentId) {
            baseTasks = getDepartmentTasks(currentUser.departmentId);
        } else {
            baseTasks = getMyTasks(currentUser.id);
        }
    }

    const filteredTasks = baseTasks.filter(task => {
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

    const statusLabels = {
        PENDING: 'ממתין',
        IN_PROGRESS: 'בביצוע',
        COMPLETED: 'הושלם',
        BLOCKED: 'חסום',
        CANCELLED: 'בוטל'
    };

    const statusIcons = {
        PENDING: Clock,
        IN_PROGRESS: AlertCircle,
        COMPLETED: CheckCircle2,
        BLOCKED: AlertCircle,
        CANCELLED: Circle
    };

    return (
        <div className="tasks-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>{isEmployee ? 'המשימות שלי' : 'משימות'}</h2>
                    <p>{filteredTasks.length} משימות</p>
                </div>
                {!isEmployee && (
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        משימה חדשה
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="tasks-filters glass-card">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        הכל
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

                {!isEmployee && (
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">כל המחלקות</option>
                            {mockDepartments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Tasks Grid */}
            <div className="tasks-grid">
                {filteredTasks.map(task => {
                    const StatusIcon = statusIcons[task.status];
                    return (
                        <div key={task.id} className="task-card glass-card">
                            <div className="task-header">
                                <div
                                    className="task-status-badge"
                                    style={{
                                        background: `${statusColors[task.status]}20`,
                                        color: statusColors[task.status]
                                    }}
                                >
                                    <StatusIcon size={14} />
                                    {statusLabels[task.status]}
                                </div>
                                {task.department && (
                                    <div
                                        className="task-dept-badge"
                                        style={{
                                            background: `${task.department.color}20`,
                                            color: task.department.color
                                        }}
                                    >
                                        {task.department.name}
                                    </div>
                                )}
                            </div>

                            <h3 className="task-title">{task.workflowStep.name}</h3>

                            <div className="task-product">
                                <Package size={16} />
                                <span>{task.orderItem.product.name}</span>
                            </div>

                            <div className="task-order">
                                <span className="order-number">{task.orderItem.order.orderNumber}</span>
                                <span className="customer-name">{task.orderItem.order.customer.name}</span>
                            </div>

                            {task.notes && (
                                <p className="task-notes">{task.notes}</p>
                            )}

                            <div className="task-footer">
                                <div className="task-duration">
                                    <Clock size={14} />
                                    {task.workflowStep.estimatedDurationDays} ימים
                                </div>

                                {task.assignedTo ? (
                                    <div className="task-assignee">
                                        <div
                                            className="assignee-avatar"
                                            style={{ background: task.department?.color || 'var(--primary)' }}
                                        >
                                            {task.assignedTo.avatar}
                                        </div>
                                        <span>{task.assignedTo.firstName}</span>
                                    </div>
                                ) : (
                                    <button className="assign-btn">
                                        <User size={14} />
                                        הקצאה
                                    </button>
                                )}
                            </div>

                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                                <div className="task-actions">
                                    {task.status === 'PENDING' && (
                                        <button className="btn btn-primary btn-sm">התחל עבודה</button>
                                    )}
                                    {task.status === 'IN_PROGRESS' && (
                                        <button className="btn btn-primary btn-sm">סיום משימה</button>
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
                    <h3>אין משימות</h3>
                    <p>לא נמצאו משימות התואמות לסינון</p>
                </div>
            )}
        </div>
    );
}

export default Tasks;
