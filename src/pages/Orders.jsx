import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    Package,
    User,
    Calendar,
    Clock,
    Check,
    AlertTriangle,
    FileText
} from 'lucide-react';
import { mockOrders, mockCustomers, mockProducts } from '../data/mockData';
import { ViewSwitcher, VIEW_TYPES } from '../components/ViewSwitcher';
import Modal from '../components/Modal';
import './Orders.css';

function Orders({ currentUser, t, language }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentView, setCurrentView] = useState(VIEW_TYPES.TABLE);
    const [orders, setOrders] = useState(mockOrders);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);

    // New order form
    const [newOrderForm, setNewOrderForm] = useState({
        customerId: '',
        items: [{ productId: '', quantity: 1, unitPrice: 0 }],
        notes: ''
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const statusColors = {
        PENDING: '#fee140',
        PROCESSING: '#4facfe',
        COMPLETED: '#00f2fe',
        CANCELLED: '#ff6b6b'
    };

    const statusLabels = {
        he: { PENDING: 'ממתין', PROCESSING: 'בעיבוד', COMPLETED: 'הושלם', CANCELLED: 'בוטל' },
        uk: { PENDING: 'Очікує', PROCESSING: 'Обробка', COMPLETED: 'Виконано', CANCELLED: 'Скасовано' },
        en: { PENDING: 'Pending', PROCESSING: 'Processing', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
    };

    const getStatusLabel = (status) => statusLabels[language]?.[status] || statusLabels.he[status];

    // Handlers
    const handleView = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
        ));
        showToast(t('statusUpdated') || 'סטטוס עודכן');
    };

    const handleDelete = () => {
        setOrders(orders.filter(o => o.id !== selectedOrder.id));
        setShowDeleteModal(false);
        showToast(t('orderDeleted') || 'הזמנה נמחקה');
    };

    // Add item to new order
    const addOrderItem = () => {
        setNewOrderForm({
            ...newOrderForm,
            items: [...newOrderForm.items, { productId: '', quantity: 1, unitPrice: 0 }]
        });
    };

    // Create new order
    const handleCreateOrder = () => {
        if (!newOrderForm.customerId || newOrderForm.items.every(i => !i.productId)) {
            showToast(language === 'he' ? 'נא לבחור לקוח ומוצר' : 'Please select customer and product', 'error');
            return;
        }

        const customer = mockCustomers.find(c => c.id === newOrderForm.customerId);
        const newOrder = {
            id: `ord-${Date.now()}`,
            orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orders.length + 1).padStart(3, '0')}`,
            customerId: newOrderForm.customerId,
            customer,
            status: 'PENDING',
            totalAmount: newOrderForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
            items: newOrderForm.items.filter(i => i.productId).map((item, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                productId: item.productId,
                product: mockProducts.find(p => p.id === item.productId),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                selectedParameters: []
            })),
            notes: newOrderForm.notes,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        setOrders([newOrder, ...orders]);
        setShowAddModal(false);
        setNewOrderForm({ customerId: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }], notes: '' });
        showToast(t('orderCreated') || 'הזמנה נוצרה בהצלחה! משימות נוצרו אוטומטית.');
    };

    // Render based on view type
    const renderContent = () => {
        switch (currentView) {
            case VIEW_TYPES.GRID:
                return renderGridView();
            case VIEW_TYPES.LIST:
                return renderListView();
            case VIEW_TYPES.KANBAN:
                return renderKanbanView();
            case VIEW_TYPES.CALENDAR:
                return renderCalendarView();
            case VIEW_TYPES.GANTT:
                return renderGanttView();
            default:
                return renderTableView();
        }
    };

    // TABLE VIEW
    const renderTableView = () => (
        <div className="table-container glass-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>{t('orderNumber')}</th>
                        <th>{t('customer')}</th>
                        <th>{t('status')}</th>
                        <th>{t('items')}</th>
                        <th>{t('total')}</th>
                        <th>{t('date')}</th>
                        <th>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td><strong>{order.orderNumber}</strong></td>
                            <td>
                                <div className="customer-cell">
                                    <User size={14} />
                                    <span>{order.customer?.name}</span>
                                </div>
                            </td>
                            <td>
                                <select
                                    className="status-select"
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    style={{
                                        background: `${statusColors[order.status]}20`,
                                        color: statusColors[order.status],
                                        borderColor: statusColors[order.status]
                                    }}
                                >
                                    <option value="PENDING">{getStatusLabel('PENDING')}</option>
                                    <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                                    <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                                    <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                                </select>
                            </td>
                            <td className="center">{order.items?.length || 0}</td>
                            <td className="value-cell">₪{order.totalAmount?.toLocaleString()}</td>
                            <td>{order.createdAt}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(order)}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="action-btn" onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // GRID VIEW (Cards)
    const renderGridView = () => (
        <div className="orders-grid">
            {filteredOrders.map(order => (
                <div key={order.id} className="order-card glass-card">
                    <div className="order-card-header">
                        <span className="order-number">{order.orderNumber}</span>
                        <span
                            className="status-badge"
                            style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status] }}
                        >
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                    <div className="order-card-customer">
                        <User size={16} />
                        <span>{order.customer?.name}</span>
                    </div>
                    <div className="order-card-details">
                        <div className="detail-item">
                            <Package size={14} />
                            <span>{order.items?.length || 0} {t('items')}</span>
                        </div>
                        <div className="detail-item">
                            <Calendar size={14} />
                            <span>{order.createdAt}</span>
                        </div>
                    </div>
                    <div className="order-card-total">
                        ₪{order.totalAmount?.toLocaleString()}
                    </div>
                    <div className="order-card-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => handleView(order)}>
                            <Eye size={14} /> {t('view')}
                        </button>
                        <select
                            className="status-select-sm"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                            <option value="PENDING">{getStatusLabel('PENDING')}</option>
                            <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                            <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                            <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );

    // LIST VIEW
    const renderListView = () => (
        <div className="orders-list">
            {filteredOrders.map(order => (
                <div key={order.id} className="order-list-item glass-card" onClick={() => handleView(order)}>
                    <div className="list-item-main">
                        <div className="list-item-icon" style={{ background: statusColors[order.status] }}>
                            <FileText size={20} />
                        </div>
                        <div className="list-item-info">
                            <h4>{order.orderNumber}</h4>
                            <p>{order.customer?.name} • {order.items?.length} {t('items')}</p>
                        </div>
                    </div>
                    <div className="list-item-meta">
                        <span className="list-item-date">{order.createdAt}</span>
                        <span className="list-item-amount">₪{order.totalAmount?.toLocaleString()}</span>
                        <span
                            className="status-badge"
                            style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status] }}
                        >
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    // KANBAN VIEW
    const renderKanbanView = () => {
        const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
        return (
            <div className="kanban-board">
                {statuses.map(status => (
                    <div key={status} className="kanban-column">
                        <div className="kanban-column-header" style={{ borderColor: statusColors[status] }}>
                            <span className="kanban-status" style={{ color: statusColors[status] }}>
                                {getStatusLabel(status)}
                            </span>
                            <span className="kanban-count">
                                {filteredOrders.filter(o => o.status === status).length}
                            </span>
                        </div>
                        <div className="kanban-cards">
                            {filteredOrders.filter(o => o.status === status).map(order => (
                                <div
                                    key={order.id}
                                    className="kanban-card"
                                    onClick={() => handleView(order)}
                                    draggable
                                    onDragEnd={() => {/* TODO: implement drag */ }}
                                >
                                    <div className="kanban-card-number">{order.orderNumber}</div>
                                    <div className="kanban-card-customer">{order.customer?.name}</div>
                                    <div className="kanban-card-footer">
                                        <span>{order.items?.length} {t('items')}</span>
                                        <span>₪{order.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // CALENDAR VIEW
    const renderCalendarView = () => {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

        const ordersByDate = {};
        filteredOrders.forEach(order => {
            const date = order.createdAt;
            if (!ordersByDate[date]) ordersByDate[date] = [];
            ordersByDate[date].push(order);
        });

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOrders = ordersByDate[dateStr] || [];
            days.push(
                <div key={day} className={`calendar-day ${dayOrders.length > 0 ? 'has-orders' : ''}`}>
                    <span className="day-number">{day}</span>
                    {dayOrders.slice(0, 2).map(order => (
                        <div
                            key={order.id}
                            className="calendar-order"
                            style={{ background: statusColors[order.status] }}
                            onClick={() => handleView(order)}
                        >
                            {order.orderNumber.slice(-7)}
                        </div>
                    ))}
                    {dayOrders.length > 2 && (
                        <span className="more-orders">+{dayOrders.length - 2}</span>
                    )}
                </div>
            );
        }

        const weekDays = language === 'he'
            ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="calendar-view glass-card">
                <div className="calendar-header-bar">
                    <h3>{today.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
                </div>
                <div className="calendar-weekdays">
                    {weekDays.map(day => <div key={day} className="weekday">{day}</div>)}
                </div>
                <div className="calendar-grid">
                    {days}
                </div>
            </div>
        );
    };

    // GANTT VIEW
    const renderGanttView = () => {
        const today = new Date();
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            return d;
        });

        return (
            <div className="gantt-view glass-card">
                <div className="gantt-header">
                    <div className="gantt-label-col">{t('orderNumber')}</div>
                    <div className="gantt-timeline">
                        {days.map((d, i) => (
                            <div key={i} className="gantt-day">
                                {d.getDate()}/{d.getMonth() + 1}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="gantt-body">
                    {filteredOrders.slice(0, 10).map(order => (
                        <div key={order.id} className="gantt-row">
                            <div className="gantt-label">{order.orderNumber}</div>
                            <div className="gantt-bars">
                                <div
                                    className="gantt-bar"
                                    style={{
                                        background: statusColors[order.status],
                                        width: `${Math.random() * 40 + 20}%`,
                                        marginLeft: `${Math.random() * 30}%`
                                    }}
                                    onClick={() => handleView(order)}
                                >
                                    {order.customer?.name?.slice(0, 15)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="orders-page">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div className="header-info">
                    <h2>{t('orders')}</h2>
                    <p>{filteredOrders.length} {t('orders')}</p>
                </div>
                <div className="header-actions">
                    <ViewSwitcher
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        language={language}
                    />
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        {t('newOrder')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="toolbar glass-card">
                <div className="toolbar-right">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('all')}</option>
                            <option value="PENDING">{getStatusLabel('PENDING')}</option>
                            <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                            <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                            <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                        </select>
                    </div>
                </div>

                <div className="toolbar-left">
                    <button className="btn btn-outline">
                        <Download size={18} />
                        {t('export')}
                    </button>
                </div>
            </div>

            {/* Content based on view */}
            {renderContent()}

            {/* Add Order Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('newOrder')} size="large">
                <div className="order-wizard">
                    {/* Step 1: Customer */}
                    <div className="wizard-section">
                        <h4><User size={18} /> {t('customer')}</h4>
                        <select
                            className="form-select"
                            value={newOrderForm.customerId}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, customerId: e.target.value })}
                        >
                            <option value="">{language === 'he' ? 'בחר לקוח...' : 'Select customer...'}</option>
                            {mockCustomers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.companyName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Items */}
                    <div className="wizard-section">
                        <h4><Package size={18} /> {t('items')}</h4>
                        {newOrderForm.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                                <select
                                    className="form-select"
                                    value={item.productId}
                                    onChange={(e) => {
                                        const product = mockProducts.find(p => p.id === e.target.value);
                                        const newItems = [...newOrderForm.items];
                                        newItems[idx] = {
                                            ...newItems[idx],
                                            productId: e.target.value,
                                            unitPrice: product?.price || 0
                                        };
                                        setNewOrderForm({ ...newOrderForm, items: newItems });
                                    }}
                                >
                                    <option value="">{language === 'he' ? 'בחר מוצר...' : 'Select product...'}</option>
                                    {mockProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₪{p.price.toLocaleString()}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    className="form-input quantity-input"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newItems = [...newOrderForm.items];
                                        newItems[idx].quantity = parseInt(e.target.value) || 1;
                                        setNewOrderForm({ ...newOrderForm, items: newItems });
                                    }}
                                />
                                <span className="item-price">₪{(item.unitPrice * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                        <button className="btn btn-outline btn-sm" onClick={addOrderItem}>
                            <Plus size={14} /> {language === 'he' ? 'הוסף מוצר' : 'Add Product'}
                        </button>
                    </div>

                    {/* Step 3: Notes */}
                    <div className="wizard-section">
                        <h4><FileText size={18} /> {t('notes')}</h4>
                        <textarea
                            className="form-textarea"
                            value={newOrderForm.notes}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                            placeholder={language === 'he' ? 'הערות להזמנה...' : 'Order notes...'}
                        />
                    </div>

                    {/* Summary */}
                    <div className="order-summary">
                        <div className="summary-row">
                            <span>{t('total')}:</span>
                            <span className="summary-total">
                                ₪{newOrderForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                            {t('cancel')}
                        </button>
                        <button className="btn btn-primary" onClick={handleCreateOrder}>
                            <Check size={16} />
                            {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Order Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedOrder?.orderNumber || ''} size="large">
                {selectedOrder && (
                    <div className="order-detail">
                        <div className="detail-header">
                            <span
                                className="status-badge large"
                                style={{ background: `${statusColors[selectedOrder.status]}20`, color: statusColors[selectedOrder.status] }}
                            >
                                {getStatusLabel(selectedOrder.status)}
                            </span>
                            <span className="order-date">{selectedOrder.createdAt}</span>
                        </div>

                        <div className="detail-section">
                            <h4>{t('customer')}</h4>
                            <p><strong>{selectedOrder.customer?.name}</strong></p>
                            <p>{selectedOrder.customer?.companyName}</p>
                            <p>{selectedOrder.customer?.email}</p>
                        </div>

                        <div className="detail-section">
                            <h4>{t('orderItems')} ({selectedOrder.items?.length})</h4>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>{t('productName')}</th>
                                        <th>{language === 'he' ? 'כמות' : 'Qty'}</th>
                                        <th>{t('price')}</th>
                                        <th>{t('total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.product?.name}</td>
                                            <td className="center">{item.quantity}</td>
                                            <td>₪{item.unitPrice?.toLocaleString()}</td>
                                            <td>₪{(item.unitPrice * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>{t('total')}</strong></td>
                                        <td><strong>₪{selectedOrder.totalAmount?.toLocaleString()}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {selectedOrder.notes && (
                            <div className="detail-section">
                                <h4>{t('notes')}</h4>
                                <p className="notes-text">{selectedOrder.notes}</p>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowViewModal(false)}>
                                {t('close') || 'סגור'}
                            </button>
                            <select
                                className="status-select"
                                value={selectedOrder.status}
                                onChange={(e) => {
                                    handleStatusChange(selectedOrder.id, e.target.value);
                                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                                }}
                                style={{
                                    background: `${statusColors[selectedOrder.status]}20`,
                                    color: statusColors[selectedOrder.status]
                                }}
                            >
                                <option value="PENDING">{getStatusLabel('PENDING')}</option>
                                <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                                <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                                <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('delete')} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon">
                        <AlertTriangle size={48} />
                    </div>
                    <p>{language === 'he' ? 'האם אתה בטוח שברצונך למחוק את' : 'Delete'} <strong>{selectedOrder?.orderNumber}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                            {t('cancel')}
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <Trash2 size={16} />
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Orders;
