import { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    Check,
    Package,
    User,
    Phone,
    Mail,
    Building2,
    DollarSign,
    FileText,
    Sparkles,
    Loader2
} from 'lucide-react';
import { productsService, parametersService } from '../services/api';
import './OrderLifecycleWizard.css';

/**
 * Order Lifecycle Wizard
 * Central interface for Lead → Product Match → Order Creation
 * Used by sales team during phone calls with customers
 */
function OrderLifecycleWizard({ lead, onComplete, onCancel, language = 'he' }) {
    // Current stage in the wizard
    const [currentStage, setCurrentStage] = useState(1);
    const [saving, setSaving] = useState(false);

    // Lead data (can be existing or new)
    const [leadData, setLeadData] = useState(lead || {
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });

    // Product search and selection
    const [products, setProducts] = useState([]);
    const [allVariants, setAllVariants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Parameters
    const [parameters, setParameters] = useState([]);
    const [selectedParams, setSelectedParams] = useState({});
    const [currentParamGroup, setCurrentParamGroup] = useState(0);

    // Price calculation
    const [calculatedPrice, setCalculatedPrice] = useState(null);

    // Load products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsService.getAll();
            if (response.success) {
                const allProducts = response.data.products || [];
                // Only base products for initial selection
                const baseProducts = allProducts.filter(p => !p.parentProductId);
                setProducts(baseProducts);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    // Smart search - by name, catalog code, design tag, SKU
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            product.name?.toLowerCase().includes(search) ||
            product.catalogCode?.toLowerCase().includes(search) ||
            product.designTag?.toLowerCase().includes(search) ||
            product.sku?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search)
        );
    });

    // Parameter grouping by category
    const parameterGroups = [
        { id: 'measurements', nameHe: 'מידות', nameEn: 'Measurements', params: [] },
        { id: 'dedications', nameHe: 'הקדשות', nameEn: 'Dedications', params: [] },
        { id: 'colors', nameHe: 'צבעים', nameEn: 'Colors', params: [] },
        { id: 'additions', nameHe: 'תוספות', nameEn: 'Additions', params: [] },
        { id: 'attachments', nameHe: 'קבצים', nameEn: 'Attachments', params: [] }
    ];

    // Calculate progress
    const totalStages = 3 + parameterGroups.length; // Lead + Product + Variant + Params
    const progress = (currentStage / totalStages) * 100;

    // Can proceed checks
    const canProceedFromStage1 = leadData.name && leadData.phone;
    const canProceedFromStage2 = selectedProduct !== null;
    const canProceedFromStage3 = selectedVariant !== null;

    // Handle product selection
    const handleProductSelect = async (product) => {
        setSelectedProduct(product);

        // Fetch variants if it's a base product
        if (!product.parentProductId) {
            const response = await productsService.getAll();
            if (response.success) {
                const variants = (response.data.products || []).filter(p => p.parentProductId === product.id);
                setAllVariants(variants);
            }
        }
    };

    // Handle variant selection
    const handleVariantSelect = async (variant) => {
        setSelectedVariant(variant);

        // Load all parameters from localStorage (parochet parameters)
        try {
            const allParams = JSON.parse(localStorage.getItem('mockParameters') || '[]');
            const parochetParams = allParams.filter(p => p.id.startsWith('param-'));
            setParameters(parochetParams);
            console.log('[Wizard] Loaded parameters:', parochetParams.length);
        } catch (err) {
            console.error('Failed to load parameters:', err);
        }
    };

    // Handle parameter change
    const handleParamChange = (paramId, value) => {
        setSelectedParams(prev => ({
            ...prev,
            [paramId]: value
        }));
    };

    // Calculate final price
    useEffect(() => {
        if (selectedVariant && Object.keys(selectedParams).length > 0) {
            calculatePrice();
        }
    }, [selectedParams, selectedVariant]);

    const calculatePrice = () => {
        let basePrice = selectedVariant?.basePrice || 0;
        let additionalCost = 0;

        // Calculate based on parameters
        parameters.forEach(param => {
            const value = selectedParams[param.id];
            if (!value) return;

            // Calculate price impact based on parameter type
            if (param.type === 'SELECT' || param.type === 'COLOR') {
                const option = param.options?.find(o => o.id === value);
                if (option?.priceImpact) {
                    additionalCost += option.priceImpact;
                }
            } else if (param.type === 'NUMBER' && param.priceImpactFormula) {
                // Simple formula evaluation (e.g., "height * 10")
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    const formula = param.priceImpactFormula.replace(/\w+/, numValue);
                    try {
                        additionalCost += eval(formula) || 0;
                    } catch (e) {
                        console.error('Formula error:', e);
                    }
                }
            } else if (param.priceImpact) {
                additionalCost += param.priceImpact;
            }
        });

        setCalculatedPrice({
            base: basePrice,
            additional: additionalCost,
            total: basePrice + additionalCost
        });
    };

    // Handle completion
    const handleComplete = () => {
        if (onComplete) {
            onComplete({
                lead: leadData,
                product: selectedVariant || selectedProduct,
                parameters: selectedParams,
                price: calculatedPrice
            });
        }
    };

    // Navigation
    const goNext = () => {
        if (currentStage < totalStages) {
            setCurrentStage(prev => prev + 1);
        }
    };

    const goBack = () => {
        if (currentStage > 1) {
            setCurrentStage(prev => prev - 1);
        }
    };

    return (
        <div className="order-wizard">
            {/* Progress Bar */}
            <div className="wizard-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-text">
                    {language === 'he' ? 'התקדמות:' : 'Progress:'} {Math.round(progress)}%
                </div>
            </div>

            {/* Wizard Content */}
            <div className="wizard-body">
                {/* Stage 1: Lead Information */}
                {currentStage === 1 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Sparkles size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'פרטי הלקוח' : 'Customer Details'}</h2>
                            <p>{language === 'he' ? 'בואו נתחיל - מי הלקוח?' : "Let's start - who is the customer?"}</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field">
                                <label>
                                    <User size={16} />
                                    <span>{language === 'he' ? 'שם מלא' : 'Full Name'} *</span>
                                </label>
                                <input
                                    type="text"
                                    value={leadData.name}
                                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                                    placeholder={language === 'he' ? 'שם הלקוח' : 'Customer name'}
                                    autoFocus
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    <Phone size={16} />
                                    <span>{language === 'he' ? 'טלפון' : 'Phone'} *</span>
                                </label>
                                <input
                                    type="tel"
                                    value={leadData.phone}
                                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                    placeholder={language === 'he' ? '050-1234567' : '050-1234567'}
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    <Mail size={16} />
                                    <span>{language === 'he' ? 'אימייל' : 'Email'}</span>
                                </label>
                                <input
                                    type="email"
                                    value={leadData.email}
                                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                                    placeholder={language === 'he' ? 'email@example.com' : 'email@example.com'}
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    <Building2 size={16} />
                                    <span>{language === 'he' ? 'חברה/ארגון' : 'Company'}</span>
                                </label>
                                <input
                                    type="text"
                                    value={leadData.company}
                                    onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                                    placeholder={language === 'he' ? 'שם החברה' : 'Company name'}
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>
                                    <FileText size={16} />
                                    <span>{language === 'he' ? 'הערות' : 'Notes'}</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={leadData.notes}
                                    onChange={(e) => setLeadData({ ...leadData, notes: e.target.value })}
                                    placeholder={language === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 2: Product Search & Selection */}
                {currentStage === 2 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Package size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'בחירת מוצר' : 'Product Selection'}</h2>
                            <p>{language === 'he' ? 'חפש לפי שם, קוד קטלוג או דגם' : 'Search by name, catalog code or design'}</p>
                        </div>

                        {/* Smart Search */}
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={language === 'he' ? 'חפש מוצר... (P124, כתר וזר, B1Z0)' : 'Search product...'}
                                autoFocus
                            />
                        </div>

                        {/* Products Grid */}
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="product-image">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} />
                                        ) : (
                                            <div className="placeholder-image">
                                                <Package size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h4>{product.name}</h4>
                                        {product.catalogCode && (
                                            <span className="catalog-code">{product.catalogCode}</span>
                                        )}
                                        {product.sku && (
                                            <span className="sku">{product.sku}</span>
                                        )}
                                    </div>
                                    {selectedProduct?.id === product.id && (
                                        <div className="selected-badge">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage 3: Variant Selection (Design + Complexity) */}
                {currentStage === 3 && selectedProduct && allVariants.length > 0 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Sparkles size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'בחירת דגם ורמת מורכבות' : 'Select Design & Complexity'}</h2>
                            <p>{language === 'he' ? `נמצאו ${allVariants.length} אפשרויות עיצוב זמינות` : `${allVariants.length} design options available`}</p>
                        </div>

                        {/* Group variants by designTag */}
                        <div className="variants-container">
                            {(() => {
                                // Group by design
                                const grouped = {};
                                allVariants.forEach(v => {
                                    if (!grouped[v.designTag]) grouped[v.designTag] = [];
                                    grouped[v.designTag].push(v);
                                });

                                return Object.entries(grouped).map(([designTag, designs]) => (
                                    <div key={designTag} className="design-group-card">
                                        <h3 className="design-title">{designTag}</h3>
                                        <div className="complexity-grid">
                                            {designs
                                                .sort((a, b) => {
                                                    const order = { SIMPLE: 1, MEDIUM: 2, FULL: 3 };
                                                    return order[a.complexityLevel] - order[b.complexityLevel];
                                                })
                                                .map(variant => (
                                                    <div
                                                        key={variant.id}
                                                        className={`complexity-card ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                                                        onClick={() => handleVariantSelect(variant)}
                                                    >
                                                        <div className="complexity-level">
                                                            {variant.complexityLevel === 'SIMPLE' && (language === 'he' ? 'רקמה פשוטה' : 'Simple')}
                                                            {variant.complexityLevel === 'MEDIUM' && (language === 'he' ? 'רקמה בינונית' : 'Medium')}
                                                            {variant.complexityLevel === 'FULL' && (language === 'he' ? 'רקמה מלאה' : 'Full')}
                                                        </div>
                                                        {variant.catalogCode && (
                                                            <div className="catalog-badge">{variant.catalogCode}</div>
                                                        )}
                                                        <div className="variant-price">
                                                            ₪{variant.basePrice?.toLocaleString()}
                                                        </div>
                                                        {selectedVariant?.id === variant.id && (
                                                            <div className="selected-check">
                                                                <Check size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                )}

                {/* Stage 4+: Parameter Groups (Dynamic) */}
                {currentStage > 3 && selectedVariant && parameters.length > 0 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <FileText size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'מילוי פרטי ההזמנה' : 'Order Details'}</h2>
                            <p>{language === 'he' ? 'ענה על השאלות הבאות' : 'Answer the following questions'}</p>
                        </div>

                        <div className="parameters-container">
                            {parameters.map((param) => (
                                <div key={param.id} className="param-field">
                                    <label>
                                        {param.name}
                                        {param.isRequired && <span className="required">*</span>}
                                    </label>
                                    {param.description && (
                                        <p className="param-hint">{param.description}</p>
                                    )}

                                    {/* Different input types */}
                                    {param.type === 'TEXT' && (
                                        <input
                                            type="text"
                                            value={selectedParams[param.id] || ''}
                                            onChange={(e) => handleParamChange(param.id, e.target.value)}
                                            placeholder={param.description}
                                            className="param-input"
                                        />
                                    )}

                                    {param.type === 'NUMBER' && (
                                        <div className="number-with-unit">
                                            <input
                                                type="number"
                                                value={selectedParams[param.id] || ''}
                                                onChange={(e) => handleParamChange(param.id, e.target.value)}
                                                placeholder={param.description}
                                                className="param-input"
                                            />
                                            {param.unit && <span className="unit-label">{param.unit}</span>}
                                        </div>
                                    )}

                                    {param.type === 'SELECT' && (
                                        <select
                                            value={selectedParams[param.id] || ''}
                                            onChange={(e) => handleParamChange(param.id, e.target.value)}
                                            className="param-select"
                                        >
                                            <option value="">{language === 'he' ? 'בחר...' : 'Select...'}</option>
                                            {param.options?.map(opt => (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.label}
                                                    {opt.priceImpact ? ` (+₪${opt.priceImpact})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {param.type === 'COLOR' && (
                                        <div className="color-picker-grid">
                                            {param.options?.map(opt => (
                                                <div
                                                    key={opt.id}
                                                    className={`color-option-box ${selectedParams[param.id] === opt.id ? 'selected' : ''}`}
                                                    onClick={() => handleParamChange(param.id, opt.id)}
                                                >
                                                    <div
                                                        className="color-swatch"
                                                        style={{ background: opt.colorHex }}
                                                    />
                                                    <span>{opt.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {param.type === 'TEXTAREA' && (
                                        <textarea
                                            value={selectedParams[param.id] || ''}
                                            onChange={(e) => handleParamChange(param.id, e.target.value)}
                                            placeholder={param.description}
                                            className="param-textarea"
                                            rows={4}
                                        />
                                    )}

                                    {param.type === 'BOOLEAN' && (
                                        <div className="boolean-toggle">
                                            {param.options?.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    className={`toggle-option ${selectedParams[param.id] === opt.id ? 'active' : ''}`}
                                                    onClick={() => handleParamChange(param.id, opt.id)}
                                                >
                                                    {opt.label}
                                                    {opt.priceImpact ? ` (+₪${opt.priceImpact})` : ''}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Price Preview */}
                        {calculatedPrice && (
                            <div className="price-preview">
                                <div className="price-row">
                                    <span>{language === 'he' ? 'מחיר בסיס:' : 'Base Price:'}</span>
                                    <span>₪{calculatedPrice.base?.toLocaleString()}</span>
                                </div>
                                {calculatedPrice.additional > 0 && (
                                    <div className="price-row">
                                        <span>{language === 'he' ? 'תוספות:' : 'Additions:'}</span>
                                        <span>₪{calculatedPrice.additional?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="price-row total">
                                    <span>{language === 'he' ? 'סה"כ:' : 'Total:'}</span>
                                    <span>₪{calculatedPrice.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Final Stage: Summary */}
                {currentStage === totalStages && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Check size={32} className="stage-icon success" />
                            <h2>{language === 'he' ? 'סיכום ההזמנה' : 'Order Summary'}</h2>
                            <p>{language === 'he' ? 'אישור סופי לפני יצירת ההזמנה' : 'Final confirmation before creating the order'}</p>
                        </div>

                        <div className="summary-container">
                            {/* Customer Info */}
                            <div className="summary-section">
                                <h3>{language === 'he' ? 'פרטי הלקוח' : 'Customer Details'}</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <strong>{language === 'he' ? 'שם:' : 'Name:'}</strong>
                                        <span>{leadData.name}</span>
                                    </div>
                                    <div className="summary-item">
                                        <strong>{language === 'he' ? 'טלפון:' : 'Phone:'}</strong>
                                        <span>{leadData.phone}</span>
                                    </div>
                                    {leadData.email && (
                                        <div className="summary-item">
                                            <strong>{language === 'he' ? 'אימייל:' : 'Email:'}</strong>
                                            <span>{leadData.email}</span>
                                        </div>
                                    )}
                                    {leadData.company && (
                                        <div className="summary-item">
                                            <strong>{language === 'he' ? 'חברה:' : 'Company:'}</strong>
                                            <span>{leadData.company}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="summary-section">
                                <h3>{language === 'he' ? 'המוצר' : 'Product'}</h3>
                                <div className="selected-product-summary">
                                    <strong>{selectedVariant?.name || selectedProduct?.name}</strong>
                                    {selectedVariant?.catalogCode && (
                                        <span className="catalog-code">{selectedVariant.catalogCode}</span>
                                    )}
                                </div>
                            </div>

                            {/* Parameters Summary */}
                            {Object.keys(selectedParams).length > 0 && (
                                <div className="summary-section">
                                    <h3>{language === 'he' ? 'התאמות אישיות' : 'Customizations'}</h3>
                                    <div className="params-summary">
                                        {parameters
                                            .filter(p => selectedParams[p.id])
                                            .map(param => (
                                                <div key={param.id} className="param-summary-item">
                                                    <strong>{param.name}:</strong>
                                                    <span>
                                                        {param.type === 'SELECT' || param.type === 'COLOR'
                                                            ? param.options?.find(o => o.id === selectedParams[param.id])?.label
                                                            : selectedParams[param.id]}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Final Price */}
                            <div className="summary-section price-summary">
                                <h3>{language === 'he' ? 'מחיר סופי' : 'Final Price'}</h3>
                                <div className="final-price-display">
                                    ₪{calculatedPrice?.total?.toLocaleString() || selectedVariant?.basePrice?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="wizard-footer">
                {currentStage > 1 && (
                    <button className="btn btn-outline" onClick={goBack}>
                        <ChevronLeft size={16} />
                        {language === 'he' ? 'הקודם' : 'Previous'}
                    </button>
                )}

                <div style={{ flex: 1 }} />

                {onCancel && (
                    <button className="btn btn-text" onClick={onCancel}>
                        {language === 'he' ? 'ביטול' : 'Cancel'}
                    </button>
                )}

                {currentStage < totalStages ? (
                    <button
                        className="btn btn-primary"
                        onClick={goNext}
                        disabled={
                            (currentStage === 1 && !canProceedFromStage1) ||
                            (currentStage === 2 && !canProceedFromStage2) ||
                            (currentStage === 3 && !canProceedFromStage3)
                        }
                    >
                        {language === 'he' ? 'הבא' : 'Next'}
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={handleComplete}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                        {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default OrderLifecycleWizard;
