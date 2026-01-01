import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    Building2,
    User,
    Calendar,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    AlertTriangle,
    Loader2,
    Target,
    TrendingUp,
    Clock,
    MessageSquare,
    Activity,
    Upload,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Users,
    Briefcase,
    CheckSquare,
    Square,
    UserPlus,
    FileSpreadsheet,
    Sparkles,
    Layers,
    FileText,
    Printer,
    CreditCard
} from 'lucide-react';
import { leadsService, customersService, ordersService, productsService, workflowsService } from '../services/api';
import { ViewSwitcher, VIEW_TYPES } from '../components/ViewSwitcher';
import Modal from '../components/Modal';
import BulkImporter from '../components/BulkImporter';
import ConvertToOrderWizard from '../components/ConvertToOrderWizard';
import OrderLifecycleWizard from '../components/OrderLifecycleWizard';
import './Leads.css';

// Lead sources
const LEAD_SOURCES = {
    WEBSITE: { label: { he: 'אתר', en: 'Website' } },
    REFERRAL: { label: { he: 'הפנייה', en: 'Referral' } },
    COLD_CALL: { label: { he: 'שיחה קרה', en: 'Cold Call' } },
    SOCIAL: { label: { he: 'רשתות חברתיות', en: 'Social Media' } },
    EVENT: { label: { he: 'אירוע', en: 'Event' } },
    OTHER: { label: { he: 'אחר', en: 'Other' } }
};

