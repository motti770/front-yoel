import { useState, useEffect } from 'react';
import {
    Plus,
    Sliders,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    Palette,
    Check,
    AlertTriangle,
    Loader2,
    X,
    Link2,
    Eye,
    LayoutGrid,
    List,
    Columns,
    Maximize2,
    Minimize2,
    Square,
    Settings2,
    Package,
    Filter
} from 'lucide-react';
import { parametersService, productsService } from '../services/api';
import Modal from '../components/Modal';
import './Parameters.css';

// View settings stored in localStorage
const VIEW_SETTINGS_KEY = 'parameters_view_settings';
const getDefaultViewSettings = () => ({
    size: 'normal',      // 'compact', 'normal', 'large'
    layout: 'list',      // 'list', 'grid', 'cards'
    showDescriptions: true
});

function Parameters({ currentUser, t, language }) {
    const [parameters, setParameters] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedParam, setExpandedParam] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Grouping & Filtering
    const [selectedProductFilter, setSelectedProductFilter] = useState('all');
    const [collapsedGroups, setCollapsedGroups] = useState({});

    // View settings - loaded from localStorage
    const [viewSettings, setViewSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(VIEW_SETTINGS_KEY);
            return saved ? { ...getDefaultViewSettings(), ...JSON.parse(saved) } : getDefaultViewSettings();
        } catch {
            return getDefaultViewSettings();
        }
    });
    const [showViewSettings, setShowViewSettings] = useState(false);

    // Save view settings to localStorage
    const updateViewSettings = (updates) => {
        const newSettings = { ...viewSettings, ...updates };
        setViewSettings(newSettings);
        localStorage.setItem(VIEW_SETTINGS_KEY, JSON.stringify(newSettings));
    };

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedParam, setSelectedParam] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        type: 'TEXT',
        isRequired: false,
        isActive: true,
        showWhen: null  // { parameterId, optionId } - conditional visibility
    });

    const [optionFormData, setOptionFormData] = useState({
        label: '',
        value: '',
        colorHex: '',
        priceImpact: 0,
        sortOrder: 1
    });

    const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch both parameters and products in parallel
            const [paramsResult, productsResult] = await Promise.all([
                parametersService.getAll({ limit: 100 }),
                productsService.getAll()
            ]);

            if (paramsResult.success) {
                setParameters(paramsResult.data.parameters || []);
            } else {
                setError(paramsResult.error?.message || 'Failed to load parameters');
            }

            if (productsResult.success) {
                // Get only parent products (not variants/design groups)
                const parentProducts = (productsResult.data.products || []).filter(p => !p.parentProductId);
                setProducts(parentProducts);
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Get all product IDs for a parameter (supports both productId and productIds)
    const getParamProductIds = (param) => {
        if (param.productIds && Array.isArray(param.productIds)) {
            return param.productIds;
        }
        if (param.productId) {
            return [param.productId];
        }
        return ['shared']; // No product = shared/general
    };

    // Check if parameter belongs to a product
    const paramBelongsToProduct = (param, productId) => {
        const paramProducts = getParamProductIds(param);
        return paramProducts.includes(productId);
    };

    // Group parameters by product
    const getGroupedParameters = () => {
        // Filter by selected product
        let filtered = parameters;
        if (selectedProductFilter !== 'all') {
            filtered = parameters.filter(p => paramBelongsToProduct(p, selectedProductFilter));
        }

        // Group by productId (shared parameters appear in 'shared' group)
        const groups = {};

        filtered.forEach(param => {
            const productIds = getParamProductIds(param);

            // If filtering by specific product, only show in that product's group
            if (selectedProductFilter !== 'all') {
                if (!groups[selectedProductFilter]) {
                    groups[selectedProductFilter] = [];
                }
                groups[selectedProductFilter].push(param);
            } else {
                // Show in each product group it belongs to
                // But for shared, show in 'shared' group
                if (productIds.includes('shared') || productIds.length > 1) {
                    if (!groups['shared']) {
                        groups['shared'] = [];
                    }
                    groups['shared'].push(param);
                } else {
                    const productId = productIds[0];
                    if (!groups[productId]) {
                        groups[productId] = [];
                    }
                    groups[productId].push(param);
                }
            }
        });

        // Sort: 'shared' first, then products
        const sortedGroups = {};
        if (groups['shared']) {
            sortedGroups['shared'] = groups['shared'];
        }
        Object.keys(groups).filter(k => k !== 'shared').sort().forEach(key => {
            sortedGroups[key] = groups[key];
        });

        return sortedGroups;
    };

    // Get product name by ID
    const getProductName = (productId) => {
        if (productId === 'general' || productId === 'shared') {
            return language === 'he' ? 'משותף לכל המוצרים' : 'Shared';
        }
        const product = products.find(p => p.id === productId);
        return product?.name || productId;
    };

    // Toggle group collapse
    const toggleGroupCollapse = (productId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Parameter handlers
    const handleAddParam = () => {
        setSelectedParam(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            type: 'TEXT',
            isRequired: false,
            isActive: true,
            showWhen: null
        });
        setShowAddModal(true);
    };

    const handleEditParam = (param) => {
        setSelectedParam(param);
        setFormData({
            name: param.name || '',
            code: param.code || '',
            description: param.description || '',
            type: param.type || 'TEXT',
            isRequired: param.isRequired || false,
            isActive: param.isActive !== false,
            showWhen: param.showWhen || null
        });
        setShowAddModal(true);
    };

    // Get parameters that can be used as conditions (same product, has options)
    const getConditionableParams = () => {
        if (!selectedParam) return [];
        const currentProductId = selectedParam.productId;
        return parameters.filter(p =>
            p.id !== selectedParam?.id &&  // Not the current parameter
            p.productId === currentProductId &&  // Same product
            (p.type === 'SELECT' || p.type === 'BOOLEAN' || p.type === 'COLOR') &&  // Has options
            p.options?.length > 0  // Has at least one option
        );
    };

    const handleSaveParam = async () => {
        if (!formData.name || !formData.code) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedParam) {
                const result = await parametersService.update(selectedParam.id, formData);
                if (result.success) {
                    setParameters(parameters.map(p =>
                        p.id === selectedParam.id ? { ...p, ...result.data } : p
                    ));
                    showToast(language === 'he' ? 'פרמטר עודכן' : 'Parameter updated');
                } else {
                    showToast(result.error?.message || 'Failed to update', 'error');
                    return;
                }
            } else {
                const result = await parametersService.create(formData);
                if (result.success) {
                    setParameters([result.data, ...parameters]);
                    showToast(language === 'he' ? 'פרמטר נוסף' : 'Parameter added');
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

    const handleDeleteParam = async () => {
        try {
            setSaving(true);
            const result = await parametersService.delete(selectedParam.id);
            if (result.success) {
                setParameters(parameters.filter(p => p.id !== selectedParam.id));
                setShowDeleteModal(false);
                showToast(language === 'he' ? 'פרמטר נמחק' : 'Parameter deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Option handlers
    const handleAddOption = (param) => {
        setSelectedParam(param);
        setSelectedOption(null);
        const maxOrder = param.options?.length > 0
            ? Math.max(...param.options.map(o => o.sortOrder || 0)) + 1
            : 1;
        setOptionFormData({
            label: '',
            value: '',
            colorHex: '',
            priceImpact: 0,
            sortOrder: maxOrder
        });
        setShowOptionModal(true);
    };

    const handleEditOption = (param, option) => {
        setSelectedParam(param);
        setSelectedOption(option);
        setOptionFormData({
            label: option.label || '',
            value: option.value || '',
            colorHex: option.colorHex || '',
            priceImpact: option.priceImpact || 0,
            sortOrder: option.sortOrder || 1
        });
        setShowOptionModal(true);
    };

    const handleSaveOption = async () => {
        if (!optionFormData.label || !optionFormData.value) {
            showToast(language === 'he' ? 'נא למלא שדות חובה' : 'Please fill required fields', 'error');
            return;
        }

        try {
            setSaving(true);

            if (selectedOption) {
                const result = await parametersService.updateOption(selectedParam.id, selectedOption.id, optionFormData);
                if (result.success) {
                    await fetchData();
                    showToast(language === 'he' ? 'אפשרות עודכנה' : 'Option updated');
                } else {
                    showToast(result.error?.message || 'Failed to update option', 'error');
                    return;
                }
            } else {
                const result = await parametersService.addOption(selectedParam.id, optionFormData);
                if (result.success) {
                    await fetchData();
                    showToast(language === 'he' ? 'אפשרות נוספה' : 'Option added');
                } else {
                    showToast(result.error?.message || 'Failed to add option', 'error');
                    return;
                }
            }
            setShowOptionModal(false);
        } catch (err) {
            showToast(err.error?.message || 'Failed to save option', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOption = async (param, option) => {
        if (!confirm(language === 'he' ? 'למחוק את האפשרות?' : 'Delete this option?')) return;

        try {
            const result = await parametersService.deleteOption(param.id, option.id);
            if (result.success) {
                await fetchData();
                showToast(language === 'he' ? 'אפשרות נמחקה' : 'Option deleted');
            } else {
                showToast(result.error?.message || 'Failed to delete option', 'error');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete option', 'error');
        }
    };

    const typeLabelsI18n = {
        he: { TEXT: 'טקסט', SELECT: 'בחירה', COLOR: 'צבע', NUMBER: 'מספר', DATE: 'תאריך' },
        en: { TEXT: 'Text', SELECT: 'Select', COLOR: 'Color', NUMBER: 'Number', DATE: 'Date' },
        uk: { TEXT: 'Текст', SELECT: 'Вибір', COLOR: 'Колір', NUMBER: 'Число', DATE: 'Дата' }
    };

    const typeLabels = typeLabelsI18n[language] || typeLabelsI18n.he;

    const typeColors = {
        TEXT: '#4facfe',
        SELECT: '#667eea',
        COLOR: '#f5576c',
        NUMBER: '#fee140',
        DATE: '#00f2fe'
    };

    // Loading state
    if (loading) {
        return (
            <div className="parameters-page">
                <div className="loading-container">
                    <Loader2 className="spinner" size={40} />
                    <p>{language === 'he' ? 'טוען פרמטרים...' : 'Loading parameters...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="parameters-page">
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
        <div className="parameters-page">
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
                    <h2>{language === 'he' ? 'פרמטרים' : 'Parameters'}</h2>
                    <p>{parameters.length} {language === 'he' ? 'פרמטרים' : 'parameters'}</p>
                </div>

                <div className="header-actions">
                    {/* Product Filter */}
                    <div className="product-filter">
                        <Filter size={16} />
                        <select
                            value={selectedProductFilter}
                            onChange={(e) => setSelectedProductFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{language === 'he' ? 'כל המוצרים' : 'All Products'}</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Controls */}
                    <div className="view-controls">
                        {/* Size Toggle */}
                        <div className="view-toggle size-toggle">
                            <button
                                className={`toggle-btn ${viewSettings.size === 'compact' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ size: 'compact' })}
                                title={language === 'he' ? 'קומפקטי' : 'Compact'}
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                className={`toggle-btn ${viewSettings.size === 'normal' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ size: 'normal' })}
                                title={language === 'he' ? 'רגיל' : 'Normal'}
                            >
                                <Square size={16} />
                            </button>
                            <button
                                className={`toggle-btn ${viewSettings.size === 'large' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ size: 'large' })}
                                title={language === 'he' ? 'גדול' : 'Large'}
                            >
                                <Maximize2 size={16} />
                            </button>
                        </div>

                        {/* Layout Toggle */}
                        <div className="view-toggle layout-toggle">
                            <button
                                className={`toggle-btn ${viewSettings.layout === 'list' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ layout: 'list' })}
                                title={language === 'he' ? 'רשימה' : 'List'}
                            >
                                <List size={16} />
                            </button>
                            <button
                                className={`toggle-btn ${viewSettings.layout === 'grid' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ layout: 'grid' })}
                                title={language === 'he' ? 'רשת' : 'Grid'}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                className={`toggle-btn ${viewSettings.layout === 'cards' ? 'active' : ''}`}
                                onClick={() => updateViewSettings({ layout: 'cards' })}
                                title={language === 'he' ? 'כרטיסים' : 'Cards'}
                            >
                                <Columns size={16} />
                            </button>
                        </div>
                    </div>

                    {canEdit && (
                        <button className="btn btn-primary" onClick={handleAddParam}>
                            <Plus size={18} />
                            {language === 'he' ? 'פרמטר חדש' : 'New Parameter'}
                        </button>
                    )}
                </div>
            </div>

            {/* Grouped Parameters */}
            {Object.entries(getGroupedParameters()).map(([productId, groupParams]) => (
                <div key={productId} className="parameter-group">
                    {/* Group Header */}
                    <div
                        className="group-header"
                        onClick={() => toggleGroupCollapse(productId)}
                    >
                        <div className="group-info">
                            <Package size={20} />
                            <h3>{getProductName(productId)}</h3>
                            <span className="group-count">{groupParams.length}</span>
                        </div>
                        <button className="expand-btn">
                            {collapsedGroups[productId] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                    </div>

                    {/* Group Content */}
                    {!collapsedGroups[productId] && (
                        <div className={`parameters-list layout-${viewSettings.layout} size-${viewSettings.size}`}>
                            {groupParams.map(param => (
                    <div key={param.id} className="parameter-card glass-card">
                        <div
                            className="param-header"
                            onClick={() => setExpandedParam(expandedParam === param.id ? null : param.id)}
                        >
                            <div className="param-icon" style={{ background: `${typeColors[param.type] || '#667eea'}20`, color: typeColors[param.type] || '#667eea' }}>
                                {param.type === 'COLOR' ? <Palette size={20} /> : <Sliders size={20} />}
                            </div>

                            <div className="param-info">
                                <h3>{param.name}</h3>
                                <p>{param.description || '-'}</p>
                                <div className="param-meta">
                                    <span className="type-badge" style={{ background: `${typeColors[param.type] || '#667eea'}20`, color: typeColors[param.type] || '#667eea' }}>
                                        {typeLabels[param.type] || param.type}
                                    </span>
                                    <span className="code-badge">{param.code}</span>
                                    {param.isRequired && <span className="required-badge">{language === 'he' ? 'חובה' : 'Required'}</span>}
                                    {(param.options?.length || 0) > 0 && <span className="options-count">{param.options.length} {language === 'he' ? 'אפשרויות' : 'options'}</span>}
                                    {param.showWhen && (
                                        <span className="param-condition-badge">
                                            <Link2 size={10} />
                                            {language === 'he' ? 'מותנה' : 'Conditional'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {canEdit && (
                                <div className="param-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="action-btn" onClick={() => handleEditParam(param)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="action-btn danger" onClick={() => { setSelectedParam(param); setShowDeleteModal(true); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}

                            <button className="expand-btn">
                                {expandedParam === param.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {expandedParam === param.id && (
                            <div className="param-options">
                                <h4>{language === 'he' ? 'אפשרויות' : 'Options'}</h4>
                                {(param.options?.length || 0) > 0 ? (
                                    <div className="options-grid">
                                        {param.options.map(option => (
                                            <div key={option.id} className="option-item">
                                                {option.colorHex && (
                                                    <div
                                                        className="option-color"
                                                        style={{ background: option.colorHex }}
                                                    ></div>
                                                )}
                                                <div className="option-info">
                                                    <span className="option-label">{option.label}</span>
                                                    <span className="option-value">{option.value}</span>
                                                </div>
                                                {option.priceImpact !== 0 && (
                                                    <span className={`price-impact ${option.priceImpact > 0 ? 'positive' : 'negative'}`}>
                                                        {option.priceImpact > 0 ? '+' : ''}₪{option.priceImpact}
                                                    </span>
                                                )}
                                                {canEdit && (
                                                    <div className="option-actions">
                                                        <button className="action-btn" onClick={() => handleEditOption(param, option)}><Edit size={14} /></button>
                                                        <button className="action-btn danger" onClick={() => handleDeleteOption(param, option)}><Trash2 size={14} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-options">{language === 'he' ? 'אין אפשרויות' : 'No options'}</p>
                                )}
                                {canEdit && (
                                    <button className="add-option-btn" onClick={() => handleAddOption(param)}>
                                        <Plus size={16} />
                                        {language === 'he' ? 'הוסף אפשרות' : 'Add Option'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                </div>
            )}
            </div>
        ))}

            {parameters.length === 0 && (
                <div className="empty-state">
                    <Sliders size={48} />
                    <p>{language === 'he' ? 'לא נמצאו פרמטרים' : 'No parameters found'}</p>
                </div>
            )}

            {/* Add/Edit Parameter Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedParam ? (language === 'he' ? 'עריכת פרמטר' : 'Edit Parameter') : (language === 'he' ? 'פרמטר חדש' : 'New Parameter')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'שם פרמטר' : 'Name'}</label>
                            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'קוד' : 'Code'}</label>
                            <input type="text" className="form-input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{language === 'he' ? 'סוג' : 'Type'}</label>
                        <select className="form-input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{language === 'he' ? 'תיאור' : 'Description'}</label>
                        <textarea className="form-input" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.isRequired} onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })} />
                            {language === 'he' ? 'שדה חובה' : 'Required field'}
                        </label>
                    </div>

                    {/* Conditional Visibility - showWhen */}
                    {selectedParam && getConditionableParams().length > 0 && (
                        <div className="form-group condition-section">
                            <label>
                                <Eye size={14} style={{ marginLeft: '4px' }} />
                                {language === 'he' ? 'הצג בתנאי' : 'Show When'}
                            </label>
                            <div className="condition-config">
                                <select
                                    className="form-input"
                                    value={formData.showWhen?.parameterId || ''}
                                    onChange={(e) => {
                                        if (e.target.value === '') {
                                            setFormData({ ...formData, showWhen: null });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                showWhen: { parameterId: e.target.value, operator: 'equals', optionId: '' }
                                            });
                                        }
                                    }}
                                >
                                    <option value="">{language === 'he' ? '-- תמיד מוצג --' : '-- Always visible --'}</option>
                                    {getConditionableParams().map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                {formData.showWhen?.parameterId && (
                                    <>
                                        {/* Operator selection */}
                                        <select
                                            className="form-input operator-select"
                                            value={formData.showWhen?.operator || 'equals'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                showWhen: {
                                                    ...formData.showWhen,
                                                    operator: e.target.value,
                                                    optionId: ['exists', 'not_exists'].includes(e.target.value) ? '' : formData.showWhen?.optionId
                                                }
                                            })}
                                        >
                                            <option value="equals">{language === 'he' ? '= שווה ל' : '= equals'}</option>
                                            <option value="not_equals">{language === 'he' ? '≠ שונה מ' : '≠ not equals'}</option>
                                            <option value="exists">{language === 'he' ? '✓ קיים ערך' : '✓ has value'}</option>
                                            <option value="not_exists">{language === 'he' ? '✗ ריק' : '✗ is empty'}</option>
                                        </select>

                                        {/* Value selection - only for equals/not_equals */}
                                        {['equals', 'not_equals'].includes(formData.showWhen?.operator || 'equals') && (
                                            <select
                                                className="form-input"
                                                value={formData.showWhen?.optionId || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    showWhen: { ...formData.showWhen, optionId: e.target.value }
                                                })}
                                            >
                                                <option value="">{language === 'he' ? '-- בחר ערך --' : '-- Select value --'}</option>
                                                {parameters.find(p => p.id === formData.showWhen.parameterId)?.options?.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="condition-hint">
                                {language === 'he'
                                    ? formData.showWhen?.operator === 'exists'
                                        ? 'השדה יוצג כשיש ערך בשדה הנבחר'
                                        : formData.showWhen?.operator === 'not_exists'
                                        ? 'השדה יוצג כשאין ערך בשדה הנבחר'
                                        : formData.showWhen?.operator === 'not_equals'
                                        ? 'השדה יוצג כשהערך שונה מהערך הנבחר'
                                        : 'השדה יוצג כשהערך שווה לערך הנבחר'
                                    : 'This field will show based on the selected condition'}
                            </p>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSaveParam} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'שמור' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Option Modal */}
            <Modal isOpen={showOptionModal} onClose={() => setShowOptionModal(false)} title={selectedOption ? (language === 'he' ? 'עריכת אפשרות' : 'Edit Option') : (language === 'he' ? 'אפשרות חדשה' : 'New Option')}>
                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'תווית' : 'Label'}</label>
                            <input type="text" className="form-input" value={optionFormData.label} onChange={(e) => setOptionFormData({ ...optionFormData, label: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><span className="required">*</span>{language === 'he' ? 'ערך' : 'Value'}</label>
                            <input type="text" className="form-input" value={optionFormData.value} onChange={(e) => setOptionFormData({ ...optionFormData, value: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{language === 'he' ? 'צבע' : 'Color'}</label>
                            <div className="color-picker">
                                <input type="color" value={optionFormData.colorHex || '#667eea'} onChange={(e) => setOptionFormData({ ...optionFormData, colorHex: e.target.value })} />
                                <span>{optionFormData.colorHex || '-'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{language === 'he' ? 'השפעה על מחיר' : 'Price Impact'}</label>
                            <input type="number" className="form-input" value={optionFormData.priceImpact} onChange={(e) => setOptionFormData({ ...optionFormData, priceImpact: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowOptionModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSaveOption} disabled={saving}>
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
                    <p>{language === 'he' ? 'למחוק את פרמטר' : 'Delete parameter'} <strong>{selectedParam?.name}</strong>?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-danger" onClick={handleDeleteParam} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? 'מחק' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Parameters;
