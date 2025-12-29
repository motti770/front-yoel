import { useState, useEffect } from 'react';
import {
    Plus,
    GitBranch,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Building2,
    Check,
    AlertTriangle,
    Loader2,
    X,
    Copy,
    ArrowUp,
    ArrowDown,
    Target,
    Clock
} from 'lucide-react';
import { workflowsService, departmentsService } from '../services/api';
import Modal from '../components/Modal';
import './Workflows.css';

function Workflows({ currentUser, t, language }) {
    const [activeTab, setActiveTab] = useState('production'); // 'production' or 'sales'
    const [workflows, setWorkflows] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedWorkflow, setExpandedWorkflow] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Sales Pipeline State
    const [salesStages, setSalesStages] = useState(() => {
        const saved = localStorage.getItem('salesPipelineStages');
        return saved ? JSON.parse(saved) : [
            { id: 'NEW', label: 'חדש', color: '#6366f1', slaHours: 24 },
            { id: 'CONTACT', label: 'יצירת קשר', color: '#3b82f6', slaHours: 48 },
            { id: 'MEETING', label: 'פגישה', color: '#8b5cf6', slaHours: 72 },
            { id: 'NEGOTIATION', label: 'משא ומתן', color: '#f59e0b', slaHours: 168 },
            { id: 'WON', label: 'זכייה', color: '#10b981', slaHours: null },
            { id: 'LOST', label: 'הפסד', color: '#ef4444', slaHours: null }
        ];
    });
    const [newStageName, setNewStageName] = useState('');
    const [editingStageId, setEditingStageId] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStepModal, setShowStepModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);
    const [draggedStep, setDraggedStep] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    const [stepFormData, setStepFormData] = useState({
        name: '',
        description: '',
        departmentId: '',
        stepOrder: 1,
        estimatedDurationDays: 1,
        isActive: true
    });

    const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [workflowsRes, deptsRes] = await Promise.all([
                workflowsService.getAll({ limit: 100 }),
                departmentsService.getAll({ limit: 100 })
            ]);

            if (workflowsRes.success) {
                setWorkflows(workflowsRes.data.workflows || []);
            } else {
                setError(workflowsRes.error?.message || 'Failed to load workflows');
            }

            if (deptsRes.success) {
                setDepartments(deptsRes.data.departments || []);
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Auto-set departmentId when modal is open and departments become available
    useEffect(() => {
        if (showStepModal && !stepFormData.departmentId && departments.length > 0) {
            console.log('[useEffect] Setting departmentId from departments:', departments[0].id);
            setStepFormData(prev => ({ ...prev, departmentId: departments[0].id }));
        }
    }, [showStepModal, departments, stepFormData.departmentId]);

    // Sales Pipeline handlers
    const saveSalesStages = (stages) => {
        setSalesStages(stages);
        localStorage.setItem('salesPipelineStages', JSON.stringify(stages));
    };

    const addSalesStage = () => {
        if (!newStageName.trim()) return;
        const id = newStageName.toUpperCase().replace(/\s+/g, '_');
        const newStages = [...salesStages.slice(0, -2), { id, label: newStageName, color: '#6366f1', slaHours: 24 }, ...salesStages.slice(-2)];
        saveSalesStages(newStages);
        setNewStageName('');
        showToast(language === 'he' ? 'שלב נוסף' : 'Stage added');
    };

    const updateSalesStage = (stageId, updates) => {
        const newStages = salesStages.map(s => s.id === stageId ? { ...s, ...updates } : s);
        saveSalesStages(newStages);
        setEditingStageId(null);
    };

    const removeSalesStage = (stageId) => {
        if (['WON', 'LOST', 'NEW'].includes(stageId)) {
            showToast(language === 'he' ? 'לא ניתן למחוק שלב זה' : 'Cannot delete this stage', 'error');
            return;
        }
        const newStages = salesStages.filter(s => s.id !== stageId);
        saveSalesStages(newStages);
        showToast(language === 'he' ? 'שלב נמחק' : 'Stage deleted');
    };

    // Workflow handlers
    const handleAddWorkflow = () => {
        setSelectedWorkflow(null);
        setFormData({ name: '', code: '', description: '', isActive: true });
        setShowAddModal(true);
    };

    const handleEditWorkflow = (workflow) => {
        setSelectedWorkflow(workflow);
        setFormData({
            name: workflow.name || '',
            code: workflow.code || '',
            description: workflow.description || '',
            isActive: workflow.isActive !== false
        });
        setShowAddModal(true);
    };

    const handleSaveWorkflow = async () => {
        if (!formData.name || !formData.code) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedWorkflow) {
                const result = await workflowsService.update(selectedWorkflow.id, formData);
                if (result.success) {
                    setWorkflows(workflows.map(w =>
                        w.id === selectedWorkflow.id ? { ...w, ...result.data } : w
                    ));
                    showToast(language === 'he' ? 'תהליך עודכן' : 'Workflow updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                const result = await workflowsService.create(formData);
                if (result.success) {
                    setWorkflows([result.data, ...workflows]);
                    showToast(language === 'he' ? 'תהליך נוסף' : 'Workflow added');
                } else {
                    showToast(result.error?.message || 'Failed to create', 'error');
                    return;
                }
            }
            setShowAddModal(false);
        } catch (err) {
            showToast(err.error?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWorkflow = async () => {
        try {
            setSaving(true);
            const result = await workflowsService.delete(selectedWorkflow.id);
            if (result.success) {
                setWorkflows(workflows.filter(w => w.id !== selectedWorkflow.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'תהליך נמחק' : 'Workflow deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Duplicate workflow
    const handleDuplicateWorkflow = async (workflow) => {
        try {
            setSaving(true);
            // Create new workflow with copied data
            const newWorkflowData = {
                name: `${workflow.name} (${language === 'he' ? 'העתק' : 'Copy'})`,
                code: `${workflow.code}_COPY`,
                description: workflow.description,
                isActive: true
            };

            const result = await workflowsService.create(newWorkflowData);
            if (result.success) {
                // Copy steps to new workflow
                const newWorkflow = result.data;
                for (const step of (workflow.steps || [])) {
                    await workflowsService.addStep(newWorkflow.id, {
                        name: step.name,
                        description: step.description,
                        departmentId: step.departmentId || step.department?.id,
                        stepOrder: step.stepOrder,
                        estimatedDurationDays: step.estimatedDurationDays,
                        isActive: true
                    });
                }
                await fetchData(); // Refresh to get complete data
                showToast(language === 'he' ? 'תהליך שוכפל בהצלחה' : 'Workflow duplicated');
            } else {
                showToast(result.error?.message || 'Failed to duplicate', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to duplicate', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Move step up/down
    const handleMoveStep = async (workflow, step, direction) => {
        const steps = [...(workflow.steps || [])].sort((a, b) => a.stepOrder - b.stepOrder);
        const currentIndex = steps.findIndex(s => s.id === step.id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= steps.length) return;

        // Swap orders
        const targetStep = steps[newIndex];
        const tempOrder = step.stepOrder;

        try {
            setSaving(true);
            // Update current step
            await workflowsService.updateStep(step.id, { stepOrder: targetStep.stepOrder });
            // Update target step
            await workflowsService.updateStep(targetStep.id, { stepOrder: tempOrder });

            await fetchData();
            showToast(language === 'he' ? 'סדר השלבים עודכן' : 'Step order updated');
        } catch (err) {
            showToast(err.error?.message || 'Failed to reorder', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Step handlers
    const handleAddStep = (workflow) => {
        setSelectedWorkflow(workflow);
        setSelectedStep(null);
        const maxOrder = workflow.steps?.length > 0
            ? Math.max(...workflow.steps.map(s => s.stepOrder || 0)) + 1
            : 1;

        // Get the first department ID - ensure it's available
        const firstDeptId = departments.length > 0 ? departments[0].id : '';
        console.log('[handleAddStep] departments available:', departments.length, 'firstDeptId:', firstDeptId);

        setStepFormData({
            name: '',
            description: '',
            departmentId: firstDeptId,
            stepOrder: maxOrder,
            estimatedDurationDays: 1,
            isActive: true
        });
        setShowStepModal(true);
    };

    const handleEditStep = (workflow, step) => {
        setSelectedWorkflow(workflow);
        setSelectedStep(step);
        setStepFormData({
            name: step.name || '',
            description: step.description || '',
            departmentId: step.departmentId || step.department?.id || '',
            stepOrder: step.stepOrder || 1,
            estimatedDurationDays: step.estimatedDurationDays || 1,
            isActive: step.isActive !== false
        });
        setShowStepModal(true);
    };

    const handleSaveStep = async () => {
        console.log('[DEBUG] handleSaveStep called');
        console.log('[DEBUG] stepFormData:', stepFormData);
        console.log('[DEBUG] selectedWorkflow:', selectedWorkflow?.id, selectedWorkflow?.name);

        if (!stepFormData.name || !stepFormData.departmentId) {
            console.log('[DEBUG] Validation failed - name or departmentId empty');
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);
            console.log('[DEBUG] Starting save operation...');

            if (selectedStep) {
                console.log('[DEBUG] Updating existing step:', selectedStep.id);
                const result = await workflowsService.updateStep(selectedWorkflow.id, selectedStep.id, stepFormData);
                console.log('[DEBUG] updateStep result:', result);
                if (result.success) {
                    // Refresh workflow data
                    await fetchData();
                    showToast(language === 'he' ? 'שלב עודכן' : 'Step updated');
                } else {
                    showToast(result.error?.message || 'Failed to update step', 'error');
                    return;
                }
            } else {
                console.log('[DEBUG] Adding new step to workflow:', selectedWorkflow.id);
                const result = await workflowsService.addStep(selectedWorkflow.id, stepFormData);
                console.log('[DEBUG] addStep result:', result);
                if (result.success) {
                    // Refresh workflow data
                    await fetchData();
                    showToast(language === 'he' ? 'שלב נוסף' : 'Step added');
                } else {
                    showToast(result.error?.message || 'Failed to add step', 'error');
                    return;
                }
            }
            setShowStepModal(false);
        } catch (err) {
            console.error('[DEBUG] Error in handleSaveStep:', err);
            showToast(err.error?.message || 'Failed to save step', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStep = async (workflow, step) => {
        if (!confirm(language === 'he' ? 'למחוק את השלב?' : 'Delete this step?')) return;

        try {
            const result = await workflowsService.deleteStep(workflow.id, step.id);
            if (result.success) {
                await fetchData();
                showToast(language === 'he' ? 'שלב נמחק' : 'Step deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete step', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete step', 'error');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="workflows-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען תהליכים...' : 'Loading workflows...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="workflows-page">
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

    return (
        <div className="workflows-page">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div className="header-info">
                    <h2>{language === 'he' ? 'תהליכי עבודה' : 'Workflows'}</h2>
                    <p>{language === 'he' ? 'ניהול תהליכי ייצור ומכירות' : 'Production & Sales Workflows'}</p>
                </div>
                {canEdit && activeTab === 'production' && (
                    <button className="btn btn-primary" onClick={handleAddWorkflow}>
                        <Plus size={18} />
                        {language === 'he' ? 'תהליך חדש' : 'New Workflow'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="workflow-tabs glass-card" style={{ display: 'flex', gap: '8px', padding: '8px', marginBottom: '20px', borderRadius: '12px' }}>
                <button
                    className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
                    onClick={() => setActiveTab('production')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === 'production' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: activeTab === 'production' ? 600 : 400,
                        transition: 'all 0.3s'
                    }}
                >
                    <GitBranch size={18} />
                    {language === 'he' ? 'תהליכי ייצור' : 'Production'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === 'sales' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: activeTab === 'sales' ? 600 : 400,
                        transition: 'all 0.3s'
                    }}
                >
                    <Target size={18} />
                    {language === 'he' ? 'תהליך מכירות' : 'Sales Pipeline'}
                </button>
            </div>

            {/* Sales Pipeline Tab Content */}
            {activeTab === 'sales' && (
                <div className="sales-pipeline-content glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '8px' }}>{language === 'he' ? 'שלבי מכירות' : 'Sales Stages'}</h3>
                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{language === 'he' ? 'הגדר את השלבים שכל ליד עובר בתהליך המכירה' : 'Define the stages each lead goes through'}</p>
                    </div>

                    {/* Stages List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        {salesStages.map((stage, index) => (
                            <div key={stage.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '10px',
                                borderInlineStart: `4px solid ${stage.color}`
                            }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: stage.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>{index + 1}</div>

                                {editingStageId === stage.id ? (
                                    <>
                                        <input
                                            type="text"
                                            className="form-input"
                                            defaultValue={stage.label}
                                            style={{ flex: 1 }}
                                            onBlur={(e) => updateSalesStage(stage.id, { label: e.target.value })}
                                            autoFocus
                                        />
                                        <input
                                            type="color"
                                            defaultValue={stage.color}
                                            onChange={(e) => updateSalesStage(stage.id, { color: e.target.value })}
                                            style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="number"
                                            defaultValue={stage.slaHours || 24}
                                            onChange={(e) => updateSalesStage(stage.id, { slaHours: parseInt(e.target.value) || null })}
                                            style={{ width: '70px' }}
                                            className="form-input"
                                            placeholder="SLA"
                                        />
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{language === 'he' ? 'שעות' : 'hours'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1, fontWeight: 500 }}>{stage.label}</span>
                                        {stage.slaHours && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6, fontSize: '0.85rem' }}>
                                                <Clock size={14} />
                                                {stage.slaHours}h
                                            </div>
                                        )}
                                        {canEdit && (
                                            <>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => setEditingStageId(stage.id)}
                                                    style={{ opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                {!['WON', 'LOST', 'NEW'].includes(stage.id) && (
                                                    <button
                                                        className="action-btn danger"
                                                        onClick={() => removeSalesStage(stage.id)}
                                                        style={{ opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Stage */}
                    {canEdit && (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '2px dashed rgba(255,255,255,0.1)',
                            borderRadius: '10px'
                        }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={language === 'he' ? 'שם שלב חדש...' : 'New stage name...'}
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSalesStage()}
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-primary" onClick={addSalesStage}>
                                <Plus size={16} />
                                {language === 'he' ? 'הוסף' : 'Add'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Production Workflows Tab Content */}
            {activeTab === 'production' && (
                <div className="workflows-list">
                    {workflows.map(workflow => (
                        <div key={workflow.id} className="workflow-card glass-card">
                            <div
                                className="workflow-header"
                                onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                            >
                                <div className="workflow-icon">
                                    <GitBranch size={24} />
                                </div>

                                <div className="workflow-info">
                                    <h3>{workflow.name}</h3>
                                    <p>{workflow.description || '-'}</p>
                                    <div className="workflow-meta">
                                        <span className="meta-tag code">{workflow.code}</span>
                                        <span className="meta-tag steps">{workflow.steps?.length || 0} {language === 'he' ? 'שלבים' : 'steps'}</span>
                                        {workflow.productCount > 0 && (
                                            <span className="meta-tag products">{workflow.productCount} {language === 'he' ? 'מוצרים' : 'products'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="workflow-status">
                                    <span className={`status-badge ${workflow.isActive !== false ? 'active' : 'inactive'}`}>
                                        {workflow.isActive !== false ? (language === 'he' ? 'פעיל' : 'Active') : (language === 'he' ? 'לא פעיל' : 'Inactive')}
                                    </span>
                                </div>

                                {canEdit && (
                                    <div className="workflow-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="action-btn" onClick={() => handleDuplicateWorkflow(workflow)} title={language === 'he' ? 'שכפול' : 'Duplicate'}>
                                            <Copy size={16} />
                                        </button>
                                        <button className="action-btn" onClick={() => handleEditWorkflow(workflow)} title={language === 'he' ? 'עריכה' : 'Edit'}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="action-btn danger" onClick={() => { setSelectedWorkflow(workflow); setShowDeleteModal(true); }} title={language === 'he' ? 'מחיקה' : 'Delete'}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <button className="expand-btn">
                                    {expandedWorkflow === workflow.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {expandedWorkflow === workflow.id && (
                                <div className="workflow-steps">
                                    <h4>{language === 'he' ? 'שלבי התהליך' : 'Process Steps'}</h4>
                                    <div className="steps-timeline">
                                        {(workflow.steps || []).map((step, index) => (
                                            <div key={step.id} className="step-item">
                                                <div className="step-connector">
                                                    <div className="step-number">{index + 1}</div>
                                                    {index < (workflow.steps?.length || 0) - 1 && <div className="step-line"></div>}
                                                </div>

                                                <div className="step-content">
                                                    <div className="step-header">
                                                        <h5>{step.name}</h5>
                                                        {canEdit && (
                                                            <div className="step-actions">
                                                                {index > 0 && (
                                                                    <button className="step-action-btn move" onClick={() => handleMoveStep(workflow, step, 'up')} title={language === 'he' ? 'העבר למעלה' : 'Move up'}>
                                                                        <ArrowUp size={14} />
                                                                    </button>
                                                                )}
                                                                {index < (workflow.steps?.length || 0) - 1 && (
                                                                    <button className="step-action-btn move" onClick={() => handleMoveStep(workflow, step, 'down')} title={language === 'he' ? 'העבר למטה' : 'Move down'}>
                                                                        <ArrowDown size={14} />
                                                                    </button>
                                                                )}
                                                                <button className="step-action-btn" onClick={() => handleEditStep(workflow, step)} title={language === 'he' ? 'עריכה' : 'Edit'}>
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button className="step-action-btn danger" onClick={() => handleDeleteStep(workflow, step)} title={language === 'he' ? 'מחיקה' : 'Delete'}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="step-details">
                                                        {step.department && (
                                                            <div
                                                                className="dept-badge"
                                                                style={{
                                                                    background: `${step.department.color || '#667eea'}20`,
                                                                    color: step.department.color || '#667eea'
                                                                }}
                                                            >
                                                                <Building2 size={14} />
                                                                {step.department.name}
                                                            </div>
                                                        )}
                                                        <span className="duration">{step.estimatedDurationDays || 1} {language === 'he' ? 'ימים' : 'days'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {canEdit && (
                                        <button className="add-step-btn" onClick={() => handleAddStep(workflow)}>
                                            <Plus size={16} />
                                            {language === 'he' ? 'הוסף שלב' : 'Add Step'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {workflows.length === 0 && (
                        <div className="empty-state">
                            <GitBranch size={48} />
                            <p>{language === 'he' ? 'לא נמצאו תהליכים' : 'No workflows found'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Workflow Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedWorkflow ? (language === 'he' ? 'עריכת תהליך' : 'Edit Workflow') : (language === 'he' ? 'תהליך חדש' : 'New Workflow')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'שם תהליך' : 'Name'}</label>
                            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'קוד' : 'Code'}</label>
                            <input type="text" className="form-input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{language === 'he' ? 'תיאור' : 'Description'}</label>
                        <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                            {language === 'he' ? 'פעיל' : 'Active'}
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSaveWorkflow} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'שמור' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Step Modal */}
            <Modal isOpen={showStepModal} onClose={() => setShowStepModal(false)} title={selectedStep ? (language === 'he' ? 'עריכת שלב' : 'Edit Step') : (language === 'he' ? 'שלב חדש' : 'New Step')}>
                <div className="modal-form">
                    <div className="form-group">
                        <label><span className="required">*</span>{language === 'he' ? 'שם שלב' : 'Step Name'}</label>
                        <input type="text" className="form-input" value={stepFormData.name} onChange={(e) => setStepFormData({ ...stepFormData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label><span className="required">*</span>{language === 'he' ? 'מחלקה' : 'Department'}</label>
                        <select className="form-input" value={stepFormData.departmentId} onChange={(e) => setStepFormData({ ...stepFormData, departmentId: e.target.value })}>
                            <option value="">{language === 'he' ? 'בחר מחלקה' : 'Select department'}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'סדר' : 'Order'}</label>
                            <input type="number" className="form-input" min={1} value={stepFormData.stepOrder} onChange={(e) => setStepFormData({ ...stepFormData, stepOrder: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'משך בימים' : 'Duration (days)'}</label>
                            <input type="number" className="form-input" min={1} value={stepFormData.estimatedDurationDays} onChange={(e) => setStepFormData({ ...stepFormData, estimatedDurationDays: parseInt(e.target.value) || 1 })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{language === 'he' ? 'תיאור' : 'Description'}</label>
                        <textarea className="form-input" rows={2} value={stepFormData.description} onChange={(e) => setStepFormData({ ...stepFormData, description: e.target.value })} />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowStepModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSaveStep} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'שמור' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={language === 'he' ? 'מחיקה' : 'Delete'} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon"><AlertTriangle size={48} /></div>
                    <p>{language === 'he' ? 'למחוק את תהליך' : 'Delete workflow'} <strong>{selectedWorkflow?.name}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-danger" onClick={handleDeleteWorkflow} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? 'מחק' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Workflows;
