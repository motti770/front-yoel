import { useState, useEffect } from 'react';
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
    CheckCircle2
} from 'lucide-react';
import { leadsService, customersService } from '../services/api';
import { ViewSwitcher, VIEW_TYPES } from '../components/ViewSwitcher';
import Modal from '../components/Modal';
import BulkImporter from '../components/BulkImporter';
import './Leads.css';

// Lead stages - Sales Pipeline
const LEAD_STAGES = {
    NEW: { id: 'NEW', label: { he: 'חדש', en: 'New' }, color: '#667eea' },
    CONTACTED: { id: 'CONTACTED', label: { he: 'יצירת קשר', en: 'Contacted' }, color: '#4facfe' },
    QUALIFIED: { id: 'QUALIFIED', label: { he: 'מוסמך', en: 'Qualified' }, color: '#00f2fe' },
    PROPOSAL: { id: 'PROPOSAL', label: { he: 'הצעת מחיר', en: 'Proposal' }, color: '#fee140' },
    NEGOTIATION: { id: 'NEGOTIATION', label: { he: 'משא ומתן', en: 'Negotiation' }, color: '#f5576c' },
    WON: { id: 'WON', label: { he: 'זכייה', en: 'Won' }, color: '#00c853' },
    LOST: { id: 'LOST', label: { he: 'אבוד', en: 'Lost' }, color: '#ff5252' }
};

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
    // Data state
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [currentView, setCurrentView] = useState(VIEW_TYPES.PIPELINE);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [draggedLead, setDraggedLead] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'WEBSITE',
        stage: 'NEW',
        estimatedValue: '',
        notes: '',
        nextFollowUp: ''
    });

    // Fetch leads from API
    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await leadsService.getAll();
            console.log('[Leads] API Response:', result);

            if (result.success && result.data) {
                // Handle both array and paginated response
                const leadsData = Array.isArray(result.data) ? result.data : (result.data.items || result.data.leads || []);
                setLeads(leadsData);
            } else {
                // Fallback to empty array if no data
                setLeads([]);
                console.warn('[Leads] No leads data in response');
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
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        return matchesSearch && matchesStage && matchesSource;
    });

    // Get leads by stage
    const getLeadsByStage = (stage) => filteredLeads.filter(lead => lead.stage === stage);

    // Calculate pipeline metrics
    const pipelineMetrics = {
        totalLeads: leads.length,
        totalValue: leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0),
        wonValue: leads.filter(l => l.stage === 'WON').reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
        conversionRate: leads.length > 0 ? ((leads.filter(l => l.stage === 'WON').length / leads.length) * 100).toFixed(1) : 0,
        proposalsCount: leads.filter(l => l.stage === 'NEGOTIATION').length,
        proposalsValue: leads.filter(l => l.stage === 'NEGOTIATION').reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    };

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handlers
    const handleView = (lead) => {
        setSelectedLead(lead);
        setShowViewModal(true);
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
            notes: '',
            nextFollowUp: ''
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            showToast(language === 'he' ? 'נא למלא שם ואימייל' : 'Please fill name and email', 'error');
            return;
        }

        try {
            setSaving(true);
            if (selectedLead) {
                // Update existing lead
                const result = await leadsService.update(selectedLead.id, formData);
                if (result.success) {
                    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, ...formData } : l));
                    showToast(language === 'he' ? 'ליד עודכן' : 'Lead updated');
                } else {
                    throw new Error(result.error?.message || 'Failed to update');
                }
            } else {
                // Create new lead
                const result = await leadsService.create(formData);
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

    // Move lead to next/previous stage
    const moveLeadToStage = async (leadId, newStage) => {
        try {
            const result = await leadsService.updateStage(leadId, newStage);
            if (result.success) {
                setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage, lastContact: new Date().toISOString().split('T')[0] } : l));
                showToast(language === 'he' ? 'שלב עודכן' : 'Stage updated');
            } else {
                throw new Error(result.error?.message || 'Failed to update stage');
            }
        } catch (err) {
            console.error('[Leads] Stage update error:', err);
            showToast(err.message || err.error?.message || 'Failed to update stage', 'error');
        }
    };

    // Convert lead to customer
    const handleConvertToCustomer = async () => {
        try {
            setSaving(true);
            console.log('[Leads] converting lead:', selectedLead);

            // Try to use convert endpoint first
            try {
                const result = await leadsService.convert(selectedLead.id);
                if (result.success) {
                    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, stage: 'WON' } : l));
                    setShowConvertModal(false);
                    showToast(language === 'he' ? 'ליד הומר ללקוח!' : 'Lead converted to customer!');
                    return;
                }
            } catch (convertError) {
                console.log('[Leads] Convert endpoint failed, trying manual creation:', convertError);
            }

            // Fallback: create customer manually
            const customerData = {
                name: selectedLead.name,
                email: selectedLead.email,
                phone: selectedLead.phone,
                companyName: selectedLead.company,
                notes: selectedLead.notes,
                status: 'ACTIVE'
            };

            console.log('[Leads] Creating customer with data:', customerData);
            const customerResult = await customersService.create(customerData);

            if (customerResult.success) {
                console.log('[Leads] Customer created successfully:', customerResult.data);

                // Update lead stage only after successful customer creation
                await leadsService.updateStage(selectedLead.id, 'WON');
                setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, stage: 'WON' } : l));

                setShowConvertModal(false);
                showToast(language === 'he' ? 'ליד הומר ללקוח!' : 'Lead converted to customer!');
            } else {
                throw new Error(customerResult.error?.message || 'Failed to create customer');
            }
        } catch (err) {
            console.error('[Leads] Convert error:', err);
            showToast(err.message || err.error?.message || 'Failed to convert', 'error');
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

    const handleDrop = (e, stage) => {
        e.preventDefault();
        if (draggedLead && draggedLead.stage !== stage) {
            moveLeadToStage(draggedLead.id, stage);
        }
        setDraggedLead(null);
    };

    // Render pipeline view
    const renderPipelineView = () => {
        const activeStages = Object.values(LEAD_STAGES).filter(s => s.id !== 'WON' && s.id !== 'LOST');

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
                                <span>{stage.label[language] || stage.label.he}</span>
                            </div>
                            <span className="column-count">{getLeadsByStage(stage.id).length}</span>
                        </div>
                        <div className="column-content">
                            {getLeadsByStage(stage.id).map(lead => (
                                <div
                                    key={lead.id}
                                    className="lead-card glass-card"
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
                                        <span>₪{(lead.estimatedValue || 0).toLocaleString()}</span>
                                    </div>
                                    {lead.nextFollowUp && (
                                        <div className="lead-followup">
                                            <Calendar size={12} />
                                            <span>{lead.nextFollowUp}</span>
                                        </div>
                                    )}
                                    <div className="lead-source">
                                        <span className="source-badge">{LEAD_SOURCES[lead.source]?.label[language]}</span>
                                    </div>
                                </div>
                            ))}
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
        const wonLeads = getLeadsByStage('WON');
        const lostLeads = getLeadsByStage('LOST');

        return (
            <div className="closed-deals-section">
                <div className="closed-column won" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'WON')}>
                    <div className="closed-header">
                        <Check size={20} />
                        <span>{language === 'he' ? 'זכייה' : 'Won'}</span>
                        <span className="count">{wonLeads.length}</span>
                    </div>
                    <div className="closed-value">
                        ₪{wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="closed-column lost" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'LOST')}>
                    <div className="closed-header">
                        <X size={20} />
                        <span>{language === 'he' ? 'אבוד' : 'Lost'}</span>
                        <span className="count">{lostLeads.length}</span>
                    </div>
                    <div className="closed-value">
                        ₪{lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString()}
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

    // TABLE VIEW
    const renderTableView = () => (
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
                    {filteredLeads.map((lead) => (
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
                                <span className="status-badge" style={{
                                    background: `${LEAD_STAGES[lead.stage]?.color}20`,
                                    color: LEAD_STAGES[lead.stage]?.color
                                }}>
                                    {LEAD_STAGES[lead.stage]?.label[language] || lead.stage}
                                </span>
                            </td>
                            <td>₪{(lead.estimatedValue || 0).toLocaleString()}</td>
                            <td>{LEAD_SOURCES[lead.source]?.label[language]}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(lead)}><Eye size={14} /></button>
                                    <button className="action-btn" onClick={() => handleEdit(lead)}><Edit size={14} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredLeads.length === 0 && (
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
    const renderGridView = () => (
        <div className="customers-grid">
            {filteredLeads.map(lead => (
                <div key={lead.id} className="customer-card glass-card" onClick={() => handleView(lead)}>
                    <div className="card-header">
                        <div className="customer-avatar large" style={{ background: LEAD_STAGES[lead.stage]?.color }}>
                            <User size={24} />
                        </div>
                        <span className="source-badge">{LEAD_SOURCES[lead.source]?.label[language]}</span>
                    </div>
                    <h4>{lead.name}</h4>
                    <p className="company">{lead.company || '-'}</p>
                    <div className="card-stats">
                        <div className="stat">
                            <span className="stat-value">₪{(lead.estimatedValue || 0).toLocaleString()}</span>
                            <span className="stat-label">{language === 'he' ? 'ערך' : 'Value'}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value" style={{ color: LEAD_STAGES[lead.stage]?.color }}>
                                {LEAD_STAGES[lead.stage]?.label[language]}
                            </span>
                            <span className="stat-label">{language === 'he' ? 'שלב' : 'Stage'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // KANBAN / PIPELINE WRAPPER
    const renderKanbanView = () => renderPipelineView(); // Reuse existing pipeline logic but filtered

    // Main Render Content Switcher
    const renderContent = () => {
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
        <div className="leads-page">
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
            <div className="page-header-section glass-card">
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
                <div className="pipeline-metrics">
                    <div className="metric">
                        <span className="metric-value">{pipelineMetrics.totalLeads}</span>
                        <span className="metric-label">{language === 'he' ? 'לידים' : 'Leads'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">₪{(pipelineMetrics.totalValue / 1000).toFixed(0)}K</span>
                        <span className="metric-label">{language === 'he' ? 'פוטנציאל' : 'Pipeline'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">₪{(pipelineMetrics.proposalsValue / 1000).toFixed(0)}K</span>
                        <span className="metric-label">
                            {language === 'he' ? 'הצעות' : 'Proposals'}
                            <span style={{ fontSize: '0.8em', opacity: 0.7, marginInlineStart: '4px' }}>({pipelineMetrics.proposalsCount})</span>
                        </span>
                    </div>
                    <div className="metric won">
                        <span className="metric-value">₪{(pipelineMetrics.wonValue / 1000).toFixed(0)}K</span>
                        <span className="metric-label">{language === 'he' ? 'זכיות' : 'Won'}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">{pipelineMetrics.conversionRate}%</span>
                        <span className="metric-label">{language === 'he' ? 'המרה' : 'Conv.'}</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="btn btn-outline" onClick={scanForDuplicates} title={language === 'he' ? 'סרוק כפילויות' : 'Scan Duplicates'}>
                        <Users size={18} />
                        {language === 'he' ? 'ניקוי כפולים' : 'Cleanup'}
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
                        <Upload size={18} />
                        {language === 'he' ? 'ייבוא' : 'Import'}
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        {language === 'he' ? 'ליד חדש' : 'New Lead'}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar glass-card">
                <div className="toolbar-left">
                    <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
                </div>
                <div className="toolbar-right">
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
                        {Object.values(LEAD_STAGES).map(stage => (
                            <option key={stage.id} value={stage.id}>
                                {stage.label[language] || stage.label.he}
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
                            <label>{language === 'he' ? 'שלב' : 'Stage'}</label>
                            <select
                                className="form-input"
                                value={formData.stage}
                                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            >
                                {Object.values(LEAD_STAGES).map(stage => (
                                    <option key={stage.id} value={stage.id}>{stage.label[language]}</option>
                                ))}
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

                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {t('save')}
                        </button>
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
                {selectedLead && (
                    <div className="lead-detail">
                        <div className="detail-header">
                            <div className="stage-badge" style={{ background: LEAD_STAGES[selectedLead.stage]?.color }}>
                                {LEAD_STAGES[selectedLead.stage]?.label[language]}
                            </div>
                            <div className="detail-value">
                                <DollarSign size={20} />
                                <span>₪{(selectedLead.estimatedValue || 0).toLocaleString()}</span>
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
                                    <span>{LEAD_SOURCES[selectedLead.source]?.label[language]}</span>
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
                            {selectedLead.stage !== 'WON' && selectedLead.stage !== 'LOST' && (
                                <button className="btn btn-success" onClick={() => { setShowViewModal(false); setShowConvertModal(true); }}>
                                    <TrendingUp size={16} /> {language === 'he' ? 'המר ללקוח' : 'Convert to Customer'}
                                </button>
                            )}
                            <button className="btn btn-danger" onClick={() => { setShowViewModal(false); setShowDeleteModal(true); }}>
                                <Trash2 size={16} /> {language === 'he' ? 'מחק' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}
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

            {/* Convert to Customer Modal */}
            <Modal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} title={language === 'he' ? 'המרה ללקוח' : 'Convert to Customer'} size="small">
                <div className="convert-confirm">
                    <TrendingUp size={48} className="success-icon" />
                    <p>{language === 'he' ? 'להפוך את הליד ללקוח פעיל?' : 'Convert this lead to an active customer?'}</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowConvertModal(false)}>{t('cancel')}</button>
                        <button className="btn btn-success" onClick={handleConvertToCustomer} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'המר ללקוח' : 'Convert'}
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
                            key: 'stage',
                            label: language === 'he' ? 'שלב' : 'Stage',
                            type: 'select',
                            required: false,
                            options: Object.keys(LEAD_STAGES).map(k => ({ value: k, label: LEAD_STAGES[k].label[language] }))
                        },
                        { key: 'source', label: language === 'he' ? 'מקור' : 'Source', type: 'select', required: false },
                        { key: 'estimatedValue', label: language === 'he' ? 'ערך משוער' : 'Est. Value', type: 'number', required: false }
                    ]}
                    onImport={async (data) => {
                        // Helper to normalize stage
                        const normalizeStage = (val) => {
                            if (!val) return 'NEW';
                            const str = String(val).trim();
                            const upper = str.toUpperCase();
                            // Direct ID match
                            if (LEAD_STAGES[upper]) return upper;
                            // Label match (He/En)
                            const match = Object.values(LEAD_STAGES).find(s =>
                                s.label.en.toUpperCase() === upper || s.label.he === str
                            );
                            return match ? match.id : 'NEW';
                        };

                        // Normalize email for check
                        const normalizeEmail = (e) => e?.toLowerCase().trim();
                        const existingLead = leads.find(l => normalizeEmail(l.email) === normalizeEmail(data.email));

                        try {
                            if (existingLead) {
                                // UPDATE existing lead
                                const updatedFields = { ...data };
                                console.log('[Import] Updating lead:', existingLead.id);

                                const result = await leadsService.update(existingLead.id, updatedFields);

                                if (result.success) {
                                    // Update local state
                                    const updated = result.data || { ...existingLead, ...updatedFields };
                                    setLeads(prev => prev.map(l => l.id === existingLead.id ? updated : l));
                                    return updated;
                                } else {
                                    throw new Error(result.error?.message || 'Update failed');
                                }
                            } else {
                                // CREATE new lead
                                const payload = {
                                    stage: 'NEW',
                                    source: 'IMPORT',
                                    ...data
                                };
                                console.log('[Import] Creating new lead');

                                const result = await leadsService.create(payload);

                                if (result.success && result.data) {
                                    // Update local state
                                    const newLead = result.data;
                                    setLeads(prev => [newLead, ...prev]);
                                    return newLead;
                                } else {
                                    throw new Error(result.error?.message || 'Create failed');
                                }
                            }
                        } catch (err) {
                            console.error('[Import] Error:', err);
                            throw err;
                        }
                    }}
                    language={language}
                    onClose={() => {
                        setShowImportModal(false);
                    }}
                />
            </Modal>
        </div>
    );
}

export default Leads;