function Leads({ currentUser, t, language }) {
    const navigate = useNavigate();

    // Data state
    const [leads, setLeads] = useState([]);
    const [products, setProducts] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [pipelineStages, setPipelineStages] = useState([]);  // שלבי Pipeline דינמיים
    const [salesWorkflows, setSalesWorkflows] = useState([]);  // תהליכי מכירה לפי מוצר
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [currentView, setCurrentView] = useState(VIEW_TYPES.PIPELINE);

    // Grouping
    const [groupBy, setGroupBy] = useState('none');
    const [expandedGroups, setExpandedGroups] = useState({});

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showProductMatchModal, setShowProductMatchModal] = useState(false);
    const [showProductSelectModal, setShowProductSelectModal] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [preSelectedProduct, setPreSelectedProduct] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [draggedLead, setDraggedLead] = useState(null);
    const [leadTasks, setLeadTasks] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'WEBSITE',
        pipelineStageId: 'stage-new',  // שלב ב-Pipeline הדינמי
        estimatedValue: '',
        priority: 'MEDIUM',
        productId: '',
        notes: '',
        nextFollowUp: ''
    });

    // Helper: קבלת שלב Pipeline לפי ID
    const getStageById = (stageId) => {
        return pipelineStages.find(s => s.id === stageId) || null;
    };

    // Helper: בדיקה אם ליד חורג מ-SLA
    const isLeadOverdue = (lead) => {
        if (!lead.stageUpdatedAt && !lead.createdAt) return false;
        const stageConfig = getStageById(lead.pipelineStageId);
        if (!stageConfig?.slaHours) return false;

        const enteredStageAt = new Date(lead.stageUpdatedAt || lead.createdAt);
        const now = new Date();
        const hoursInStage = (now - enteredStageAt) / (1000 * 60 * 60);
        return hoursInStage > stageConfig.slaHours;
    };

    // Helper: קבלת workflow מכירה לפי מוצר
    const getSalesWorkflowForProduct = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product?.salesWorkflowId) return null;
        return salesWorkflows.find(w => w.id === product.salesWorkflowId);
    };

    // Helper: קבלת התקדמות ב-workflow מכירה
    const getSalesWorkflowProgress = (lead) => {
        if (!lead.salesWorkflowId || !lead.currentSalesStepId) return null;
        const workflow = salesWorkflows.find(w => w.id === lead.salesWorkflowId);
        if (!workflow) return null;

        const currentStepIndex = workflow.steps.findIndex(s => s.id === lead.currentSalesStepId);
        const completedSteps = currentStepIndex >= 0 ? currentStepIndex : 0;
        const totalSteps = workflow.steps.length;

        return {
            workflow,
            currentStep: workflow.steps[currentStepIndex],
            completedSteps,
            totalSteps,
            percentage: Math.round((completedSteps / totalSteps) * 100)
        };
    };

    // Fetch leads and related data from API
    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch leads, products and workflows in parallel
            const [leadsResult, productsResult, workflowsResult] = await Promise.all([
                leadsService.getAll(),
                productsService.getAll(),
                workflowsService.getActive()
            ]);

            console.log('[Leads] API Response:', leadsResult);

            if (leadsResult.success && leadsResult.data) {
                // Handle both array and paginated response
                const leadsData = Array.isArray(leadsResult.data) ? leadsResult.data : (leadsResult.data.items || leadsResult.data.leads || []);
                setLeads(leadsData);
            } else {
                // Fallback to empty array if no data
                setLeads([]);
                console.warn('[Leads] No leads data in response');
            }

            // Set products
            if (productsResult.success && productsResult.data) {
                const productsData = Array.isArray(productsResult.data) ? productsResult.data : productsResult.data.products || [];
                setProducts(productsData);
            }

            // Set workflows and extract pipeline stages
            if (workflowsResult.success && workflowsResult.data) {
                const workflowsData = Array.isArray(workflowsResult.data) ? workflowsResult.data : workflowsResult.data.workflows || [];
                setWorkflows(workflowsData);

                // Extract pipeline stages from LEAD_PIPELINE workflow
                const pipelineWorkflow = workflowsData.find(w => w.type === 'LEAD_PIPELINE' && w.isDefault);
                if (pipelineWorkflow?.steps) {
                    // Sort stages by stepOrder
                    const sortedStages = [...pipelineWorkflow.steps].sort((a, b) => a.stepOrder - b.stepOrder);
                    setPipelineStages(sortedStages);
                    console.log('[Leads] Pipeline stages loaded:', sortedStages.length);
                }

                // Extract SALES workflows
                const salesWorkflowsData = workflowsData.filter(w => w.type === 'SALES');
                setSalesWorkflows(salesWorkflowsData);
                console.log('[Leads] Sales workflows loaded:', salesWorkflowsData.length);
            }
        } catch (err) {
            console.error('[Leads] Failed to fetch:', err);
            setError(err.message || err.error?.message || 'Failed to load leads');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStage = stageFilter === 'all' || lead.pipelineStageId === stageFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        return matchesSearch && matchesStage && matchesSource;
    });

    // Get leads by pipeline stage (using new pipelineStageId)
    const getLeadsByStage = (stageId) => filteredLeads.filter(lead => lead.pipelineStageId === stageId);

    // Calculate pipeline metrics
    // Helper to format currency safely
    const formatCurrencyMetric = (value) => {
        if (!value || isNaN(value)) return '0';
        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toLocaleString();
    };

    // Calculate pipeline metrics
    const pipelineMetrics = {
        totalLeads: leads.length,
        totalValue: leads.reduce((sum, lead) => sum + (Number(lead.estimatedValue) || 0), 0),
        wonValue: leads.filter(l => l.stage === 'WON').reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0),
        conversionRate: leads.length > 0 ? ((leads.filter(l => l.stage === 'WON').length / leads.length) * 100).toFixed(1) : 0,
        proposalsCount: leads.filter(l => l.stage === 'NEGOTIATION').length,
        proposalsValue: leads.filter(l => l.stage === 'NEGOTIATION').reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0),
        overdueCount: leads.filter(lead => isLeadOverdue(lead)).length
    };

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handlers
    const handleView = async (lead) => {
        setSelectedLead(lead);
        setShowViewModal(true);

        // Fetch lead tasks if the lead has a selected product
        if (lead.selectedProductId || lead.tasks?.length > 0) {
            try {
                const result = await leadsService.getLeadTasks(lead.id);
                if (result.success && result.data?.tasks) {
                    setLeadTasks(result.data.tasks);
                }
            } catch (err) {
                console.log('[Leads] Failed to fetch lead tasks:', err);
            }
        } else {
            setLeadTasks([]);
        }
    };

    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setFormData({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company || '',
            source: lead.source || 'WEBSITE',
            stage: lead.stage || 'NEW',
            estimatedValue: lead.estimatedValue || '',
            productId: lead.productId || '',
            notes: lead.notes || '',
            nextFollowUp: lead.nextFollowUp || ''
        });
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setSelectedLead(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            source: 'WEBSITE',
            stage: 'NEW',
            estimatedValue: '',
            productId: '',
            notes: '',
            nextFollowUp: ''
        });
        setShowAddModal(true);
    };

    // Demo data arrays for variety
    const demoNames = ['משה כהן', 'יעקב לוי', 'דוד ישראלי', 'אברהם גולד', 'יצחק שטרן', 'שמואל רוזן', 'נתן פרידמן', 'אליהו ברק'];
    const demoCompanies = ['בית כנסת אור חדש', 'קהילת שערי תורה', 'ישיבת נתיבות', 'מרכז תורני אמונה', 'בית מדרש הגר"א', 'קהילת בני ציון', 'בית הכנסת המרכזי', 'ישיבת תפארת'];
    const demoProducts = ['parochet', 'meil', 'kisui-bima', 'kisui-talit'];
    const demoSources = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'SOCIAL', 'EVENT'];
    const demoPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const demoNotes = [
        'מעוניין בפרוכת לארון קודש חדש',
        'צריך מעיל לספר תורה שנתרם לבית הכנסת',
        'מחפש כיסוי בימה לחגים',
        'רוצה להחליף את הפרוכת הישנה',
        'בית כנסת חדש - צריך ציוד מלא',
        'שיפוץ בית הכנסת - צריך הצעת מחיר'
    ];

    // Fill demo data with incrementing counter
    const fillDemoData = () => {
        const counter = parseInt(localStorage.getItem('demoLeadCounter') || '0') + 1;
        localStorage.setItem('demoLeadCounter', counter.toString());

        const randomName = demoNames[counter % demoNames.length];
        const randomCompany = demoCompanies[counter % demoCompanies.length];
        const randomProduct = demoProducts[counter % demoProducts.length];
        const randomSource = demoSources[counter % demoSources.length];
        const randomPriority = demoPriorities[counter % demoPriorities.length];
        const randomNotes = demoNotes[counter % demoNotes.length];
        const randomValue = Math.floor(5000 + Math.random() * 20000);

        // Next follow-up: random 1-14 days from now
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + Math.floor(1 + Math.random() * 14));

        setFormData({
            name: `${randomName} #${counter}`,
            email: `demo${counter}@test.com`,
            phone: `05${Math.floor(10000000 + Math.random() * 89999999)}`,
            company: randomCompany,
            source: randomSource,
            stage: 'NEW',
            priority: randomPriority,
            estimatedValue: randomValue,
            budget: randomValue,
            productId: randomProduct,
            notes: `${randomNotes} [דמו #${counter}]`,
            nextFollowUp: followUpDate.toISOString().split('T')[0]
        });

        showToast(`מילוי דמו #${counter}`, 'success');
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            showToast(language === 'he' ? 'נא למלא שם ואימייל' : 'Please fill name and email', 'error');
            return;
        }

        try {
            setSaving(true);

            // Prepare payload with proper data types
            const payload = {
                name: formData.name,
                email: formData.email,
                source: formData.source,
                stage: formData.stage,
                estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : 0
            };

            // Add optional fields only if they have values
            if (formData.phone && formData.phone.trim()) {
                payload.phone = formData.phone.trim();
            }
            if (formData.company && formData.company.trim()) {
                payload.company = formData.company.trim();
            }
            if (formData.notes && formData.notes.trim()) {
                payload.notes = formData.notes.trim();
            }
            if (formData.nextFollowUp && formData.nextFollowUp.trim()) {
                payload.nextFollowUp = formData.nextFollowUp.trim();
            }
            if (formData.productId && formData.productId.trim()) {
                payload.productId = formData.productId.trim();
            }

            // Remove undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });

            console.log('[Leads] Saving lead with payload:', payload);

            if (selectedLead) {
                // Update existing lead
                const result = await leadsService.update(selectedLead.id, payload);
                if (result.success) {
                    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, ...payload } : l));
                    showToast(language === 'he' ? 'ליד עודכן' : 'Lead updated');
                } else {
                    throw new Error(result.error?.message || 'Failed to update');
                }
            } else {
                // Create new lead
                const result = await leadsService.create(payload);
                if (result.success && result.data) {
                    setLeads([result.data, ...leads]);
                    showToast(language === 'he' ? 'ליד נוסף' : 'Lead added');
                } else {
                    throw new Error(result.error?.message || 'Failed to create');
                }
            }
            setShowAddModal(false);
        } catch (err) {
            console.error('[Leads] Save error:', err);
            showToast(err.message || err.error?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Deduplication Logic
    const [showDedupeModal, setShowDedupeModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);

    const scanForDuplicates = () => {
        const groups = {};
        leads.forEach(lead => {
            if (!lead.email) return;
            const key = lead.email.toLowerCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(lead);
        });
        const dups = Object.values(groups).filter(g => g.length > 1);
        setDuplicates(dups);
        setShowDedupeModal(true);
    };

    const handleMergeDuplicates = () => {
        let newLeadsList = [...leads];
        let mergedCount = 0;

        duplicates.forEach(group => {
            // Sort by createdAt descending (newest first)
            const sorted = group.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            // Master is the newest one
            const master = { ...sorted[0] };

            // Fill missing fields from older versions
            sorted.slice(1).forEach(older => {
                Object.keys(older).forEach(key => {
                    // If master field is empty but older has value, take it
                    if ((master[key] === undefined || master[key] === null || master[key] === '') && older[key]) {
                        master[key] = older[key];
                    }
                });
                // Remove older from list
                newLeadsList = newLeadsList.filter(l => l.id !== older.id);
            });

            // Update master in list
            const masterIndex = newLeadsList.findIndex(l => l.id === master.id);
            if (masterIndex >= 0) newLeadsList[masterIndex] = master;
            mergedCount++;
        });

        setLeads(newLeadsList);
        setShowDedupeModal(false);
        showToast(language === 'he' ? `מוזגו ${mergedCount} כפילויות` : `Merged ${mergedCount} duplicate groups`);
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const result = await leadsService.delete(selectedLead.id);
            if (result.success) {
                setLeads(leads.filter(l => l.id !== selectedLead.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'ליד נמחק' : 'Lead deleted');
            } else {
                throw new Error(result.error?.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('[Leads] Delete error:', err);
            showToast(err.message || err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Move lead to next/previous pipeline stage
    const moveLeadToStage = async (leadId, newStageId) => {
        try {
            const result = await leadsService.update(leadId, {
                pipelineStageId: newStageId,
                stageUpdatedAt: new Date().toISOString()
            });
            if (result.success) {
                setLeads(leads.map(l => l.id === leadId ? {
                    ...l,
                    pipelineStageId: newStageId,
                    stageUpdatedAt: new Date().toISOString()
                } : l));
                const stageName = getStageById(newStageId)?.name || newStageId;
                showToast(language === 'he' ? `הליד הועבר ל: ${stageName}` : `Lead moved to: ${stageName}`);
            } else {
                throw new Error(result.error?.message || 'Failed to update stage');
            }
        } catch (err) {
            console.error('[Leads] Stage update error:', err);
            showToast(err.message || err.error?.message || 'Failed to update stage', 'error');
        }
    };


    // --- Conversion Logic ---
    const handleOpenConvertModal = (lead) => {
        setSelectedLead(lead);
        setConversionChecks({ offerAccepted: false, designApproved: false });
        setShowConvertModal(true);
    };

    // Safety fallback for legacy calls
    const handleConvertToCustomer = () => handleOpenConvertModal(selectedLead);

    // Helper to find workflowId - traces up parent chain to find base product with workflow
    const findWorkflowId = (product) => {
        if (product.workflowId) return product.workflowId;

        // Trace up to parent
        let currentProduct = product;
        const allProducts = products;

        while (currentProduct && currentProduct.parentProductId) {
            const parent = allProducts.find(p => p.id === currentProduct.parentProductId);
            if (!parent) break;
            if (parent.workflowId) return parent.workflowId;
            currentProduct = parent;
        }

        // Default workflow if none found
        return '1';
    };

    const processConversion = async (wizardData) => {
        if (!selectedLead) return;
        setSaving(true);

        try {
            // Extract data from wizard
            const { lead, product, configuration, finalPrice } = wizardData;

            // 1. Create Customer
            const customerPayload = {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                companyName: lead.company || lead.name,
                source: lead.source,
                notes: `Original Lead ID: ${lead.id}\n${lead.notes || ''}`
            };

            console.log('[Convert] Creating customer...');
            const customerRes = await customersService.create(customerPayload);
            if (!customerRes.success) throw new Error(customerRes.error?.message || 'Failed to create customer');

            const newCustomer = customerRes.data;

            // 2. Create Order with product configuration
            // Find workflowId from base product if not directly on selected product
            const workflowId = findWorkflowId(product);
            console.log('[Convert] Creating order with workflowId:', workflowId);

            const orderPayload = {
                customerId: newCustomer.id,
                productId: product.id,
                quantity: 1,
                totalPrice: finalPrice,
                status: 'PENDING',
                productConfiguration: configuration,
                workflowId: workflowId,
                notes: `Converted from Lead ID: ${lead.id}`
            };

            const orderRes = await ordersService.create(orderPayload);
            if (!orderRes.success) throw new Error(orderRes.error?.message || 'Failed to create order');

            const newOrder = orderRes.data;

            // 3. Update Lead to WON status (don't delete - keep the record)
            console.log('[Convert] Updating lead status to WON...');
            await leadsService.update(lead.id, {
                stage: 'WON',
                convertedToCustomerId: newCustomer.id,
                convertedAt: new Date().toISOString()
            });

            // 4. Update UI
            setLeads(prev => prev.map(l =>
                l.id === lead.id
                    ? { ...l, stage: 'WON', convertedToCustomerId: newCustomer.id }
                    : l
            ));
            setShowConvertModal(false);
            showToast(language === 'he' ? 'הזמנה נוצרה בהצלחה!' : 'Order created successfully!');

            // 5. Navigate to orders page
            setTimeout(() => {
                navigate('/orders');
            }, 500);

        } catch (error) {
            console.error('[Convert] Error:', error);
            showToast(language === 'he' ? 'שגיאה בתהליך ההמרה' : 'Conversion failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle product selection for lead (creates sales tasks)
    const handleSelectProduct = async (productId) => {
        if (!selectedLead) return;
        setSaving(true);

        try {
            console.log('[Lead] Selecting product:', productId, 'for lead:', selectedLead.id);
            const result = await leadsService.selectProduct(selectedLead.id, productId);

            if (result.success) {
                // Update local leads state
                setLeads(prev => prev.map(l =>
                    l.id === selectedLead.id
                        ? { ...l, selectedProductId: productId, tasks: result.data.tasks }
                        : l
                ));

                // Update selected lead
                setSelectedLead(prev => ({
                    ...prev,
                    selectedProductId: productId,
                    tasks: result.data.tasks
                }));

                // Fetch the new tasks
                const tasksResult = await leadsService.getLeadTasks(selectedLead.id);
                if (tasksResult.success) {
                    setLeadTasks(tasksResult.data.tasks);
                }

                setShowProductSelectModal(false);
                showToast(language === 'he' ? 'מוצר נבחר ומשימות מכירה נוצרו!' : 'Product selected and sales tasks created!');
            } else {
                throw new Error(result.error?.message || 'Failed to select product');
            }
        } catch (error) {
            console.error('[Lead] Error selecting product:', error);
            showToast(language === 'he' ? 'שגיאה בבחירת מוצר' : 'Error selecting product', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle completing a lead task
    const handleCompleteLeadTask = async (taskId) => {
        try {
            setSaving(true);
            const result = await leadsService.completeLeadTask(taskId);
            if (result.success) {
                // Update local tasks state
                setLeadTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t
                ).map(t =>
                    t.id === result.data.nextTask?.id ? { ...t, status: 'IN_PROGRESS' } : t
                ));

                // Show toast
                showToast(language === 'he' ? 'משימה הושלמה' : 'Task completed');

                // Refresh lead tasks
                if (selectedLead) {
                    const tasksResult = await leadsService.getLeadTasks(selectedLead.id);
                    if (tasksResult.success) {
                        setLeadTasks(tasksResult.data.tasks);
                    }
                }
            }
        } catch (err) {
            showToast(language === 'he' ? 'שגיאה בעדכון משימה' : 'Failed to update task', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, stageId) => {
        e.preventDefault();
        if (draggedLead && draggedLead.pipelineStageId !== stageId) {
            moveLeadToStage(draggedLead.id, stageId);
        }
        setDraggedLead(null);
    };

    // Render pipeline view
    const renderPipelineView = () => {
        // Filter out closed stages (won/lost) for the main pipeline
        const activeStages = pipelineStages.filter(s => !s.isClosed);

        // Render a lead card with product workflow progress
        const renderLeadCard = (lead) => {
            const progress = getSalesWorkflowProgress(lead);
            const product = products.find(p => p.id === lead.selectedProductId);

            return (
                <div
                    key={lead.id}
                    className={`lead-card glass-card ${isLeadOverdue(lead) ? 'overdue' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onClick={() => handleView(lead)}
                >
                    <div className="lead-card-header">
                        <h4>{lead.name}</h4>
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(lead); }}>
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <p className="lead-company">{lead.company}</p>
                    <div className="lead-value">
                        <DollarSign size={14} />
                        <span>₪{(lead.budget || lead.estimatedValue || 0).toLocaleString()}</span>
                    </div>

                    {/* Product & Sales Workflow Progress */}
                    {product && (
                        <div className="lead-product-info">
                            <span className="product-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                {product.name}
                            </span>
                            {progress && (
                                <div className="sales-progress">
                                    <div className="progress-bar-mini">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{progress.completedSteps}/{progress.totalSteps}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {lead.nextFollowUp && (
                        <div className="lead-followup">
                            <Calendar size={12} />
                            <span>{lead.nextFollowUp}</span>
                        </div>
                    )}
                    <div className="lead-source">
                        <span className="source-badge">{LEAD_SOURCES[lead.source]?.label?.[language] || lead.source}</span>
                    </div>
                </div>
            );
        };

        return (
            <div className="pipeline-container">
                {activeStages.map(stage => (
                    <div
                        key={stage.id}
                        className={`pipeline-column ${draggedLead ? 'drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="column-header" style={{ borderColor: stage.color }}>
                            <div className="column-title">
                                <span className="color-dot" style={{ background: stage.color }} />
                                <span>{stage.name}</span>
                            </div>
                            <span className="column-count">{getLeadsByStage(stage.id).length}</span>
                        </div>
                        <div className="column-content">
                            {getLeadsByStage(stage.id).map(lead => renderLeadCard(lead))}
                            {getLeadsByStage(stage.id).length === 0 && (
                                <div className="empty-column">
                                    <Target size={24} />
                                    <span>{language === 'he' ? 'גרור לידים לכאן' : 'Drop leads here'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render won/lost section
    const renderClosedDeals = () => {
        const wonLeads = getLeadsByStage('stage-won');
        const lostLeads = getLeadsByStage('stage-lost');

        return (
            <div className="closed-deals-section">
                <div className="closed-column won" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'stage-won')}>
                    <div className="closed-header">
                        <Check size={20} />
                        <span>{language === 'he' ? 'זכייה' : 'Won'}</span>
                        <span className="count">{wonLeads.length}</span>
                    </div>
                    <div className="closed-value">
                        ₪{wonLeads.reduce((sum, l) => sum + (l.budget || l.estimatedValue || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="closed-column lost" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'stage-lost')}>
                    <div className="closed-header">
                        <X size={20} />
                        <span>{language === 'he' ? 'אבוד' : 'Lost'}</span>
                        <span className="count">{lostLeads.length}</span>
                    </div>
                    <div className="closed-value">
                        ₪{lostLeads.reduce((sum, l) => sum + (l.budget || l.estimatedValue || 0), 0).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" size={48} />
                <p>{language === 'he' ? 'טוען לידים...' : 'Loading leads...'}</p>
            </div>
        );
    }

    // --- Grouping Logic ---
    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: prev[groupKey] === undefined ? false : !prev[groupKey] // Default open, so undefined -> false meant 'closing'? No.
            // Let's decided: undefined means CLOSED or OPEN?
            // Usually easier if default is OPEN (true).
            // Logic: if in map, use value. If not, use default.
        }));
        // Actually, cleaner: store IDs of COLLAPSED groups.
    };

    const isGroupCollapsed = (groupKey) => expandedGroups[groupKey] === true;
    const toggleGroupCollapse = (groupKey) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const getGroupedLeads = () => {
        const groups = {};

        filteredLeads.forEach(lead => {
            let key = 'other';
            let title = language === 'he' ? 'אחר' : 'Other';
            let sortValue = 0; // For sorting groups if needed

            if (groupBy === 'stage') {
                key = lead.pipelineStageId;
                const stageConfig = getStageById(lead.pipelineStageId);
                title = stageConfig?.name || lead.pipelineStageId;
            } else if (groupBy === 'source') {
                key = lead.source || 'OTHER';
                const sourceConfig = LEAD_SOURCES[key === 'IMPORT' ? 'OTHER' : key] || LEAD_SOURCES['OTHER'];
                title = sourceConfig ? (sourceConfig.label[language] || sourceConfig.label.he) : key;
            } else if (groupBy === 'date') {
                const date = new Date(lead.createdAt);
                if (!isNaN(date.getTime())) {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    title = date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' });
                    sortValue = date.getTime();
                } else {
                    key = 'no-date';
                    title = language === 'he' ? 'ללא תאריך' : 'No Date';
                }
            }

            if (!groups[key]) {
                groups[key] = { title, items: [], id: key, sortValue };
            }
            groups[key].items.push(lead);
        });

        // Sort groups? Date: new to old. Stage: predefined order?
        return Object.values(groups).sort((a, b) => {
            if (groupBy === 'date') return b.sortValue - a.sortValue; // Newest first
            if (groupBy === 'stage') {
                // predefined order based on pipelineStages stepOrder
                const stageA = pipelineStages.find(s => s.id === a.id);
                const stageB = pipelineStages.find(s => s.id === b.id);
                return (stageA?.stepOrder || 999) - (stageB?.stepOrder || 999);
            }
            return 0; // Source: arbitrary
        });
    };

    // --- Render Views ---

    // TABLE VIEW
    const renderTableView = (data = filteredLeads) => (
        <div className="table-container glass-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>{language === 'he' ? 'שם' : 'Name'}</th>
                        <th>{language === 'he' ? 'חברה' : 'Company'}</th>
                        <th>{language === 'he' ? 'סטטוס' : 'Status'}</th>
                        <th>{language === 'he' ? 'ערך' : 'Value'}</th>
                        <th>{language === 'he' ? 'מקור' : 'Source'}</th>
                        <th>{language === 'he' ? 'פעולות' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((lead) => (
                        <tr key={lead.id}>
                            <td>
                                <div className="customer-name-cell">
                                    <div className="customer-avatar">
                                        <User size={16} />
                                    </div>
                                    <span>{lead.name}</span>
                                </div>
                            </td>
                            <td>{lead.company || '-'}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {(() => {
                                        const stageConfig = getStageById(lead.pipelineStageId);
                                        return (
                                            <span className="status-badge" style={{
                                                background: `${stageConfig?.color || '#888'}20`,
                                                color: stageConfig?.color || '#888'
                                            }}>
                                                {stageConfig?.name || lead.pipelineStageId}
                                            </span>
                                        );
                                    })()}
                                    {isLeadOverdue(lead) && (
                                        <span title={language === 'he' ? 'חריגת זמן!' : 'SLA Exceeded!'} style={{ color: '#ef4444' }}>
                                            <AlertTriangle size={14} />
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>₪{(Number(lead.estimatedValue) || 0).toLocaleString()}</td>
                            <td>{LEAD_SOURCES[lead.source]?.label[language] || lead.source}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(lead)}><Eye size={14} /></button>
                                    <button className="action-btn" onClick={() => handleEdit(lead)}><Edit size={14} /></button>
                                    <button
                                        className="action-btn"
                                        title={language === 'he' ? 'המר ללקוח' : 'Convert to Customer'}
                                        onClick={() => handleOpenConvertModal(lead)}
                                    >
                                        <Briefcase size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center p-4">
                                {language === 'he' ? 'לא נמצאו לידים' : 'No leads found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table >
        </div >
    );

    // GRID VIEW
    const renderGridView = (data = filteredLeads) => (
        <div className="customers-grid">
            {data.map(lead => {
                const stageConfig = getStageById(lead.pipelineStageId);
                return (
                    <div key={lead.id} className="customer-card glass-card" onClick={() => handleView(lead)}>
                        <div className="card-header">
                            <div className="customer-avatar large" style={{ background: stageConfig?.color || '#888' }}>
                                <User size={24} />
                            </div>
                            <span className="source-badge">{LEAD_SOURCES[lead.source]?.label?.[language] || lead.source}</span>
                        </div>
                        <h4>{lead.name}</h4>
                        <p className="company">{lead.company || '-'}</p>
                        {lead.selectedProductId && (() => {
                            const product = products.find(p => p.id === lead.selectedProductId);
                            return product ? (
                                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '4px' }}>
                                    📦 {product.name}
                                </p>
                            ) : null;
                        })()}
                        <div className="card-stats">
                            <div className="stat">
                                <span className="stat-value">₪{(Number(lead.budget) || 0).toLocaleString()}</span>
                                <span className="stat-label">{language === 'he' ? 'ערך' : 'Value'}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value" style={{ color: stageConfig?.color || '#888' }}>
                                    {stageConfig?.name || lead.pipelineStageId}
                                </span>
                                <span className="stat-label">{language === 'he' ? 'שלב' : 'Stage'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {data.length === 0 && (
                <div className="text-center p-4 w-100" style={{ gridColumn: '1/-1', opacity: 0.7 }}>
                    {language === 'he' ? 'לא נמצאו לידים' : 'No leads found'}
                </div>
            )}
        </div>
    );

    // GROUPED VIEW
    const renderGroupedView = () => {
        const groupedData = getGroupedLeads();

        return (
            <div className="grouped-view">
                {groupedData.map(group => {
                    const isCollapsed = isGroupCollapsed(group.id);
                    return (
                        <div key={group.id} className="group-section glass-card" style={{ marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
                            <div
                                className="group-header"
                                onClick={() => toggleGroupCollapse(group.id)}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                    <span style={{ fontSize: '1.2rem' }}>{group.title}</span>
                                    <span className="badge" style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {group.items.length}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    ₪{formatCurrencyMetric(group.items.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0))}
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="group-content">
                                    {(currentView === VIEW_TYPES.TABLE || currentView === VIEW_TYPES.LIST)
                                        ? renderTableView(group.items)
                                        : renderGridView(group.items)
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // KANBAN / PIPELINE WRAPPER
    const renderKanbanView = () => renderPipelineView(); // Reuse existing pipeline logic but filtered

    // Main Render Content Switcher
    const renderContent = () => {
        if (groupBy !== 'none' && currentView !== VIEW_TYPES.PIPELINE && currentView !== VIEW_TYPES.KANBAN) {
            return renderGroupedView();
        }

        switch (currentView) {
            case VIEW_TYPES.TABLE: return renderTableView();
            case VIEW_TYPES.GRID: return renderGridView();
            case VIEW_TYPES.PIPELINE: return renderPipelineView();
            case VIEW_TYPES.KANBAN: return renderKanbanView();
            case VIEW_TYPES.LIST: return renderTableView(); // Reuse table for list for now
            default: return renderPipelineView();
        }
    };

    return (
        <div className="leads-page" >
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )
            }

            {/* Page Header */}
            <div className="page-header-section glass-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'nowrap', // Prevent wrapping
                overflowX: 'auto',  // Allow scrolling on small screens
                gap: '16px'
            }}>
                <div className="header-left">
                    <div className="page-icon">
                        <Target size={28} />
                    </div>
                    <div>
                        <h1>{language === 'he' ? 'לידים ומכירות' : 'Leads & Sales'}</h1>
                        <p>{language === 'he' ? 'ניהול Pipeline מכירות' : 'Sales Pipeline Management'}</p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="pipeline-metrics" style={{
                    display: 'flex',
                    gap: '24px',
                    flex: '1 0 auto',
                    paddingInline: '16px'
                }}>
                    <div className="metric">
                        <span className="metric-value">{pipelineMetrics.totalLeads}</span>
                        <span className="metric-label">{language === 'he' ? 'לידים' : 'Leads'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">₪{formatCurrencyMetric(pipelineMetrics.totalValue)}</span>
                        <span className="metric-label">{language === 'he' ? 'פוטנציאל' : 'Pipeline'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">₪{formatCurrencyMetric(pipelineMetrics.proposalsValue)}</span>
                        <span className="metric-label">
                            {language === 'he' ? 'הצעות' : 'Proposals'}
                            <span style={{ fontSize: '0.8em', opacity: 0.7, marginInlineStart: '4px' }}>({pipelineMetrics.proposalsCount})</span>
                        </span>
                    </div>
                    <div className="metric won">
                        <span className="metric-value">₪{formatCurrencyMetric(pipelineMetrics.wonValue)}</span>
                        <span className="metric-label">{language === 'he' ? 'זכיות' : 'Won'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">{pipelineMetrics.conversionRate}%</span>
                        <span className="metric-label">{language === 'he' ? 'המרה' : 'Conv.'}</span>
                    </div>
                    {pipelineMetrics.overdueCount > 0 && (
                        <div className="metric" style={{ background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '8px 16px' }}>
                            <span className="metric-value" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={16} />
                                {pipelineMetrics.overdueCount}
                            </span>
                            <span className="metric-label" style={{ color: '#ef4444' }}>{language === 'he' ? 'חריגות' : 'Overdue'}</span>
                        </div>
                    )}
                </div>

                <div className="header-actions" style={{ position: 'relative' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        style={{
                            minWidth: '140px',
                            paddingInline: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={18} />
                        {language === 'he' ? 'הוסף ליד' : 'Add Lead'}
                        <ChevronDown size={14} style={{ marginInlineStart: '4px', opacity: 0.7 }} />
                    </button>

                    {showActionsMenu && (
                        <>
                            <div className="dropdown-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowActionsMenu(false)} />
                            <div className="actions-dropdown glass-card" style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                insetInlineEnd: 0,
                                width: '220px',
                                zIndex: 1000,
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                            }}>
                                <button className="dropdown-item" onClick={() => { openAddModal(); setShowActionsMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'start' }}>
                                    <UserPlus size={16} style={{ opacity: 0.7 }} />
                                    <span>{language === 'he' ? 'יצירה ידנית' : 'Manual Entry'}</span>
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowImportModal(true); setShowActionsMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'start' }}>
                                    <FileSpreadsheet size={16} style={{ opacity: 0.7 }} />
                                    <span>{language === 'he' ? 'ייבוא מקובץ' : 'Import File'}</span>
                                </button>
                                <button className="dropdown-item" onClick={() => { scanForDuplicates(); setShowActionsMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'start' }}>
                                    <Sparkles size={16} style={{ opacity: 0.7 }} />
                                    <span>{language === 'he' ? 'ניקוי כפילויות' : 'Cleanup Duplicates'}</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar glass-card">
                <div className="toolbar-left">
                    <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
                </div>
                <div className="toolbar-right" style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end', minWidth: 0, gap: '12px' }}>

                    {(currentView === VIEW_TYPES.TABLE || currentView === VIEW_TYPES.LIST || currentView === VIEW_TYPES.GRID) && (
                        <div className="group-by-control" style={{ marginInlineEnd: '12px', borderInlineEnd: '1px solid rgba(255,255,255,0.1)', paddingInlineEnd: '12px' }}>
                            <div className="dropdown-wrapper" style={{ position: 'relative' }}>
                                <select
                                    className="filter-select"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                    style={{ paddingInlineStart: '34px' }}
                                >
                                    <option value="none">{language === 'he' ? 'ללא קיבוץ' : 'No Grouping'}</option>
                                    <option value="stage">{language === 'he' ? 'לפי שלב' : 'By Stage'}</option>
                                    <option value="date">{language === 'he' ? 'לפי תאריך' : 'By Date'}</option>
                                    <option value="source">{language === 'he' ? 'לפי מקור' : 'By Source'}</option>
                                    <option value="priority">{language === 'he' ? 'לפי דחיפות' : 'By Priority'}</option>
                                </select>
                                <Layers size={16} style={{ position: 'absolute', insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }} />
                            </div>
                        </div>
                    )}

                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={language === 'he' ? 'חיפוש לידים...' : 'Search leads...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                    >
                        <option value="all">{language === 'he' ? 'כל השלבים' : 'All Stages'}</option>
                        {pipelineStages.map(stage => (
                            <option key={stage.id} value={stage.id}>
                                {stage.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                    >
                        <option value="all">{language === 'he' ? 'כל המקורות' : 'All Sources'}</option>
                        {Object.entries(LEAD_SOURCES).map(([key, source]) => (
                            <option key={key} value={key}>
                                {source.label[language] || source.label.he}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content View */}
            {renderContent()}

            {/* Closed Deals */}
            {renderClosedDeals()}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={selectedLead ? (language === 'he' ? 'עריכת ליד' : 'Edit Lead') : (language === 'he' ? 'ליד חדש' : 'New Lead')}
            >
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'שם איש קשר' : 'Contact Name'} *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'חברה/ארגון' : 'Company/Organization'}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'אימייל' : 'Email'} *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'טלפון' : 'Phone'}</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'מקור' : 'Source'}</label>
                            <select
                                className="form-input"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                {Object.entries(LEAD_SOURCES).map(([key, source]) => (
                                    <option key={key} value={key}>{source.label[language]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'מוצר מעוניין' : 'Interested Product'}</label>
                            <select
                                className="form-input"
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            >
                                <option value="">{language === 'he' ? 'ללא מוצר ספציפי' : 'No specific product'}</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'שלב' : 'Stage'}</label>
                            <select
                                className="form-input"
                                value={formData.pipelineStageId}
                                onChange={(e) => setFormData({ ...formData, pipelineStageId: e.target.value })}
                            >
                                {pipelineStages.map(stage => (
                                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'דחיפות' : 'Priority'}</label>
                            <select
                                className="form-input"
                                value={formData.priority || 'MEDIUM'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                style={{ borderInlineStart: formData.priority === 'URGENT' ? '3px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="LOW">{language === 'he' ? 'נמוכה' : 'Low'}</option>
                                <option value="MEDIUM">{language === 'he' ? 'רגילה' : 'Medium'}</option>
                                <option value="HIGH">{language === 'he' ? 'גבוהה' : 'High'}</option>
                                <option value="URGENT">{language === 'he' ? 'דחוף!' : 'Urgent!'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'ערך משוער (₪)' : 'Estimated Value (₪)'}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.estimatedValue}
                                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'מעקב הבא' : 'Next Follow-up'}</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.nextFollowUp}
                                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{language === 'he' ? 'הערות' : 'Notes'}</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                        <button
                            className="btn"
                            onClick={fillDemoData}
                            style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none'
                            }}
                            title="מילוי אוטומטי לבדיקות"
                        >
                            <Sparkles size={16} /> Demo #{parseInt(localStorage.getItem('demoLeadCounter') || '0') + 1}
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>{t('cancel')}</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title={selectedLead?.name || ''}
                size="large"
            >
                {selectedLead && (() => {
                    const currentStage = getStageById(selectedLead.pipelineStageId);
                    const salesProgress = getSalesWorkflowProgress(selectedLead);

                    return (
                    <div className="lead-detail">
                        <div className="detail-header">
                            <div className="stage-badge" style={{ background: currentStage?.color || '#667eea' }}>
                                {currentStage?.name || selectedLead.pipelineStageId}
                            </div>
                            <div className="detail-value">
                                <DollarSign size={20} />
                                <span>₪{(selectedLead.budget || selectedLead.estimatedValue || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Pipeline Progress - Circles with Connections */}
                        <div className="pipeline-progress-section" style={{
                            margin: '16px 0',
                            padding: '20px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                    {language === 'he' ? 'מיקום ב-Pipeline' : 'Pipeline Position'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                {/* Background line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '16px',
                                    right: '16px',
                                    height: '3px',
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-50%)',
                                    zIndex: 0
                                }} />
                                {/* Progress line */}
                                {(() => {
                                    const activeStages = pipelineStages.filter(s => !s.isClosed);
                                    const currentIndex = activeStages.findIndex(s => s.id === selectedLead.pipelineStageId);
                                    const progressWidth = currentIndex >= 0 ? ((currentIndex) / (activeStages.length - 1)) * 100 : 0;
                                    return (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '16px',
                                            width: `calc(${progressWidth}% - 16px)`,
                                            height: '3px',
                                            background: 'linear-gradient(90deg, #667eea, #4facfe, #00f2fe)',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1,
                                            transition: 'width 0.5s ease'
                                        }} />
                                    );
                                })()}
                                {/* Stage circles */}
                                {pipelineStages.filter(s => !s.isClosed).map((stage, index) => {
                                    const stageIndex = pipelineStages.filter(s => !s.isClosed).findIndex(s => s.id === selectedLead.pipelineStageId);
                                    const isPast = index < stageIndex;
                                    const isCurrent = stage.id === selectedLead.pipelineStageId;
                                    const isFuture = index > stageIndex;

                                    return (
                                        <div key={stage.id} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            zIndex: 2,
                                            flex: 1
                                        }}>
                                            {/* Circle */}
                                            <div style={{
                                                width: isCurrent ? '28px' : '20px',
                                                height: isCurrent ? '28px' : '20px',
                                                borderRadius: '50%',
                                                background: isPast || isCurrent ? stage.color : 'var(--bg-secondary)',
                                                border: isCurrent ? `3px solid ${stage.color}` : isPast ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                                boxShadow: isCurrent ? `0 0 16px ${stage.color}66` : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                            }} title={stage.name}>
                                                {isPast && (
                                                    <Check size={12} style={{ color: 'white' }} />
                                                )}
                                                {isCurrent && (
                                                    <div style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        background: 'white'
                                                    }} />
                                                )}
                                            </div>
                                            {/* Stage name - show for current and neighbors */}
                                            <span style={{
                                                fontSize: '0.65rem',
                                                marginTop: '8px',
                                                color: isCurrent ? stage.color : isPast ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                                                fontWeight: isCurrent ? 700 : 500,
                                                textAlign: 'center',
                                                maxWidth: '60px',
                                                lineHeight: 1.2,
                                                opacity: isCurrent || index === stageIndex - 1 || index === stageIndex + 1 ? 1 : 0.6
                                            }}>
                                                {stage.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <Building2 size={16} />
                                <div>
                                    <label>{language === 'he' ? 'חברה' : 'Company'}</label>
                                    <span>{selectedLead.company}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Mail size={16} />
                                <div>
                                    <label>{language === 'he' ? 'אימייל' : 'Email'}</label>
                                    <span>{selectedLead.email}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Phone size={16} />
                                <div>
                                    <label>{language === 'he' ? 'טלפון' : 'Phone'}</label>
                                    <span>{selectedLead.phone}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Activity size={16} />
                                <div>
                                    <label>{language === 'he' ? 'מקור' : 'Source'}</label>
                                    <span>{LEAD_SOURCES[selectedLead.source]?.label?.[language] || selectedLead.source}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Calendar size={16} />
                                <div>
                                    <label>{language === 'he' ? 'נוצר' : 'Created'}</label>
                                    <span>{selectedLead.createdAt}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Clock size={16} />
                                <div>
                                    <label>{language === 'he' ? 'מעקב הבא' : 'Next Follow-up'}</label>
                                    <span>{selectedLead.nextFollowUp || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Product & Sales Tasks */}
                        {selectedLead.selectedProductId && (() => {
                            const leadProduct = products.find(p => p.id === selectedLead.selectedProductId);
                            return (
                                <div style={{
                                    margin: '24px 0',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                            {language === 'he' ? 'תהליך מכירה' : 'Sales Process'}
                                        </h4>
                                        {leadProduct && (
                                            <span style={{
                                                background: 'rgba(79, 172, 254, 0.2)',
                                                color: '#4facfe',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {leadProduct.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tasks List */}
                                    {leadTasks.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {leadTasks.map((task, index) => {
                                                const isCompleted = task.status === 'COMPLETED';
                                                const isInProgress = task.status === 'IN_PROGRESS';
                                                const isPending = task.status === 'PENDING';

                                                return (
                                                    <div
                                                        key={task.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '12px',
                                                            background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : isInProgress ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                                                            borderRadius: '8px',
                                                            borderInlineStart: `3px solid ${isCompleted ? '#10b981' : isInProgress ? '#4facfe' : 'rgba(255,255,255,0.2)'}`,
                                                            opacity: isPending ? 0.6 : 1
                                                        }}
                                                    >
                                                        {/* Step Number / Status */}
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            background: isCompleted ? '#10b981' : isInProgress ? '#4facfe' : 'rgba(255,255,255,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            {isCompleted ? <Check size={16} /> : <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{index + 1}</span>}
                                                        </div>

                                                        {/* Task Info */}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {task.title}
                                                                {task.isPaymentStep && (
                                                                    <span style={{
                                                                        background: 'rgba(245, 158, 11, 0.2)',
                                                                        color: '#f59e0b',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.7rem'
                                                                    }}>
                                                                        {language === 'he' ? 'תשלום' : 'Payment'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>
                                                                {isCompleted && task.completedAt && `${language === 'he' ? 'הושלם: ' : 'Completed: '}${new Date(task.completedAt).toLocaleDateString()}`}
                                                                {isInProgress && task.dueDate && `${language === 'he' ? 'יעד: ' : 'Due: '}${task.dueDate}`}
                                                                {isPending && (language === 'he' ? 'ממתין' : 'Pending')}
                                                            </div>
                                                        </div>

                                                        {/* Complete Button */}
                                                        {isInProgress && (
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                                onClick={() => handleCompleteLeadTask(task.id)}
                                                                disabled={saving}
                                                            >
                                                                {saving ? <Loader2 className="spinner" size={14} /> : <Check size={14} />}
                                                                {language === 'he' ? 'סיום' : 'Done'}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Progress Summary */}
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                                                    {language === 'he' ? 'התקדמות:' : 'Progress:'}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '100px',
                                                        height: '8px',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${(leadTasks.filter(t => t.status === 'COMPLETED').length / leadTasks.length) * 100}%`,
                                                            background: 'linear-gradient(90deg, #10b981, #4facfe)',
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#10b981' }}>
                                                        {leadTasks.filter(t => t.status === 'COMPLETED').length}/{leadTasks.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                                            {language === 'he' ? 'אין משימות מוגדרות' : 'No tasks defined'}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Pre-Order Configuration Display */}
                        {selectedLead.selectedProductId && selectedLead.productConfiguration && (
                            <div style={{
                                margin: '24px 0',
                                padding: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(0, 194, 254, 0.1))',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={18} />
                                        {language === 'he' ? 'קדם-הזמנה' : 'Pre-Order'}
                                    </h4>
                                    {selectedLead.estimatedPrice && (
                                        <span style={{
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            color: '#10b981',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}>
                                            ₪{selectedLead.estimatedPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Configuration Details */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {Object.entries(selectedLead.productConfiguration).map(([key, value]) => {
                                        if (!value || value === '') return null;
                                        // Try to get parameter name from parameters
                                        const paramName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                                        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

                                        return (
                                            <div key={key} style={{
                                                padding: '10px 12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '8px',
                                                borderInlineStart: '3px solid #667eea'
                                            }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'capitalize' }}>
                                                    {paramName}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {displayValue}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Selected Variant */}
                                {selectedLead.selectedVariantId && (
                                    <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,200,83,0.1)', borderRadius: '8px' }}>
                                        <span style={{ color: '#00c853', fontWeight: 500 }}>
                                            {language === 'he' ? 'עיצוב נבחר: ' : 'Selected Design: '}
                                        </span>
                                        {(() => {
                                            const variant = products.find(p => p.id === selectedLead.selectedVariantId);
                                            return variant ? variant.name : selectedLead.selectedVariantId;
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sales Workflow Checklist (if product selected) */}
                        {salesProgress && salesProgress.workflow && (
                            <div style={{
                                margin: '24px 0',
                                padding: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '0.9rem', margin: 0 }}>
                                        {salesProgress.workflow.name}
                                    </h4>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {salesProgress.completedSteps}/{salesProgress.totalSteps}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {salesProgress.workflow.steps.map((step, index) => {
                                        const isCompleted = index < salesProgress.completedSteps;
                                        const isCurrent = step.id === selectedLead.currentSalesStepId;

                                        return (
                                            <div
                                                key={step.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px 12px',
                                                    background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'rgba(79, 172, 254, 0.15)' : 'rgba(255,255,255,0.02)',
                                                    borderRadius: '8px',
                                                    borderInlineStart: `3px solid ${isCompleted ? '#10b981' : isCurrent ? '#4facfe' : 'rgba(255,255,255,0.1)'}`,
                                                    opacity: !isCompleted && !isCurrent ? 0.5 : 1
                                                }}
                                            >
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: isCompleted ? '#10b981' : isCurrent ? '#4facfe' : 'rgba(255,255,255,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {isCompleted ? <Check size={14} /> : <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{index + 1}</span>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {step.name}
                                                        {step.isPaymentStep && (
                                                            <span style={{
                                                                background: 'rgba(245, 158, 11, 0.2)',
                                                                color: '#f59e0b',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.65rem'
                                                            }}>
                                                                💳 {language === 'he' ? 'תשלום' : 'Payment'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isCurrent && (
                                                    <span style={{
                                                        background: '#4facfe',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        {language === 'he' ? 'נוכחי' : 'Current'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedLead.notes && (
                            <div className="detail-notes">
                                <h4><MessageSquare size={16} /> {language === 'he' ? 'הערות' : 'Notes'}</h4>
                                <p>{selectedLead.notes}</p>
                            </div>
                        )}

                        <div className="detail-actions">
                            <button className="btn btn-outline" onClick={() => { setShowViewModal(false); handleEdit(selectedLead); }}>
                                <Edit size={16} /> {language === 'he' ? 'עריכה' : 'Edit'}
                            </button>
                            {selectedLead.pipelineStageId !== 'stage-won' && selectedLead.pipelineStageId !== 'stage-lost' && (
                                <>
                                    {/* If no product selected yet - show product selection options */}
                                    {!selectedLead.selectedProductId && (
                                        <button className="btn btn-primary" onClick={() => { setShowViewModal(false); setShowProductSelectModal(true); }}>
                                            <Sparkles size={16} /> {language === 'he' ? 'בחירת מוצר' : 'Select Product'}
                                        </button>
                                    )}

                                    {/* If product selected - show quote button */}
                                    {selectedLead.selectedProductId && (
                                        <button className="btn btn-secondary" onClick={() => { setShowViewModal(false); setShowQuoteModal(true); }}>
                                            <FileText size={16} /> {language === 'he' ? 'הצעת מחיר' : 'Price Quote'}
                                        </button>
                                    )}

                                    {/* Show payment button when product selected */}
                                    {selectedLead.selectedProductId && (
                                        <button className="btn btn-primary" style={{ background: '#10b981' }} onClick={() => { setShowViewModal(false); setShowPaymentModal(true); }}>
                                            <CreditCard size={16} /> {language === 'he' ? 'לינק תשלום' : 'Payment Link'}
                                        </button>
                                    )}

                                    {/* If product selected and all sales tasks complete - can create order */}
                                    {selectedLead.selectedProductId && leadTasks.length > 0 &&
                                        leadTasks.every(t => t.status === 'COMPLETED') && (
                                            <button className="btn btn-success" onClick={() => { setShowViewModal(false); setShowProductMatchModal(true); }}>
                                                <TrendingUp size={16} /> {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                                            </button>
                                        )}

                                    {/* Legacy convert option */}
                                    <button className="btn btn-outline" onClick={() => { setShowViewModal(false); setShowConvertModal(true); }}>
                                        <TrendingUp size={16} /> {language === 'he' ? 'המרה מהירה' : 'Quick Convert'}
                                    </button>
                                </>
                            )}
                            <button className="btn btn-danger" onClick={() => { setShowViewModal(false); setShowDeleteModal(true); }}>
                                <Trash2 size={16} /> {language === 'he' ? 'מחק' : 'Delete'}
                            </button>
                        </div>
                    </div>
                    );
                })()}
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={language === 'he' ? 'מחיקת ליד' : 'Delete Lead'} size="small">
                <div className="delete-confirm">
                    <AlertTriangle size={48} className="warning-icon" />
                    <p>{language === 'he' ? 'האם למחוק את הליד הזה? פעולה זו לא ניתנת לביטול.' : 'Delete this lead? This action cannot be undone.'}</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>



            {/* Deduplication Modal */}
            <Modal
                isOpen={showDedupeModal}
                onClose={() => setShowDedupeModal(false)}
                title={language === 'he' ? 'ניהול כפילויות' : 'Manage Duplicates'}
                size="large"
            >
                <div className="dedupe-container" style={{ padding: '20px' }}>
                    {duplicates.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                            <h3>{language === 'he' ? 'לא נמצאו כפילויות!' : 'No duplicates found!'}</h3>
                            <p className="text-muted">{language === 'he' ? 'הנתונים שלך נקיים.' : 'Your data is clean.'}</p>
                            <button className="btn btn-primary mt-4" onClick={() => setShowDedupeModal(false)}>{t('close')}</button>
                        </div>
                    ) : (
                        <>
                            <div className="dedupe-summary" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                                <strong>
                                    {language === 'he'
                                        ? `נמצאו ${duplicates.length} קבוצות של כפילויות.`
                                        : `Found ${duplicates.length} duplicate groups.`
                                    }
                                </strong>
                                <p style={{ fontSize: '0.9em', margin: '5px 0 0' }}>
                                    {language === 'he' ? 'לחיצה על "מזג הכל" תשאיר את הרשומה העדכנית ביותר ותשלים מידע חסר מרשומות ישנות.' : 'Clicking "Merge All" will keep the latest record and fill missing info from older ones.'}
                                </p>
                            </div>

                            <div className="dedupe-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                {duplicates.map((group, idx) => (
                                    <div key={idx} className="dedupe-group" style={{ marginBottom: '10px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <div className="group-header" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{group[0].email}</span>
                                            <span className="badge badge-warning">{group.length}</span>
                                        </div>
                                        {group.map(lead => (
                                            <div key={lead.id} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '10px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {lead.name} • {lead.company || '-'} • {new Date(lead.createdAt || 0).toLocaleDateString()} • {lead.stage}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-outline" onClick={() => setShowDedupeModal(false)}>
                                    {t('close')}
                                </button>
                                <button className="btn btn-primary" onClick={handleMergeDuplicates}>
                                    {language === 'he' ? 'מזג ושמור' : 'Merge & Save'}
                                </button>
                            </div>
                        </>
                    )}
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
                    entityType="leads"
                    targetFields={[
                        { key: 'name', label: language === 'he' ? 'שם איש קשר' : 'Contact Name', type: 'text', required: true },
                        { key: 'email', label: language === 'he' ? 'אימייל' : 'Email', type: 'email', required: true },
                        { key: 'phone', label: language === 'he' ? 'טלפון' : 'Phone', type: 'tel', required: false },
                        { key: 'company', label: language === 'he' ? 'חברה' : 'Company', type: 'text', required: false },
                        {
                            key: 'pipelineStageId',
                            label: language === 'he' ? 'שלב' : 'Stage',
                            type: 'select',
                            required: false,
                            options: pipelineStages.map(s => ({ value: s.id, label: s.name }))
                        },
                        { key: 'source', label: language === 'he' ? 'מקור' : 'Source', type: 'select', required: false },
                        { key: 'budget', label: language === 'he' ? 'תקציב' : 'Budget', type: 'number', required: false }
                    ]}
                    onImport={async (data) => {
                        // Helper to normalize stage to pipelineStageId
                        const normalizeStage = (val) => {
                            if (!val) return 'stage-new';
                            const str = String(val).trim().toLowerCase();
                            // Direct ID match
                            const directMatch = pipelineStages.find(s => s.id === str || s.id === val);
                            if (directMatch) return directMatch.id;
                            // Name match
                            const nameMatch = pipelineStages.find(s =>
                                s.name.toLowerCase() === str || s.name === val
                            );
                            return nameMatch ? nameMatch.id : 'stage-new';
                        };

                        // Normalize email for check
                        const normalizeEmail = (e) => e?.toLowerCase().trim();
                        const existingLead = leads.find(l => normalizeEmail(l.email) === normalizeEmail(data.email));

                        try {
                            if (existingLead) {
                                // UPDATE existing lead
                                const updatedFields = { ...data };
                                if (updatedFields.budget) updatedFields.budget = Number(updatedFields.budget);
                                if (updatedFields.pipelineStageId) updatedFields.pipelineStageId = normalizeStage(updatedFields.pipelineStageId);

                                console.log('[Import] Updating lead:', existingLead.id);

                                const result = await leadsService.update(existingLead.id, updatedFields);

                                if (result.success) {
                                    // Update local state
                                    const updated = result.data || { ...existingLead, ...updatedFields };
                                    setLeads(prev => prev.map(l => l.id === existingLead.id ? updated : l));
                                    return { ...updated, _action: 'updated' };
                                } else {
                                    const errorMsg = result.error?.message || 'Update failed';
                                    console.error('[Import] Update error:', result);
                                    throw new Error(errorMsg);
                                }
                            } else {
                                // CREATE new lead
                                const payload = {
                                    ...data,
                                    pipelineStageId: normalizeStage(data.pipelineStageId),
                                    source: data.source || 'OTHER',
                                    budget: Number(data.budget) || 0
                                };
                                console.log('[Import] Creating new lead', payload);

                                const result = await leadsService.create(payload);

                                if (result.success && result.data) {
                                    // Update local state
                                    const newLead = result.data;
                                    setLeads(prev => [newLead, ...prev]);
                                    return { ...newLead, _action: 'created' };
                                } else {
                                    const errorMsg = result.error?.message || 'Create failed';
                                    console.error('[Import] Create error:', result);
                                    throw new Error(errorMsg);
                                }
                            }
                        } catch (err) {
                            console.error('[Import] Exception:', err);
                            throw err;
                        }
                    }}
                    language={language}
                    onClose={() => {
                        setShowImportModal(false);
                    }}
                />
            </Modal>

            {/* Product Match Wizard - Central Interface */}
            <Modal
                isOpen={showProductMatchModal}
                onClose={() => { setShowProductMatchModal(false); setPreSelectedProduct(null); }}
                title={language === 'he' ? 'הקמת קדם-הזמנה' : 'Create Pre-Order'}
                size="xlarge"
                hideHeader
            >
                {selectedLead && (
                    <OrderLifecycleWizard
                        lead={selectedLead}
                        preSelectedProduct={preSelectedProduct}
                        language={language}
                        onComplete={async (data) => {
                            // Create pre-order: save product + parameters to lead, create sales tasks
                            setSaving(true);
                            try {
                                const productId = data.product?.id || preSelectedProduct?.id;
                                const variantId = data.variant?.id || null;

                                // 1. Update lead with product selection and create sales tasks
                                const result = await leadsService.selectProduct(selectedLead.id, productId);

                                if (result.success) {
                                    // 2. Save configuration to lead (including variant)
                                    await leadsService.update(selectedLead.id, {
                                        stage: 'CONTACTED',
                                        selectedProductId: productId,
                                        selectedVariantId: variantId,
                                        productConfiguration: data.parameters,
                                        estimatedPrice: data.price?.total || data.product?.basePrice || selectedLead.budget || 0,
                                        stageUpdatedAt: new Date().toISOString()
                                    });

                                    // 3. Update local state
                                    setLeads(prev => prev.map(l =>
                                        l.id === selectedLead.id
                                            ? {
                                                ...l,
                                                stage: 'CONTACTED',
                                                selectedProductId: productId,
                                                selectedVariantId: variantId,
                                                productConfiguration: data.parameters,
                                                estimatedPrice: data.price?.total || data.product?.basePrice || selectedLead.budget || 0,
                                                tasks: result.data.tasks
                                            }
                                            : l
                                    ));

                                    // 4. Refresh tasks
                                    const tasksResult = await leadsService.getLeadTasks(selectedLead.id);
                                    if (tasksResult.success) {
                                        setLeadTasks(tasksResult.data.tasks);
                                    }
                                }

                                setShowProductMatchModal(false);
                                setPreSelectedProduct(null);
                                showToast(language === 'he' ? 'קדם-הזמנה נוצרה בהצלחה!' : 'Pre-order created successfully!');
                            } catch (err) {
                                console.error('[Pre-Order] Error:', err);
                                showToast(err.message || (language === 'he' ? 'שגיאה ביצירת קדם-הזמנה' : 'Error creating pre-order'), 'error');
                            } finally {
                                setSaving(false);
                            }
                        }}
                        onCancel={() => { setShowProductMatchModal(false); setPreSelectedProduct(null); }}
                    />
                )}
            </Modal>

            {/* Product Selection Modal with Search */}
            <Modal
                isOpen={showProductSelectModal}
                onClose={() => { setShowProductSelectModal(false); setProductSearchTerm(''); }}
                title={language === 'he' ? 'בחירת מוצר' : 'Select Product'}
                size="large"
            >
                {selectedLead && (
                    <div style={{ padding: '16px' }}>
                        {/* Lead Info Header */}
                        <div style={{
                            marginBottom: '20px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(0, 194, 254, 0.1))',
                            borderRadius: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#667eea' }}>
                                {language === 'he' ? 'ליד:' : 'Lead:'} {selectedLead.name}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {language === 'he'
                                    ? 'בחר מוצר או חפש לפי קוד/שם'
                                    : 'Select a product or search by code/name'}
                            </p>
                        </div>

                        {/* Search Input */}
                        <div style={{
                            marginBottom: '20px',
                            position: 'relative'
                        }}>
                            <Search size={20} style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)'
                            }} />
                            <input
                                type="text"
                                placeholder={language === 'he' ? 'חפש לפי קוד (P120), שם, צבע...' : 'Search by code (P120), name, color...'}
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 44px 14px 16px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--border-color)',
                                    background: 'var(--card-bg)',
                                    fontSize: '16px',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* Search Results or Base Products */}
                        {productSearchTerm.trim() ? (
                            // Search Results
                            (() => {
                                const searchLower = productSearchTerm.toLowerCase().trim();
                                const searchResults = products.filter(p =>
                                    p.status === 'ACTIVE' && (
                                        (p.catalogCode || '').toLowerCase().includes(searchLower) ||
                                        (p.name || '').toLowerCase().includes(searchLower) ||
                                        (p.colorScheme || '').toLowerCase().includes(searchLower) ||
                                        (p.sku || '').toLowerCase().includes(searchLower) ||
                                        (p.description || '').toLowerCase().includes(searchLower)
                                    )
                                );

                                // Group by type
                                const baseProducts = searchResults.filter(p => !p.parentProductId && !p.isDesignGroup);
                                const designGroups = searchResults.filter(p => p.isDesignGroup);
                                const variations = searchResults.filter(p => p.parentProductId && !p.isDesignGroup);

                                if (searchResults.length === 0) {
                                    return (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                            <p style={{ margin: 0 }}>
                                                {language === 'he' ? 'לא נמצאו תוצאות' : 'No results found'}
                                            </p>
                                            <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                                                {language === 'he' ? `חיפוש: "${productSearchTerm}"` : `Search: "${productSearchTerm}"`}
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {/* Variations - Most specific results first */}
                                        {variations.length > 0 && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 style={{
                                                    margin: '0 0 12px 0',
                                                    color: '#00c853',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Check size={16} />
                                                    {language === 'he' ? `עיצובים ספציפיים (${variations.length})` : `Specific Designs (${variations.length})`}
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    {variations.map(product => {
                                                        const parent = products.find(p => p.id === product.parentProductId);
                                                        return (
                                                            <div
                                                                key={product.id}
                                                                onClick={() => {
                                                                    // Direct variation - skip design group selection
                                                                    setPreSelectedProduct({ ...product, skipDesignGroups: true });
                                                                    setShowProductSelectModal(false);
                                                                    setProductSearchTerm('');
                                                                    setShowProductMatchModal(true);
                                                                }}
                                                                style={{
                                                                    padding: '12px',
                                                                    background: 'var(--card-bg)',
                                                                    borderRadius: '10px',
                                                                    border: '2px solid #00c853',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    minWidth: '150px',
                                                                    flex: '1 1 auto',
                                                                    maxWidth: 'calc(33% - 8px)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(0, 200, 83, 0.1)';
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'var(--card-bg)';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px'
                                                                }}>
                                                                    {product.imageUrl ? (
                                                                        <img src={product.imageUrl} alt={product.name} style={{
                                                                            width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'
                                                                        }} />
                                                                    ) : (
                                                                        <div style={{
                                                                            width: '50px', height: '50px', borderRadius: '8px',
                                                                            background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            color: 'white', fontWeight: 'bold', fontSize: '14px'
                                                                        }}>
                                                                            {product.catalogCode?.split('-')[1] || '?'}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                                                            {product.catalogCode || product.name}
                                                                        </div>
                                                                        {product.colorScheme && (
                                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                                                {product.colorScheme}
                                                                            </div>
                                                                        )}
                                                                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                                                            {parent?.name || ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Design Groups */}
                                        {designGroups.length > 0 && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 style={{
                                                    margin: '0 0 12px 0',
                                                    color: '#667eea',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Layers size={16} />
                                                    {language === 'he' ? `קבוצות עיצוב (${designGroups.length})` : `Design Groups (${designGroups.length})`}
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    {designGroups.map(product => (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => {
                                                                setPreSelectedProduct(product);
                                                                setShowProductSelectModal(false);
                                                                setProductSearchTerm('');
                                                                setShowProductMatchModal(true);
                                                            }}
                                                            style={{
                                                                padding: '12px',
                                                                background: 'var(--card-bg)',
                                                                borderRadius: '10px',
                                                                border: '2px solid #667eea',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                minWidth: '150px',
                                                                flex: '1 1 auto',
                                                                maxWidth: 'calc(33% - 8px)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'var(--card-bg)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                                                {product.catalogCode || product.name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                                {language === 'he' ? 'קבוצת עיצוב' : 'Design Group'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Base Products */}
                                        {baseProducts.length > 0 && (
                                            <div>
                                                <h4 style={{
                                                    margin: '0 0 12px 0',
                                                    color: '#4facfe',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Target size={16} />
                                                    {language === 'he' ? `מוצרים בסיסיים (${baseProducts.length})` : `Base Products (${baseProducts.length})`}
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                    {baseProducts.map(product => (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => {
                                                                setPreSelectedProduct(product);
                                                                setShowProductSelectModal(false);
                                                                setProductSearchTerm('');
                                                                setShowProductMatchModal(true);
                                                            }}
                                                            style={{
                                                                padding: '16px',
                                                                background: 'var(--card-bg)',
                                                                borderRadius: '12px',
                                                                border: '2px solid var(--border-color)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                textAlign: 'center'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.borderColor = '#4facfe';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} style={{
                                                                    width: '100%', height: '80px', objectFit: 'cover',
                                                                    borderRadius: '8px', marginBottom: '10px'
                                                                }} />
                                                            ) : (
                                                                <Layers size={40} style={{ color: '#4facfe', marginBottom: '10px' }} />
                                                            )}
                                                            <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '15px' }}>
                                                                {product.name}
                                                            </h4>
                                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                                {product.catalogCode || ''}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        ) : (
                            // Default - Show Base Products Grid
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '16px'
                            }}>
                                {products.filter(p => !p.parentProductId && p.status === 'ACTIVE').map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            setPreSelectedProduct(product);
                                            setShowProductSelectModal(false);
                                            setProductSearchTerm('');
                                            setShowProductMatchModal(true);
                                        }}
                                        style={{
                                            padding: '16px',
                                            background: 'var(--card-bg)',
                                            borderRadius: '12px',
                                            border: '2px solid var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    marginBottom: '12px'
                                                }}
                                            />
                                        ) : (
                                            <Layers size={48} style={{ color: '#667eea', marginBottom: '12px' }} />
                                        )}
                                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '18px' }}>
                                            {product.name}
                                        </h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                                            {product.description}
                                        </p>
                                        <div style={{ marginTop: '12px', fontSize: '12px', color: '#667eea' }}>
                                            {language === 'he' ? `זמן ייצור: ${product.productionTime || 30} יום` : `Production: ${product.productionTime || 30} days`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {language === 'he'
                                ? 'לחץ על מוצר כדי להמשיך למילוי פרטי ההזמנה'
                                : 'Click a product to continue to order details'}
                        </p>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setShowProductSelectModal(false); setProductSearchTerm(''); }}
                            >
                                {language === 'he' ? 'ביטול' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Price Quote Modal */}
            <Modal
                isOpen={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                title={language === 'he' ? 'הצעת מחיר' : 'Price Quote'}
                size="large"
            >
                {selectedLead && selectedLead.selectedProductId && (
                    <div id="price-quote-content" style={{ padding: '20px', direction: 'rtl' }}>
                        {/* Quote Header */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '30px',
                            paddingBottom: '20px',
                            borderBottom: '2px solid #667eea'
                        }}>
                            <h1 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '28px' }}>
                                {language === 'he' ? 'הצעת מחיר' : 'Price Quote'}
                            </h1>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                {language === 'he' ? 'תאריך:' : 'Date:'} {new Date().toLocaleDateString('he-IL')}
                            </p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {language === 'he' ? 'מספר הצעה:' : 'Quote #:'} Q-{selectedLead.id}-{Date.now().toString().slice(-4)}
                            </p>
                        </div>

                        {/* Customer Details */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '30px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                padding: '16px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <h3 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
                                    {language === 'he' ? 'פרטי לקוח' : 'Customer Details'}
                                </h3>
                                <p style={{ margin: '4px 0' }}><strong>{selectedLead.name}</strong></p>
                                {selectedLead.company && <p style={{ margin: '4px 0' }}>{selectedLead.company}</p>}
                                <p style={{ margin: '4px 0' }}>{selectedLead.phone}</p>
                                <p style={{ margin: '4px 0' }}>{selectedLead.email}</p>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <h3 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
                                    {language === 'he' ? 'פרטי מוצר' : 'Product Details'}
                                </h3>
                                {(() => {
                                    const product = products.find(p => p.id === selectedLead.selectedProductId);
                                    return product ? (
                                        <>
                                            <p style={{ margin: '4px 0' }}><strong>{product.name}</strong></p>
                                            <p style={{ margin: '4px 0' }}>{product.category}</p>
                                            <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                {product.description}
                                            </p>
                                        </>
                                    ) : <p>{language === 'he' ? 'מוצר לא נמצא' : 'Product not found'}</p>;
                                })()}
                            </div>
                        </div>

                        {/* Notes/Requirements */}
                        {selectedLead.notes && (
                            <div style={{
                                marginBottom: '30px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                                    {language === 'he' ? 'דרישות ופרטים נוספים' : 'Requirements & Additional Details'}
                                </h3>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedLead.notes}</p>
                            </div>
                        )}

                        {/* Price Section */}
                        <div style={{
                            marginBottom: '30px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(0, 194, 254, 0.1))',
                            borderRadius: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#667eea' }}>
                                {language === 'he' ? 'הצעת מחיר' : 'Price Proposal'}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px' }}>
                                    {language === 'he' ? 'סה"כ משוער:' : 'Estimated Total:'}
                                </span>
                                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                                    ₪{(selectedLead.budget || 0).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {language === 'he'
                                    ? '* המחיר הסופי ייקבע לאחר אישור כל הפרטים והמפרט הטכני'
                                    : '* Final price will be determined after all details and specifications are confirmed'}
                            </p>
                        </div>

                        {/* Terms & Conditions */}
                        <div style={{
                            marginBottom: '30px',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px',
                            fontSize: '13px',
                            color: 'var(--text-secondary)'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                                {language === 'he' ? 'תנאים' : 'Terms & Conditions'}
                            </h4>
                            <ul style={{ margin: 0, paddingRight: '20px' }}>
                                <li>{language === 'he' ? 'תוקף ההצעה: 30 יום' : 'Quote valid for 30 days'}</li>
                                <li>{language === 'he' ? 'תשלום מקדמה: 50% בעת אישור ההזמנה' : 'Deposit: 50% upon order confirmation'}</li>
                                <li>{language === 'he' ? 'יתרת התשלום: לפני המשלוח' : 'Balance: Due before delivery'}</li>
                                <li>{language === 'he' ? 'זמן אספקה משוער: יימסר בעת אישור ההזמנה' : 'Estimated delivery: Will be provided upon order confirmation'}</li>
                            </ul>
                        </div>

                        {/* Action Buttons (hidden in print) */}
                        <div className="quote-actions" style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            marginTop: '24px'
                        }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    const printContent = document.getElementById('price-quote-content');
                                    const printWindow = window.open('', '_blank');
                                    printWindow.document.write(`
                                        <html dir="rtl">
                                        <head>
                                            <title>הצעת מחיר - ${selectedLead.name}</title>
                                            <style>
                                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
                                                .quote-actions { display: none !important; }
                                                @media print { .quote-actions { display: none !important; } }
                                            </style>
                                        </head>
                                        <body>${printContent.innerHTML}</body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.print();
                                }}
                            >
                                <Printer size={16} /> {language === 'he' ? 'הדפס' : 'Print'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowQuoteModal(false)}
                            >
                                {language === 'he' ? 'סגור' : 'Close'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Link Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title={language === 'he' ? 'לינק תשלום' : 'Payment Link'}
                size="medium"
            >
                {selectedLead && selectedLead.selectedProductId && (
                    <div style={{ padding: '20px', direction: 'rtl' }}>
                        {/* Payment Summary */}
                        <div style={{
                            marginBottom: '24px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))',
                            borderRadius: '12px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>
                                {language === 'he' ? 'סכום מקדמה נדרש (50%)' : 'Deposit Amount Required (50%)'}
                            </h3>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                                ₪{Math.round((selectedLead.budget || 0) * 0.5).toLocaleString()}
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {language === 'he' ? 'מתוך סה"כ:' : 'Out of total:'} ₪{(selectedLead.budget || 0).toLocaleString()}
                            </p>
                        </div>

                        {/* Payment Link */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>
                                {language === 'he' ? 'לינק לתשלום' : 'Payment Link'}
                            </h4>
                            <div style={{
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={`https://pay.example.com/lead/${selectedLead.id}?amount=${Math.round((selectedLead.budget || 0) * 0.5)}`}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'var(--bg-hover)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '13px'
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const link = `https://pay.example.com/lead/${selectedLead.id}?amount=${Math.round((selectedLead.budget || 0) * 0.5)}`;
                                        navigator.clipboard.writeText(link);
                                        showToast(language === 'he' ? 'לינק הועתק!' : 'Link copied!');
                                    }}
                                >
                                    {language === 'he' ? 'העתק' : 'Copy'}
                                </button>
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {language === 'he'
                                    ? 'שלח את הלינק ללקוח באמצעות WhatsApp, SMS או אימייל'
                                    : 'Send this link to the customer via WhatsApp, SMS or email'}
                            </p>
                        </div>

                        {/* Quick Share Buttons */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>
                                {language === 'he' ? 'שליחה מהירה' : 'Quick Share'}
                            </h4>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-outline"
                                    style={{ background: '#25D366', color: 'white', border: 'none' }}
                                    onClick={() => {
                                        const link = `https://pay.example.com/lead/${selectedLead.id}?amount=${Math.round((selectedLead.budget || 0) * 0.5)}`;
                                        const message = language === 'he'
                                            ? `שלום ${selectedLead.name},%0A%0Aמצורף לינק לתשלום מקדמה בסך ₪${Math.round((selectedLead.budget || 0) * 0.5).toLocaleString()}:%0A${link}`
                                            : `Hello ${selectedLead.name},%0A%0AHere's your payment link for ₪${Math.round((selectedLead.budget || 0) * 0.5).toLocaleString()}:%0A${link}`;
                                        window.open(`https://wa.me/${selectedLead.phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
                                    }}
                                >
                                    WhatsApp
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        const link = `https://pay.example.com/lead/${selectedLead.id}?amount=${Math.round((selectedLead.budget || 0) * 0.5)}`;
                                        const subject = language === 'he' ? 'לינק לתשלום' : 'Payment Link';
                                        const body = language === 'he'
                                            ? `שלום ${selectedLead.name},%0A%0Aמצורף לינק לתשלום מקדמה בסך ₪${Math.round((selectedLead.budget || 0) * 0.5).toLocaleString()}:%0A${link}`
                                            : `Hello ${selectedLead.name},%0A%0AHere's your payment link for ₪${Math.round((selectedLead.budget || 0) * 0.5).toLocaleString()}:%0A${link}`;
                                        window.open(`mailto:${selectedLead.email}?subject=${subject}&body=${body}`, '_blank');
                                    }}
                                >
                                    <Mail size={16} /> Email
                                </button>
                            </div>
                        </div>

                        {/* Bank Transfer Option */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            marginBottom: '24px'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>
                                {language === 'he' ? 'או: העברה בנקאית' : 'Or: Bank Transfer'}
                            </h4>
                            <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                                <p style={{ margin: '4px 0' }}><strong>{language === 'he' ? 'בנק:' : 'Bank:'}</strong> לאומי (10)</p>
                                <p style={{ margin: '4px 0' }}><strong>{language === 'he' ? 'סניף:' : 'Branch:'}</strong> 800</p>
                                <p style={{ margin: '4px 0' }}><strong>{language === 'he' ? 'חשבון:' : 'Account:'}</strong> 12345678</p>
                                <p style={{ margin: '4px 0' }}><strong>{language === 'he' ? 'שם:' : 'Name:'}</strong> עסק יואל בע"מ</p>
                            </div>
                        </div>

                        {/* Confirm Payment Button */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '12px',
                            border: '1px dashed #10b981'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#10b981' }}>
                                {language === 'he' ? 'התקבל תשלום?' : 'Payment Received?'}
                            </h4>
                            <button
                                className="btn btn-success"
                                style={{ width: '100%' }}
                                onClick={async () => {
                                    setSaving(true);
                                    try {
                                        // Mark payment task as completed if exists
                                        const paymentTask = leadTasks.find(t => t.isPaymentStep);
                                        if (paymentTask) {
                                            await leadsService.completeLeadTask(paymentTask.id);
                                        }
                                        // Update lead stage
                                        await leadsService.update(selectedLead.id, {
                                            stage: 'QUALIFIED',
                                            paymentConfirmedAt: new Date().toISOString(),
                                            depositPaid: true
                                        });
                                        // Update local state
                                        setLeads(prev => prev.map(l =>
                                            l.id === selectedLead.id
                                                ? { ...l, stage: 'QUALIFIED', depositPaid: true }
                                                : l
                                        ));
                                        setSelectedLead(prev => ({ ...prev, stage: 'QUALIFIED', depositPaid: true }));

                                        // Refresh tasks
                                        const tasksResult = await leadsService.getLeadTasks(selectedLead.id);
                                        if (tasksResult.success) {
                                            setLeadTasks(tasksResult.data.tasks);
                                        }

                                        setShowPaymentModal(false);
                                        showToast(language === 'he' ? 'תשלום אושר!' : 'Payment confirmed!');
                                    } catch (error) {
                                        console.error('[Payment] Error:', error);
                                        showToast(language === 'he' ? 'שגיאה באישור תשלום' : 'Error confirming payment', 'error');
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                                {language === 'he' ? 'אשר קבלת תשלום' : 'Confirm Payment Received'}
                            </button>
                        </div>

                        {/* Close Button */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                {language === 'he' ? 'סגור' : 'Close'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Convert Modal with Wizard */}
            <Modal
                isOpen={showConvertModal}
                onClose={() => setShowConvertModal(false)}
                title={language === 'he' ? 'המרת ליד להזמנה' : 'Convert Lead to Order'}
                size="large"
            >
                {selectedLead && (
                    <ConvertToOrderWizard
                        lead={selectedLead}
                        language={language}
                        onConvert={processConversion}
                        onCancel={() => setShowConvertModal(false)}
                        saving={saving}
                    />
                )}
            </Modal>
        </div >
    );
}

export default Leads;
