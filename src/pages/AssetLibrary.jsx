import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Image,
    Edit,
    Trash2,
    Eye,
    X,
    Upload,
    Tag,
    FolderOpen,
    Loader2,
    Check,
    AlertTriangle
} from 'lucide-react';
import Modal from '../components/Modal';
import './AssetLibrary.css';

// נתוני מוק
const mockDrawings = [
    { id: '1', name: 'אריה זהב', category: 'ציורים', tags: ['אריה', 'זהב'], imageUrl: null },
    { id: '2', name: 'לוחות הברית', category: 'ציורים', tags: ['תורה'], imageUrl: null },
    { id: '3', name: 'כתר מלכות', category: 'ציורים', tags: ['כתר', 'מלך'], imageUrl: null },
];

function AssetLibrary({ currentUser, t, language = 'he' }) {
    const [assets, setAssets] = useState(mockDrawings);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'ציורים',
        tags: '',
        imageUrl: null
    });

    const categories = [
        { value: 'all', label: 'הכל' },
        { value: 'ציורים', label: 'ציורים' },
        { value: 'לוגואים', label: 'לוגואים' },
        { value: 'תבניות', label: 'תבניות' }
    ];

    // Filter assets
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleView = (asset) => {
        setSelectedAsset(asset);
        setShowViewModal(true);
    };

    const handleEdit = (asset) => {
        setSelectedAsset(asset);
        setFormData({
            name: asset.name,
            category: asset.category,
            tags: asset.tags.join(', '),
            imageUrl: asset.imageUrl
        });
        setShowAddModal(true);
    };

    const handleDelete = () => {
        setAssets(assets.filter(a => a.id !== selectedAsset.id));
        setShowDeleteModal(false);
        showToast('נכס נמחק בהצלחה');
    };

    const handleSave = () => {
        if (!formData.name || !formData.category) {
            showToast('נא למלא את כל השדות החובה', 'error');
            return;
        }

        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);

        if (selectedAsset) {
            // Edit existing
            setAssets(assets.map(a =>
                a.id === selectedAsset.id
                    ? { ...a, ...formData, tags: tagsArray }
                    : a
            ));
            showToast('נכס עודכן בהצלחה');
        } else {
            // Add new
            const newAsset = {
                id: Date.now().toString(),
                ...formData,
                tags: tagsArray
            };
            setAssets([newAsset, ...assets]);
            showToast('נכס נוסף בהצלחה');
        }

        closeAddModal();
    };

    const openAddModal = () => {
        setSelectedAsset(null);
        setFormData({
            name: '',
            category: 'ציורים',
            tags: '',
            imageUrl: null
        });
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setSelectedAsset(null);
        setFormData({
            name: '',
            category: 'ציורים',
            tags: '',
            imageUrl: null
        });
    };

    const handleDeleteClick = (asset) => {
        setSelectedAsset(asset);
        setShowDeleteModal(true);
    };

    return (
        <div className="asset-library-page">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <div className="header-info">
                    <h2>ספריית נכסים</h2>
                    <p>{filteredAssets.length} נכסים</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        <span>הוסף ציור חדש</span>
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar glass-card">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="חפש לפי שם או תגיות..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="toolbar-right">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            className="filter-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="assets-grid">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="asset-card glass-card" onClick={() => handleView(asset)}>
                        <div className={`asset-image ${asset.imageUrl ? 'has-image' : ''}`}>
                            {asset.imageUrl ? (
                                <img src={asset.imageUrl} alt={asset.name} />
                            ) : (
                                <div className="asset-icon-fallback">
                                    <Image size={48} />
                                </div>
                            )}
                        </div>

                        <div className="asset-content">
                            <div className="asset-header">
                                <span className="category-badge">{asset.category}</span>
                            </div>

                            <h3 className="asset-name">{asset.name}</h3>

                            <div className="asset-tags">
                                {asset.tags.map((tag, index) => (
                                    <span key={index} className="tag-badge">
                                        <Tag size={12} />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="asset-actions">
                                <button
                                    className="action-btn"
                                    onClick={(e) => { e.stopPropagation(); handleView(asset); }}
                                    title="צפייה"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(asset); }}
                                    title="עריכה"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="action-btn danger"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(asset); }}
                                    title="מחיקה"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredAssets.length === 0 && (
                    <div className="empty-state">
                        <FolderOpen size={64} />
                        <h3>לא נמצאו נכסים</h3>
                        <p>נסה לשנות את החיפוש או הוסף נכס חדש</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={closeAddModal}
                    title={selectedAsset ? 'עריכת נכס' : 'הוספת נכס חדש'}
                >
                    <div className="modal-form">
                        <div className="form-group">
                            <label>שם הנכס *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="לדוגמה: אריה זהב"
                            />
                        </div>

                        <div className="form-group">
                            <label>קטגוריה *</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="ציורים">ציורים</option>
                                <option value="לוגואים">לוגואים</option>
                                <option value="תבניות">תבניות</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>תגיות</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="הפרד תגיות בפסיקים, לדוגמה: אריה, זהב, פיסול"
                            />
                        </div>

                        <div className="form-group">
                            <label>העלאת תמונה</label>
                            <div className="upload-area">
                                <Upload size={24} />
                                <p>גרור קובץ לכאן או לחץ לבחירה</p>
                                <span className="upload-hint">PNG, JPG, SVG עד 5MB</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeAddModal}>
                                ביטול
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="spinner" size={18} /> : null}
                                <span>{selectedAsset ? 'עדכן' : 'הוסף'}</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* View Modal */}
            {showViewModal && selectedAsset && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="פרטי נכס"
                >
                    <div className="asset-detail-view">
                        <div className="detail-image-container">
                            {selectedAsset.imageUrl ? (
                                <img src={selectedAsset.imageUrl} alt={selectedAsset.name} />
                            ) : (
                                <div className="detail-image-fallback">
                                    <Image size={80} />
                                </div>
                            )}
                        </div>

                        <div className="detail-info">
                            <h2>{selectedAsset.name}</h2>
                            <div className="detail-meta">
                                <div className="meta-row">
                                    <span className="meta-label">קטגוריה:</span>
                                    <span className="category-badge">{selectedAsset.category}</span>
                                </div>
                                <div className="meta-row">
                                    <span className="meta-label">תגיות:</span>
                                    <div className="tags-list">
                                        {selectedAsset.tags.map((tag, index) => (
                                            <span key={index} className="tag-badge">
                                                <Tag size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                                סגור
                            </button>
                            <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEdit(selectedAsset); }}>
                                <Edit size={18} />
                                <span>ערוך</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="אישור מחיקה"
                >
                    <div className="delete-confirmation">
                        <AlertTriangle size={48} color="var(--danger)" />
                        <p>האם אתה בטוח שברצונך למחוק את הנכס "{selectedAsset?.name}"?</p>
                        <p className="warning-text">פעולה זו אינה ניתנת לביטול</p>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                ביטול
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                                {saving ? <Loader2 className="spinner" size={18} /> : null}
                                <span>מחק</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default AssetLibrary;
