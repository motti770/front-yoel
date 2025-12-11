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
    AlertCircle
} from 'lucide-react';
import { mockAnalytics, mockActivities, mockTasks, getMyTasks } from '../data/mockData';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function Dashboard({ currentUser }) {
    // For EMPLOYEE, show only their tasks
    const isEmployee = currentUser.role === 'EMPLOYEE';
    const myTasks = isEmployee ? getMyTasks(currentUser.id) : mockTasks;

    const stats = isEmployee ? [
        {
            title: 'המשימות שלי',
            value: myTasks.length,
            change: '+2',
            trend: 'up',
            icon: CheckCircle2,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'משימות פתוחות',
            value: myTasks.filter(t => t.status !== 'COMPLETED').length,
            change: '',
            trend: 'neutral',
            icon: AlertCircle,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }
    ] : [
        {
            title: 'סה"כ הכנסות',
            value: `₪${(mockAnalytics.dashboard.totalRevenue / 1000).toFixed(0)}K`,
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'הזמנות',
            value: mockAnalytics.dashboard.totalOrders,
            change: '+3',
            trend: 'up',
            icon: ShoppingCart,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: 'לקוחות',
            value: mockAnalytics.dashboard.totalCustomers,
            change: '+1',
            trend: 'up',
            icon: Users,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            title: 'משימות פעילות',
            value: mockAnalytics.dashboard.activeTasks,
            change: '-2',
            trend: 'down',
            icon: Package,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ];

    const taskStatusColors = {
        PENDING: '#fee140',
        IN_PROGRESS: '#4facfe',
        COMPLETED: '#00f2fe',
        BLOCKED: '#ff6b6b',
        CANCELLED: '#8888a0'
    };

    const taskStatusLabels = {
        PENDING: 'ממתין',
        IN_PROGRESS: 'בביצוע',
        COMPLETED: 'הושלם',
        BLOCKED: 'חסום',
        CANCELLED: 'בוטל'
    };

    const taskPieData = Object.entries(mockAnalytics.tasksByStatus)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
            name: taskStatusLabels[status],
            value,
            color: taskStatusColors[status]
        }));

    return (
        <div className="dashboard">
            {/* Welcome Message for Employee */}
            {isEmployee && (
                <div className="welcome-card glass-card">
                    <h2>שלום {currentUser.firstName}! 👋</h2>
                    <p>הנה הסיכום של המשימות שלך היום במחלקת {currentUser.department?.name || 'לא משויך'}</p>
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
                            <h3>מגמת הכנסות</h3>
                            <span className="card-subtitle">12 חודשים אחרונים</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={mockAnalytics.revenueTrends}>
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
                                        formatter={(value) => [`₪${value.toLocaleString()}`, 'הכנסות']}
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
                            <h3>משימות לפי סטטוס</h3>
                            <span className="card-subtitle">התפלגות נוכחית</span>
                        </div>
                        <div className="chart-container">
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
                        </div>
                    </div>

                    {/* Tasks by Department */}
                    <div className="chart-card glass-card full-width">
                        <div className="card-header">
                            <h3>משימות לפי מחלקה</h3>
                            <span className="card-subtitle">עומס עבודה</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={mockAnalytics.tasksByDepartment}>
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
                                        formatter={(value) => [value, 'משימות']}
                                    />
                                    <Bar dataKey="taskCount" radius={[8, 8, 0, 0]}>
                                        {mockAnalytics.tasksByDepartment.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* My Tasks Section - For Employee */}
            {isEmployee && myTasks.length > 0 && (
                <div className="my-tasks-section glass-card">
                    <div className="card-header">
                        <h3>המשימות שלי</h3>
                    </div>
                    <div className="tasks-list">
                        {myTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div
                                    className="task-status-dot"
                                    style={{ background: taskStatusColors[task.status] }}
                                ></div>
                                <div className="task-content">
                                    <h4>{task.workflowStep.name}</h4>
                                    <p>{task.orderItem.product.name} - {task.orderItem.order.orderNumber}</p>
                                    <span className="task-customer">{task.orderItem.order.customer.name}</span>
                                </div>
                                <div className="task-badge" style={{
                                    background: `${taskStatusColors[task.status]}20`,
                                    color: taskStatusColors[task.status]
                                }}>
                                    {taskStatusLabels[task.status]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="activities-section glass-card">
                <div className="card-header">
                    <h3>פעילות אחרונה</h3>
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        הצג הכל
                    </button>
                </div>
                <div className="activities-list">
                    {mockActivities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                <Activity size={18} />
                            </div>
                            <div className="activity-content">
                                <h4>{activity.title}</h4>
                                <p>{activity.description}</p>
                                <div className="activity-meta">
                                    <span className="activity-user">{activity.user}</span>
                                    <span className="activity-time">
                                        <Clock size={14} />
                                        {activity.timestamp}
                                    </span>
                                </div>
                            </div>
                            <div className={`activity-badge ${activity.type}`}>
                                {activity.type === 'order' ? 'הזמנה' : activity.type === 'task' ? 'משימה' : 'לקוח'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
