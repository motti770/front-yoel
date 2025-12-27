import { useState, useEffect } from 'react';
import {
    Warehouse,
    Plus,
    Package,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Play,
    Pause,
    Search,
    Filter,
    MoreHorizontal,
    Loader2,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import Modal from '../components/Modal';
import './StockOrders.css';

// Mock Products for selection
const MOCK_PRODUCTS = [
    { id: '1', name: 'כיפה סרוגה', category: 'כיפות', unitCost: 15 },
    { id: '2', name: 'כיפה שחורה', category: 'כיפות', unitCost: 12 },
    { id: '3', name: 'טלית גדולה', category: 'טליתות', unitCost: 250 },
    { id: '4', name: 'פרוכת ארון קודש', category: 'פרוכות', unitCost: 1500 },
    { id: '5', name: 'מפה לבימה', category: 'מפות', unitCost: 400 },
];

// Mock Stock Orders
const MOCK_STOCK_ORDERS = [
    { id: '1', productId: '1', productName: 'כיפה סרוגה', quantity: 500, estimatedCost: 7500, status: 'IN_PROGRESS', targetDate: '2025-01-15', createdAt: '2024-12-20', progress: 65 },
    { id: '2', productId: '2', productName: 'כיפה שחורה', quantity: 1000, estimatedCost: 12000, status: 'PENDING', targetDate: '2025-02-01', createdAt: '2024-12-25', progress: 0 },
    { id: '3', productId: '3', productName: 'טלית גדולה', quantity: 50, estimatedCost: 12500, status: 'COMPLETED', targetDate: '2024-12-28', createdAt: '2024-12-01', progress: 100 },
];

const STATUS_CONFIG = {
    PENDING: { label: { he: 'ממתין', en: 'Pending' }, color: '#6366f1', icon: Clock },
    IN_PROGRESS: { label: { he: 'בייצור', en: 'In Progress' }, color: '#f59e0b', icon: Play },
    COMPLETED: { label: { he: 'הושלם', en: 'Completed' }, color: '#10b981', icon: CheckCircle },
    CANCELLED: { label: { he: 'בוטל', en: 'Cancelled' }, color: '#ef4444', icon: XCircle }
};

function StockOrders({ language = 'he' }) {
    const [orders, setOrders] = useState(MOCK_STOCK_ORDERS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: 100,
        targetDate: '',
        notes: ''
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totals = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        totalValue: orders.reduce((sum, o) => sum + o.estimatedCost, 0)
    };

    const handleAddOrder = () => {
        if (!formData.productId || !formData.quantity) return;

        const product = MOCK_PRODUCTS.find(p => p.id === formData.productId);
        const newOrder = {
            id: Date.now().toString(),
            productId: formData.productId,
            productName: product?.name || '',
            quantity: Number(formData.quantity),
            estimatedCost: (product?.unitCost || 0) * Number(formData.quantity),
            status: 'PENDING',
            targetDate: formData.targetDate,
            createdAt: new Date().toISOString().split('T')[0],
            progress: 0,
            notes: formData.notes
        };

        setOrders([newOrder, ...orders]);
        setShowAddModal(false);
        setFormData({ productId: '', quantity: 100, targetDate: '', notes: '' });
    };

    const updateStatus = (orderId, newStatus) => {
        setOrders(orders.map(o =>
            o.id === orderId
                ? { ...o, status: newStatus, progress: newStatus === 'COMPLETED' ? 100 : newStatus === 'IN_PROGRESS' ? 25 : 0 }
                : o
        ));
    };

    const selectedProduct = MOCK_PRODUCTS.find(p => p.id === formData.productId);
    const estimatedCost = selectedProduct ? selectedProduct.unitCost * Number(formData.quantity || 0) : 0;

    return (
        <div className="stock-orders-page">
            {/* Header */}
            <div className="page-header glass-card">
                <div className="header-info">
                    <div className="page-icon">
                        <Warehouse size={28} />
                    </div>
                    <div>
                        <h1>{language === 'he' ? 'ייצור למלאי' : 'Stock Production'}</h1>
                        <p>{language === 'he' ? 'ניהול הזמנות ייצור פנימיות' : 'Internal production orders'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{totals.pending}</span>
                        <span className="stat-label">{language === 'he' ? 'ממתינים' : 'Pending'}</span>
                    </div>
                    <div className="stat warning">
                        <span className="stat-value">{totals.inProgress}</span>
                        <span className="stat-label">{language === 'he' ? 'בייצור' : 'In Progress'}</span>
                    </div>
                    <div className="stat success">
                        <span className="stat-value">{totals.completed}</span>
                        <span className="stat-label">{language === 'he' ? 'הושלמו' : 'Completed'}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">₪{totals.totalValue.toLocaleString()}</span>
                        <span className="stat-label">{language === 'he' ? 'שווי כולל' : 'Total Value'}</span>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    {language === 'he' ? 'הזמנת מלאי חדשה' : 'New Stock Order'}
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar glass-card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={language === 'he' ? 'חיפוש...' : 'Search...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                        <option value="PENDING">{language === 'he' ? 'ממתין' : 'Pending'}</option>
                        <option value="IN_PROGRESS">{language === 'he' ? 'בייצור' : 'In Progress'}</option>
                        <option value="COMPLETED">{language === 'he' ? 'הושלם' : 'Completed'}</option>
                    </select>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="orders-grid">
                {filteredOrders.map(order => {
                    const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                    const isOverdue = new Date(order.targetDate) < new Date() && order.status !== 'COMPLETED';

                    return (
                        <div key={order.id} className={`order-card glass-card ${isOverdue ? 'overdue' : ''}`}>
                            <div className="order-header">
                                <div className="product-info">
                                    <Package size={20} />
                                    <h3>{order.productName}</h3>
                                </div>
                                <div
                                    className="status-badge"
                                    style={{ background: STATUS_CONFIG[order.status]?.color }}
                                >
                                    <StatusIcon size={14} />
                                    {STATUS_CONFIG[order.status]?.label[language]}
                                </div>
                            </div>

                            <div className="order-details">
                                <div className="detail-row">
                                    <span>{language === 'he' ? 'כמות' : 'Quantity'}</span>
                                    <strong>{order.quantity.toLocaleString()}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>{language === 'he' ? 'עלות משוערת' : 'Est. Cost'}</span>
                                    <strong>₪{order.estimatedCost.toLocaleString()}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>{language === 'he' ? 'תאריך יעד' : 'Target Date'}</span>
                                    <strong className={isOverdue ? 'text-danger' : ''}>
                                        {order.targetDate}
                                        {isOverdue && <AlertTriangle size={14} style={{ marginInlineStart: '4px' }} />}
                                    </strong>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>{language === 'he' ? 'התקדמות' : 'Progress'}</span>
                                    <span>{order.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${order.progress}%`,
                                            background: STATUS_CONFIG[order.status]?.color
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="order-actions">
                                {order.status === 'PENDING' && (
                                    <button className="btn btn-sm btn-primary" onClick={() => updateStatus(order.id, 'IN_PROGRESS')}>
                                        <Play size={14} />
                                        {language === 'he' ? 'התחל ייצור' : 'Start'}
                                    </button>
                                )}
                                {order.status === 'IN_PROGRESS' && (
                                    <button className="btn btn-sm btn-success" onClick={() => updateStatus(order.id, 'COMPLETED')}>
                                        <CheckCircle size={14} />
                                        {language === 'he' ? 'סיים' : 'Complete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="empty-state">
                        <Warehouse size={48} />
                        <h3>{language === 'he' ? 'אין הזמנות מלאי' : 'No stock orders'}</h3>
                        <p>{language === 'he' ? 'צור הזמנת ייצור חדשה למלאי' : 'Create a new production order'}</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={language === 'he' ? 'הזמנת מלאי חדשה' : 'New Stock Order'}
            >
                <div className="form-content">
                    <div className="form-group">
                        <label>{language === 'he' ? 'מוצר' : 'Product'}</label>
                        <select
                            className="form-input"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        >
                            <option value="">{language === 'he' ? 'בחר מוצר...' : 'Select product...'}</option>
                            {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₪{p.unitCost}/יח')</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{language === 'he' ? 'כמות' : 'Quantity'}</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label>{language === 'he' ? 'תאריך יעד' : 'Target Date'}</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.targetDate}
                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>{language === 'he' ? 'הערות' : 'Notes'}</label>
                        <textarea
                            className="form-input"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Cost Preview */}
                    {formData.productId && (
                        <div className="cost-preview glass-card">
                            <TrendingUp size={20} />
                            <div>
                                <span>{language === 'he' ? 'עלות משוערת' : 'Estimated Cost'}</span>
                                <strong>₪{estimatedCost.toLocaleString()}</strong>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button className="btn btn-primary" onClick={handleAddOrder} disabled={!formData.productId}>
                            <Plus size={16} />
                            {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default StockOrders;
