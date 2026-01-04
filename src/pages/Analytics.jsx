import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Package,
    Building2,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsService, departmentsService } from '../services/api';
import './Analytics.css';

function Analytics({ currentUser }) {
    // State for API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [tasksByDepartment, setTasksByDepartment] = useState([]);
    const [departments, setDepartments] = useState([]);

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

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all analytics data in parallel
            const [dashboardRes, trendsRes, productsRes, tasksRes, deptsRes] = await Promise.all([
                analyticsService.getDashboard(),
                analyticsService.getRevenueTrends('monthly'),
                analyticsService.getProducts(),
                analyticsService.getTasks(),
                departmentsService.getAll()
            ]);

            // Process dashboard data
            if (dashboardRes.success) {
                setDashboardData(dashboardRes.data);
            }

            // Process revenue trends
            if (trendsRes.success && trendsRes.data) {
                const trends = trendsRes.data.trends || trendsRes.data;
                // Map to Hebrew months if needed
                const hebrewMonths = {
                    'Jan': 'ינואר', 'Feb': 'פברואר', 'Mar': 'מרץ', 'Apr': 'אפריל',
                    'May': 'מאי', 'Jun': 'יוני', 'Jul': 'יולי', 'Aug': 'אוגוסט',
                    'Sep': 'ספטמבר', 'Oct': 'אוקטובר', 'Nov': 'נובמבר', 'Dec': 'דצמבר'
                };
                const formattedTrends = Array.isArray(trends) ? trends.map(item => ({
                    ...item,
                    period: hebrewMonths[item.period] || item.period || item.month
                })) : [];
                setRevenueTrends(formattedTrends);
            }

            // Process products data
            if (productsRes.success && productsRes.data) {
                const products = productsRes.data.products || productsRes.data.topProducts || productsRes.data || [];
                setTopProducts(Array.isArray(products) ? products.slice(0, 5) : []);
            }

            // Process tasks by department
            if (tasksRes.success && tasksRes.data) {
                const taskData = tasksRes.data.tasksByDepartment || tasksRes.data || [];
                setTasksByDepartment(Array.isArray(taskData) ? taskData : []);
            }

            // Process departments
            if (deptsRes.success && deptsRes.data) {
                const depts = deptsRes.data.departments || deptsRes.data || [];
                setDepartments(Array.isArray(depts) ? depts : []);
            }

        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('אירעה שגיאה בטעינת נתוני האנליטיקס');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading-container glass-card">
                    <Loader2 size={48} className="spinner" />
                    <p>טוען נתוני אנליטיקס...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="analytics-page">
                <div className="error-container glass-card">
                    <AlertCircle size={48} />
                    <h2>שגיאה</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchAllData}>
                        <RefreshCw size={18} />
                        נסה שוב
                    </button>
                </div>
            </div>
        );
    }

    // Format number for display
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '₪0';
        if (value >= 1000) {
            return `₪${(value / 1000).toFixed(0)}K`;
        }
        return `₪${value.toLocaleString()}`;
    };

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>אנליטיקס</h2>
                    <p>נתונים ותובנות עסקיות</p>
                </div>
                <button className="btn btn-outline" onClick={fetchAllData}>
                    <RefreshCw size={18} />
                    רענן נתונים
                </button>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card glass-card">
                    <div className="kpi-value">{formatCurrency(dashboardData?.totalRevenue)}</div>
                    <div className="kpi-label">סה"כ מכירות</div>
                    <div className={`kpi-change ${dashboardData?.revenueChange?.startsWith('+') ? 'positive' : dashboardData?.revenueChange?.startsWith('-') ? 'negative' : 'neutral'}`}>
                        {dashboardData?.revenueChange || 'יציב'} מהחודש שעבר
                    </div>
                </div>
                <div className="kpi-card glass-card">
                    <div className="kpi-value">{dashboardData?.totalOrders || 0}</div>
                    <div className="kpi-label">הזמנות</div>
                    <div className={`kpi-change ${dashboardData?.ordersChange?.startsWith('+') ? 'positive' : 'neutral'}`}>
                        {dashboardData?.ordersChange || '0'} חדשות
                    </div>
                </div>
                <div className="kpi-card glass-card">
                    <div className="kpi-value">{dashboardData?.totalCustomers || 0}</div>
                    <div className="kpi-label">לקוחות</div>
                    <div className={`kpi-change ${dashboardData?.customersChange?.startsWith('+') ? 'positive' : 'neutral'}`}>
                        {dashboardData?.customersChange || '0'} חדשים
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-section glass-card">
                <div className="section-header">
                    <h3>מגמת הכנסות</h3>
                    <span className="section-subtitle">12 חודשים אחרונים</span>
                </div>
                <div className="chart-container">
                    {revenueTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={revenueTrends}>
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
                    ) : (
                        <div className="no-data">
                            <p>אין נתוני הכנסות להצגה</p>
                        </div>
                    )}
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
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.id || index} className="product-row">
                                    <div className="product-rank">{index + 1}</div>
                                    <div className="product-icon">
                                        <Package size={18} />
                                    </div>
                                    <div className="product-info">
                                        <span className="product-name">{product.name}</span>
                                        <span className="product-orders">{product.orderCount || product.sales || 0} הזמנות</span>
                                    </div>
                                    <div className="product-revenue">₪{(product.revenue || 0).toLocaleString()}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <p>אין נתוני מוצרים להצגה</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks by Department */}
                <div className="chart-section glass-card">
                    <div className="section-header">
                        <h3>עומס עבודה לפי מחלקה</h3>
                        <span className="section-subtitle">משימות פעילות</span>
                    </div>
                    <div className="chart-container">
                        {tasksByDepartment.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={tasksByDepartment} layout="vertical">
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
                                        {tasksByDepartment.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#667eea'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">
                                <p>אין נתוני משימות להצגה</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="department-performance glass-card">
                <div className="section-header">
                    <h3>ביצועי מחלקות</h3>
                </div>
                <div className="departments-grid">
                    {departments.length > 0 ? (
                        departments.map(dept => (
                            <div key={dept.id} className="dept-perf-card">
                                <div
                                    className="dept-icon"
                                    style={{ background: `${dept.color || '#667eea'}20`, color: dept.color || '#667eea' }}
                                >
                                    <Building2 size={20} />
                                </div>
                                <div className="dept-stats">
                                    <h4>{dept.name}</h4>
                                    <div className="dept-numbers">
                                        <div className="number-item">
                                            <span className="number-value">{dept.employeeCount || 0}</span>
                                            <span className="number-label">עובדים</span>
                                        </div>
                                        <div className="number-item">
                                            <span className="number-value">{dept.activeTasks || 0}</span>
                                            <span className="number-label">משימות</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="dept-progress">
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${Math.min((dept.activeTasks || 0) / 20 * 100, 100)}%`,
                                            background: dept.color || '#667eea'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <p>אין נתוני מחלקות להצגה</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
