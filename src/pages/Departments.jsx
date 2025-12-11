import { useState, useEffect } from 'react';
import {
    Plus,
    Building2,
    Users,
    CheckSquare,
    Edit,
    Trash2,
    Check,
    AlertTriangle,
    Loader2,
    X
} from 'lucide-react';
import { departmentsService } from '../services/api';
import Modal from '../components/Modal';
import './Departments.css';

function Departments({ currentUser, t, language }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        color: '#667eea'
    });

    const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
    const canDelete = currentUser?.role === 'ADMIN';

    // Fetch departments
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const result = await departmentsService.getAll({ limit: 100 });
            if (result.success) {
                setDepartments(result.data.departments || []);
            } else {
                setError(result.error?.message || 'Failed to load departments');
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handlers
    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setFormData({
            name: dept.name || '',
            code: dept.code || '',
            description: dept.description || '',
            color: dept.color || '#667eea'
        });
        setShowAddModal(true);
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const result = await departmentsService.delete(selectedDept.id);
            if (result.success) {
                setDepartments(departments.filter(d => d.id !== selectedDept.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'מחלקה נמחקה' : 'Department deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedDept) {
                const result = await departmentsService.update(selectedDept.id, formData);
                if (result.success) {
                    setDepartments(departments.map(d =>
                        d.id === selectedDept.id ? { ...d, ...result.data } : d
                    ));
                    showToast(language === 'he' ? 'מחלקה עודכנה' : 'Department updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                const result = await departmentsService.create(formData);
                if (result.success) {
                    setDepartments([result.data, ...departments]);
                    showToast(language === 'he' ? 'מחלקה נוספה' : 'Department added');
                } else {
                    showToast(result.error?.message || 'Failed to create', 'error');
                    return;
                }
            }
            setShowAddModal(false);
            setSelectedDept(null);
            setFormData({ name: '', code: '', description: '', color: '#667eea' });
        } catch (err) {
            showToast(err.error?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const openAddModal = () => {
        setSelectedDept(null);
        setFormData({ name: '', code: '', description: '', color: '#667eea' });
        setShowAddModal(true);
    };

    // Loading state
    if (loading) {
        return (
            <div className="departments-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען מחלקות...' : 'Loading departments...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="departments-page">
                <div className="error-container">
                    <AlertTriangle size={40} />
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchDepartments}>
                        {language === 'he' ? 'נסה שוב' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="departments-page">
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
                    <h2>{t?.('departments') || 'Departments'}</h2>
                    <p>{departments.length} {language === 'he' ? 'מחלקות' : 'departments'}</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        {language === 'he' ? 'מחלקה חדשה' : 'New Department'}
                    </button>
                )}
            </div>

            <div className="departments-grid">
                {departments.map(dept => (
                    <div key={dept.id} className="department-card glass-card">
                        <div
                            className="dept-color-bar"
                            style={{ background: dept.color || '#667eea' }}
                        ></div>

                        <div className="dept-content">
                            <div className="dept-header">
                                <div
                                    className="dept-icon"
                                    style={{ background: `${dept.color || '#667eea'}20`, color: dept.color || '#667eea' }}
                                >
                                    <Building2 size={24} />
                                </div>
                                <div className="dept-status">
                                    <span className={`status-dot ${dept.isActive !== false ? 'active' : ''}`}></span>
                                    {dept.isActive !== false ? (language === 'he' ? 'פעיל' : 'Active') : (language === 'he' ? 'לא פעיל' : 'Inactive')}
                                </div>
                            </div>

                            <h3>{dept.name}</h3>
                            <span className="dept-code">{dept.code}</span>
                            <p>{dept.description || '-'}</p>

                            <div className="dept-stats">
                                <div className="stat-item">
                                    <Users size={18} />
                                    <div className="stat-info">
                                        <span className="stat-value">{dept.employeeCount || 0}</span>
                                        <span className="stat-label">{language === 'he' ? 'עובדים' : 'Employees'}</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <CheckSquare size={18} />
                                    <div className="stat-info">
                                        <span className="stat-value">{dept.activeTasks || 0}</span>
                                        <span className="stat-label">{language === 'he' ? 'משימות' : 'Tasks'}</span>
                                    </div>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="dept-actions">
                                    <button className="action-btn" onClick={() => handleEdit(dept)}>
                                        <Edit size={16} />
                                        {language === 'he' ? 'עריכה' : 'Edit'}
                                    </button>
                                    {canDelete && (
                                        <button className="action-btn danger" onClick={() => { setSelectedDept(dept); setShowDeleteModal(true); }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {departments.length === 0 && (
                    <div className="empty-state">
                        <Building2 size={48} />
                        <p>{language === 'he' ? 'לא נמצאו מחלקות' : 'No departments found'}</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedDept ? (language === 'he' ? 'עריכת מחלקה' : 'Edit Department') : (language === 'he' ? 'מחלקה חדשה' : 'New Department')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'שם מחלקה' : 'Name'}</label>
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
                        <label>{language === 'he' ? 'צבע' : 'Color'}</label>
                        <div className="color-picker">
                            <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                            <span>{formData.color}</span>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
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
                    <p>{language === 'he' ? 'למחוק את מחלקת' : 'Delete department'} <strong>{selectedDept?.name}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? 'מחק' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Departments;
