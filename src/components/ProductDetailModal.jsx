import { useState, useEffect } from 'react';
import {
    Package,
    Settings,
    GitBranch,
    FileImage,
    History,
    Boxes,
    X,
    Loader2,
    Eye,
    Edit,
    Trash2,
    Plus,
    Upload,
    ExternalLink,
    AlertTriangle,
    Check,
    ChevronRight
} from 'lucide-react';
import Modal from './Modal';
import { productsService, filesService, workflowsService } from '../services/api';
import './ProductDetailModal.css';

const TABS = {
    DETAILS: 'details',
    PARAMETERS: 'parameters',
    WORKFLOW: 'workflow',
    FILES: 'files',
    SUBPRODUCTS: 'subproducts',
    HISTORY: 'history'
};

function ProductDetailModal({
    isOpen,
    onClose,
    product,
    language = 'he',
    onEdit,
    onDelete
}) {
    const [activeTab, setActiveTab] = useState(TABS.DETAILS);
    const [productDetails, setProductDetails] = useState(null);
    const [files, setFiles] = useState([]);
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Labels
    const labels = {
        he: {
            details: 'פרטים',
            parameters: 'פרמטרים',
            workflow: 'תהליך ייצור',
            files: 'קבצים וציורים',
            subproducts: 'תתי-מוצרים',
            history: 'היסטוריה',
            basePrice: 'מחיר בסיס',
            priceRange: 'טווח מחירים',
            stock: 'מלאי',
            category: 'קטגוריה',
            status: 'סטטוס',
            description: 'תיאור',
            noParameters: 'אין פרמטרים מוקצים למוצר זה',
            noWorkflow: 'אין תהליך ייצור מחובר',
            noFiles: 'אין קבצים מצורפים',
            noSubproducts: 'אין תתי-מוצרים',
            uploadFile: 'העלאת קובץ',
            required: 'חובה',
            optional: 'אופציונלי',
            priceImpact: 'השפעה על מחיר',
            step: 'שלב',
            department: 'מחלקה',
            estimatedDays: 'ימים משוערים',
            edit: 'עריכה',
            delete: 'מחיקה',
            close: 'סגור',
            options: 'אופציות'
        },
        en: {
            details: 'Details',
            parameters: 'Parameters',
            workflow: 'Workflow',
            files: 'Files & Drawings',
            subproducts: 'Sub-Products',
            history: 'History',
            basePrice: 'Base Price',
            priceRange: 'Price Range',
            stock: 'Stock',
            category: 'Category',
            status: 'Status',
            description: 'Description',
            noParameters: 'No parameters assigned to this product',
            noWorkflow: 'No workflow connected',
            noFiles: 'No files attached',
            noSubproducts: 'No sub-products',
            uploadFile: 'Upload File',
            required: 'Required',
            optional: 'Optional',
            priceImpact: 'Price Impact',
            step: 'Step',
            department: 'Department',
            estimatedDays: 'Estimated Days',
            edit: 'Edit',
            delete: 'Delete',
            close: 'Close',
            options: 'Options'
        }
    };

    const t = (key) => labels[language]?.[key] || labels.en[key] || key;

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

    // Fetch product details when opened
    useEffect(() => {
        if (isOpen && product?.id) {
            fetchProductDetails();
        }
    }, [isOpen, product?.id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);

            // Fetch product details
            const productResult = await productsService.getById(product.id);
            if (productResult.success) {
                setProductDetails(productResult.data);
            }

            // Fetch files for this product
            const filesResult = await filesService.getAll({
                entityType: 'PRODUCT',
                entityId: product.id
            });
            if (filesResult.success) {
                setFiles(filesResult.data.files || []);
            }

            // Fetch workflow if product has one
            if (product.workflowId) {
                const workflowResult = await workflowsService.getById(product.workflowId);
                if (workflowResult.success) {
                    setWorkflow(workflowResult.data);
                }
            }

        } catch (err) {
            console.error('Failed to fetch product details:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate price range based on parameters
    const calculatePriceRange = () => {
        const basePrice = parseFloat(product?.price) || 0;
        let minExtra = 0;
        let maxExtra = 0;

        if (productDetails?.parameterAssignments) {
            productDetails.parameterAssignments.forEach(assignment => {
                const options = assignment.parameter?.options || [];
                if (options.length > 0) {
                    const impacts = options.map(o => parseFloat(o.priceImpact) || 0);
                    minExtra += Math.min(...impacts);
                    maxExtra += Math.max(...impacts);
                }
            });
        }

        return {
            min: basePrice + minExtra,
            max: basePrice + maxExtra
        };
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const result = await filesService.upload(file, 'PRODUCT', product.id);
            if (result.success) {
                setFiles([...files, result.data]);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            const result = await filesService.delete(fileId);
            if (result.success) {
                setFiles(files.filter(f => f.id !== fileId));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Tab content renderers
    const renderDetailsTab = () => {
        const priceRange = calculatePriceRange();
        const hasParameters = productDetails?.parameterAssignments?.length > 0;

        return (
            <div className="tab-content details-tab">
                <div className="detail-grid">
                    <div className="detail-item">
                        <span className="detail-label">SKU</span>
                        <span className="detail-value mono">{product.sku}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t('category')}</span>
                        <span
                            className="category-badge"
                            style={{
                                background: `${categoryColors[product.category]}20`,
                                color: categoryColors[product.category]
                            }}
                        >
                            {categoryLabels[product.category]}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t('status')}</span>
                        <span className={`status-badge ${product.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                            {statusLabels[product.status]}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t('stock')}</span>
                        <span className={`stock-value ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                            {product.stockQuantity || 0}
                        </span>
                    </div>
                </div>

                <div className="price-section">
                    <div className="price-item base">
                        <span className="price-label">{t('basePrice')}</span>
                        <span className="price-value">${parseFloat(product.price || 0).toLocaleString()}</span>
                    </div>
                    {hasParameters && priceRange.min !== priceRange.max && (
                        <div className="price-item range">
                            <span className="price-label">{t('priceRange')}</span>
                            <span className="price-value">
                                ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {product.description && (
                    <div className="description-section">
                        <h4>{t('description')}</h4>
                        <p>{product.description}</p>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="quick-stats">
                    <div className="stat-item" onClick={() => setActiveTab(TABS.PARAMETERS)}>
                        <Settings size={20} />
                        <span className="stat-count">{productDetails?.parameterAssignments?.length || 0}</span>
                        <span className="stat-label">{t('parameters')}</span>
                        <ChevronRight size={16} />
                    </div>
                    <div className="stat-item" onClick={() => setActiveTab(TABS.FILES)}>
                        <FileImage size={20} />
                        <span className="stat-count">{files.length}</span>
                        <span className="stat-label">{t('files')}</span>
                        <ChevronRight size={16} />
                    </div>
                    <div className="stat-item" onClick={() => setActiveTab(TABS.WORKFLOW)}>
                        <GitBranch size={20} />
                        <span className="stat-count">{workflow?.steps?.length || 0}</span>
                        <span className="stat-label">{t('workflow')}</span>
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        );
    };

    const renderParametersTab = () => {
        const parameters = productDetails?.parameterAssignments || [];

        if (parameters.length === 0) {
            return (
                <div className="tab-content empty-state">
                    <Settings size={48} />
                    <p>{t('noParameters')}</p>
                </div>
            );
        }

        return (
            <div className="tab-content parameters-tab">
                {parameters.map(assignment => {
                    const param = assignment.parameter;
                    return (
                        <div key={param.id} className="parameter-card">
                            <div className="parameter-header">
                                <div className="parameter-info">
                                    <h4>{param.name}</h4>
                                    <span className={`required-badge ${param.isRequired ? 'required' : 'optional'}`}>
                                        {param.isRequired ? t('required') : t('optional')}
                                    </span>
                                </div>
                                <span className="parameter-type">{param.type}</span>
                            </div>

                            {param.description && (
                                <p className="parameter-desc">{param.description}</p>
                            )}

                            {param.options && param.options.length > 0 && (
                                <div className="options-grid">
                                    {param.options.map(option => (
                                        <div key={option.id} className="option-item">
                                            {param.type === 'COLOR' && option.colorHex && (
                                                <div
                                                    className="color-preview"
                                                    style={{ background: option.colorHex }}
                                                />
                                            )}
                                            <span className="option-label">{option.label}</span>
                                            {parseFloat(option.priceImpact) !== 0 && (
                                                <span className={`price-impact ${parseFloat(option.priceImpact) > 0 ? 'positive' : 'negative'}`}>
                                                    {parseFloat(option.priceImpact) > 0 ? '+' : ''}${option.priceImpact}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWorkflowTab = () => {
        if (!workflow) {
            return (
                <div className="tab-content empty-state">
                    <GitBranch size={48} />
                    <p>{t('noWorkflow')}</p>
                </div>
            );
        }

        return (
            <div className="tab-content workflow-tab">
                <div className="workflow-header">
                    <h4>{workflow.name}</h4>
                    {workflow.description && <p>{workflow.description}</p>}
                </div>

                <div className="workflow-steps">
                    {workflow.steps?.map((step, index) => (
                        <div key={step.id} className="workflow-step">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                                <h5>{step.name}</h5>
                                {step.department && (
                                    <span
                                        className="department-badge"
                                        style={{
                                            background: `${step.department.color}20`,
                                            color: step.department.color,
                                            borderColor: step.department.color
                                        }}
                                    >
                                        {step.department.name}
                                    </span>
                                )}
                                {step.estimatedDurationDays && (
                                    <span className="duration">
                                        {step.estimatedDurationDays} {language === 'he' ? 'ימים' : 'days'}
                                    </span>
                                )}
                            </div>
                            {index < (workflow.steps?.length - 1) && (
                                <div className="step-connector" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderFilesTab = () => {
        return (
            <div className="tab-content files-tab">
                <div className="files-header">
                    <label className="upload-btn">
                        <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                        />
                        {uploading ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                        {t('uploadFile')}
                    </label>
                </div>

                {files.length === 0 ? (
                    <div className="empty-state">
                        <FileImage size={48} />
                        <p>{t('noFiles')}</p>
                    </div>
                ) : (
                    <div className="files-grid">
                        {files.map(file => (
                            <div key={file.id} className="file-card">
                                {file.mimeType?.startsWith('image/') ? (
                                    <div className="file-preview image">
                                        <img src={`https://api.the-shul.com/files/${file.id}/download`} alt={file.originalName} />
                                    </div>
                                ) : (
                                    <div className="file-preview doc">
                                        <FileImage size={32} />
                                    </div>
                                )}
                                <div className="file-info">
                                    <span className="file-name" title={file.originalName}>
                                        {file.originalName}
                                    </span>
                                    <span className="file-size">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                                <div className="file-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => window.open(`https://api.the-shul.com/files/${file.id}/download`, '_blank')}
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                    <button
                                        className="action-btn danger"
                                        onClick={() => handleDeleteFile(file.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSubproductsTab = () => {
        // Sub-products feature - displays linked products and allows adding new ones
        const subProducts = productDetails?.subProducts || [];
        const parentProduct = productDetails?.parentProduct;

        return (
            <div className="tab-content subproducts-tab">
                {/* Parent Product Info (if this is a child) */}
                {parentProduct && (
                    <div className="parent-product-card">
                        <div className="parent-label">{language === 'he' ? 'מוצר אב' : 'Parent Product'}</div>
                        <div className="parent-info">
                            <Package size={20} />
                            <div className="parent-details">
                                <span className="parent-name">{parentProduct.name}</span>
                                <span className="parent-sku">{parentProduct.sku}</span>
                            </div>
                            <span className="parent-price">${parseFloat(parentProduct.price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Sub-products Header */}
                <div className="subproducts-header">
                    <h4>
                        <Boxes size={18} />
                        {language === 'he' ? 'תתי-מוצרים' : 'Sub-Products'} ({subProducts.length})
                    </h4>
                    <button className="btn btn-outline btn-sm">
                        <Plus size={14} />
                        {language === 'he' ? 'הוסף' : 'Add'}
                    </button>
                </div>

                {/* Sub-products List */}
                {subProducts.length === 0 ? (
                    <div className="empty-state-inline">
                        <Boxes size={32} />
                        <div className="empty-text">
                            <p>{language === 'he' ? 'אין תתי-מוצרים למוצר זה' : 'No sub-products for this product'}</p>
                            <span>
                                {language === 'he'
                                    ? 'תתי-מוצרים מאפשרים ליצור מוצרים מורכבים ממספר חלקים'
                                    : 'Sub-products allow creating complex products from multiple parts'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="subproducts-list">
                        {subProducts.map((sub, index) => (
                            <div key={sub.id || index} className="subproduct-item">
                                <div className="subproduct-drag">
                                    <span className="subproduct-number">{index + 1}</span>
                                </div>
                                <div className="subproduct-icon">
                                    <Package size={18} />
                                </div>
                                <div className="subproduct-info">
                                    <span className="subproduct-name">{sub.name}</span>
                                    <span className="subproduct-sku">{sub.sku}</span>
                                </div>
                                <div className="subproduct-qty">
                                    <span className="qty-label">{language === 'he' ? 'כמות' : 'Qty'}</span>
                                    <span className="qty-value">{sub.quantity || 1}</span>
                                </div>
                                <div className="subproduct-price">
                                    ${parseFloat(sub.price || 0).toLocaleString()}
                                </div>
                                <div className="subproduct-actions">
                                    <button className="action-btn small" title={language === 'he' ? 'צפייה' : 'View'}>
                                        <Eye size={14} />
                                    </button>
                                    <button className="action-btn small danger" title={language === 'he' ? 'הסר' : 'Remove'}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sub-products Summary */}
                {subProducts.length > 0 && (
                    <div className="subproducts-summary">
                        <div className="summary-row">
                            <span>{language === 'he' ? 'סה"כ חלקים' : 'Total Parts'}</span>
                            <span className="summary-value">{subProducts.length}</span>
                        </div>
                        <div className="summary-row">
                            <span>{language === 'he' ? 'עלות רכיבים' : 'Components Cost'}</span>
                            <span className="summary-value price">
                                ${subProducts.reduce((sum, sub) => sum + (parseFloat(sub.price || 0) * (sub.quantity || 1)), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="feature-info-box">
                    <AlertTriangle size={16} />
                    <span>
                        {language === 'he'
                            ? 'תכונה זו בפיתוח. בקרוב תוכל לחבר מוצרים יחד ליצירת מוצרים מורכבים.'
                            : 'This feature is in development. Soon you\'ll be able to link products together to create complex products.'}
                    </span>
                </div>
            </div>
        );
    };

    const renderHistoryTab = () => {
        // TODO: Implement history when API is ready
        return (
            <div className="tab-content empty-state">
                <History size={48} />
                <p>{language === 'he' ? 'היסטוריית שינויים תהיה זמינה בקרוב' : 'Change history coming soon'}</p>
            </div>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="tab-content loading">
                    <Loader2 className="spin" size={32} />
                </div>
            );
        }

        switch (activeTab) {
            case TABS.DETAILS:
                return renderDetailsTab();
            case TABS.PARAMETERS:
                return renderParametersTab();
            case TABS.WORKFLOW:
                return renderWorkflowTab();
            case TABS.FILES:
                return renderFilesTab();
            case TABS.SUBPRODUCTS:
                return renderSubproductsTab();
            case TABS.HISTORY:
                return renderHistoryTab();
            default:
                return renderDetailsTab();
        }
    };

    if (!product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="large">
            <div className="product-detail-modal">
                {/* Tab Navigation */}
                <div className="tabs-nav">
                    <button
                        className={`tab-btn ${activeTab === TABS.DETAILS ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.DETAILS)}
                    >
                        <Package size={16} />
                        {t('details')}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === TABS.PARAMETERS ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.PARAMETERS)}
                    >
                        <Settings size={16} />
                        {t('parameters')}
                        {productDetails?.parameterAssignments?.length > 0 && (
                            <span className="tab-count">{productDetails.parameterAssignments.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === TABS.WORKFLOW ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.WORKFLOW)}
                    >
                        <GitBranch size={16} />
                        {t('workflow')}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === TABS.FILES ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.FILES)}
                    >
                        <FileImage size={16} />
                        {t('files')}
                        {files.length > 0 && <span className="tab-count">{files.length}</span>}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === TABS.SUBPRODUCTS ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.SUBPRODUCTS)}
                    >
                        <Boxes size={16} />
                        {t('subproducts')}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === TABS.HISTORY ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.HISTORY)}
                    >
                        <History size={16} />
                        {t('history')}
                    </button>
                </div>

                {/* Tab Content */}
                {renderTabContent()}

                {/* Modal Actions */}
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={onClose}>
                        {t('close')}
                    </button>
                    <button className="btn btn-primary" onClick={() => onEdit && onEdit(product)}>
                        <Edit size={16} />
                        {t('edit')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ProductDetailModal;
