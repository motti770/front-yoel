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
    Loader2,
    ChevronDown,
    ChevronRight,
    Users,
    FolderPlus,
    MoreHorizontal,
    GripVertical,
    Settings,
    GitBranch,
    FileImage,
    Image,
    Upload,
    Sparkles
} from 'lucide-react';
import { productsService, workflowsService } from '../services/api';
import { ViewSwitcher, VIEW_TYPES } from '../components/ViewSwitcher';
import Modal from '../components/Modal';
import ProductDetailModal from '../components/ProductDetailModal';
import GroupedBoard from '../components/GroupedBoard';
import BulkImporter from '../components/BulkImporter';
import './Products.css';

function Products({ currentUser, t, language }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentView, setCurrentView] = useState(VIEW_TYPES.GRID);
    const [workflows, setWorkflows] = useState([]);

    // Groups state - load from localStorage
    const [groups, setGroups] = useState(() => {
        const saved = localStorage.getItem('products-groups');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse groups', e);
            }
        }
        return [
            { id: 'group-1', name: language === 'he' ? 'מוצרים חמים' : 'Hot Products', color: '#f5576c', itemIds: [], collapsed: false },
            { id: 'group-2', name: language === 'he' ? 'מלאי נמוך' : 'Low Stock', color: '#fee140', itemIds: [], collapsed: false },
            { id: 'group-3', name: language === 'he' ? 'מוצרים חדשים' : 'New Products', color: '#00f2fe', itemIds: [], collapsed: false }
        ];
    });
    const [showGroupView, setShowGroupView] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Bulk selection state
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Hierarchical view state
    const [expandedProducts, setExpandedProducts] = useState(new Set());
    const [allProductsData, setAllProductsData] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: 'RITUAL',
        status: 'ACTIVE',
        workflowId: ''
    });

    // Fetch products and workflows
    useEffect(() => {
        fetchProducts();
        fetchWorkflows();
    }, []);

    // Save groups to localStorage when they change
    useEffect(() => {
        localStorage.setItem('products-groups', JSON.stringify(groups));
    }, [groups]);

    const fetchWorkflows = async () => {
        try {
            const result = await workflowsService.getActive();
            if (result.success) {
                setWorkflows(result.data.workflows || []);
            }
        } catch (err) {
            console.error('Failed to fetch workflows:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const result = await productsService.getAll({ limit: 500 });
            if (result.success) {
                const allProducts = result.data.products || [];
                setAllProductsData(allProducts);
                // Show only base products (no parent) in main view
                const baseProducts = allProducts.filter(p => !p.parentProductId);
                setProducts(baseProducts);
            } else {
                setError(result.error?.message || 'Failed to load products');
            }
        } catch (err) {
            setError(err.error?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Get child products (design groups or variations)
    const getChildProducts = (parentId) => {
        return allProductsData.filter(p => p.parentProductId === parentId);
    };

    // Toggle expand/collapse for a product
    const toggleProductExpand = (productId, e) => {
        e.stopPropagation();
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Count children for a product
    const getChildCount = (productId) => {
        return allProductsData.filter(p => p.parentProductId === productId).length;
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

    const statusColors = {
        ACTIVE: '#00f2fe',
        DISCONTINUED: '#f5576c'
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
            status: product.status || 'ACTIVE',
            workflowId: product.workflowId || ''
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

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    // Bulk selection handlers
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const handleBulkDelete = async () => {
        try {
            setSaving(true);
            let successCount = 0;
            let failCount = 0;

            for (const productId of selectedProducts) {
                try {
                    const result = await productsService.delete(productId);
                    if (result.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    failCount++;
                }
            }

            // Refresh products list
            await fetchProducts();

            setSelectedProducts([]);
            setShowBulkDeleteModal(false);

            if (failCount === 0) {
                showToast(language === 'he' ? `${successCount} מוצרים נמחקו בהצלחה` : `${successCount} products deleted successfully`);
            } else {
                const message = language === 'he'
                    ? `${successCount} נמחקו בהצלחה. ${failCount} לא ניתן למחוק (ככל הנראה יש להם הזמנות קיימות)`
                    : `${successCount} deleted successfully. ${failCount} couldn't be deleted (likely have existing orders)`;
                showToast(message, 'warning');
            }
        } catch (err) {
            showToast(err.error?.message || 'Failed to delete products', 'error');
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

    // Demo data for products
    const demoProductNames = [
        'פרוכת לארון קודש - דגם מלכות',
        'מעיל לספר תורה - דגם הדר',
        'כיסוי בימה - דגם קלאסי',
        'פרוכת - דגם ירושלים',
        'מעיל תורה - דגם פרימיום',
        'כיסוי לתיבה - דגם מהודר',
        'פרוכת מודרנית - דגם אופק',
        'מעיל תורה - דגם מסורת'
    ];

    const demoDescriptions = [
        'עבודת יד מקצועית, רקמה ידנית על קטיפה איכותית',
        'רקמה מוזהבת על בד איכותי, כולל כיתוב מותאם אישית',
        'עיצוב קלאסי עם עיטורים מסורתיים, מתאים לכל בית כנסת',
        'שילוב של מודרני ומסורתי, צבעים עזים וייחודיים',
        'עבודה מקצועית בסטנדרטים הגבוהים ביותר',
        'מותאם אישית לפי מידות ודרישות הלקוח'
    ];

    const fillDemoProduct = () => {
        const counter = parseInt(localStorage.getItem('demoProductCounter') || '0') + 1;
        localStorage.setItem('demoProductCounter', counter.toString());

        const categories = ['RITUAL', 'FURNITURE', 'PERSONAL'];
        const randomName = demoProductNames[counter % demoProductNames.length];
        const randomDesc = demoDescriptions[counter % demoDescriptions.length];
        const randomCategory = categories[counter % categories.length];
        const randomPrice = 3000 + (counter * 500) + Math.floor(Math.random() * 2000);
        const randomStock = Math.floor(Math.random() * 50) + 1;
        const randomWorkflow = workflows.length > 0 ? workflows[counter % workflows.length] : null;

        setFormData({
            name: `${randomName} #${counter}`,
            sku: `PRD-${String(counter).padStart(4, '0')}`,
            description: randomDesc,
            price: randomPrice.toString(),
            stockQuantity: randomStock.toString(),
            category: randomCategory,
            status: 'ACTIVE',
            workflowId: randomWorkflow?.id || ''
        });

        showToast(`מילוי דמו מוצר #${counter}`, 'success');
    };

    // Group handlers
    const addGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup = {
            id: `group-${Date.now()}`,
            name: newGroupName,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            productIds: [],
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

    const moveProductToGroup = (productId, targetGroupId) => {
        setGroups(groups.map(g => ({
            ...g,
            productIds: g.id === targetGroupId
                ? [...g.productIds.filter(id => id !== productId), productId]
                : g.productIds.filter(id => id !== productId)
        })));
        showToast(language === 'he' ? 'מוצר הועבר לקבוצה' : 'Product moved');
    };

    const deleteGroup = (groupId) => {
        setGroups(groups.filter(g => g.id !== groupId));
        showToast(language === 'he' ? 'קבוצה נמחקה' : 'Group deleted');
    };

    // Drag & Drop handlers
    const handleDragStart = (e, productId) => {
        setDraggedProduct(productId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, groupId) => {
        e.preventDefault();
        if (draggedProduct) {
            moveProductToGroup(draggedProduct, groupId);
            setDraggedProduct(null);
        }
    };

    // Get ungrouped products
    const getUngroupedProducts = () => {
        const allGroupedIds = groups.flatMap(g => g.productIds);
        return filteredProducts.filter(p => !allGroupedIds.includes(p.id));
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

    // Render functions for different views

    // TABLE VIEW
    const renderTableView = () => (
        <div className="table-container glass-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" /></th>
                        <th>{language === 'he' ? 'שם מוצר' : 'Product Name'}</th>
                        <th>SKU</th>
                        <th>{language === 'he' ? 'קטגוריה' : 'Category'}</th>
                        <th>{language === 'he' ? 'מחיר' : 'Price'}</th>
                        <th>{language === 'he' ? 'מלאי' : 'Stock'}</th>
                        <th>{language === 'he' ? 'סטטוס' : 'Status'}</th>
                        <th>{language === 'he' ? 'פעולות' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id}>
                            <td><input type="checkbox" /></td>
                            <td>
                                <div className="product-name-cell">
                                    <div className="product-icon-small">
                                        <Package size={16} />
                                    </div>
                                    <span>{product.name}</span>
                                </div>
                            </td>
                            <td className="font-mono">{product.sku}</td>
                            <td>
                                <span
                                    className="category-badge"
                                    style={{
                                        background: `${categoryColors[product.category]}20`,
                                        color: categoryColors[product.category]
                                    }}
                                >
                                    {categoryLabels[product.category] || product.category}
                                </span>
                            </td>
                            <td className="font-bold">${(product.price || 0).toLocaleString()}</td>
                            <td>
                                <span className={`stock-badge ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                    {product.stockQuantity || 0}
                                </span>
                            </td>
                            <td>
                                <span className="status-dot-label">
                                    <span className={`status-dot ${product.status === 'ACTIVE' ? 'active' : 'inactive'}`}></span>
                                    {statusLabels[product.status]}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => handleView(product)}><Eye size={14} /></button>
                                    <button className="action-btn" onClick={() => handleEdit(product)}><Edit size={14} /></button>
                                    <button className="action-btn danger" onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}><Trash2 size={14} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Render a single product card (reusable)
    const renderProductCard = (product, level = 0) => {
        const childCount = getChildCount(product.id);
        const isExpanded = expandedProducts.has(product.id);
        const children = isExpanded ? getChildProducts(product.id) : [];

        return (
            <div key={product.id} className={`product-hierarchy-item level-${level}`}>
                <div
                    className={`product-card glass-card ${isExpanded ? 'expanded' : ''} ${childCount > 0 ? 'has-children' : ''}`}
                    onClick={() => handleView(product)}
                >
                    {/* Expand/Collapse button for products with children */}
                    {childCount > 0 && (
                        <button
                            className="expand-btn"
                            onClick={(e) => toggleProductExpand(product.id, e)}
                        >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            <span className="child-count">{childCount}</span>
                        </button>
                    )}

                    <div className="product-card-checkbox" onClick={(e) => { e.stopPropagation(); toggleProductSelection(product.id); }}>
                        <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => {}}
                        />
                    </div>

                    <div className="product-icon-wrapper">
                        <Package size={level === 0 ? 32 : 24} />
                    </div>

                    <div className="product-content">
                        <div className="product-header">
                            <h3 className="product-name">{product.name}</h3>
                            {product.catalogCode && (
                                <span className="product-code">{product.catalogCode}</span>
                            )}
                        </div>

                        <p className="product-description">{product.description || '-'}</p>

                        {product.basePrice && (
                            <div className="product-price">
                                ₪{product.basePrice?.toLocaleString()}
                            </div>
                        )}

                        {product.isDesignGroup && (
                            <span className="design-group-badge">
                                {language === 'he' ? 'קבוצת עיצוב' : 'Design Group'}
                            </span>
                        )}

                        {product.colorScheme && (
                            <span className="variation-badge">
                                {product.colorScheme}
                            </span>
                        )}
                    </div>

                    <div className="product-actions">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleView(product); }} title={language === 'he' ? 'צפייה' : 'View'}>
                            <Eye size={16} />
                        </button>
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(product); }} title={language === 'he' ? 'עריכה' : 'Edit'}>
                            <Edit size={16} />
                        </button>
                    </div>
                </div>

                {/* Render children when expanded - as thumbnail grid */}
                {isExpanded && children.length > 0 && (
                    <div className="product-children-grid">
                        {children.map(child => {
                            const grandChildCount = getChildCount(child.id);
                            const isChildExpanded = expandedProducts.has(child.id);
                            const grandChildren = isChildExpanded ? getChildProducts(child.id) : [];

                            return (
                                <div key={child.id} className="child-thumbnail-wrapper">
                                    <div
                                        className={`child-thumbnail-card ${grandChildCount > 0 ? 'has-children' : ''} ${isChildExpanded ? 'expanded' : ''}`}
                                        onClick={() => handleView(child)}
                                    >
                                        {/* Thumbnail Image */}
                                        <div className="child-thumbnail-image">
                                            {child.imageUrl ? (
                                                <img src={child.imageUrl} alt={child.name} />
                                            ) : (
                                                <div className="child-thumbnail-placeholder">
                                                    {child.isDesignGroup ? (
                                                        <Layers size={24} />
                                                    ) : (
                                                        <FileImage size={24} />
                                                    )}
                                                    {child.catalogCode && (
                                                        <span className="thumbnail-letter">
                                                            {child.catalogCode.split('-')[1] || child.catalogCode.slice(-2)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {grandChildCount > 0 && (
                                                <button
                                                    className="expand-child-btn"
                                                    onClick={(e) => toggleProductExpand(child.id, e)}
                                                >
                                                    {isChildExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    <span>{grandChildCount}</span>
                                                </button>
                                            )}
                                        </div>
                                        {/* Thumbnail Info */}
                                        <div className="child-thumbnail-info">
                                            <span className="child-thumbnail-code">{child.catalogCode || child.name}</span>
                                            {child.colorScheme && (
                                                <span className="child-thumbnail-scheme">{child.colorScheme}</span>
                                            )}
                                            {child.basePrice && (
                                                <span className="child-thumbnail-price">₪{child.basePrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grand children (variations) */}
                                    {isChildExpanded && grandChildren.length > 0 && (
                                        <div className="grandchild-grid">
                                            {grandChildren.map(grandChild => (
                                                <div
                                                    key={grandChild.id}
                                                    className="grandchild-card"
                                                    onClick={() => handleView(grandChild)}
                                                >
                                                    <div className="grandchild-image">
                                                        {grandChild.imageUrl ? (
                                                            <img src={grandChild.imageUrl} alt={grandChild.name} />
                                                        ) : (
                                                            <div className="grandchild-placeholder">
                                                                <span className="grandchild-letter">
                                                                    {grandChild.catalogCode?.split('-')[1] || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grandchild-info">
                                                        <span className="grandchild-code">{grandChild.catalogCode}</span>
                                                        {grandChild.colorScheme && (
                                                            <span className="grandchild-scheme">{grandChild.colorScheme}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // GRID VIEW - Hierarchical
    const renderGridView = () => (
        <div className="products-hierarchy">
            {filteredProducts.map(product => renderProductCard(product, 0))}
        </div>
    );

    // GRID VIEW OLD (keeping for reference)
    const renderGridViewOld = () => (
        <div className="products-grid">
            {filteredProducts.map(product => (
                <div key={product.id} className="product-card glass-card" onClick={() => handleView(product)}>
                    <div className="product-card-checkbox" onClick={(e) => { e.stopPropagation(); toggleProductSelection(product.id); }}>
                        <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => {}}
                        />
                    </div>
                    <div className={`product-image ${product.imageUrl ? 'has-image' : ''}`}>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="product-icon-fallback" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                            <Package size={48} />
                        </div>
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
                                <span className="meta-value price">${parseFloat(product.price || 0).toLocaleString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">{language === 'he' ? 'מלאי' : 'Stock'}</span>
                                <span className={`meta-value stock ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                    {product.stockQuantity || 0}
                                </span>
                            </div>
                        </div>

                        {/* Feature Badges - Parameters, Workflow, Files */}
                        <div className="product-features">
                            {product.parameterAssignments && product.parameterAssignments.length > 0 && (
                                <div className="feature-badge parameters" title={language === 'he' ? 'פרמטרים' : 'Parameters'}>
                                    <Settings size={12} />
                                    <span>{product.parameterAssignments.length}</span>
                                </div>
                            )}
                            {product.workflowId && (
                                <div className="feature-badge workflow" title={language === 'he' ? 'תהליך ייצור' : 'Workflow'}>
                                    <GitBranch size={12} />
                                </div>
                            )}
                            {product.workflow && (
                                <div className="workflow-tag">
                                    <Layers size={14} />
                                    {product.workflow.name}
                                </div>
                            )}
                        </div>

                        <div className="product-actions">
                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleView(product); }} title={language === 'he' ? 'צפייה' : 'View'}>
                                <Eye size={16} />
                            </button>
                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(product); }} title={language === 'he' ? 'עריכה' : 'Edit'}>
                                <Edit size={16} />
                            </button>
                            <button className="action-btn danger" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowDeleteModal(true); }} title={language === 'he' ? 'מחיקה' : 'Delete'}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // LIST VIEW
    const renderListView = () => (
        <div className="products-list">
            {filteredProducts.map(product => (
                <div key={product.id} className="product-list-item glass-card" onClick={() => handleView(product)}>
                    <div className="list-item-main">
                        <div className="product-icon-wrapper">
                            <Package size={24} />
                        </div>
                        <div className="list-item-content">
                            <div className="list-item-header">
                                <h3>{product.name}</h3>
                                <span className="product-sku">{product.sku}</span>
                            </div>
                            <p className="list-item-desc">{product.description || '-'}</p>
                        </div>
                    </div>

                    <div className="list-item-meta">
                        <span
                            className="category-badge"
                            style={{
                                background: `${categoryColors[product.category]}20`,
                                color: categoryColors[product.category]
                            }}
                        >
                            {categoryLabels[product.category] || product.category}
                        </span>

                        <div className="list-item-stat">
                            <span className="list-label">{language === 'he' ? 'מלאי' : 'Stock'}</span>
                            <span className={`stock-value ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                {product.stockQuantity || 0}
                            </span>
                        </div>

                        <div className="list-item-price">
                            ${(product.price || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // KANBAN VIEW (By Category)
    const renderKanbanView = () => {
        const categories = ['RITUAL', 'FURNITURE', 'PERSONAL'];

        return (
            <div className="kanban-board">
                {categories.map(category => (
                    <div key={category} className="kanban-column">
                        <div className="kanban-header" style={{ borderColor: categoryColors[category] }}>
                            <span style={{ color: categoryColors[category] }}>
                                {categoryLabels[category]}
                            </span>
                            <span className="count">
                                {filteredProducts.filter(p => p.category === category).length}
                            </span>
                        </div>
                        <div className="kanban-cards">
                            {filteredProducts.filter(p => p.category === category).map(product => (
                                <div
                                    key={product.id}
                                    className="kanban-card product-kanban"
                                    onClick={() => handleView(product)}
                                >
                                    <div className="kanban-card-header">
                                        <span className="product-sku">{product.sku}</span>
                                        {product.stockQuantity === 0 && <AlertTriangle size={12} color="#ff6b6b" />}
                                    </div>
                                    <div className="kanban-card-title">{product.name}</div>
                                    <div className="kanban-card-footer">
                                        <span className="price">${(product.price || 0).toLocaleString()}</span>
                                        <span className={`stock ${product.stockQuantity <= 3 ? 'low' : ''}`}>
                                            {language === 'he' ? 'מלאי:' : 'Stock:'} {product.stockQuantity || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // GROUPS VIEW - Monday.com style
    const renderGroupsView = () => (
        <div className="groups-view">
            {groups.map(group => (
                <div
                    key={group.id}
                    className="group-section"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, group.id)}
                >
                    <div className="group-header" style={{ borderColor: group.color }}>
                        <button className="collapse-btn" onClick={() => toggleGroupCollapse(group.id)}>
                            {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="group-color" style={{ background: group.color }} />
                        <span className="group-name">{group.name}</span>
                        <span className="group-count">{group.productIds.length}</span>
                        <button className="group-menu" onClick={() => deleteGroup(group.id)}>
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {!group.collapsed && (
                        <div className="group-content">
                            {group.productIds.length === 0 ? (
                                <div className="empty-group">
                                    {language === 'he' ? 'גרור מוצרים לכאן' : 'Drag products here'}
                                </div>
                            ) : (
                                <table className="group-table">
                                    <tbody>
                                        {group.productIds.map(productId => {
                                            const product = products.find(p => p.id === productId);
                                            if (!product) return null;
                                            return (
                                                <tr
                                                    key={product.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, product.id)}
                                                >
                                                    <td className="drag-handle"><GripVertical size={14} /></td>
                                                    <td className="product-cell">
                                                        <Package size={14} />
                                                        <span>{product.name}</span>
                                                    </td>
                                                    <td className="sku-cell">{product.sku}</td>
                                                    <td className="price-cell">${(product.price || 0).toLocaleString()}</td>
                                                    <td className="stock-cell">
                                                        <span className={`stock-badge ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                                            {product.stockQuantity || 0}
                                                        </span>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="action-btn" onClick={() => handleView(product)}><Eye size={14} /></button>
                                                        <button className="action-btn" onClick={() => handleEdit(product)}><Edit size={14} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Ungrouped Products */}
            <div
                className="group-section ungrouped"
                onDragOver={handleDragOver}
                onDrop={(e) => {
                    e.preventDefault();
                    if (draggedProduct) {
                        setGroups(groups.map(g => ({
                            ...g,
                            productIds: g.productIds.filter(id => id !== draggedProduct)
                        })));
                        setDraggedProduct(null);
                    }
                }}
            >
                <div className="group-header" style={{ borderColor: '#8888a0' }}>
                    <div className="group-color" style={{ background: '#8888a0' }} />
                    <span className="group-name">{language === 'he' ? 'ללא קבוצה' : 'Ungrouped'}</span>
                    <span className="group-count">{getUngroupedProducts().length}</span>
                </div>
                <div className="group-content">
                    <table className="group-table">
                        <tbody>
                            {getUngroupedProducts().map(product => (
                                <tr
                                    key={product.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, product.id)}
                                >
                                    <td className="drag-handle"><GripVertical size={14} /></td>
                                    <td className="product-cell">
                                        <Package size={14} />
                                        <span>{product.name}</span>
                                    </td>
                                    <td className="sku-cell">{product.sku}</td>
                                    <td className="price-cell">${(product.price || 0).toLocaleString()}</td>
                                    <td className="stock-cell">
                                        <span className={`stock-badge ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                            {product.stockQuantity || 0}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn" onClick={() => handleView(product)}><Eye size={14} /></button>
                                        <button className="action-btn" onClick={() => handleEdit(product)}><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render a single product item (used by GroupedBoard)
    const renderProductItem = (product) => (
        <div className="group-item-content" onClick={() => handleView(product)}>
            <div className="item-main">
                <div className="product-row">
                    <div className={`product-thumb ${product.imageUrl ? 'has-image' : ''}`}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                        ) : (
                            <Package size={20} />
                        )}
                    </div>
                    <div className="product-info-compact">
                        <span className="product-name">{product.name}</span>
                        <span className="product-sku">{product.sku}</span>
                    </div>
                </div>
            </div>
            <div className="item-meta">
                <span className="product-category">{categoryLabels[product.category] || product.category}</span>
                <span className="product-price">₪{(product.price || 0).toLocaleString()}</span>
                <span className={`stock-badge ${(product.stockQuantity || 0) === 0 ? 'out' : (product.stockQuantity || 0) < 10 ? 'low' : ''}`}>
                    {product.stockQuantity || 0} {language === 'he' ? 'יחידות' : 'units'}
                </span>
                <span
                    className="status-badge"
                    style={{ background: `${statusColors[product.status]}20`, color: statusColors[product.status] }}
                >
                    {statusLabels[product.status] || product.status}
                </span>
                <div className="action-buttons">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(product); }}><Edit size={14} /></button>
                    <button className="action-btn danger" onClick={(e) => { e.stopPropagation(); handleDeleteClick(product); }}><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        // If group view is active, use GroupedBoard
        if (showGroupView) {
            return (
                <GroupedBoard
                    items={filteredProducts}
                    groups={groups}
                    onGroupsChange={setGroups}
                    renderItem={renderProductItem}
                    itemIdField="id"
                    language={language}
                    emptyStateIcon={<Package size={48} />}
                    emptyStateText={language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}
                />
            );
        }

        // Otherwise, render based on currentView
        switch (currentView) {
            case VIEW_TYPES.TABLE:
                return renderTableView();
            case VIEW_TYPES.LIST:
                return renderListView();
            case VIEW_TYPES.KANBAN:
                return renderKanbanView();
            case VIEW_TYPES.GRID:
            default:
                return renderGridView();
        }
    };

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
                    <p>
                        {filteredProducts.length} {t?.('products') || 'products'}
                        {selectedProducts.length > 0 && ` • ${selectedProducts.length} ${language === 'he' ? 'נבחרו' : 'selected'}`}
                    </p>
                </div>
                <div className="header-actions">
                    {selectedProducts.length > 0 && (
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowBulkDeleteModal(true)}
                        >
                            <Trash2 size={18} />
                            {language === 'he' ? `מחק ${selectedProducts.length} נבחרים` : `Delete ${selectedProducts.length} selected`}
                        </button>
                    )}
                    <button
                        className={`btn btn-outline groups-btn ${showGroupView ? 'active' : ''}`}
                        onClick={() => setShowGroupView(!showGroupView)}
                    >
                        <Users size={18} />
                        {language === 'he' ? 'קבוצות' : 'Groups'}
                    </button>
                    {showGroupView && (
                        <button className="btn btn-outline" onClick={() => setShowAddGroupModal(true)}>
                            <FolderPlus size={18} />
                            {language === 'he' ? 'קבוצה חדשה' : 'New Group'}
                        </button>
                    )}
                    {!showGroupView && (
                        <ViewSwitcher
                            currentView={currentView}
                            onViewChange={setCurrentView}
                            language={language}
                            availableViews={[VIEW_TYPES.GRID, VIEW_TYPES.TABLE, VIEW_TYPES.LIST, VIEW_TYPES.KANBAN]}
                        />
                    )}
                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
                            <Upload size={18} />
                            {language === 'he' ? 'ייבוא' : 'Import'}
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={18} />
                            {language === 'he' ? 'מוצר חדש' : 'New Product'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="toolbar glass-card">
                <div className="toolbar-right">
                    <div className="select-all-checkbox" style={{ marginRight: '1rem' }}>
                        <input
                            type="checkbox"
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={toggleSelectAll}
                        />
                        <label>{language === 'he' ? 'בחר הכל' : 'Select All'}</label>
                    </div>
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

            {/* Products Content */}
            {renderContent()}

            {filteredProducts.length === 0 && (
                <div className="empty-state">
                    <Package size={48} />
                    <p>{language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}</p>
                </div>
            )}

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
                    <div className="form-group">
                        <label>
                            <GitBranch size={16} style={{ marginLeft: '0.5rem' }} />
                            {language === 'he' ? 'תהליך ייצור' : 'Workflow'}
                        </label>
                        <select
                            className="form-select"
                            value={formData.workflowId}
                            onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
                        >
                            <option value="">{language === 'he' ? '-- בחר תהליך --' : '-- Select Workflow --'}</option>
                            {workflows.map(wf => (
                                <option key={wf.id} value={wf.id}>{wf.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        {!selectedProduct && (
                            <button className="btn btn-outline demo-btn" onClick={fillDemoProduct} type="button">
                                <Sparkles size={16} />
                                Demo
                            </button>
                        )}
                        <button className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>{language === 'he' ? 'ביטול' : 'Cancel'}</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                            {language === 'he' ? 'שמור' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Modal - New Tabbed Modal */}
            <ProductDetailModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                product={selectedProduct}
                language={language}
                onEdit={(product) => {
                    setShowViewModal(false);
                    handleEdit(product);
                }}
                onDelete={(product) => {
                    setShowViewModal(false);
                    setSelectedProduct(product);
                    setShowDeleteModal(true);
                }}
            />

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

            {/* Bulk Delete Modal */}
            <Modal isOpen={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title={language === 'he' ? 'מחיקה מרובה' : 'Bulk Delete'} size="small">
                <div className="delete-confirm">
                    <div className="delete-icon"><AlertTriangle size={48} /></div>
                    <p>
                        {language === 'he'
                            ? `האם אתה בטוח שברצונך למחוק ${selectedProducts.length} מוצרים?`
                            : `Are you sure you want to delete ${selectedProducts.length} products?`}
                    </p>
                    <p style={{ fontSize: '0.9em', color: '#888', marginTop: '0.5rem' }}>
                        {language === 'he' ? 'פעולה זו אינה ניתנת לביטול' : 'This action cannot be undone'}
                    </p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowBulkDeleteModal(false)} disabled={saving}>
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button className="btn btn-danger" onClick={handleBulkDelete} disabled={saving}>
                            {saving ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
                            {language === 'he' ? `מחק ${selectedProducts.length}` : `Delete ${selectedProducts.length}`}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Group Modal */}
            <Modal isOpen={showAddGroupModal} onClose={() => setShowAddGroupModal(false)} title={language === 'he' ? 'קבוצה חדשה' : 'New Group'} size="small">
                <div className="modal-form">
                    <div className="form-group">
                        <label>{language === 'he' ? 'שם הקבוצה' : 'Group Name'}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder={language === 'he' ? 'הכנס שם לקבוצה...' : 'Enter group name...'}
                        />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setShowAddGroupModal(false)}>
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button className="btn btn-primary" onClick={addGroup}>
                            <FolderPlus size={16} />
                            {language === 'he' ? 'צור קבוצה' : 'Create Group'}
                        </button>
                    </div>
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
                    entityType="products"
                    targetFields={[
                        { key: 'name', label: language === 'he' ? 'שם מוצר' : 'Product Name', type: 'text', required: true },
                        { key: 'sku', label: language === 'he' ? 'מק"ט' : 'SKU', type: 'text', required: true },
                        { key: 'price', label: language === 'he' ? 'מחיר' : 'Price', type: 'number', required: true },
                        { key: 'stockQuantity', label: language === 'he' ? 'מלאי' : 'Stock', type: 'number', required: false },
                        { key: 'description', label: language === 'he' ? 'תיאור' : 'Description', type: 'text', required: false },
                        { key: 'category', label: language === 'he' ? 'קטגוריה' : 'Category', type: 'select', required: false }
                    ]}
                    onImport={async (data) => {
                        const result = await productsService.create(data);
                        if (!result.success) throw new Error(result.error?.message);
                        return result.data;
                    }}
                    language={language}
                    onClose={() => {
                        setShowImportModal(false);
                        fetchProducts(); // Refresh data after import
                    }}
                />
            </Modal>
        </div>
    );
}

export default Products;
