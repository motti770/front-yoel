import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    ChevronRight,
    ArrowRight,
    Package,
    User,
    Users,
    Calendar,
    Clock,
    Check,
    AlertTriangle,
    FileText,
    Loader2,
    FolderPlus,
    GripVertical,
    Upload,
    X as XIcon,
    PlayCircle,
    Sparkles
} from 'lucide-react';
import { ordersService, customersService, productsService, tasksService, workflowsService, filesService, materialsService } from '../services/api';
import { ViewSwitcher, VIEW_TYPES } from '../components/ViewSwitcher';
import Modal from '../components/Modal';
import ProductConfigurator from '../components/ProductConfigurator';
import MaterialSelector from '../components/MaterialSelector';
import './Orders.css';

function Orders({ currentUser, t, language }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentView, setCurrentView] = useState(VIEW_TYPES.TABLE);

    // Groups state
    const [groups, setGroups] = useState([
        { id: 'group-1', name: language === 'he' ? 'דחוף' : 'Priority', color: '#ff6b6b', orderIds: [], collapsed: false },
        { id: 'group-2', name: language === 'he' ? 'השבוע' : 'This Week', color: '#4facfe', orderIds: [], collapsed: false },
        { id: 'group-3', name: language === 'he' ? 'ממתין ללקוח' : 'Customer Waiting', color: '#fee140', orderIds: [], collapsed: false }
    ]);
    const [showGroupView, setShowGroupView] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [draggedOrder, setDraggedOrder] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Wizard steps
    const [wizardStep, setWizardStep] = useState(1);

    // New order form - enhanced with workflow, assets and materials
    const [newOrderForm, setNewOrderForm] = useState({
        customerId: '',
        items: [{
            productId: '',
            quantity: 1,
            unitPrice: 0,
            selectedParameters: [],
            workflowId: '',
            assets: [], // Files to upload
            selectedMaterials: [], // Materials (fabrics, threads, etc.)
            materialWarnings: [] // Stock warnings for materials
        }],
        notes: '',
        dueDate: ''
    });

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [ordersRes, customersRes, productsRes, workflowsRes, tasksRes] = await Promise.all([
                ordersService.getAll({ limit: 100 }),
                customersService.getAll({ limit: 100 }),
                productsService.getAll({ limit: 100 }),
                workflowsService.getAll({ limit: 100 }),
                tasksService.getAll({ limit: 100 })
            ]);

            console.log('[Orders] API Responses:', { ordersRes, customersRes, productsRes, workflowsRes, tasksRes });

            // Handle Orders
            if (ordersRes.success) {
                const ordersData = ordersRes.data?.orders || ordersRes.data?.items || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
                setOrders(ordersData);
            } else {
                console.warn('[Orders] Orders API failed:', ordersRes.error);
            }

            // Handle Customers
            if (customersRes.success) {
                const customersData = customersRes.data?.customers || customersRes.data?.items || (Array.isArray(customersRes.data) ? customersRes.data : []);
                setCustomers(customersData);
            }

            // Handle Products
            if (productsRes.success) {
                const productsData = productsRes.data?.products || productsRes.data?.items || (Array.isArray(productsRes.data) ? productsRes.data : []);
                setProducts(productsData);
            }

            // Handle Workflows
            if (workflowsRes.success) {
                const workflowsData = workflowsRes.data?.workflows || workflowsRes.data?.items || (Array.isArray(workflowsRes.data) ? workflowsRes.data : []);
                setWorkflows(workflowsData);
            }

            // Handle Tasks
            if (tasksRes.success) {
                const tasksData = tasksRes.data?.tasks || tasksRes.data?.items || (Array.isArray(tasksRes.data) ? tasksRes.data : []);
                setTasks(tasksData);
            }

        } catch (err) {
            console.error('[Orders] Fetch error:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Check for query params (from lead conversion)
    useEffect(() => {
        const customerIdFromQuery = searchParams.get('customerId');
        const fromLead = searchParams.get('from') === 'lead';

        if (customerIdFromQuery && fromLead) {
            // Auto-open the new order modal with customer pre-filled
            setNewOrderForm(prev => ({
                ...prev,
                customerId: customerIdFromQuery
            }));
            setShowAddModal(true);
        }
    }, [searchParams]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const statusColors = {
        PENDING: '#fee140',
        PENDING_PAYMENT: '#f59e0b', // Orange - waiting for deposit
        DEPOSIT_PAID: '#10b981', // Green - deposit received
        IN_PRODUCTION: '#4facfe', // Blue - in production
        PROCESSING: '#4facfe',
        COMPLETED: '#00f2fe',
        CANCELLED: '#ff6b6b'
    };

    const statusLabels = {
        he: {
            PENDING: 'ממתין',
            PENDING_PAYMENT: 'ממתין לתשלום',
            DEPOSIT_PAID: 'מקדמה שולמה',
            IN_PRODUCTION: 'בייצור',
            PROCESSING: 'בעיבוד',
            COMPLETED: 'הושלם',
            CANCELLED: 'בוטל'
        },
        uk: {
            PENDING: 'Очікує',
            PENDING_PAYMENT: 'Очікує оплати',
            DEPOSIT_PAID: 'Депозит сплачено',
            IN_PRODUCTION: 'У виробництві',
            PROCESSING: 'Обробка',
            COMPLETED: 'Виконано',
            CANCELLED: 'Скасовано'
        },
        en: {
            PENDING: 'Pending',
            PENDING_PAYMENT: 'Awaiting Payment',
            DEPOSIT_PAID: 'Deposit Paid',
            IN_PRODUCTION: 'In Production',
            PROCESSING: 'Processing',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled'
        }
    };

    const getStatusLabel = (status) => statusLabels[language]?.[status] || statusLabels.he[status] || status;

    // Handlers
    const handleView = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const result = await ordersService.update(orderId, { status: newStatus });
            if (result.success) {
                setOrders(orders.map(o =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                ));
                showToast(t?.('statusUpdated') || 'Status updated');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const result = await ordersService.cancel(selectedOrder.id);
            if (result.success) {
                setOrders(orders.filter(o => o.id !== selectedOrder.id));
                setShowDeleteModal(false);
                showToast(t?.('orderDeleted') || 'Order cancelled');
            } else {
                showToast(result.error?.message || 'Failed to cancel order', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to cancel order', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Confirm deposit payment - unlocks production
    const handleConfirmDeposit = async (order, depositAmount) => {
        try {
            setSaving(true);
            const result = await ordersService.confirmDeposit(order.id, depositAmount);
            if (result.success) {
                // Update order in state
                setOrders(orders.map(o =>
                    o.id === order.id ? result.data : o
                ));
                // Refresh tasks
                const tasksRes = await tasksService.getAll({ limit: 100 });
                if (tasksRes.success) {
                    const tasksData = tasksRes.data?.tasks || tasksRes.data?.items || (Array.isArray(tasksRes.data) ? tasksRes.data : []);
                    setTasks(tasksData);
                }
                if (selectedOrder?.id === order.id) {
                    setSelectedOrder(result.data);
                }
                showToast(language === 'he' ? 'מקדמה אושרה - הייצור התחיל!' : 'Deposit confirmed - production started!');
            } else {
                showToast(result.error?.message || 'Failed to confirm deposit', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to confirm deposit', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Generate Workflow Task Manually
    // Generate Workflow Tasks Automatically
    const generateProductionTask = async () => {
        if (!selectedOrder) return;
        try {
            setSaving(true);
            let tasksCreated = 0;

            // Iterate over each item in the order
            for (const item of selectedOrder.items || []) {
                if (!item.productId) continue;

                // Try to get workflow for this product
                try {
                    const wfResponse = await workflowsService.getByProduct(item.productId);
                    const workflow = wfResponse.success ? wfResponse.data : null;

                    if (workflow && workflow.steps && workflow.steps.length > 0) {
                        // Create tasks for each step in the workflow
                        for (const step of workflow.steps) {
                            const taskData = {
                                title: `${step.name} - ${item.product?.name || 'Product'} (${selectedOrder.orderNumber})`,
                                description: `Step ${step.stepOrder}: ${step.name}. ${item.selectedParameters?.map(p => `${p.name}: ${p.value}`).join(', ') || ''}`,
                                status: 'PENDING',
                                priority: 'MEDIUM',
                                departmentId: step.departmentId,
                                orderId: selectedOrder.id,
                                orderItemId: item.id,
                                workflowStepId: step.id,
                                estimatedDuration: step.estimatedDurationMinutes
                            };
                            await tasksService.create(taskData);
                            tasksCreated++;
                        }
                    } else {
                        // Fallback: Create generic task if no workflow found
                        const taskData = {
                            title: `${language === 'he' ? 'ייצור' : 'Production'}: ${item.product?.name || 'Item'} (${selectedOrder.orderNumber})`,
                            description: `${language === 'he' ? 'ייצור כללי עבור הזמנה' : 'General production for order'} ${selectedOrder.orderNumber}`,
                            status: 'PENDING',
                            priority: 'HIGH',
                            departmentId: 'dept-1', // Default
                            orderId: selectedOrder.id,
                            orderItemId: item.id
                        };
                        await tasksService.create(taskData);
                        tasksCreated++;
                    }
                } catch (wfErr) {
                    console.warn(`Could not fetch workflow for product ${item.productId}`, wfErr);
                    // Fallback on error
                    const taskData = {
                        title: `${language === 'he' ? 'ייצור ידני' : 'Manual Production'}: ${item.product?.name} (${selectedOrder.orderNumber})`,
                        description: `Manual task created due to workflow error.`,
                        status: 'PENDING',
                        priority: 'HIGH',
                        departmentId: 'dept-1',
                        orderId: selectedOrder.id,
                        orderItemId: item.id
                    };
                    await tasksService.create(taskData);
                    tasksCreated++;
                }
            }

            if (tasksCreated > 0) {
                showToast(t?.('tasksCreated') || `${tasksCreated} tasks created successfully`, 'success');
                // Update order status
                await handleStatusChange(selectedOrder.id, 'PROCESSING');
                setSelectedOrder({ ...selectedOrder, status: 'PROCESSING' });
            } else {
                showToast(language === 'he' ? 'לא נוצרו משימות (אין פריטים)' : 'No tasks created (no items)', 'warning');
            }
            setShowViewModal(false);
        } catch (err) {
            console.error('Task creation failed:', err);
            showToast(t?.('taskCreationFailed') || 'Failed to create tasks', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Add item to new order
    const addOrderItem = () => {
        setNewOrderForm({
            ...newOrderForm,
            items: [...newOrderForm.items, {
                productId: '',
                quantity: 1,
                unitPrice: 0,
                selectedParameters: [],
                workflowId: '',
                assets: [],
                selectedMaterials: [],
                materialWarnings: []
            }]
        });
    };

    // Demo data for orders
    const demoNotes = [
        'לקוח VIP - יש לתת עדיפות',
        'רקמה מיוחדת לפי דוגמא שנשלחה במייל',
        'יש להתקשר לאישור צבעים לפני תחילת העבודה',
        'הזמנה חוזרת - לפי דוגמא קודמת #2023-156',
        'דחוף! יש אירוע בעוד 3 שבועות',
        'נא לשים לב לפרטים המיוחדים של הלקוח'
    ];

    const fillDemoOrder = () => {
        const counter = parseInt(localStorage.getItem('demoOrderCounter') || '0') + 1;
        localStorage.setItem('demoOrderCounter', counter.toString());

        // Pick random customer
        const randomCustomer = customers.length > 0
            ? customers[counter % customers.length]
            : null;

        // Pick random product(s)
        const availableProducts = products.filter(p => !p.isDesignGroup);
        const numProducts = 1 + (counter % 3); // 1-3 products
        const selectedProducts = [];

        for (let i = 0; i < numProducts && i < availableProducts.length; i++) {
            const productIdx = (counter + i) % availableProducts.length;
            const product = availableProducts[productIdx];
            const workflow = workflows.find(w => w.productId === product.id) || (workflows.length > 0 ? workflows[counter % workflows.length] : null);

            selectedProducts.push({
                productId: product.id,
                quantity: 1 + (counter % 5),
                unitPrice: product.basePrice || product.price || 5000,
                selectedParameters: [],
                workflowId: workflow?.id || '',
                assets: []
            });
        }

        // Generate due date (2-8 weeks from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14 + (counter % 42));
        const dueDateStr = dueDate.toISOString().split('T')[0];

        setNewOrderForm({
            customerId: randomCustomer?.id || '',
            items: selectedProducts.length > 0 ? selectedProducts : [{
                productId: availableProducts[0]?.id || '',
                quantity: 1,
                unitPrice: availableProducts[0]?.basePrice || 5000,
                selectedParameters: [],
                workflowId: '',
                assets: []
            }],
            notes: demoNotes[counter % demoNotes.length],
            dueDate: dueDateStr
        });

        showToast(`מילוי דמו הזמנה #${counter}`, 'success');
    };

    // Handle file upload for order item
    const handleFileUpload = async (itemIndex, event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newItems = [...newOrderForm.items];
        newItems[itemIndex].assets = [...(newItems[itemIndex].assets || []), ...files];
        setNewOrderForm({ ...newOrderForm, items: newItems });
    };

    // Remove file from order item
    const removeFile = (itemIndex, fileIndex) => {
        const newItems = [...newOrderForm.items];
        newItems[itemIndex].assets = newItems[itemIndex].assets.filter((_, i) => i !== fileIndex);
        setNewOrderForm({ ...newOrderForm, items: newItems });
    };

    // Wizard navigation
    const nextStep = () => {
        if (wizardStep === 1 && !newOrderForm.customerId) {
            showToast(language === 'he' ? 'נא לבחור לקוח' : 'Please select a customer', 'error');
            return;
        }
        if (wizardStep === 2 && newOrderForm.items.every(i => !i.productId)) {
            showToast(language === 'he' ? 'נא להוסיף לפחות מוצר אחד' : 'Please add at least one product', 'error');
            return;
        }
        setWizardStep(prev => Math.min(3, prev + 1));
    };

    const prevStep = () => {
        setWizardStep(prev => Math.max(1, prev - 1));
    };

    // Create new order
    const handleCreateOrder = async () => {
        if (!newOrderForm.customerId || newOrderForm.items.every(i => !i.productId)) {
            showToast(language === 'he' ? 'נא לבחור לקוח ומוצר' : 'Please select customer and product', 'error');
            return;
        }

        // Check for critical stock issues
        const criticalWarnings = newOrderForm.items.flatMap(item =>
            (item.materialWarnings || []).filter(w => w.type === 'critical')
        );
        if (criticalWarnings.length > 0) {
            showToast(
                language === 'he'
                    ? 'לא ניתן ליצור הזמנה - חומרים חסרים במלאי'
                    : 'Cannot create order - materials out of stock',
                'error'
            );
            return;
        }

        try {
            setSaving(true);

            // 1. Create order with materials
            const orderData = {
                customerId: newOrderForm.customerId,
                items: newOrderForm.items.filter(i => i.productId).map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    selectedParameters: item.selectedParameters || [],
                    workflowId: item.workflowId || null,
                    selectedMaterials: item.selectedMaterials || []
                })),
                notes: newOrderForm.notes,
                dueDate: newOrderForm.dueDate || null
            };

            const result = await ordersService.create(orderData);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to create order');
            }

            const newOrder = result.data;

            // 2. Reserve materials (deduct from inventory)
            for (const item of newOrderForm.items) {
                if (item.selectedMaterials && item.selectedMaterials.length > 0) {
                    try {
                        const materialItems = item.selectedMaterials.map(m => ({
                            materialId: m.materialId,
                            quantity: item.quantity // In real implementation, might calculate actual usage
                        }));
                        await materialsService.reserveForOrder(newOrder.id, materialItems);
                    } catch (materialErr) {
                        console.warn('Failed to reserve materials:', materialErr);
                        // Continue even if material reservation fails
                    }
                }
            }

            // 3. Upload assets for each item
            for (let i = 0; i < newOrderForm.items.length; i++) {
                const item = newOrderForm.items[i];
                if (item.assets && item.assets.length > 0) {
                    for (const file of item.assets) {
                        try {
                            await filesService.upload(file, 'ORDER_ASSET', newOrder.id);
                        } catch (uploadErr) {
                            console.warn('Failed to upload asset:', uploadErr);
                        }
                    }
                }
            }

            // 4. Auto-generate tasks if workflow is selected
            if (newOrderForm.items.some(i => i.workflowId)) {
                try {
                    // Create tasks for items with workflows
                    for (const item of newOrder.items || []) {
                        if (item.workflowId) {
                            const workflow = workflows.find(w => w.id === item.workflowId);
                            if (workflow && workflow.steps && workflow.steps.length > 0) {
                                for (const step of workflow.steps) {
                                    await tasksService.create({
                                        title: `${step.name} - ${item.product?.name || 'Product'}`,
                                        description: `Workflow step for order ${newOrder.orderNumber}`,
                                        status: 'PENDING',
                                        priority: 'MEDIUM',
                                        departmentId: step.departmentId,
                                        orderId: newOrder.id,
                                        orderItemId: item.id,
                                        workflowStepId: step.id
                                    });
                                }
                            }
                        }
                    }
                } catch (taskErr) {
                    console.warn('Failed to create tasks:', taskErr);
                }
            }

            // 5. Update UI
            setOrders([newOrder, ...orders]);
            setShowAddModal(false);
            setWizardStep(1);
            setNewOrderForm({
                customerId: '',
                items: [{
                    productId: '',
                    quantity: 1,
                    unitPrice: 0,
                    selectedParameters: [],
                    workflowId: '',
                    assets: [],
                    selectedMaterials: [],
                    materialWarnings: []
                }],
                notes: '',
                dueDate: ''
            });

            showToast(t?.('orderCreated') || 'Order created successfully!');

            // Navigate to order view
            setTimeout(() => {
                navigate(`/orders/${newOrder.id}`);
            }, 1000);

        } catch (err) {
            console.error('[Orders] Create error:', err);
            showToast(err.message || err.error?.message || 'Failed to create order', 'error');
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
            orderIds: [],
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

    const moveOrderToGroup = (orderId, targetGroupId) => {
        setGroups(groups.map(g => ({
            ...g,
            orderIds: g.id === targetGroupId
                ? [...g.orderIds.filter(id => id !== orderId), orderId]
                : g.orderIds.filter(id => id !== orderId)
        })));
        showToast(language === 'he' ? 'הזמנה הועברה' : 'Order moved');
    };

    const deleteGroup = (groupId) => {
        setGroups(groups.filter(g => g.id !== groupId));
        showToast(language === 'he' ? 'קבוצה נמחקה' : 'Group deleted');
    };

    // Drag & Drop handlers
    const handleDragStart = (e, orderId) => {
        setDraggedOrder(orderId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, groupId) => {
        e.preventDefault();
        if (draggedOrder) {
            moveOrderToGroup(draggedOrder, groupId);
            setDraggedOrder(null);
        }
    };

    // Get ungrouped orders
    const getUngroupedOrders = () => {
        const allGroupedIds = groups.flatMap(g => g.orderIds);
        return filteredOrders.filter(o => !allGroupedIds.includes(o.id));
    };

    // Loading state
    if (loading) {
        return (
            <div className="orders-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען הזמנות...' : 'Loading orders...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="orders-page">
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
                        <th>{t?.('orderNumber') || 'Order #'}</th>
                        <th>{t?.('customer') || 'Customer'}</th>
                        <th>{t?.('status') || 'Status'}</th>
                        <th>{t?.('items') || 'Items'}</th>
                        <th>{t?.('total') || 'Total'}</th>
                        <th>{t?.('date') || 'Date'}</th>
                        <th>{t?.('actions') || 'Actions'}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td><strong>{order.orderNumber}</strong></td>
                            <td>
                                <div className="customer-cell">
                                    <User size={14} />
                                    <span>{order.customer?.name || '-'}</span>
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
                                    <option value="PENDING_PAYMENT">{getStatusLabel('PENDING_PAYMENT')}</option>
                                    <option value="IN_PRODUCTION">{getStatusLabel('IN_PRODUCTION')}</option>
                                    <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                                    <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                                    <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                                </select>
                            </td>
                            <td className="center">{order.items?.length || 0}</td>
                            <td className="value-cell">${(order.totalAmount || 0).toLocaleString()}</td>
                            <td>{order.createdAt?.split('T')[0] || '-'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(order)}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="action-btn danger" onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredOrders.length === 0 && (
                <div className="empty-state">
                    <FileText size={48} />
                    <p>{language === 'he' ? 'לא נמצאו הזמנות' : 'No orders found'}</p>
                </div>
            )}
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
                        <span>{order.customer?.name || '-'}</span>
                    </div>
                    <div className="order-card-details">
                        <div className="detail-item">
                            <Package size={14} />
                            <span>{order.items?.length || 0} {t?.('items') || 'items'}</span>
                        </div>
                        <div className="detail-item">
                            <Calendar size={14} />
                            <span>{order.createdAt?.split('T')[0] || '-'}</span>
                        </div>
                    </div>
                    <div className="order-card-total">
                        ${(order.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="order-card-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => handleView(order)}>
                            <Eye size={14} /> {t?.('view') || 'View'}
                        </button>
                        <select
                            className="status-select-sm"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                            <option value="PENDING">{getStatusLabel('PENDING')}</option>
                            <option value="PENDING_PAYMENT">{getStatusLabel('PENDING_PAYMENT')}</option>
                            <option value="IN_PRODUCTION">{getStatusLabel('IN_PRODUCTION')}</option>
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
                            <p>{order.customer?.name || '-'} • {order.items?.length || 0} {t?.('items') || 'items'}</p>
                        </div>
                    </div>
                    <div className="list-item-meta">
                        <span className="list-item-date">{order.createdAt?.split('T')[0] || '-'}</span>
                        <span className="list-item-amount">${(order.totalAmount || 0).toLocaleString()}</span>
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
        const statuses = ['PENDING_PAYMENT', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'];
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
                                >
                                    <div className="kanban-card-number">{order.orderNumber}</div>
                                    <div className="kanban-card-customer">{order.customer?.name || '-'}</div>
                                    <div className="kanban-card-footer">
                                        <span>{order.items?.length || 0} {t?.('items') || 'items'}</span>
                                        <span>${(order.totalAmount || 0).toLocaleString()}</span>
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
            const date = order.createdAt?.split('T')[0];
            if (date) {
                if (!ordersByDate[date]) ordersByDate[date] = [];
                ordersByDate[date].push(order);
            }
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
                            {order.orderNumber?.slice(-7)}
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
                    <div className="gantt-label-col">{t?.('orderNumber') || 'Order #'}</div>
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
                                    {order.customer?.name?.slice(0, 15) || '-'}
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
                    <h2>{t?.('orders') || 'Orders'}</h2>
                    <p>{filteredOrders.length} {t?.('orders') || 'orders'}</p>
                </div>
                <div className="header-actions">
                    <ViewSwitcher
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        language={language}
                    />
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        {t?.('newOrder') || 'New Order'}
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
                            placeholder={t?.('search') || 'Search...'}
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
                            <option value="all">{t?.('all') || 'All'}</option>
                            <option value="PENDING">{getStatusLabel('PENDING')}</option>
                            <option value="PENDING_PAYMENT">{getStatusLabel('PENDING_PAYMENT')}</option>
                            <option value="IN_PRODUCTION">{getStatusLabel('IN_PRODUCTION')}</option>
                            <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                            <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                            <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                        </select>
                    </div>
                </div>

                <div className="toolbar-left">
                    <button className="btn btn-outline">
                        <Download size={18} />
                        {t?.('export') || 'Export'}
                    </button>
                </div>
            </div>

            {/* Content based on view */}
            {renderContent()}

            {/* Add Order Modal - 3 Step Wizard */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setWizardStep(1);
                }}
                title={`${t?.('newOrder') || 'New Order'} - ${language === 'he' ? 'שלב' : 'Step'} ${wizardStep}/3`}
                size="large"
            >
                <div className="order-wizard">
                    {/* Wizard Progress */}
                    <div className="wizard-progress">
                        <div className={`wizard-step ${wizardStep >= 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}>
                            <div className="step-number">1</div>
                            <span className="step-label">{language === 'he' ? 'לקוח' : 'Customer'}</span>
                        </div>
                        <div className="wizard-line" />
                        <div className={`wizard-step ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
                            <div className="step-number">2</div>
                            <span className="step-label">{language === 'he' ? 'מוצרים' : 'Products'}</span>
                        </div>
                        <div className="wizard-line" />
                        <div className={`wizard-step ${wizardStep >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span className="step-label">{language === 'he' ? 'פרטים' : 'Details'}</span>
                        </div>
                    </div>

                    {/* Step 1: Customer Selection */}
                    {wizardStep === 1 && (
                        <div className="wizard-section">
                            <h4><User size={18} /> {language === 'he' ? 'בחירת לקוח' : 'Select Customer'}</h4>
                            <select
                                className="form-select"
                                value={newOrderForm.customerId}
                                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerId: e.target.value })}
                            >
                                <option value="">{language === 'he' ? 'בחר לקוח...' : 'Select customer...'}</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.companyName ? `- ${c.companyName}` : ''}
                                    </option>
                                ))}
                            </select>
                            {newOrderForm.customerId && (
                                <div className="customer-preview" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                                    <strong>{customers.find(c => c.id === newOrderForm.customerId)?.name}</strong>
                                    <p style={{ margin: '4px 0', opacity: 0.7 }}>
                                        {customers.find(c => c.id === newOrderForm.customerId)?.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Add Products */}
                    {wizardStep === 2 && (
                        <div className="wizard-section">
                            <h4><Package size={18} /> {language === 'he' ? 'הוספת מוצרים' : 'Add Products'}</h4>
                            {newOrderForm.items.map((item, idx) => {
                                const selectedProduct = products.find(p => p.id === item.productId);
                                const selectedWorkflow = workflows.find(w => w.id === item.workflowId);

                                return (
                                    <div key={idx} className="order-item-block" style={{ marginBottom: '16px' }}>
                                        <div className="order-item-row">
                                            <select
                                                className="form-select"
                                                value={item.productId}
                                                onChange={(e) => {
                                                    const product = products.find(p => p.id === e.target.value);
                                                    const newItems = [...newOrderForm.items];
                                                    newItems[idx] = {
                                                        ...newItems[idx],
                                                        productId: e.target.value,
                                                        unitPrice: product?.basePrice || product?.price || 0,
                                                        workflowId: product?.workflowId || '',
                                                        selectedParameters: []
                                                    };
                                                    setNewOrderForm({ ...newOrderForm, items: newItems });
                                                }}
                                            >
                                                <option value="">{language === 'he' ? 'בחר מוצר...' : 'Select product...'}</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} - ${(p.basePrice || p.price || 0).toLocaleString()}
                                                    </option>
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
                                                placeholder={language === 'he' ? 'כמות' : 'Qty'}
                                            />
                                            <span className="item-price">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                        </div>

                                        {/* Product Configurator */}
                                        {selectedProduct && (
                                            <ProductConfigurator
                                                product={selectedProduct}
                                                language={language}
                                                onConfigurationChange={(config) => {
                                                    const newItems = [...newOrderForm.items];
                                                    newItems[idx] = {
                                                        ...newItems[idx],
                                                        selectedParameters: config.selectedParameters,
                                                        unitPrice: parseFloat(config.finalPrice) || item.unitPrice
                                                    };
                                                    setNewOrderForm({ ...newOrderForm, items: newItems });
                                                }}
                                            />
                                        )}

                                        {/* Material Selection (Fabrics, Threads, etc.) */}
                                        {selectedProduct && (
                                            <MaterialSelector
                                                productId={selectedProduct.id}
                                                quantity={item.quantity}
                                                language={language}
                                                onMaterialsChange={(materialData) => {
                                                    const newItems = [...newOrderForm.items];
                                                    newItems[idx] = {
                                                        ...newItems[idx],
                                                        selectedMaterials: materialData.selectedMaterials,
                                                        materialWarnings: materialData.stockWarnings
                                                    };
                                                    setNewOrderForm({ ...newOrderForm, items: newItems });
                                                }}
                                            />
                                        )}

                                        {/* Workflow Selection */}
                                        {selectedProduct && (
                                            <div style={{ marginTop: '12px' }}>
                                                <label className="form-label">
                                                    <PlayCircle size={14} style={{ marginInlineEnd: '6px' }} />
                                                    {language === 'he' ? 'תהליך ייצור' : 'Production Workflow'}
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={item.workflowId}
                                                    onChange={(e) => {
                                                        const newItems = [...newOrderForm.items];
                                                        newItems[idx].workflowId = e.target.value;
                                                        setNewOrderForm({ ...newOrderForm, items: newItems });
                                                    }}
                                                >
                                                    <option value="">{language === 'he' ? 'ללא תהליך' : 'No workflow'}</option>
                                                    {workflows.map(w => (
                                                        <option key={w.id} value={w.id}>
                                                            {w.name} ({w.steps?.length || 0} {language === 'he' ? 'שלבים' : 'steps'})
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedWorkflow && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.7 }}>
                                                        {language === 'he' ? 'שלבים:' : 'Steps:'} {selectedWorkflow.steps?.map(s => s.name).join(' → ')}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* File Upload */}
                                        {selectedProduct && (
                                            <div style={{ marginTop: '12px' }}>
                                                <label className="form-label">
                                                    <Upload size={14} style={{ marginInlineEnd: '6px' }} />
                                                    {language === 'he' ? 'קבצים (סקיצות/דוגמאות)' : 'Files (Sketches/Samples)'}
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="form-input"
                                                    onChange={(e) => handleFileUpload(idx, e)}
                                                    accept="image/*,.pdf,.doc,.docx"
                                                />
                                                {item.assets && item.assets.length > 0 && (
                                                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {item.assets.map((file, fileIdx) => (
                                                            <div
                                                                key={fileIdx}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: 'var(--bg-card)',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                <FileText size={14} />
                                                                <span>{file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(idx, fileIdx)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        color: 'var(--danger)',
                                                                        padding: '2px'
                                                                    }}
                                                                >
                                                                    <XIcon size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button className="btn btn-outline btn-sm" onClick={addOrderItem}>
                                <Plus size={14} /> {language === 'he' ? 'הוסף מוצר נוסף' : 'Add Another Product'}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Order Details & Summary */}
                    {wizardStep === 3 && (
                        <div className="wizard-section">
                            <h4><Clock size={18} /> {language === 'he' ? 'פרטי הזמנה' : 'Order Details'}</h4>
                            <div className="form-group">
                                <label>{language === 'he' ? 'תאריך יעד' : 'Due Date'}</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newOrderForm.dueDate}
                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t?.('notes') || 'Notes'}</label>
                                <textarea
                                    className="form-textarea"
                                    value={newOrderForm.notes}
                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                                    placeholder={language === 'he' ? 'הערות להזמנה...' : 'Order notes...'}
                                    rows="4"
                                />
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary" style={{ marginTop: '24px' }}>
                                <h4>{language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}</h4>
                                <div className="summary-items">
                                    {newOrderForm.items.filter(i => i.productId).map((item, idx) => {
                                        const product = products.find(p => p.id === item.productId);
                                        return (
                                            <div key={idx} className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                                <span>{product?.name} x {item.quantity}</span>
                                                <span>${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="summary-row" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t?.('total') || 'Total'}:</span>
                                    <span className="summary-total" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                        ${newOrderForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wizard Navigation */}
                    <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <button className="btn btn-outline demo-btn" onClick={fillDemoOrder} type="button">
                            <Sparkles size={16} />
                            Demo
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => wizardStep === 1 ? setShowAddModal(false) : prevStep()}
                            disabled={saving}
                        >
                            {wizardStep === 1 ? (t?.('cancel') || 'Cancel') : (language === 'he' ? 'חזרה' : 'Back')}
                        </button>
                        {wizardStep < 3 ? (
                            <button className="btn btn-primary" onClick={nextStep}>
                                {language === 'he' ? 'המשך' : 'Next'} <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleCreateOrder} disabled={saving}>
                                {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                                {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                            </button>
                        )}
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
                            <span className="order-date">{selectedOrder.createdAt?.split('T')[0]}</span>
                        </div>

                        <div className="detail-section">
                            <h4>{t?.('customer') || 'Customer'}</h4>
                            <p><strong>{selectedOrder.customer?.name || '-'}</strong></p>
                            <p>{selectedOrder.customer?.companyName || ''}</p>
                            <p>{selectedOrder.customer?.email || ''}</p>
                        </div>

                        <div className="detail-section">
                            <h4>{t?.('orderItems') || 'Order Items'} ({selectedOrder.items?.length || 0})</h4>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>{t?.('productName') || 'Product'}</th>
                                        <th>{language === 'he' ? 'כמות' : 'Qty'}</th>
                                        <th>{t?.('price') || 'Price'}</th>
                                        <th>{t?.('total') || 'Total'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.product?.name || '-'}</td>
                                            <td className="center">{item.quantity}</td>
                                            <td>${(item.unitPrice || 0).toLocaleString()}</td>
                                            <td>${((item.unitPrice || 0) * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>{t?.('total') || 'Total'}</strong></td>
                                        <td><strong>${(selectedOrder.totalAmount || 0).toLocaleString()}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Product Configuration Section */}
                        {selectedOrder.productConfiguration && Object.keys(selectedOrder.productConfiguration).length > 0 && (
                            <div className="detail-section">
                                <h4>{language === 'he' ? 'הגדרות המוצר' : 'Product Configuration'}</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'var(--bg-hover)',
                                    borderRadius: '8px'
                                }}>
                                    {Object.entries(selectedOrder.productConfiguration).map(([key, value]) => (
                                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {key}
                                            </span>
                                            <span style={{ fontWeight: '500' }}>
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedOrder.tasks && selectedOrder.tasks.length > 0 && (
                            <div className="detail-section">
                                <h4>{language === 'he' ? 'התקדמות ייצור' : 'Production Progress'}</h4>
                                <div className="order-progress-container">
                                    <div className="progress-header">
                                        <span>{language === 'he' ? 'משימות הושלמו:' : 'Tasks completed:'}</span>
                                        <span className="progress-count">
                                            {tasks.filter(t => selectedOrder.tasks.includes(t.id) && t.status === 'COMPLETED').length} / {selectedOrder.tasks.length}
                                        </span>
                                    </div>
                                    <div className="task-progress-bar">
                                        {selectedOrder.tasks.map((taskId, i) => {
                                            const task = tasks.find(t => t.id === taskId);
                                            if (!task) return null;
                                            return (
                                                <div
                                                    key={taskId}
                                                    className={`progress-step ${task.status.toLowerCase()}`}
                                                    title={task.title}
                                                >
                                                    {task.status === 'COMPLETED' ? '✓' : task.status === 'IN_PROGRESS' ? '⟳' : i + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="task-list-mini">
                                        {selectedOrder.tasks.map(taskId => {
                                            const task = tasks.find(t => t.id === taskId);
                                            if (!task) return null;
                                            return (
                                                <div key={taskId} className="mini-task-row">
                                                    <span className={`mini-status-dot ${task.status.toLowerCase()}`}></span>
                                                    <span className="mini-task-title">{task.title}</span>
                                                    <span className="mini-task-status">
                                                        {task.status === 'COMPLETED' ? (language === 'he' ? 'הושלם' : 'Completed') :
                                                         task.status === 'IN_PROGRESS' ? (language === 'he' ? 'בביצוע' : 'In Progress') :
                                                         (language === 'he' ? 'ממתין' : 'Pending')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedOrder.notes && (
                            <div className="detail-section">
                                <h4>{t?.('notes') || 'Notes'}</h4>
                                <p className="notes-text">{selectedOrder.notes}</p>
                            </div>
                        )}

                        {/* Payment Status Section */}
                        {(selectedOrder.status === 'PENDING_PAYMENT' || selectedOrder.paymentStatus) && (
                            <div className="detail-section" style={{
                                background: selectedOrder.status === 'PENDING_PAYMENT' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                border: `1px solid ${selectedOrder.status === 'PENDING_PAYMENT' ? '#f59e0b' : '#10b981'}`,
                                borderRadius: '12px',
                                padding: '16px'
                            }}>
                                <h4 style={{ color: selectedOrder.status === 'PENDING_PAYMENT' ? '#f59e0b' : '#10b981', marginBottom: '12px' }}>
                                    {language === 'he' ? 'סטטוס תשלום' : 'Payment Status'}
                                </h4>
                                {selectedOrder.status === 'PENDING_PAYMENT' ? (
                                    <div>
                                        <p style={{ marginBottom: '12px' }}>
                                            {language === 'he'
                                                ? 'ההזמנה ממתינה לתשלום מקדמה. הייצור יתחיל רק לאחר אישור התשלום.'
                                                : 'Order is awaiting deposit. Production will start after payment confirmation.'}
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleConfirmDeposit(selectedOrder, selectedOrder.totalPrice * 0.5)}
                                            disabled={saving}
                                            style={{ background: '#10b981', border: 'none' }}
                                        >
                                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                                            {language === 'he' ? 'אישור קבלת מקדמה' : 'Confirm Deposit Received'}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p><strong>{language === 'he' ? 'מקדמה:' : 'Deposit:'}</strong> ₪{(selectedOrder.depositAmount || 0).toLocaleString()}</p>
                                        <p><strong>{language === 'he' ? 'תאריך תשלום:' : 'Paid on:'}</strong> {selectedOrder.depositPaidAt?.split('T')[0] || '-'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowViewModal(false)}>
                                {t?.('close') || 'Close'}
                            </button>
                            {selectedOrder.status !== 'PENDING_PAYMENT' && (
                                <button className="btn btn-primary" onClick={generateProductionTask} disabled={saving} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}>
                                    {saving ? <Loader2 className="spinner" size={16} /> : <Package size={16} />}
                                    {language === 'he' ? 'שלח לייצור' : 'Send to Production'}
                                </button>
                            )}
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
                                <option value="PENDING_PAYMENT">{getStatusLabel('PENDING_PAYMENT')}</option>
                                <option value="IN_PRODUCTION">{getStatusLabel('IN_PRODUCTION')}</option>
                                <option value="PROCESSING">{getStatusLabel('PROCESSING')}</option>
                                <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                                <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t?.('delete') || 'Cancel Order'} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon">
                        <AlertTriangle size={48} />
                    </div>
                    <p>{language === 'he' ? 'האם לבטל את הזמנה' : 'Cancel order'} <strong>{selectedOrder?.orderNumber}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>
                            {t?.('cancel') || 'No'}
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? 'בטל הזמנה' : 'Cancel Order'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Orders;
