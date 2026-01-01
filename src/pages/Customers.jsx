import { useState, useEffect } from 'react';
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
    Calendar as CalendarIcon,
    Loader2,
    Upload,
    Sparkles
} from 'lucide-react';
import { customersService } from '../services/api';
import Modal from '../components/Modal';
import ExportDropdown from '../components/ExportDropdown';
import GroupedBoard from '../components/GroupedBoard';
import BulkImporter from '../components/BulkImporter';
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
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentView, setCurrentView] = useState(VIEW_TYPES.TABLE);

    // Groups state - load from localStorage
    const [groups, setGroups] = useState(() => {
        const saved = localStorage.getItem('customers-groups');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse groups', e);
            }
        }
        return [
            { id: 'group-1', name: 'VIP', color: '#667eea', itemIds: [], collapsed: false },
            { id: 'group-2', name: language === 'he' ? 'לקוחות חדשים' : 'New Customers', color: '#00f2fe', itemIds: [], collapsed: false },
            { id: 'group-3', name: language === 'he' ? 'לא פעילים' : 'Inactive', color: '#8888a0', itemIds: [], collapsed: false }
        ];
    });
    const [showGroupView, setShowGroupView] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Save groups to localStorage when they change
    useEffect(() => {
        localStorage.setItem('customers-groups', JSON.stringify(groups));
    }, [groups]);

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
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [toast, setToast] = useState(null);
    const [draggedCustomer, setDraggedCustomer] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        status: 'ACTIVE'
    });

    // Fetch customers from API
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const result = await customersService.getAll({ limit: 100 });
            if (result.success) {
                setCustomers(result.data.customers || []);
            } else {
                setError(result.error?.message || 'Failed to load customers');
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

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
                        const orders = customer.totalOrders || 0;
                        if (filter.operator === 'equals') return orders === parseInt(filter.value);
                        if (filter.operator === 'greater') return orders > parseInt(filter.value);
                        if (filter.operator === 'less') return orders < parseInt(filter.value);
                        break;
                    case 'totalSpent':
                        const spent = customer.totalSpent || 0;
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
            const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            phone: customer.phone || '',
            companyName: customer.companyName || '',
            status: customer.status
        });
        setShowAddModal(true);
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const result = await customersService.delete(selectedCustomer.id);
            if (result.success) {
                setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
                setGroups(groups.map(g => ({
                    ...g,
                    customerIds: g.customerIds.filter(id => id !== selectedCustomer.id)
                })));
                setShowDeleteModal(false);
                showToast(t('customerDeleted') || 'Customer deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Demo data for customers
    const demoCustomerNames = ['בית כנסת הגדול', 'קהילת אור התורה', 'ישיבת מרכז הרב', 'בית מדרש חכמי לב', 'קהילת שערי רחמים', 'מרכז תורני נתיבות', 'בית כנסת המזרחי', 'קהילת בני ציון'];
    const demoContacts = ['הרב משה כהן', 'מר יעקב לוי', 'הרב דוד שטרן', 'מר אברהם גולד', 'הרב יצחק פרידמן', 'מר שמואל רוזן'];
    const demoCities = ['ירושלים', 'בני ברק', 'תל אביב', 'פתח תקווה', 'רמת גן', 'אשדוד', 'חיפה', 'באר שבע'];
    const demoStreets = ['רח\' הרב קוק', 'רח\' החשמונאים', 'שד\' רוטשילד', 'רח\' בן יהודה', 'רח\' אלנבי', 'רח\' דיזנגוף'];

    const fillDemoCustomer = () => {
        const counter = parseInt(localStorage.getItem('demoCustomerCounter') || '0') + 1;
        localStorage.setItem('demoCustomerCounter', counter.toString());

        const randomName = demoCustomerNames[counter % demoCustomerNames.length];
        const randomContact = demoContacts[counter % demoContacts.length];
        const randomCity = demoCities[counter % demoCities.length];
        const randomStreet = demoStreets[counter % demoStreets.length];
        const randomNumber = Math.floor(1 + Math.random() * 150);

        setFormData({
            name: `${randomName} #${counter}`,
            email: `customer${counter}@demo.com`,
            phone: `05${Math.floor(10000000 + Math.random() * 89999999)}`,
            companyName: randomName,
            contactName: randomContact,
            address: `${randomStreet} ${randomNumber}, ${randomCity}`,
            notes: `לקוח דמו #${counter} - ${randomCity}`
        });

        showToast(`מילוי דמו לקוח #${counter}`, 'success');
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedCustomer) {
                // Edit
                const result = await customersService.update(selectedCustomer.id, formData);
                if (result.success) {
                    setCustomers(customers.map(c =>
                        c.id === selectedCustomer.id ? { ...c, ...result.data } : c
                    ));
                    showToast(t('customerUpdated') || 'Customer updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                // Add
                const result = await customersService.create(formData);
                if (result.success) {
                    setCustomers([result.data, ...customers]);
                    showToast(t('customerAdded') || 'Customer added');
                } else {
                    showToast(result.error?.message || 'Failed to create', 'error');
                    return;
                }
            }
            setShowAddModal(false);
            setSelectedCustomer(null);
            setFormData({ name: '', email: '', phone: '', companyName: '', status: 'ACTIVE' });
        } catch (err) {
            showToast(err.error?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
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
        { label: 'Name', accessor: 'name' },
        { label: 'Company', accessor: 'companyName' },
        { label: 'Email', accessor: 'email' },
        { label: 'Phone', accessor: 'phone' },
        { label: 'Status', accessor: 'status' },
        { label: 'Orders', accessor: 'totalOrders' },
        { label: 'Total Spent', accessor: 'totalSpent' }
    ];

    // View Icons
    const viewOptions = [
        { type: VIEW_TYPES.TABLE, icon: Table2, label: 'Table' },
        { type: VIEW_TYPES.GRID, icon: LayoutGrid, label: 'Grid' },
        { type: VIEW_TYPES.LIST, icon: List, label: 'List' },
        { type: VIEW_TYPES.KANBAN, icon: Kanban, label: 'Kanban' },
        { type: VIEW_TYPES.PIPELINE, icon: GitBranch, label: 'Pipeline' },
        { type: VIEW_TYPES.CALENDAR, icon: CalendarIcon, label: 'Calendar' }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="customers-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען לקוחות...' : 'Loading customers...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="customers-page">
                <div className="error-container">
                    <AlertTriangle size={40} />
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchCustomers}>
                        {language === 'he' ? 'נסה שוב' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    // Render a single customer item (used by GroupedBoard)
    const renderCustomerItem = (customer) => (
        <div className="group-item-content" onClick={() => handleView(customer)}>
            <div className="item-main">
                <div className="customer-row">
                    <div className="customer-avatar">
                        <Building2 size={16} />
                    </div>
                    <div className="customer-info-compact">
                        <span className="customer-name">{customer.name}</span>
                        <span className="customer-company">{customer.companyName || '-'}</span>
                    </div>
                </div>
            </div>
            <div className="item-meta">
                <span className="customer-email">{customer.email}</span>
                <span className="customer-phone">{customer.phone || '-'}</span>
                <span
                    className="status-badge"
                    style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                >
                    {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                </span>
                <div className="action-buttons">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}><Edit size={14} /></button>
                    <button className="action-btn danger" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); setShowDeleteModal(true); }}><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );

    // Render content based on view type - now properly switching views
    const renderContent = () => {
        // If group view is active, show GroupedBoard
        if (showGroupView) {
            return (
                <GroupedBoard
                    items={filteredCustomers}
                    groups={groups}
                    onGroupsChange={setGroups}
                    renderItem={renderCustomerItem}
                    itemIdField="id"
                    language={language}
                    emptyStateIcon={<Users size={48} />}
                    emptyStateText={language === 'he' ? 'לא נמצאו לקוחות' : 'No customers found'}
                />
            );
        }

        // Otherwise, render based on currentView
        switch (currentView) {
            case VIEW_TYPES.TABLE:
                return renderTableView();
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
                            <td>{customer.companyName || '-'}</td>
                            <td><a href={`mailto:${customer.email}`}>{customer.email}</a></td>
                            <td>{customer.phone || '-'}</td>
                            <td>
                                <span
                                    className="status-badge"
                                    style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                                >
                                    {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                                </span>
                            </td>
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
            {filteredCustomers.length === 0 && (
                <div className="empty-state">
                    <Users size={48} />
                    <p>{language === 'he' ? 'לא נמצאו לקוחות' : 'No customers found'}</p>
                </div>
            )}
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
                    <p className="company">{customer.companyName || '-'}</p>
                    <div className="card-stats">
                        <div className="stat">
                            <span className="stat-value">{customer.totalOrders || 0}</span>
                            <span className="stat-label">{t('orders')}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">${((customer.totalSpent || 0) / 1000).toFixed(0)}K</span>
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
                            <p>{customer.companyName || '-'} - {customer.email}</p>
                        </div>
                    </div>
                    <div className="list-item-meta">
                        <span className="orders-count">{customer.totalOrders || 0} {t('orders')}</span>
                        <span className="total-spent">${(customer.totalSpent || 0).toLocaleString()}</span>
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
                                    <div className="kanban-card-company">{customer.companyName || '-'}</div>
                                    <div className="kanban-card-stats">
                                        <span>{customer.totalOrders || 0} {t('orders')}</span>
                                        <span>${(customer.totalSpent || 0).toLocaleString()}</span>
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
            { id: 'new', label: language === 'he' ? 'חדשים' : 'New', color: '#4facfe', filter: c => (c.totalSpent || 0) === 0 },
            { id: 'small', label: language === 'he' ? 'קטנים' : 'Small', color: '#fee140', filter: c => (c.totalSpent || 0) > 0 && (c.totalSpent || 0) < 50000 },
            { id: 'medium', label: language === 'he' ? 'בינוניים' : 'Medium', color: '#f5576c', filter: c => (c.totalSpent || 0) >= 50000 && (c.totalSpent || 0) < 100000 },
            { id: 'large', label: language === 'he' ? 'גדולים' : 'Large', color: '#667eea', filter: c => (c.totalSpent || 0) >= 100000 && (c.totalSpent || 0) < 200000 },
            { id: 'vip', label: 'VIP', color: '#00f2fe', filter: c => (c.totalSpent || 0) >= 200000 }
        ];

        return (
            <div className="pipeline-view">
                <div className="pipeline-header">
                    {stages.map((stage, idx) => (
                        <div key={stage.id} className="pipeline-stage-header">
                            <div className="stage-label" style={{ background: stage.color }}>{stage.label}</div>
                            {idx < stages.length - 1 && <div className="stage-arrow">-</div>}
                        </div>
                    ))}
                </div>
                <div className="pipeline-lanes">
                    {stages.map(stage => (
                        <div key={stage.id} className="pipeline-lane">
                            <div className="lane-total">
                                ${filteredCustomers.filter(stage.filter).reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
                            </div>
                            {filteredCustomers.filter(stage.filter).map(customer => (
                                <div
                                    key={customer.id}
                                    className="pipeline-card"
                                    style={{ borderLeftColor: stage.color }}
                                    onClick={() => handleView(customer)}
                                >
                                    <div className="pipeline-card-name">{customer.name}</div>
                                    <div className="pipeline-card-value">${(customer.totalSpent || 0).toLocaleString()}</div>
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
            const dateStr = c.createdAt?.split('T')[0];
            if (dateStr) {
                if (!customersByDate[dateStr]) customersByDate[dateStr] = [];
                customersByDate[dateStr].push(c);
            }
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
                    {weekDays.map((d, i) => <div key={i} className="weekday">{d}</div>)}
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
                                                    <td>{customer.companyName || '-'}</td>
                                                    <td>
                                                        <span
                                                            className="status-badge small"
                                                            style={{ background: `${statusColors[customer.status]}20`, color: statusColors[customer.status] }}
                                                        >
                                                            {customer.status === 'ACTIVE' ? t('active') : t('inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="value-cell">${(customer.totalSpent || 0).toLocaleString()}</td>
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

                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
                            <Upload size={18} />
                            {language === 'he' ? 'ייבוא' : 'Import'}
                        </button>
                        <button className="btn btn-primary" onClick={() => { setSelectedCustomer(null); setFormData({ name: '', email: '', phone: '', companyName: '', status: 'ACTIVE' }); setShowAddModal(true); }}>
                            <Plus size={18} />
                            {t('newCustomer')}
                        </button>
                    </div>
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
                        {!selectedCustomer && (
                            <button className="btn btn-outline demo-btn" onClick={fillDemoCustomer} type="button">
                                <Sparkles size={16} />
                                Demo
                            </button>
                        )}
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>{t('cancel')}</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {t('save')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedCustomer?.name || ''}>
                {selectedCustomer && (
                    <div className="customer-detail">
                        <div className="detail-section">
                            <h4>{t('company')}</h4>
                            <p>{selectedCustomer.companyName || '-'}</p>
                        </div>
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>{t('email')}</h4>
                                <p><a href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</a></p>
                            </div>
                            <div className="detail-section">
                                <h4>{t('phone')}</h4>
                                <p>{selectedCustomer.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>{t('status')}</h4>
                                <span
                                    className="status-badge"
                                    style={{ background: `${statusColors[selectedCustomer.status]}20`, color: statusColors[selectedCustomer.status] }}
                                >
                                    {selectedCustomer.status === 'ACTIVE' ? t('active') : t('inactive')}
                                </span>
                            </div>
                            <div className="detail-section">
                                <h4>{t('createdAt') || 'Created'}</h4>
                                <p>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowViewModal(false)}>{t('close') || 'Close'}</button>
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
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>{t('cancel')}</button>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Group Modal */}
            <Modal isOpen={showAddGroupModal} onClose={() => setShowAddGroupModal(false)} title={language === 'he' ? 'קבוצה חדשה' : 'New Group'} size="small">
                <div className="modal-form">
                    <div className="form-group">
                        <label>{language === 'he' ? 'שם הקבוצה' : 'Group Name'}</label>
                        <input type="text" className="form-input" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder={language === 'he' ? 'VIP...' : 'VIP Customers...'} />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddGroupModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-primary" onClick={addGroup}><Check size={16} />{language === 'he' ? 'צור קבוצה' : 'Create'}</button>
                    </div>
                </div>
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title=""
                size="large"
                hideHeader
            >
                <BulkImporter
                    entityType="customers"
                    targetFields={[
                        { key: 'name', label: language === 'he' ? 'שם לקוח' : 'Customer Name', type: 'text', required: true },
                        { key: 'email', label: language === 'he' ? 'אימייל' : 'Email', type: 'email', required: true },
                        { key: 'phone', label: language === 'he' ? 'טלפון' : 'Phone', type: 'tel', required: false },
                        { key: 'companyName', label: language === 'he' ? 'חברה' : 'Company', type: 'text', required: false },
                        { key: 'status', label: language === 'he' ? 'סטטוס' : 'Status', type: 'select', required: false }
                    ]}
                    onImport={async (data) => {
                        const result = await customersService.create(data);
                        if (!result.success) throw new Error(result.error?.message);
                        return result.data;
                    }}
                    language={language}
                    onClose={() => {
                        setShowImportModal(false);
                        fetchCustomers(); // Refresh data after import
                    }}
                />
            </Modal>
        </div>
    );
}

export default Customers;
