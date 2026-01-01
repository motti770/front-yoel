import { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Check,
    AlertTriangle,
    Loader2,
    X,
    ChevronDown,
    ChevronUp,
    Shirt,
    Scissors,
    Sparkles,
    Layers,
    LayoutGrid,
    List,
    AlertCircle,
    TrendingDown,
    MapPin,
    DollarSign,
    Warehouse,
    RefreshCw
} from 'lucide-react';
import { materialsService, productsService } from '../services/api';
import Modal from '../components/Modal';
import './Materials.css';

const CATEGORY_CONFIG = {
    FABRIC: { name: 'בדים', nameEn: 'Fabrics', icon: Shirt, color: '#667eea' },
    THREAD: { name: 'חוטי רקמה', nameEn: 'Threads', icon: Scissors, color: '#f5576c' },
    ACCESSORY: { name: 'אביזרים', nameEn: 'Accessories', icon: Sparkles, color: '#fee140' },
    BACKING: { name: 'בדי תמיכה', nameEn: 'Backing', icon: Layers, color: '#4facfe' }
};

function Materials({ currentUser, t, language }) {
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // View
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    const [expandedMaterial, setExpandedMaterial] = useState(null);
    const [collapsedCategories, setCollapsedCategories] = useState({});

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        code: '',
        category: 'FABRIC',
        type: '',
        colorHex: '#667eea',
        supplier: '',
        stockQuantity: 0,
        stockUnit: 'מטר',
        reorderLevel: 10,
        reorderQuantity: 50,
        unitCost: 0,
        salePrice: 0,
        location: '',
        notes: '',
        isActive: true,
        productIds: []
    });

    // Stock adjustment state
    const [stockAdjustment, setStockAdjustment] = useState({
        quantity: 0,
        operation: 'ADD'
    });

    const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [materialsResult, productsResult] = await Promise.all([
                materialsService.getAll(),
                productsService.getAll()
            ]);

            if (materialsResult.success) {
                setMaterials(materialsResult.data.materials || []);
            } else {
                setError(materialsResult.error?.message || 'Failed to load materials');
            }

            if (productsResult.success) {
                const parentProducts = (productsResult.data.products || []).filter(p => !p.parentProductId);
                setProducts(parentProducts);
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter materials
    const getFilteredMaterials = () => {
        let filtered = [...materials];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(search) ||
                m.nameEn?.toLowerCase().includes(search) ||
                m.code.toLowerCase().includes(search) ||
                m.supplier?.toLowerCase().includes(search)
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(m => m.category === categoryFilter);
        }

        if (showLowStockOnly) {
            filtered = filtered.filter(m => m.stockQuantity <= m.reorderLevel);
        }

        return filtered;
    };

    // Group materials by category
    const getGroupedMaterials = () => {
        const filtered = getFilteredMaterials();
        const groups = {};

        filtered.forEach(material => {
            const cat = material.category || 'OTHER';
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(material);
        });

        return groups;
    };

    // Stats
    const getStats = () => {
        const lowStock = materials.filter(m => m.stockQuantity <= m.reorderLevel);
        const totalValue = materials.reduce((sum, m) => sum + (m.stockQuantity * m.unitCost), 0);
        return {
            total: materials.length,
            lowStock: lowStock.length,
            totalValue
        };
    };

    // Handlers
    const handleAddMaterial = () => {
        setSelectedMaterial(null);
        setFormData({
            name: '',
            nameEn: '',
            code: '',
            category: 'FABRIC',
            type: '',
            colorHex: '#667eea',
            supplier: '',
            stockQuantity: 0,
            stockUnit: 'מטר',
            reorderLevel: 10,
            reorderQuantity: 50,
            unitCost: 0,
            salePrice: 0,
            location: '',
            notes: '',
            isActive: true,
            productIds: []
        });
        setShowAddModal(true);
    };

    const handleEditMaterial = (material) => {
        setSelectedMaterial(material);
        setFormData({
            name: material.name || '',
            nameEn: material.nameEn || '',
            code: material.code || '',
            category: material.category || 'FABRIC',
            type: material.type || '',
            colorHex: material.colorHex || '#667eea',
            supplier: material.supplier || '',
            stockQuantity: material.stockQuantity || 0,
            stockUnit: material.stockUnit || 'מטר',
            reorderLevel: material.reorderLevel || 10,
            reorderQuantity: material.reorderQuantity || 50,
            unitCost: material.unitCost || 0,
            salePrice: material.salePrice || 0,
            location: material.location || '',
            notes: material.notes || '',
            isActive: material.isActive !== false,
            productIds: material.productIds || []
        });
        setShowAddModal(true);
    };

    const handleSaveMaterial = async () => {
        if (!formData.name || !formData.code) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedMaterial) {
                const result = await materialsService.update(selectedMaterial.id, formData);
                if (result.success) {
                    setMaterials(materials.map(m =>
                        m.id === selectedMaterial.id ? { ...m, ...result.data } : m
                    ));
                    showToast(language === 'he' ? 'חומר עודכן בהצלחה' : 'Material updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                const result = await materialsService.create(formData);
                if (result.success) {
                    setMaterials([result.data, ...materials]);
                    showToast(language === 'he' ? 'חומר נוסף בהצלחה' : 'Material added');
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

    const handleDeleteMaterial = async () => {
        try {
            setSaving(true);
            const result = await materialsService.delete(selectedMaterial.id);
            if (result.success) {
                setMaterials(materials.filter(m => m.id !== selectedMaterial.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'חומר נמחק' : 'Material deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenStockModal = (material) => {
        setSelectedMaterial(material);
        setStockAdjustment({ quantity: 0, operation: 'ADD' });
        setShowStockModal(true);
    };

    const handleUpdateStock = async () => {
        if (stockAdjustment.quantity <= 0) {
            showToast(language === 'he' ? 'נא להזין כמות חיובית' : 'Please enter a positive quantity', 'error');
            return;
        }

        try {
            setSaving(true);
            const result = await materialsService.updateStock(
                selectedMaterial.id,
                stockAdjustment.quantity,
                stockAdjustment.operation
            );

            if (result.success) {
                setMaterials(materials.map(m =>
                    m.id === selectedMaterial.id ? result.data : m
                ));
                setShowStockModal(false);
                showToast(language === 'he' ? 'מלאי עודכן' : 'Stock updated');
            } else {
                showToast(result.error?.message || 'Failed to update stock', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to update stock', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (category) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const toggleProductSelection = (productId) => {
        setFormData(prev => ({
            ...prev,
            productIds: prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId]
        }));
    };

    // Get stock status
    const getStockStatus = (material) => {
        if (material.stockQuantity <= material.reorderLevel / 2) {
            return { level: 'critical', color: '#ef4444', label: language === 'he' ? 'קריטי' : 'Critical' };
        }
        if (material.stockQuantity <= material.reorderLevel) {
            return { level: 'low', color: '#f59e0b', label: language === 'he' ? 'נמוך' : 'Low' };
        }
        return { level: 'ok', color: '#10b981', label: language === 'he' ? 'תקין' : 'OK' };
    };

    const stats = getStats();

    // Loading state
    if (loading) {
        return (
            <div className="materials-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען חומרים...' : 'Loading materials...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="materials-page">
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
        <div className="materials-page">
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
            <div className="page-header glass-card">
                <div className="header-info">
                    <div className="page-icon">
                        <Warehouse size={28} />
                    </div>
                    <div>
                        <h1>{language === 'he' ? 'ניהול חומרי גלם' : 'Materials Management'}</h1>
                        <p>{language === 'he' ? 'בדים, חוטים ואביזרים' : 'Fabrics, threads and accessories'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">{language === 'he' ? 'סה"כ חומרים' : 'Total Materials'}</span>
                    </div>
                    <div className={`stat ${stats.lowStock > 0 ? 'warning' : ''}`}>
                        <span className="stat-value">{stats.lowStock}</span>
                        <span className="stat-label">{language === 'he' ? 'מלאי נמוך' : 'Low Stock'}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">₪{stats.totalValue.toLocaleString()}</span>
                        <span className="stat-label">{language === 'he' ? 'שווי מלאי' : 'Inventory Value'}</span>
                    </div>
                </div>

                {canEdit && (
                    <button className="btn btn-primary" onClick={handleAddMaterial}>
                        <Plus size={18} />
                        {language === 'he' ? 'חומר חדש' : 'New Material'}
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="toolbar glass-card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={language === 'he' ? 'חיפוש חומר...' : 'Search materials...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">{language === 'he' ? 'כל הקטגוריות' : 'All Categories'}</option>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                                {language === 'he' ? config.name : config.nameEn}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className={`filter-btn ${showLowStockOnly ? 'active' : ''}`}
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                >
                    <TrendingDown size={16} />
                    {language === 'he' ? 'מלאי נמוך בלבד' : 'Low Stock Only'}
                </button>

                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewType === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewType('grid')}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                        onClick={() => setViewType('list')}
                    >
                        <List size={18} />
                    </button>
                </div>

                <button className="btn btn-outline btn-sm" onClick={fetchData}>
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Materials Grid/List */}
            {Object.entries(getGroupedMaterials()).map(([category, categoryMaterials]) => {
                const config = CATEGORY_CONFIG[category] || { name: category, color: '#667eea' };
                const CategoryIcon = config.icon || Package;
                const isCollapsed = collapsedCategories[category];

                return (
                    <div key={category} className="material-category">
                        <div
                            className="category-header"
                            onClick={() => toggleCategory(category)}
                            style={{ '--category-color': config.color }}
                        >
                            <div className="category-info">
                                <CategoryIcon size={20} />
                                <h3>{language === 'he' ? config.name : config.nameEn}</h3>
                                <span className="category-count">{categoryMaterials.length}</span>
                            </div>
                            <button className="expand-btn">
                                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                            </button>
                        </div>

                        {!isCollapsed && (
                            <div className={`materials-grid ${viewType}`}>
                                {categoryMaterials.map(material => {
                                    const stockStatus = getStockStatus(material);
                                    const isExpanded = expandedMaterial === material.id;

                                    return (
                                        <div
                                            key={material.id}
                                            className={`material-card glass-card ${stockStatus.level}`}
                                        >
                                            <div className="material-header">
                                                <div
                                                    className="material-color"
                                                    style={{ background: material.colorHex || config.color }}
                                                />
                                                <div className="material-info">
                                                    <h4>{material.name}</h4>
                                                    <span className="material-code">{material.code}</span>
                                                </div>
                                                {canEdit && (
                                                    <div className="material-actions">
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => handleEditMaterial(material)}
                                                            title={language === 'he' ? 'עריכה' : 'Edit'}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn danger"
                                                            onClick={() => {
                                                                setSelectedMaterial(material);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            title={language === 'he' ? 'מחיקה' : 'Delete'}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="material-stock">
                                                <div className="stock-info">
                                                    <div className="stock-quantity">
                                                        <span className="quantity">{material.stockQuantity}</span>
                                                        <span className="unit">{material.stockUnit}</span>
                                                    </div>
                                                    <div
                                                        className="stock-status"
                                                        style={{ background: `${stockStatus.color}20`, color: stockStatus.color }}
                                                    >
                                                        {stockStatus.level === 'critical' && <AlertCircle size={12} />}
                                                        {stockStatus.label}
                                                    </div>
                                                </div>
                                                <div className="stock-bar">
                                                    <div
                                                        className="stock-fill"
                                                        style={{
                                                            width: `${Math.min(100, (material.stockQuantity / (material.reorderLevel * 3)) * 100)}%`,
                                                            background: stockStatus.color
                                                        }}
                                                    />
                                                    <div
                                                        className="reorder-line"
                                                        style={{ left: `${(material.reorderLevel / (material.reorderLevel * 3)) * 100}%` }}
                                                    />
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        className="btn btn-sm btn-outline stock-btn"
                                                        onClick={() => handleOpenStockModal(material)}
                                                    >
                                                        <RefreshCw size={14} />
                                                        {language === 'he' ? 'עדכון מלאי' : 'Update Stock'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="material-details">
                                                {material.supplier && (
                                                    <div className="detail-row">
                                                        <Package size={14} />
                                                        <span>{material.supplier}</span>
                                                    </div>
                                                )}
                                                {material.location && (
                                                    <div className="detail-row">
                                                        <MapPin size={14} />
                                                        <span>{material.location}</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <DollarSign size={14} />
                                                    <span>₪{material.unitCost} / {material.stockUnit}</span>
                                                </div>
                                            </div>

                                            {viewType === 'list' && material.productIds?.length > 0 && (
                                                <div className="material-products">
                                                    <span className="products-label">
                                                        {language === 'he' ? 'מוצרים:' : 'Products:'}
                                                    </span>
                                                    {material.productIds.map(pid => {
                                                        const product = products.find(p => p.id === pid);
                                                        return product ? (
                                                            <span key={pid} className="product-tag">
                                                                {product.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {getFilteredMaterials().length === 0 && (
                <div className="empty-state">
                    <Package size={48} />
                    <h3>{language === 'he' ? 'לא נמצאו חומרים' : 'No materials found'}</h3>
                    <p>{language === 'he' ? 'נסה לשנות את הסינון או הוסף חומר חדש' : 'Try changing filters or add a new material'}</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={selectedMaterial
                    ? (language === 'he' ? 'עריכת חומר' : 'Edit Material')
                    : (language === 'he' ? 'חומר חדש' : 'New Material')
                }
                size="large"
            >
                <div className="modal-form material-form">
                    <div className="form-section">
                        <h4>{language === 'he' ? 'פרטים בסיסיים' : 'Basic Info'}</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label><span className="required">*</span>{language === 'he' ? 'שם' : 'Name'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={language === 'he' ? 'שם החומר' : 'Material name'}
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'שם באנגלית' : 'English Name'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.nameEn}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label><span className="required">*</span>{language === 'he' ? 'קוד' : 'Code'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="VLV-BLK-001"
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'קטגוריה' : 'Category'}</label>
                                <select
                                    className="form-input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {language === 'he' ? config.name : config.nameEn}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{language === 'he' ? 'סוג' : 'Type'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    placeholder={language === 'he' ? 'למשל: קטיפה, משי' : 'e.g., velvet, silk'}
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'צבע' : 'Color'}</label>
                                <div className="color-picker">
                                    <input
                                        type="color"
                                        value={formData.colorHex}
                                        onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                                    />
                                    <span>{formData.colorHex}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>{language === 'he' ? 'מלאי ומחירים' : 'Stock & Pricing'}</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{language === 'he' ? 'כמות במלאי' : 'Stock Quantity'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'יחידת מידה' : 'Unit'}</label>
                                <select
                                    className="form-input"
                                    value={formData.stockUnit}
                                    onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                                >
                                    <option value="מטר">{language === 'he' ? 'מטר' : 'Meter'}</option>
                                    <option value="סליל">{language === 'he' ? 'סליל' : 'Spool'}</option>
                                    <option value="יחידה">{language === 'he' ? 'יחידה' : 'Unit'}</option>
                                    <option value="ק״ג">{language === 'he' ? 'ק״ג' : 'KG'}</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{language === 'he' ? 'רף הזמנה מחדש' : 'Reorder Level'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'כמות הזמנה' : 'Reorder Quantity'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.reorderQuantity}
                                    onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{language === 'he' ? 'עלות ליחידה (₪)' : 'Unit Cost (₪)'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.unitCost}
                                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'מחיר מכירה (₪)' : 'Sale Price (₪)'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.salePrice}
                                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>{language === 'he' ? 'ספק ומיקום' : 'Supplier & Location'}</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{language === 'he' ? 'ספק' : 'Supplier'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{language === 'he' ? 'מיקום במחסן' : 'Warehouse Location'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder={language === 'he' ? 'מחסן A - מדף 1' : 'Warehouse A - Shelf 1'}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'הערות' : 'Notes'}</label>
                            <textarea
                                className="form-input"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>{language === 'he' ? 'מוצרים משויכים' : 'Linked Products'}</h4>
                        <p className="form-hint">
                            {language === 'he'
                                ? 'בחר את המוצרים שמשתמשים בחומר זה'
                                : 'Select products that use this material'
                            }
                        </p>
                        <div className="products-selection">
                            {products.map(product => (
                                <label key={product.id} className="product-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.productIds.includes(product.id)}
                                        onChange={() => toggleProductSelection(product.id)}
                                    />
                                    <span className="checkbox-label">{product.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowAddModal(false)}
                            disabled={saving}
                        >
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveMaterial}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'שמור' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Stock Update Modal */}
            <Modal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                title={language === 'he' ? 'עדכון מלאי' : 'Update Stock'}
                size="small"
            >
                <div className="modal-form stock-form">
                    {selectedMaterial && (
                        <>
                            <div className="current-stock">
                                <span className="label">{language === 'he' ? 'מלאי נוכחי:' : 'Current stock:'}</span>
                                <span className="value">
                                    {selectedMaterial.stockQuantity} {selectedMaterial.stockUnit}
                                </span>
                            </div>

                            <div className="form-group">
                                <label>{language === 'he' ? 'פעולה' : 'Operation'}</label>
                                <div className="operation-toggle">
                                    <button
                                        className={`toggle-btn ${stockAdjustment.operation === 'ADD' ? 'active add' : ''}`}
                                        onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'ADD' })}
                                    >
                                        <Plus size={16} />
                                        {language === 'he' ? 'הוספה' : 'Add'}
                                    </button>
                                    <button
                                        className={`toggle-btn ${stockAdjustment.operation === 'SUBTRACT' ? 'active subtract' : ''}`}
                                        onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'SUBTRACT' })}
                                    >
                                        <TrendingDown size={16} />
                                        {language === 'he' ? 'גריעה' : 'Subtract'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{language === 'he' ? 'כמות' : 'Quantity'}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={stockAdjustment.quantity}
                                    onChange={(e) => setStockAdjustment({
                                        ...stockAdjustment,
                                        quantity: Number(e.target.value)
                                    })}
                                    min="0"
                                />
                            </div>

                            <div className="new-stock-preview">
                                <span className="label">{language === 'he' ? 'מלאי חדש:' : 'New stock:'}</span>
                                <span className="value">
                                    {stockAdjustment.operation === 'ADD'
                                        ? selectedMaterial.stockQuantity + stockAdjustment.quantity
                                        : Math.max(0, selectedMaterial.stockQuantity - stockAdjustment.quantity)
                                    } {selectedMaterial.stockUnit}
                                </span>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowStockModal(false)}
                                    disabled={saving}
                                >
                                    {language === 'he' ? 'ביטול' : 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateStock}
                                    disabled={saving || stockAdjustment.quantity <= 0}
                                >
                                    {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                                    {language === 'he' ? 'עדכן' : 'Update'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={language === 'he' ? 'מחיקת חומר' : 'Delete Material'}
                size="small"
            >
                <div className="delete-confirm">
                    <div className="delete-icon">
                        <AlertTriangle size={48} />
                    </div>
                    <p>
                        {language === 'he'
                            ? `האם למחוק את החומר "${selectedMaterial?.name}"?`
                            : `Delete material "${selectedMaterial?.name}"?`
                        }
                    </p>
                    <div className="modal-actions">
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={saving}
                        >
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDeleteMaterial}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? 'מחק' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Materials;
