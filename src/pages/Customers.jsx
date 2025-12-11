import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    SlidersHorizontal,
    Eye,
    Edit,
    Trash2,
    Building2,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Check,
    AlertTriangle,
    X,
    Users,
    FolderPlus,
    MoreHorizontal,
    GripVertical,
    Table2,
    LayoutGrid,
    List,
    Kanban,
    GitBranch,
    Calendar as CalendarIcon
} from 'lucide-react';
import { mockCustomers } from '../data/mockData';
import Modal from '../components/Modal';
import ExportDropdown from '../components/ExportDropdown';
import './Customers.css';

// View types
const VIEW_TYPES = {
    TABLE: 'table',
    GRID: 'grid',
    LIST: 'list',
    KANBAN: 'kanban',
    PIPELINE: 'pipeline',
    CALENDAR: 'calendar'
};

function Customers({ currentUser, t, language }) {
    // Data state
    const [customers, setCustomers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentView, setCurrentView] = useState(VIEW_TYPES.TABLE);

    // Groups state
    const [groups, setGroups] = useState([
        { id: 'group-1', name: 'לקוחות VIP', color: '#667eea', customerIds: ['cust-1', 'cust-4'], collapsed: false },
        { id: 'group-2', name: 'לקוחות חדשים', color: '#00f2fe', customerIds: ['cust-2', 'cust-3'], collapsed: false },
        { id: 'group-3', name: 'לקוחות לא פעילים', color: '#8888a0', customerIds: ['cust-5'], collapsed: false }
    ]);
    const [showGroupView, setShowGroupView] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [newGroupName, setNewGroupName] = useState('');

    // Advanced filters state
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState([
        { id: 1, field: 'status', operator: 'equals', value: '', logic: 'AND' }
    ]);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [toast, setToast] = useState(null);
    const [draggedCustomer, setDraggedCustomer] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        status: 'ACTIVE'
    });

    // Filter fields for advanced filters
    const filterFields = [
        { value: 'status', label: language === 'he' ? 'סטטוס' : 'Status' },
        { value: 'totalOrders', label: language === 'he' ? 'מספר הזמנות' : 'Total Orders' },
        { value: 'totalSpent', label: language === 'he' ? 'סכום קניות' : 'Total Spent' },
        { value: 'createdAt', label: language === 'he' ? 'תאריך יצירה' : 'Created Date' }
    ];

    const filterOperators = {
        status: [
            { value: 'equals', label: language === 'he' ? 'שווה ל' : 'equals' },
            { value: 'not_equals', label: language === 'he' ? 'לא שווה ל' : 'not equals' }
        ],
        totalOrders: [
            { value: 'equals', label: '=' },
            { value: 'greater', label: '>' },
            { value: 'less', label: '<' },
            { value: 'between', label: language === 'he' ? 'בין' : 'between' }
        ],
        totalSpent: [
            { value: 'equals', label: '=' },
            { value: 'greater', label: '>' },
            { value: 'less', label: '<' }
        ],
        createdAt: [
            { value: 'after', label: language === 'he' ? 'אחרי' : 'after' },
            { value: 'before', label: language === 'he' ? 'לפני' : 'before' },
            { value: 'between', label: language === 'he' ? 'בין' : 'between' }
        ]
    };

    // Apply filters
    const applyAdvancedFilters = (customerList) => {
        if (!showAdvancedFilters || advancedFilters.every(f => !f.value)) {
            return customerList;
        }

        return customerList.filter(customer => {
            return advancedFilters.every(filter => {
                if (!filter.value) return true;

                switch (filter.field) {
                    case 'status':
                        if (filter.operator === 'equals') return customer.status === filter.value;
                        if (filter.operator === 'not_equals') return customer.status !== filter.value;
                        break;
                    case 'totalOrders':
                        const orders = customer.totalOrders;
                        if (filter.operator === 'equals') return orders === parseInt(filter.value);
                        if (filter.operator === 'greater') return orders > parseInt(filter.value);
                        if (filter.operator === 'less') return orders < parseInt(filter.value);
                        break;
                    case 'totalSpent':
                        const spent = customer.totalSpent;
                        if (filter.operator === 'equals') return spent === parseInt(filter.value);
                        if (filter.operator === 'greater') return spent > parseInt(filter.value);
                        if (filter.operator === 'less') return spent < parseInt(filter.value);
                        break;
                }
                return true;
            });
        });
    };

    // Filtered customers
    const filteredCustomers = applyAdvancedFilters(
        customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
    );

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const statusColors = {
        ACTIVE: '#00f2fe',
        INACTIVE: '#8888a0'
    };

    // Handlers
    const handleView = (customer) => {
        setSelectedCustomer(customer);
        setShowViewModal(true);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            companyName: customer.companyName,
            status: customer.status
        });
        setShowAddModal(true);
    };

    const handleDelete = () => {
        setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
        // Remove from groups too
        setGroups(groups.map(g => ({
            ...g,
            customerIds: g.customerIds.filter(id => id !== selectedCustomer.id)
        })));
        setShowDeleteModal(false);
        showToast(t('customerDeleted') || 'לקוח נמחק');
    };

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        if (selectedCustomer) {
            // Edit
            setCustomers(customers.map(c =>
                c.id === selectedCustomer.id ? { ...c, ...formData } : c
            ));
            showToast(t('customerUpdated') || 'לקוח עודכן');
        } else {
            // Add
            const newCustomer = {
                id: `cust-${Date.now()}`,
                ...formData,
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setCustomers([newCustomer, ...customers]);
            showToast(t('customerAdded') || 'לקוח נוסף');
        }
        setShowAddModal(false);
        setSelectedCustomer(null);
        setFormData({ name: '', email: '', phone: '', companyName: '', status: 'ACTIVE' });
    };

    // Group handlers
    const addGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup = {
            id: `group-${Date.now()}`,
            name: newGroupName,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            customerIds: [],
            collapsed: false
        };
        setGroups([...groups, newGroup]);
        setNewGroupName('');
        setShowAddGroupModal(false);
        showToast(language === 'he' ? 'קבוצה נוצרה' : 'Group created');
    };

    const toggleGroupCollapse = (groupId) => {
        setGroups(groups.map(g =>
            g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
        ));
    };

    const moveCustomerToGroup = (customerId, targetGroupId) => {
        setGroups(groups.map(g => ({
            ...g,
            customerIds: g.id === targetGroupId
                ? [...g.customerIds.filter(id => id !== customerId), customerId]
                : g.customerIds.filter(id => id !== customerId)
        })));
        showToast(language === 'he' ? 'לקוח הועבר לקבוצה' : 'Customer moved');
    };

    // Drag & Drop
    const handleDragStart = (e, customerId) => {
        setDraggedCustomer(customerId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, groupId) => {
        e.preventDefault();
        if (draggedCustomer) {
            moveCustomerToGroup(draggedCustomer, groupId);
            setDraggedCustomer(null);
        }
    };

    // Add filter
    const addFilter = () => {
        setAdvancedFilters([
            ...advancedFilters,
            { id: Date.now(), field: 'status', operator: 'equals', value: '', logic: 'AND' }
        ]);
    };

    const removeFilter = (id) => {
        setAdvancedFilters(advancedFilters.filter(f => f.id !== id));
    };

    const updateFilter = (id, updates) => {
        setAdvancedFilters(advancedFilters.map(f =>
            f.id === id ? { ...f, ...updates } : f
        ));
    };

    // Export columns
    const exportColumns = [
        { label: 'שם', accessor: 'name' },
        { label: 'חברה', accessor: 'companyName' },
        { label: 'אימייל', accessor: 'email' },
        { label: 'טלפון', accessor: 'phone' },
        { label: 'סטטוס', accessor: 'status' },
        { label: 'הזמנות', accessor: 'totalOrders' },
        { label: 'סה"כ קניות', accessor: 'totalSpent' }
    ];

    // View Icons
    const viewOptions = [
        { type: VIEW_TYPES.TABLE, icon: Table2, label: 'טבלה' },
        { type: VIEW_TYPES.GRID, icon: LayoutGrid, label: 'קוביות' },
        { type: VIEW_TYPES.LIST, icon: List, label: 'רשימה' },
        { type: VIEW_TYPES.KANBAN, icon: Kanban, label: 'קנבן' },
        { type: VIEW_TYPES.PIPELINE, icon: GitBranch, label: 'Pipeline' },
        { type: VIEW_TYPES.CALENDAR, icon: CalendarIcon, label: 'לוח שנה' }
    ];

    // Render content based on view type
    const renderContent = () => {
        if (showGroupView) {
            return renderGroupsView();
        }

        switch (currentView) {
            case VIEW_TYPES.GRID:
                return renderGridView();
            case VIEW_TYPES.LIST:
                return renderListView();
            case VIEW_TYPES.KANBAN:
                return renderKanbanView();
            case VIEW_TYPES.PIPELINE:
                return renderPipelineView();
            case VIEW_TYPES.CALENDAR:
                return renderCalendarView();
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
                        <th style={{ width: '40px' }}>
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    setSelectedCustomers(e.target.checked ? filteredCustomers.map(c => c.id) : []);
                                }}
                                checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                            />
                        </th>
                        <th>{t('customerName')}</th>
                        <th>{t('company')}</th>
                        <th>{t('email')}</th>
                        <th>{t('phone')}</th>
                        <th>{t('status')}</th>
                        <th>{t('totalOrdersCount')}</th>
                        <th>{t('totalSpent')}</th>
                        <th>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className={selectedCustomers.includes(customer.id) ? 'selected' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedCustomers.includes(customer.id)}
                                    onChange={(e) => {
                                        setSelectedCustomers(e.target.checked
                                            ? [...selectedCustomers, customer.id]
                                            : selectedCustomers.filter(id => id !== customer.id)
                                        );
                                    }}
                                />
                            </td>
                            <td>
                                <div className="customer-name-cell">
                                    <div className="customer-avatar">
                                        <Building2 size={16} />
                                    </div>
                                    <span>{customer.name}</span>
                                </div>
                            </td>
                            <td>{customer.companyName}</td>
                            <td><a href={`mailto:${customer.email}`}>{customer.email}</a></td>
                            <td>{customer.phone}</td>
                            <td>
                                <span
                                    className="status-badge"
                                    style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                                >
                                    {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                                </span>
                            </td>
                            <td className="center">{customer.totalOrders}</td>
                            <td className="value-cell">₪{customer.totalSpent.toLocaleString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(customer)}><Eye size={14} /></button>
                                    <button className="action-btn" onClick={() => handleEdit(customer)}><Edit size={14} /></button>
                                    <button className="action-btn danger" onClick={() => { setSelectedCustomer(customer); setShowDeleteModal(true); }}><Trash2 size={14} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // GRID VIEW
    const renderGridView = () => (
        <div className="customers-grid">
            {filteredCustomers.map(customer => (
                <div key={customer.id} className="customer-card glass-card" onClick={() => handleView(customer)}>
                    <div className="card-header">
                        <div className="customer-avatar large">
                            <Building2 size={24} />
                        </div>
                        <span
                            className="status-dot"
                            style={{ background: statusColors[customer.status] }}
                        />
                    </div>
                    <h4>{customer.name}</h4>
                    <p className="company">{customer.companyName}</p>
                    <div className="card-stats">
                        <div className="stat">
                            <span className="stat-value">{customer.totalOrders}</span>
                            <span className="stat-label">{t('orders')}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">₪{(customer.totalSpent / 1000).toFixed(0)}K</span>
                            <span className="stat-label">{t('totalSpent')}</span>
                        </div>
                    </div>
                    <div className="card-actions">
                        <button onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${customer.email}`; }}>
                            <Mail size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${customer.phone}`; }}>
                            <Phone size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}>
                            <Edit size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    // LIST VIEW
    const renderListView = () => (
        <div className="customers-list">
            {filteredCustomers.map(customer => (
                <div key={customer.id} className="list-item glass-card" onClick={() => handleView(customer)}>
                    <div className="list-item-main">
                        <div className="customer-avatar">
                            <Building2 size={18} />
                        </div>
                        <div className="list-item-info">
                            <h4>{customer.name}</h4>
                            <p>{customer.companyName} • {customer.email}</p>
                        </div>
                    </div>
                    <div className="list-item-meta">
                        <span className="orders-count">{customer.totalOrders} {t('orders')}</span>
                        <span className="total-spent">₪{customer.totalSpent.toLocaleString()}</span>
                        <span
                            className="status-badge"
                            style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                        >
                            {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    // KANBAN VIEW - by status
    const renderKanbanView = () => {
        const statuses = ['ACTIVE', 'INACTIVE'];
        return (
            <div className="kanban-board">
                {statuses.map(status => (
                    <div
                        key={status}
                        className="kanban-column"
                        onDragOver={handleDragOver}
                    >
                        <div className="kanban-header" style={{ borderColor: statusColors[status] }}>
                            <span style={{ color: statusColors[status] }}>
                                {status === 'ACTIVE' ? t('active') : t('inactive')}
                            </span>
                            <span className="count">{filteredCustomers.filter(c => c.status === status).length}</span>
                        </div>
                        <div className="kanban-cards">
                            {filteredCustomers.filter(c => c.status === status).map(customer => (
                                <div
                                    key={customer.id}
                                    className="kanban-card"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, customer.id)}
                                    onClick={() => handleView(customer)}
                                >
                                    <div className="kanban-card-name">{customer.name}</div>
                                    <div className="kanban-card-company">{customer.companyName}</div>
                                    <div className="kanban-card-stats">
                                        <span>{customer.totalOrders} {t('orders')}</span>
                                        <span>₪{customer.totalSpent.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // PIPELINE VIEW - by total spent
    const renderPipelineView = () => {
        const stages = [
            { id: 'new', label: language === 'he' ? 'חדשים' : 'New', color: '#4facfe', filter: c => c.totalSpent === 0 },
            { id: 'small', label: language === 'he' ? 'לקוחות קטנים' : 'Small', color: '#fee140', filter: c => c.totalSpent > 0 && c.totalSpent < 50000 },
            { id: 'medium', label: language === 'he' ? 'לקוחות בינוניים' : 'Medium', color: '#f5576c', filter: c => c.totalSpent >= 50000 && c.totalSpent < 100000 },
            { id: 'large', label: language === 'he' ? 'לקוחות גדולים' : 'Large', color: '#667eea', filter: c => c.totalSpent >= 100000 && c.totalSpent < 200000 },
            { id: 'vip', label: 'VIP', color: '#00f2fe', filter: c => c.totalSpent >= 200000 }
        ];

        return (
            <div className="pipeline-view">
                <div className="pipeline-header">
                    {stages.map((stage, idx) => (
                        <div key={stage.id} className="pipeline-stage-header">
                            <div className="stage-label" style={{ background: stage.color }}>{stage.label}</div>
                            {idx < stages.length - 1 && <div className="stage-arrow">→</div>}
                        </div>
                    ))}
                </div>
                <div className="pipeline-lanes">
                    {stages.map(stage => (
                        <div key={stage.id} className="pipeline-lane">
                            <div className="lane-total">
                                ₪{filteredCustomers.filter(stage.filter).reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                            </div>
                            {filteredCustomers.filter(stage.filter).map(customer => (
                                <div
                                    key={customer.id}
                                    className="pipeline-card"
                                    style={{ borderLeftColor: stage.color }}
                                    onClick={() => handleView(customer)}
                                >
                                    <div className="pipeline-card-name">{customer.name}</div>
                                    <div className="pipeline-card-value">₪{customer.totalSpent.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // CALENDAR VIEW
    const renderCalendarView = () => {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

        const customersByDate = {};
        filteredCustomers.forEach(c => {
            if (!customersByDate[c.createdAt]) customersByDate[c.createdAt] = [];
            customersByDate[c.createdAt].push(c);
        });

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayCustomers = customersByDate[dateStr] || [];
            days.push(
                <div key={day} className={`calendar-day ${dayCustomers.length > 0 ? 'has-items' : ''}`}>
                    <span className="day-number">{day}</span>
                    {dayCustomers.slice(0, 2).map(c => (
                        <div key={c.id} className="calendar-item" onClick={() => handleView(c)}>
                            {c.name.slice(0, 12)}
                        </div>
                    ))}
                    {dayCustomers.length > 2 && <span className="more">+{dayCustomers.length - 2}</span>}
                </div>
            );
        }

        const weekDays = language === 'he' ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        return (
            <div className="calendar-view glass-card">
                <div className="calendar-title">
                    {today.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="calendar-weekdays">
                    {weekDays.map(d => <div key={d} className="weekday">{d}</div>)}
                </div>
                <div className="calendar-grid">{days}</div>
            </div>
        );
    };

    // GROUPS VIEW - Monday.com style
    const renderGroupsView = () => (
        <div className="groups-view">
            {groups.map(group => (
                <div
                    key={group.id}
                    className="group-section"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, group.id)}
                >
                    <div className="group-header" style={{ borderColor: group.color }}>
                        <button className="collapse-btn" onClick={() => toggleGroupCollapse(group.id)}>
                            {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="group-color" style={{ background: group.color }} />
                        <span className="group-name">{group.name}</span>
                        <span className="group-count">{group.customerIds.length}</span>
                        <button className="group-menu"><MoreHorizontal size={16} /></button>
                    </div>

                    {!group.collapsed && (
                        <div className="group-content">
                            {group.customerIds.length === 0 ? (
                                <div className="empty-group">
                                    {language === 'he' ? 'גרור לקוחות לכאן' : 'Drag customers here'}
                                </div>
                            ) : (
                                <table className="group-table">
                                    <tbody>
                                        {group.customerIds.map(customerId => {
                                            const customer = customers.find(c => c.id === customerId);
                                            if (!customer) return null;
                                            return (
                                                <tr
                                                    key={customer.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, customer.id)}
                                                >
                                                    <td className="drag-handle"><GripVertical size={14} /></td>
                                                    <td className="customer-cell">
                                                        <Building2 size={14} />
                                                        <span>{customer.name}</span>
                                                    </td>
                                                    <td>{customer.companyName}</td>
                                                    <td>
                                                        <span
                                                            className="status-badge small"
                                                            style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                                                        >
                                                            {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="value-cell">₪{customer.totalSpent.toLocaleString()}</td>
                                                    <td>
                                                        <div className="action-buttons small">
                                                            <button onClick={() => handleView(customer)}><Eye size={12} /></button>
                                                            <button onClick={() => handleEdit(customer)}><Edit size={12} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <button className="add-group-btn" onClick={() => setShowAddGroupModal(true)}>
                <FolderPlus size={16} />
                {language === 'he' ? 'הוסף קבוצה' : 'Add Group'}
            </button>
        </div>
    );

    return (
        <div className="customers-page">
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
                    <h2>{t('customers')}</h2>
                    <p>{filteredCustomers.length} {t('customers')}</p>
                </div>
                <div className="header-actions">
                    {/* View Switcher */}
                    <div className="view-switcher">
                        {viewOptions.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.type}
                                    className={`view-btn ${currentView === opt.type && !showGroupView ? 'active' : ''}`}
                                    onClick={() => { setCurrentView(opt.type); setShowGroupView(false); }}
                                    title={opt.label}
                                >
                                    <Icon size={18} />
                                </button>
                            );
                        })}
                        <button
                            className={`view-btn ${showGroupView ? 'active' : ''}`}
                            onClick={() => setShowGroupView(!showGroupView)}
                            title={language === 'he' ? 'קבוצות' : 'Groups'}
                        >
                            <Users size={18} />
                        </button>
                    </div>

                    <button className="btn btn-primary" onClick={() => { setSelectedCustomer(null); setFormData({ name: '', email: '', phone: '', companyName: '', status: 'ACTIVE' }); setShowAddModal(true); }}>
                        <Plus size={18} />
                        {t('newCustomer')}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
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

                    {/* Simple filter */}
                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                            <option value="all">{t('all')}</option>
                            <option value="ACTIVE">{t('active')}</option>
                            <option value="INACTIVE">{t('inactive')}</option>
                        </select>
                    </div>

                    {/* Advanced filter toggle */}
                    <button
                        className={`btn btn-outline advanced-filter-btn ${showAdvancedFilters ? 'active' : ''}`}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        <SlidersHorizontal size={16} />
                        {language === 'he' ? 'סינון מתקדם' : 'Advanced'}
                    </button>
                </div>

                <div className="toolbar-left">
                    {selectedCustomers.length > 0 && (
                        <span className="selected-count">{selectedCustomers.length} {language === 'he' ? 'נבחרו' : 'selected'}</span>
                    )}
                    <ExportDropdown
                        data={selectedCustomers.length > 0 ? customers.filter(c => selectedCustomers.includes(c.id)) : filteredCustomers}
                        columns={exportColumns}
                        filename="customers"
                        language={language}
                        onExport={(format, count) => showToast(`${language === 'he' ? 'יוצאו' : 'Exported'} ${count} ${t('customers')}`)}
                    />
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="advanced-filters-panel glass-card">
                    <div className="filters-header">
                        <h4><SlidersHorizontal size={16} /> {language === 'he' ? 'סינון מתקדם (אם/כאשר)' : 'Advanced Filters (If/When)'}</h4>
                        <button className="btn btn-outline btn-sm" onClick={() => setAdvancedFilters([{ id: 1, field: 'status', operator: 'equals', value: '', logic: 'AND' }])}>
                            {language === 'he' ? 'נקה הכל' : 'Clear All'}
                        </button>
                    </div>

                    {advancedFilters.map((filter, idx) => (
                        <div key={filter.id} className="filter-row">
                            {idx > 0 && (
                                <select
                                    className="logic-select"
                                    value={filter.logic}
                                    onChange={(e) => updateFilter(filter.id, { logic: e.target.value })}
                                >
                                    <option value="AND">{language === 'he' ? 'וגם' : 'AND'}</option>
                                    <option value="OR">{language === 'he' ? 'או' : 'OR'}</option>
                                </select>
                            )}
                            {idx === 0 && <span className="filter-if">{language === 'he' ? 'אם' : 'IF'}</span>}

                            <select
                                className="field-select"
                                value={filter.field}
                                onChange={(e) => updateFilter(filter.id, { field: e.target.value, operator: 'equals', value: '' })}
                            >
                                {filterFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>

                            <select
                                className="operator-select"
                                value={filter.operator}
                                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                            >
                                {(filterOperators[filter.field] || []).map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                            </select>

                            {filter.field === 'status' ? (
                                <select
                                    className="value-select"
                                    value={filter.value}
                                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                >
                                    <option value="">{language === 'he' ? 'בחר...' : 'Select...'}</option>
                                    <option value="ACTIVE">{t('active')}</option>
                                    <option value="INACTIVE">{t('inactive')}</option>
                                </select>
                            ) : (
                                <input
                                    type={filter.field === 'createdAt' ? 'date' : 'number'}
                                    className="value-input"
                                    value={filter.value}
                                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                    placeholder={language === 'he' ? 'ערך...' : 'Value...'}
                                />
                            )}

                            <button className="remove-filter-btn" onClick={() => removeFilter(filter.id)}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    <button className="add-filter-btn" onClick={addFilter}>
                        <Plus size={14} />
                        {language === 'he' ? 'הוסף תנאי' : 'Add Condition'}
                    </button>
                </div>
            )}

            {/* Main Content */}
            {renderContent()}

            {/* Add/Edit Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedCustomer ? t('edit') : t('newCustomer')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{t('customerName')}</label>
                            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>{t('company')}</label>
                            <input type="text" className="form-input" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{t('email')}</label>
                            <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>{t('phone')}</label>
                            <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('status')}</label>
                        <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                            <option value="ACTIVE">{t('active')}</option>
                            <option value="INACTIVE">{t('inactive')}</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-primary" onClick={handleSave}><Check size={16} />{t('save')}</button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedCustomer?.name || ''}>
                {selectedCustomer && (
                    <div className="customer-detail">
                        <div className="detail-section">
                            <h4>{t('company')}</h4>
                            <p>{selectedCustomer.companyName}</p>
                        </div>
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>{t('email')}</h4>
                                <p><a href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</a></p>
                            </div>
                            <div className="detail-section">
                                <h4>{t('phone')}</h4>
                                <p>{selectedCustomer.phone}</p>
                            </div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>{t('totalOrdersCount')}</h4>
                                <p className="big-number">{selectedCustomer.totalOrders}</p>
                            </div>
                            <div className="detail-section">
                                <h4>{t('totalSpent')}</h4>
                                <p className="big-number success">₪{selectedCustomer.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowViewModal(false)}>{t('close') || 'סגור'}</button>
                            <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEdit(selectedCustomer); }}><Edit size={16} />{t('edit')}</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('delete')} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon"><AlertTriangle size={48} /></div>
                    <p>{language === 'he' ? 'למחוק את' : 'Delete'} <strong>{selectedCustomer?.name}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16} />{t('delete')}</button>
                    </div>
                </div>
            </Modal>

            {/* Add Group Modal */}
            <Modal isOpen={showAddGroupModal} onClose={() => setShowAddGroupModal(false)} title={language === 'he' ? 'קבוצה חדשה' : 'New Group'} size="small">
                <div className="modal-form">
                    <div className="form-group">
                        <label>{language === 'he' ? 'שם הקבוצה' : 'Group Name'}</label>
                        <input type="text" className="form-input" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder={language === 'he' ? 'לקוחות VIP...' : 'VIP Customers...'} />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddGroupModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-primary" onClick={addGroup}><Check size={16} />{language === 'he' ? 'צור קבוצה' : 'Create'}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Customers;
