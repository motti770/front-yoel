import {
    TrendingUp,
    Package,
    Building2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Analytics.css';

// Mock data for analytics
const mockAnalytics = {
    sales: {
        totalSales: 331000,
        orderCount: 45,
        averageOrderValue: 7355
    },
    revenueTrends: [
        { month: 'ינואר', revenue: 45000, period: 'ינואר' },
        { month: 'פברואר', revenue: 52000, period: 'פברואר' },
        { month: 'מרץ', revenue: 48000, period: 'מרץ' },
        { month: 'אפריל', revenue: 61000, period: 'אפריל' },
        { month: 'מאי', revenue: 58000, period: 'מאי' },
        { month: 'יוני', revenue: 67000, period: 'יוני' }
    ],
    productPerformance: [
        { name: 'פרוכת לארון קודש', sales: 15 },
        { name: 'מעיל לספר תורה', sales: 23 },
        { name: 'כיסוי לבימה', sales: 12 },
        { name: 'טלית מהודרת', sales: 45 }
    ],
    departmentWorkload: [
        { department: 'עיצוב רקמה', tasks: 18 },
        { department: 'חיתוך', tasks: 12 },
        { department: 'תפירה', tasks: 22 },
        { department: 'איכות', tasks: 8 }
    ]
};

const mockDepartments = [
    { id: '1', name: 'עיצוב רקמה', color: '#667eea' },
    { id: '2', name: 'חיתוך', color: '#f5576c' },
    { id: '3', name: 'תפירה', color: '#4facfe' },
    { id: '4', name: 'איכות', color: '#00f2fe' }
];

function Analytics({ currentUser }) {
    // Only ADMIN/MANAGER can see analytics
    if (currentUser && currentUser.role === 'EMPLOYEE') {
        return (
            <div className="access-denied glass-card">
                <TrendingUp size={48} />
                <h2>אין הרשאה</h2>
                <p>דף האנליטיקס זמין למנהלים בלבד</p>
            </div>
        );
    }

    const departmentColors = mockDepartments.reduce((acc, dept) => {
        acc[dept.id] = dept.color;
        return acc;
    }, {});

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>אנליטיקס</h2>
                    <p>נתונים ותובנות עסקיות</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card glass-card">
                    <div className="kpi-value">₪{(mockAnalytics.sales.totalSales / 1000).toFixed(0)}K</div>
                    <div className="kpi-label">סה"כ מכירות</div>
                    <div className="kpi-change positive">+12.5% מהחודש שעבר</div>
                </div>
                <div className="kpi-card glass-card">
                    <div className="kpi-value">{mockAnalytics.sales.orderCount}</div>
                    <div className="kpi-label">הזמנות</div>
                    <div className="kpi-change positive">+3 חדשות</div>
                </div>
                <div className="kpi-card glass-card">
                    <div className="kpi-value">₪{mockAnalytics.sales.averageOrderValue.toLocaleString()}</div>
                    <div className="kpi-label">ממוצע הזמנה</div>
                    <div className="kpi-change neutral">יציב</div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-section glass-card">
                <div className="section-header">
                    <h3>מגמת הכנסות</h3>
                    <span className="section-subtitle">12 חודשים אחרונים</span>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={mockAnalytics.revenueTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="period" stroke="#8888a0" />
                            <YAxis stroke="#8888a0" tickFormatter={(value) => `₪${value / 1000}K`} />
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
                                stroke="url(#revenueGradient)"
                                strokeWidth={3}
                                dot={{ fill: '#667eea', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#667eea' }}
                            />
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="analytics-grid">
                {/* Top Products */}
                <div className="chart-section glass-card">
                    <div className="section-header">
                        <h3>מוצרים מובילים</h3>
                        <span className="section-subtitle">לפי הכנסות</span>
                    </div>
                    <div className="products-list">
                        {mockAnalytics.topProducts.map((product, index) => (
                            <div key={product.id} className="product-row">
                                <div className="product-rank">{index + 1}</div>
                                <div className="product-icon">
                                    <Package size={18} />
                                </div>
                                <div className="product-info">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-orders">{product.orderCount} הזמנות</span>
                                </div>
                                <div className="product-revenue">₪{product.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks by Department */}
                <div className="chart-section glass-card">
                    <div className="section-header">
                        <h3>עומס עבודה לפי מחלקה</h3>
                        <span className="section-subtitle">משימות פעילות</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockAnalytics.tasksByDepartment} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" stroke="#8888a0" />
                                <YAxis dataKey="departmentName" type="category" stroke="#8888a0" width={80} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(26, 26, 46, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                    formatter={(value) => [value, 'משימות']}
                                />
                                <Bar dataKey="taskCount" radius={[0, 8, 8, 0]}>
                                    {mockAnalytics.tasksByDepartment.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="department-performance glass-card">
                <div className="section-header">
                    <h3>ביצועי מחלקות</h3>
                </div>
                <div className="departments-grid">
                    {mockDepartments.map(dept => (
                        <div key={dept.id} className="dept-perf-card">
                            <div
                                className="dept-icon"
                                style={{ background: `${dept.color}20`, color: dept.color }}
                            >
                                <Building2 size={20} />
                            </div>
                            <div className="dept-stats">
                                <h4>{dept.name}</h4>
                                <div className="dept-numbers">
                                    <div className="number-item">
                                        <span className="number-value">{dept.employeeCount}</span>
                                        <span className="number-label">עובדים</span>
                                    </div>
                                    <div className="number-item">
                                        <span className="number-value">{dept.activeTasks}</span>
                                        <span className="number-label">משימות</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dept-progress">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${Math.min((dept.activeTasks / 20) * 100, 100)}%`,
                                        background: dept.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
