/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    ArrowUp,
    ArrowDown,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    AlertTriangle,
    Bell,
    FileText
} from 'lucide-react';
import { analyticsService, tasksService } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function Dashboard({ currentUser, t, language }) {
    // 1. קריאת המשתמש הנוכחי מ-localStorage
    const localUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const user = localUser || currentUser;

    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [taskAnalytics, setTaskAnalytics] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]); // For Admin
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isEmployee = user?.role === 'EMPLOYEE';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (isEmployee) {
                // For employees - fetch their tasks and derive orders
                const tasksRes = await tasksService.getMy();
                if (tasksRes.success) {
                    setMyTasks(tasksRes.data.tasks || []);
                }
            } else {
                // For admin/manager - fetch analytics and pending tasks
                const [dashRes, trendsRes, tasksAnalyticsRes, pendingRes] = await Promise.all([
                    analyticsService.getDashboard(),
                    analyticsService.getRevenueTrends('monthly', new Date().getFullYear()),
                    analyticsService.getTasks(),
                    tasksService.getAll({ status: 'PENDING', limit: 5 })
                ]);

                if (dashRes.success) setDashboardData(dashRes.data);
                if (trendsRes.success) setRevenueTrends(trendsRes.data.trends || []);
                if (tasksAnalyticsRes.success) setTaskAnalytics(tasksAnalyticsRes.data);
                if (pendingRes.success) setPendingTasks(pendingRes.data.tasks || []);
            }
        } catch (err) {
            console.error(err);
            setError(err.error?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const taskStatusColors = {
        PENDING: '#fee140',
        IN_PROGRESS: '#4facfe',
        COMPLETED: '#00f2fe',
        BLOCKED: '#ff6b6b',
        CANCELLED: '#8888a0'
    };

    const taskStatusLabels = {
        he: { PENDING: 'ממתין', IN_PROGRESS: 'בביצוע', COMPLETED: 'הושלם', BLOCKED: 'חסום', CANCELLED: 'בוטל' },
        en: { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', BLOCKED: 'Blocked', CANCELLED: 'Cancelled' },
        uk: { PENDING: 'Очікує', IN_PROGRESS: 'В роботі', COMPLETED: 'Виконано', BLOCKED: 'Заблоковано', CANCELLED: 'Скасовано' }
    };

    const getStatusLabel = (status) => taskStatusLabels[language]?.[status] || taskStatusLabels.he[status];

    // Derive orders from tasks for Employee
    const myOrders = isEmployee ? myTasks
        .map(t => t.orderItem?.order)
        .filter(o => o && o.id)
        .filter((o, i, self) => i === self.findIndex(item => item.id === o.id)) : [];

    // Mock notifications for Employee
    const notifications = [
        { id: 1, text: language === 'he' ? 'נוספה משימה חדשה להזמנה #1234' : 'New task added for Order #1234', time: '10:00' },
        { id: 2, text: language === 'he' ? 'תזכורת: פגישת צוות ב-14:00' : 'Reminder: Team meeting at 14:00', time: '09:30' }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען נתונים...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="dashboard">
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

    // Stats for employee
    const employeeStats = [
        {
            title: language === 'he' ? 'המשימות שלי' : 'My Tasks',
            value: myTasks.length,
            change: '',
            trend: 'neutral',
            icon: CheckCircle2,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: language === 'he' ? 'הזמנות שלי' : 'My Orders',
            value: myOrders.length,
            change: '',
            trend: 'neutral',
            icon: ShoppingCart,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: language === 'he' ? 'התראות' : 'Notifications',
            value: notifications.length,
            change: '',
            trend: 'neutral',
            icon: Bell,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
    ];

    // Stats for admin/manager
    const adminStats = dashboardData ? [
        {
            title: language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue',
            value: `$${((dashboardData.totalRevenue || 0) / 1000).toFixed(0)}K`,
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: language === 'he' ? 'הזמנות' : 'Orders',
            value: dashboardData.totalOrders || 0,
            change: '+3',
            trend: 'up',
            icon: ShoppingCart,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: language === 'he' ? 'לקוחות' : 'Customers',
            value: dashboardData.totalCustomers || 0,
            change: '+1',
            trend: 'up',
            icon: Users,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            title: language === 'he' ? 'משימות פעילות' : 'Active Tasks',
            value: dashboardData.activeTasks || 0,
            change: '',
            trend: 'neutral',
            icon: Package,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ] : [];

    const stats = isEmployee ? employeeStats : adminStats;

    // Task pie data
    const taskPieData = taskAnalytics?.tasksByStatus ? Object.entries(taskAnalytics.tasksByStatus)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
            name: getStatusLabel(status),
            value,
            color: taskStatusColors[status]
        })) : [];

    // Tasks by department data
    const tasksByDeptData = taskAnalytics?.tasksByDepartment || [];

    return (
        <div className="dashboard">
            {/* 3. Welcome Message with User Name */}
            <div className="welcome-card glass-card">
                <h2>{language === 'he' ? 'שלום' : 'Hello'}, {user?.firstName || user?.name || 'User'}!</h2>
                <p>
                    {isEmployee
                        ? (language === 'he' ? 'הנה עדכון על המשימות וההזמנות שלך' : 'Here is an update on your tasks and orders')
                        : (language === 'he' ? 'הנה סקירה כללית של העסק היום' : 'Here is a general overview of the business today')
                    }
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card glass-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: stat.gradient }}>
                                    <Icon size={24} />
                                </div>
                                {stat.change && (
                                    <span className={`stat-change ${stat.trend}`}>
                                        {stat.trend === 'up' ? <ArrowUp size={16} /> : stat.trend === 'down' ? <ArrowDown size={16} /> : null}
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stat.value}</h3>
                                <p className="stat-title">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts & Lists Section - Layout varies by role */}

            {/* ADMIN / MANAGER VIEW */}
            {!isEmployee && (
                <div className="charts-grid">
                    {/* Revenue Chart */}
                    <div className="chart-card glass-card">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'מגמת הכנסות' : 'Revenue Trend'}</h3>
                            <span className="card-subtitle">{language === 'he' ? '12 חודשים אחרונים' : 'Last 12 months'}</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="period" stroke="#8888a0" />
                                    <YAxis stroke="#8888a0" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(26, 26, 46, 0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => [`$${(value || 0).toLocaleString()}`, language === 'he' ? 'הכנסות' : 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#667eea"
                                        strokeWidth={3}
                                        dot={{ fill: '#667eea', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tasks by Status Chart */}
                    <div className="chart-card glass-card">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'משימות לפי סטטוס' : 'Tasks by Status'}</h3>
                        </div>
                        <div className="chart-container">
                            {taskPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={taskPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {taskPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(26, 26, 46, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">
                                    <Package size={48} />
                                    <p>{language === 'he' ? 'אין נתונים' : 'No data'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Tasks List (Admin) */}
                    <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header">
                            <h3>{language === 'he' ? 'משימות ממתינות (כל המחלקות)' : 'Pending Tasks (All Departments)'}</h3>
                        </div>
                        <div className="tasks-list">
                            {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                <div key={task.id} className="task-item">
                                    <div className="task-status-dot" style={{ background: taskStatusColors[task.status] }}></div>
                                    <div className="task-content">
                                        <h4>{task.title || (task.workflowStep?.name + ' - ' + task.orderItem?.product?.name)}</h4>
                                        <span className="task-customer">
                                            {task.department?.name || 'General'} | {task.assignee ? (task.assignee.firstName + ' ' + task.assignee.lastName) : 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className="task-badge" style={{
                                        background: `${taskStatusColors[task.status]}20`,
                                        color: taskStatusColors[task.status]
                                    }}>
                                        {getStatusLabel(task.status)}
                                    </div>
                                </div>
                            )) : (
                                <p className="p-4">{language === 'he' ? 'אין משימות ממתינות' : 'No pending tasks'}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* EMPLOYEE VIEW */}
            {isEmployee && (
                <div className="charts-grid">
                    {/* My Tasks */}
                    <div className="glass-card full-width">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'המשימות שלי' : 'My Tasks'}</h3>
                        </div>
                        <div className="tasks-list">
                            {myTasks.length > 0 ? myTasks.map(task => (
                                <div key={task.id} className="task-item">
                                    <div
                                        className="task-status-dot"
                                        style={{ background: taskStatusColors[task.status] }}
                                    ></div>
                                    <div className="task-content">
                                        <h4>{task.workflowStep?.name || '-'}</h4>
                                        <p>{task.orderItem?.product?.name || '-'} - {task.orderItem?.order?.orderNumber || '-'}</p>
                                        <span className="task-customer">{task.orderItem?.order?.customer?.name || '-'}</span>
                                    </div>
                                    <div className="task-badge" style={{
                                        background: `${taskStatusColors[task.status]}20`,
                                        color: taskStatusColors[task.status]
                                    }}>
                                        {getStatusLabel(task.status)}
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-tasks">
                                    <CheckCircle2 size={40} />
                                    <p>{language === 'he' ? 'אין משימות פתוחות' : 'No open tasks'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Orders */}
                    <div className="glass-card">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'הזמנות בטיפולי' : 'My Orders'}</h3>
                        </div>
                        <div className="orders-list" style={{ marginTop: '1rem' }}>
                            {myOrders.length > 0 ? myOrders.map(order => (
                                <div key={order.id} className="order-item-compact" style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="icon-box" style={{ background: '#f093fb20', padding: '8px', borderRadius: '8px', color: '#f093fb' }}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>#{order.orderNumber}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{order.customer?.name}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="p-4" style={{ opacity: 0.6 }}>{language === 'he' ? 'אין הזמנות מקושרות' : 'No linked orders'}</p>
                            )}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass-card">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'התראות' : 'Notifications'}</h3>
                        </div>
                        <div className="notifications-list" style={{ marginTop: '1rem' }}>
                            {notifications.map(notif => (
                                <div key={notif.id} className="notification-item" style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                                    <div style={{ color: '#4facfe', marginTop: '2px' }}><Bell size={16} /></div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{notif.text}</p>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{notif.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
