import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Layers,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { productsService } from '../services/api';
import Modal from '../components/Modal';
import './Products.css';

function Products({ currentUser, t, language }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: 'RITUAL',
        status: 'ACTIVE'
    });

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const result = await productsService.getAll({ limit: 100 });
            if (result.success) {
                setProducts(result.data.products || []);
            } else {
                setError(result.error?.message || 'Failed to load products');
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const categoryLabels = {
        RITUAL: language === 'he' ? 'יודאיקה' : 'Judaica',
        FURNITURE: language === 'he' ? 'ריהוט' : 'Furniture',
        PERSONAL: language === 'he' ? 'אישי' : 'Personal'
    };

    const statusLabels = {
        ACTIVE: language === 'he' ? 'פעיל' : 'Active',
        DISCONTINUED: language === 'he' ? 'הופסק' : 'Discontinued'
    };

    const categoryColors = {
        RITUAL: '#667eea',
        FURNITURE: '#f5576c',
        PERSONAL: '#4facfe'
    };

    // Handlers
    const handleView = (product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            sku: product.sku || '',
            description: product.description || '',
            price: product.price || '',
            stockQuantity: product.stockQuantity || '',
            category: product.category || 'RITUAL',
            status: product.status || 'ACTIVE'
        });
        setShowAddModal(true);
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const result = await productsService.delete(selectedProduct.id);
            if (result.success) {
                setProducts(products.filter(p => p.id !== selectedProduct.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'מוצר נמחק' : 'Product deleted');
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
        if (!formData.name || !formData.sku) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                stockQuantity: parseInt(formData.stockQuantity) || 0
            };

            if (selectedProduct) {
                const result = await productsService.update(selectedProduct.id, dataToSend);
                if (result.success) {
                    setProducts(products.map(p =>
                        p.id === selectedProduct.id ? { ...p, ...result.data } : p
                    ));
                    showToast(language === 'he' ? 'מוצר עודכן' : 'Product updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                const result = await productsService.create(dataToSend);
                if (result.success) {
                    setProducts([result.data, ...products]);
                    showToast(language === 'he' ? 'מוצר נוסף' : 'Product added');
                } else {
                    showToast(result.error?.message || 'Failed to create', 'error');
                    return;
                }
            }
            setShowAddModal(false);
            setSelectedProduct(null);
            setFormData({ name: '', sku: '', description: '', price: '', stockQuantity: '', category: 'RITUAL', status: 'ACTIVE' });
        } catch (err) {
            showToast(err.error?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const openAddModal = () => {
        setSelectedProduct(null);
        setFormData({ name: '', sku: '', description: '', price: '', stockQuantity: '', category: 'RITUAL', status: 'ACTIVE' });
        setShowAddModal(true);
    };

    // Loading state
    if (loading) {
        return (
            <div className="products-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען מוצרים...' : 'Loading products...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="products-page">
                <div className="error-container">
                    <AlertTriangle size={40} />
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchProducts}>
                        {language === 'he' ? 'נסה שוב' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="products-page">
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
                    <h2>{t?.('products') || 'Products'}</h2>
                    <p>{filteredProducts.length} {t?.('products') || 'products'}</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    {language === 'he' ? 'מוצר חדש' : 'New Product'}
                </button>
            </div>

            {/* Filters */}
            <div className="toolbar glass-card">
                <div className="toolbar-right">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={language === 'he' ? 'חיפוש מוצרים...' : 'Search products...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{language === 'he' ? 'כל הקטגוריות' : 'All Categories'}</option>
                            <option value="RITUAL">{categoryLabels.RITUAL}</option>
                            <option value="FURNITURE">{categoryLabels.FURNITURE}</option>
                            <option value="PERSONAL">{categoryLabels.PERSONAL}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Layers size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                            <option value="ACTIVE">{statusLabels.ACTIVE}</option>
                            <option value="DISCONTINUED">{statusLabels.DISCONTINUED}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card glass-card">
                        <div className="product-image">
                            <Package size={48} />
                            {product.stockQuantity === 0 && (
                                <div className="out-of-stock-badge">
                                    <AlertTriangle size={14} />
                                    {language === 'he' ? 'אזל מהמלאי' : 'Out of Stock'}
                                </div>
                            )}
                            {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                                <div className="low-stock-badge">
                                    <AlertTriangle size={14} />
                                    {language === 'he' ? 'מלאי נמוך' : 'Low Stock'}
                                </div>
                            )}
                        </div>

                        <div className="product-content">
                            <div className="product-header">
                                <span
                                    className="category-badge"
                                    style={{
                                        background: `${categoryColors[product.category]}20`,
                                        color: categoryColors[product.category]
                                    }}
                                >
                                    {categoryLabels[product.category] || product.category}
                                </span>
                                <span className="product-sku">{product.sku}</span>
                            </div>

                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description || '-'}</p>

                            <div className="product-meta">
                                <div className="meta-item">
                                    <span className="meta-label">{language === 'he' ? 'מחיר' : 'Price'}</span>
                                    <span className="meta-value price">${(product.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">{language === 'he' ? 'מלאי' : 'Stock'}</span>
                                    <span className={`meta-value stock ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                        {product.stockQuantity || 0}
                                    </span>
                                </div>
                            </div>

                            {product.workflow && (
                                <div className="workflow-tag">
                                    <Layers size={14} />
                                    {product.workflow.name}
                                </div>
                            )}

                            <div className="product-actions">
                                <button className="action-btn" title={language === 'he' ? 'צפייה' : 'View'} onClick={() => handleView(product)}>
                                    <Eye size={16} />
                                </button>
                                <button className="action-btn" title={language === 'he' ? 'עריכה' : 'Edit'} onClick={() => handleEdit(product)}>
                                    <Edit size={16} />
                                </button>
                                <button className="action-btn danger" title={language === 'he' ? 'מחיקה' : 'Delete'} onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>{language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedProduct ? (language === 'he' ? 'עריכת מוצר' : 'Edit Product') : (language === 'he' ? 'מוצר חדש' : 'New Product')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'שם מוצר' : 'Product Name'}</label>
                            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><span className="required">*</span>SKU</label>
                            <input type="text" className="form-input" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{language === 'he' ? 'תיאור' : 'Description'}</label>
                        <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'מחיר' : 'Price'}</label>
                            <input type="number" className="form-input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'כמות במלאי' : 'Stock Quantity'}</label>
                            <input type="number" className="form-input" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'קטגוריה' : 'Category'}</label>
                            <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                <option value="RITUAL">{categoryLabels.RITUAL}</option>
                                <option value="FURNITURE">{categoryLabels.FURNITURE}</option>
                                <option value="PERSONAL">{categoryLabels.PERSONAL}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'סטטוס' : 'Status'}</label>
                            <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="ACTIVE">{statusLabels.ACTIVE}</option>
                                <option value="DISCONTINUED">{statusLabels.DISCONTINUED}</option>
                            </select>
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

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedProduct?.name || ''}>
                {selectedProduct && (
                    <div className="product-detail">
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>SKU</h4>
                                <p>{selectedProduct.sku}</p>
                            </div>
                            <div className="detail-section">
                                <h4>{language === 'he' ? 'קטגוריה' : 'Category'}</h4>
                                <span
                                    className="category-badge"
                                    style={{
                                        background: `${categoryColors[selectedProduct.category]}20`,
                                        color: categoryColors[selectedProduct.category]
                                    }}
                                >
                                    {categoryLabels[selectedProduct.category]}
                                </span>
                            </div>
                        </div>
                        <div className="detail-section">
                            <h4>{language === 'he' ? 'תיאור' : 'Description'}</h4>
                            <p>{selectedProduct.description || '-'}</p>
                        </div>
                        <div className="detail-row">
                            <div className="detail-section">
                                <h4>{language === 'he' ? 'מחיר' : 'Price'}</h4>
                                <p className="big-number">${(selectedProduct.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="detail-section">
                                <h4>{language === 'he' ? 'מלאי' : 'Stock'}</h4>
                                <p className={`big-number ${selectedProduct.stockQuantity === 0 ? 'danger' : ''}`}>{selectedProduct.stockQuantity || 0}</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowViewModal(false)}>{language === 'he' ? 'סגור' : 'Close'}</button>
                            <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEdit(selectedProduct); }}>
                                <Edit size={16} />
                                {language === 'he' ? 'עריכה' : 'Edit'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={language === 'he' ? 'מחיקה' : 'Delete'} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon"><AlertTriangle size={48} /></div>
                    <p>{language === 'he' ? 'למחוק את' : 'Delete'} <strong>{selectedProduct?.name}</strong>?</p>
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

export default Products;
