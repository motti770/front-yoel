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
    X
} from 'lucide-react';
import { workflowsService, departmentsService } from '../services/api';
import Modal from '../components/Modal';
import './Workflows.css';

function Workflows({ currentUser, t, language }) {
    const [workflows, setWorkflows] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedWorkflow, setExpandedWorkflow] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStepModal, setShowStepModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);

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

    // Step handlers
    const handleAddStep = (workflow) => {
        setSelectedWorkflow(workflow);
        setSelectedStep(null);
        const maxOrder = workflow.steps?.length > 0
            ? Math.max(...workflow.steps.map(s => s.stepOrder || 0)) + 1
            : 1;
        setStepFormData({
            name: '',
            description: '',
            departmentId: departments[0]?.id || '',
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
        if (!stepFormData.name || !stepFormData.departmentId) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedStep) {
                const result = await workflowsService.updateStep(selectedWorkflow.id, selectedStep.id, stepFormData);
                if (result.success) {
                    // Refresh workflow data
                    await fetchData();
                    showToast(language === 'he' ? 'שלב עודכן' : 'Step updated');
                } else {
                    showToast(result.error?.message || 'Failed to update step', 'error');
                    return;
                }
            } else {
                const result = await workflowsService.addStep(selectedWorkflow.id, stepFormData);
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
                    <p>{workflows.length} {language === 'he' ? 'תהליכים' : 'workflows'}</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary" onClick={handleAddWorkflow}>
                        <Plus size={18} />
                        {language === 'he' ? 'תהליך חדש' : 'New Workflow'}
                    </button>
                )}
            </div>

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
                                    <button className="action-btn" onClick={() => handleEditWorkflow(workflow)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="action-btn danger" onClick={() => { setSelectedWorkflow(workflow); setShowDeleteModal(true); }}>
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
                                                            <button className="step-action-btn" onClick={() => handleEditStep(workflow, step)}>
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="step-action-btn danger" onClick={() => handleDeleteStep(workflow, step)}>
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
