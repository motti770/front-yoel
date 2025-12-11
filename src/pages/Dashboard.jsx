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
    AlertTriangle
} from 'lucide-react';
import { analyticsService, tasksService } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function Dashboard({ currentUser, t, language }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [taskAnalytics, setTaskAnalytics] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isEmployee = currentUser?.role === 'EMPLOYEE';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (isEmployee) {
                // For employees - fetch their tasks
                const tasksRes = await tasksService.getMy();
                if (tasksRes.success) {
                    setMyTasks(tasksRes.data.tasks || []);
                }
            } else {
                // For admin/manager - fetch analytics
                const [dashRes, trendsRes, tasksAnalyticsRes] = await Promise.all([
                    analyticsService.getDashboard(),
                    analyticsService.getRevenueTrends('monthly', new Date().getFullYear()),
                    analyticsService.getTasks()
                ]);

                if (dashRes.success) setDashboardData(dashRes.data);
                if (trendsRes.success) setRevenueTrends(trendsRes.data.trends || []);
                if (tasksAnalyticsRes.success) setTaskAnalytics(tasksAnalyticsRes.data);
            }
        } catch (err) {
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
            title: language === 'he' ? 'משימות פתוחות' : 'Open Tasks',
            value: myTasks.filter(t => t.status !== 'COMPLETED').length,
            change: '',
            trend: 'neutral',
            icon: AlertCircle,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
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
            {/* Welcome Message for Employee */}
            {isEmployee && (
                <div className="welcome-card glass-card">
                    <h2>{language === 'he' ? 'שלום' : 'Hello'} {currentUser?.firstName}! </h2>
                    <p>{language === 'he' ? 'הנה הסיכום של המשימות שלך היום' : 'Here is your task summary for today'}</p>
                </div>
            )}

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

            {/* Charts Section - Only for ADMIN/MANAGER */}
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

                    {/* Tasks by Status */}
                    <div className="chart-card glass-card">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'משימות לפי סטטוס' : 'Tasks by Status'}</h3>
                            <span className="card-subtitle">{language === 'he' ? 'התפלגות נוכחית' : 'Current distribution'}</span>
                        </div>
                        <div className="chart-container">
                            {taskPieData.length > 0 ? (
                                <>
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
                                    <div className="pie-legend">
                                        {taskPieData.map((item, index) => (
                                            <div key={index} className="legend-item">
                                                <div className="legend-color" style={{ background: item.color }}></div>
                                                <span>{item.name}: {item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-chart">
                                    <Package size={48} />
                                    <p>{language === 'he' ? 'אין נתונים' : 'No data'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks by Department */}
                    <div className="chart-card glass-card full-width">
                        <div className="card-header">
                            <h3>{language === 'he' ? 'משימות לפי מחלקה' : 'Tasks by Department'}</h3>
                            <span className="card-subtitle">{language === 'he' ? 'עומס עבודה' : 'Workload'}</span>
                        </div>
                        <div className="chart-container">
                            {tasksByDeptData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={tasksByDeptData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="departmentName" stroke="#8888a0" />
                                        <YAxis stroke="#8888a0" />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(26, 26, 46, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                            formatter={(value) => [value, language === 'he' ? 'משימות' : 'Tasks']}
                                        />
                                        <Bar dataKey="taskCount" radius={[8, 8, 0, 0]} fill="#667eea" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">
                                    <Package size={48} />
                                    <p>{language === 'he' ? 'אין נתונים' : 'No data'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* My Tasks Section - For Employee */}
            {isEmployee && myTasks.length > 0 && (
                <div className="my-tasks-section glass-card">
                    <div className="card-header">
                        <h3>{language === 'he' ? 'המשימות שלי' : 'My Tasks'}</h3>
                    </div>
                    <div className="tasks-list">
                        {myTasks.map(task => (
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
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state for employee with no tasks */}
            {isEmployee && myTasks.length === 0 && (
                <div className="empty-tasks glass-card">
                    <CheckCircle2 size={48} />
                    <h3>{language === 'he' ? 'אין לך משימות פתוחות' : 'No open tasks'}</h3>
                    <p>{language === 'he' ? 'כל הכבוד! סיימת את כל המשימות' : 'Great job! All tasks completed'}</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
