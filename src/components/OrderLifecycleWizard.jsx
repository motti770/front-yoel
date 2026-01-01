import { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Check,
    Package,
    User,
    Phone,
    Mail,
    Building2,
    DollarSign,
    FileText,
    Sparkles,
    Loader2,
    Palette
} from 'lucide-react';
import { productsService, parametersService } from '../services/api';
import './OrderLifecycleWizard.css';

/**
 * Order Lifecycle Wizard
 * Central interface for Lead → Product Match → Order Creation
 * Used by sales team during phone calls with customers
 */
function OrderLifecycleWizard({ lead, preSelectedProduct, onComplete, onCancel, language = 'he' }) {
    // Current stage in the wizard - skip product selection if product is pre-selected
    const [currentStage, setCurrentStage] = useState(preSelectedProduct ? 2 : 1);
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
    const [allVariants, setAllVariants] = useState([]);  // Design groups (P120, P121, etc.)
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(preSelectedProduct || null);
    const [selectedVariant, setSelectedVariant] = useState(null);  // Final selected variation (P120-A, etc.)

    // Design group expansion state
    const [expandedDesignGroup, setExpandedDesignGroup] = useState(null);  // Which design group is expanded
    const [designVariations, setDesignVariations] = useState([]);  // Variations of expanded group
    const [allProductsData, setAllProductsData] = useState([]);  // Store all products for lookup

    // Parameters
    const [parameters, setParameters] = useState([]);
    const [selectedParams, setSelectedParams] = useState({});

    // Demo fill function - auto fills all parameters with sample values
    const fillDemoParameters = () => {
        const demoValues = {};

        // Helper function to fill a single parameter
        const fillParam = (param) => {
            if (param.type === 'TEXT') {
                // Use Hebrew sample text based on parameter name
                if (param.name.includes('כתובת') || param.name.includes('address')) {
                    demoValues[param.id] = 'רחוב הרצל 15, תל אביב';
                } else if (param.name.includes('טקסט') || param.name.includes('text') || param.name.includes('כיתוב')) {
                    demoValues[param.id] = 'בית הכנסת המרכזי - לעילוי נשמת';
                } else if (param.name.includes('שם')) {
                    demoValues[param.id] = 'בית כנסת אהבת שלום';
                } else {
                    demoValues[param.id] = 'ערך לדוגמה ' + Math.floor(Math.random() * 100);
                }
            } else if (param.type === 'NUMBER') {
                // Use reasonable numbers based on context
                if (param.name.includes('גובה') || param.name.includes('height')) {
                    demoValues[param.id] = 250;
                } else if (param.name.includes('רוחב') || param.name.includes('width')) {
                    demoValues[param.id] = 180;
                } else if (param.name.includes('עומק') || param.name.includes('depth')) {
                    demoValues[param.id] = 50;
                } else if (param.name.includes('כמות') || param.name.includes('quantity') || param.name.includes('אבנים')) {
                    demoValues[param.id] = Math.floor(Math.random() * 50) + 10; // 10-60 stones
                } else {
                    demoValues[param.id] = Math.floor(Math.random() * 100) + 50;
                }
            } else if ((param.type === 'SELECT' || param.type === 'COLOR' || param.type === 'BOOLEAN') && param.options?.length > 0) {
                // Pick a random option (prefer first or second for better demo)
                const randomIndex = Math.floor(Math.random() * Math.min(param.options.length, 3));
                demoValues[param.id] = param.options[randomIndex].id;
            } else if (param.type === 'TEXTAREA') {
                demoValues[param.id] = 'הערות לדוגמה - הלקוח מבקש עיצוב מיוחד עם הקדשה אישית.';
            }
        };

        // First pass: fill all parameters without conditions
        parameters.forEach(param => {
            if (param.showWhen) return; // Skip conditional parameters for now
            fillParam(param);
        });

        // Second pass: fill conditional parameters whose conditions are now met
        parameters.forEach(param => {
            if (!param.showWhen) return; // Skip non-conditional parameters

            const { parameterId, operator = 'equals', optionId } = param.showWhen;
            const parentValue = demoValues[parameterId];

            // Evaluate condition based on operator
            let conditionMet = false;
            switch (operator) {
                case 'equals':
                    conditionMet = parentValue === optionId;
                    break;
                case 'not_equals':
                    conditionMet = parentValue && parentValue !== optionId;
                    break;
                case 'exists':
                    conditionMet = !!parentValue && parentValue !== '';
                    break;
                case 'not_exists':
                    conditionMet = !parentValue || parentValue === '';
                    break;
                default:
                    conditionMet = parentValue === optionId;
            }

            // Only fill if the condition is met
            if (conditionMet) {
                fillParam(param);
            }
        });

        setSelectedParams(demoValues);
    };
    const [currentParamGroup, setCurrentParamGroup] = useState(0);

    // Price calculation
    const [calculatedPrice, setCalculatedPrice] = useState(null);

    // Load products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // If preSelectedProduct is set, load its data and skip to correct stage
    useEffect(() => {
        if (preSelectedProduct) {
            console.log('[Wizard] Pre-selected product:', preSelectedProduct.name, 'skipDesignGroups:', preSelectedProduct.skipDesignGroups);
            // Load design groups and parameters for pre-selected product
            const loadPreSelectedProductData = async () => {
                const response = await productsService.getAll();
                if (response.success) {
                    const allProducts = response.data.products || [];
                    setAllProductsData(allProducts);

                    // If skipDesignGroups is set (user selected a specific variation), go directly to parameters
                    if (preSelectedProduct.skipDesignGroups) {
                        console.log('[Wizard] Skipping design groups - direct variation selected');
                        // Set the variant as selected
                        setSelectedVariant(preSelectedProduct);
                        await loadParametersForProduct(preSelectedProduct.id);
                        setCurrentStage(4); // Go directly to parameters
                        return;
                    }

                    // Get design groups for this product
                    const designGroups = allProducts.filter(p =>
                        p.parentProductId === preSelectedProduct.id && p.isDesignGroup === true
                    );
                    setAllVariants(designGroups);
                    console.log('[Wizard] Design groups for', preSelectedProduct.name, ':', designGroups.length);

                    // If design groups exist, go to stage 3 (design selection)
                    // If no design groups, load parameters and go to stage 4 (parameters)
                    if (designGroups.length > 0) {
                        setCurrentStage(3);
                    } else {
                        await loadParametersForProduct(preSelectedProduct.id);
                        setCurrentStage(4); // Go directly to parameters
                    }
                }
            };
            loadPreSelectedProductData();
        }
    }, [preSelectedProduct]);

    const fetchProducts = async () => {
        try {
            const response = await productsService.getAll();
            console.log('[Wizard] Products response:', response);
            if (response.success) {
                const allProducts = response.data.products || [];
                console.log('[Wizard] All products:', allProducts.length, allProducts.map(p => p.name));
                // Only base products for initial selection (parentProductId is null or undefined)
                const baseProducts = allProducts.filter(p => p.parentProductId === null || p.parentProductId === undefined);
                console.log('[Wizard] Base products:', baseProducts.length, baseProducts.map(p => p.name));
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

    // Handle product selection (base product like "פרוכת")
    const handleProductSelect = async (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);
        setAllVariants([]);
        setDesignVariations([]);
        setExpandedDesignGroup(null);
        setParameters([]);

        // Fetch design groups if it's a base product
        if (!product.parentProductId) {
            const response = await productsService.getAll();
            if (response.success) {
                const allProducts = response.data.products || [];
                setAllProductsData(allProducts);

                // Get only design GROUPS (isDesignGroup: true) for this product
                const designGroups = allProducts.filter(p =>
                    p.parentProductId === product.id && p.isDesignGroup === true
                );
                setAllVariants(designGroups);

                // If no design groups exist, load parameters directly
                if (designGroups.length === 0) {
                    await loadParametersForProduct(product.id);
                }
            }
        }
    };

    // Handle design group click (expand/collapse)
    const handleDesignGroupClick = (designGroup) => {
        if (expandedDesignGroup?.id === designGroup.id) {
            // Collapse if already expanded
            setExpandedDesignGroup(null);
            setDesignVariations([]);
        } else {
            // Expand and load variations
            setExpandedDesignGroup(designGroup);
            const variations = allProductsData.filter(p => p.parentProductId === designGroup.id);
            setDesignVariations(variations);
        }
    };

    // Load parameters for a product
    const loadParametersForProduct = async (productId) => {
        try {
            const response = await parametersService.getAll();
            if (response.success) {
                const allParams = response.data.parameters || response.data || [];
                const productParams = allParams.filter(p => p.productId === productId);
                productParams.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                setParameters(productParams);
                console.log('[Wizard] Loaded parameters for', productId, ':', productParams.length);
            }
        } catch (err) {
            console.error('Failed to load parameters:', err);
        }
    };

    // Handle variation selection (P120-A, P120-B, etc.)
    const handleVariantSelect = async (variation) => {
        setSelectedVariant(variation);
        // Load parameters for the ROOT base product (parochet, not P120)
        // We need to go up the hierarchy: P120-A → P120 → parochet
        const baseProductId = selectedProduct?.id; // This is 'parochet'
        await loadParametersForProduct(baseProductId);
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
        const hasProduct = selectedVariant || (allVariants.length === 0 && selectedProduct);
        if (hasProduct && Object.keys(selectedParams).length > 0) {
            calculatePrice();
        }
    }, [selectedParams, selectedVariant, selectedProduct, allVariants.length]);

    const calculatePrice = () => {
        let basePrice = selectedVariant?.basePrice || selectedProduct?.basePrice || 0;
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

    // Check if we should skip Stage 3 (design selection)
    const hasVariants = allVariants.length > 0;

    // Navigation
    const goNext = () => {
        if (currentStage < totalStages) {
            let nextStage = currentStage + 1;
            // Skip Stage 3 if no variants - go directly to parameters (Stage 4)
            if (nextStage === 3 && !hasVariants) {
                nextStage = 4;
            }
            setCurrentStage(nextStage);
        }
    };

    const goBack = () => {
        if (currentStage > 1) {
            let prevStage = currentStage - 1;
            // Skip Stage 3 when going back if no variants
            if (prevStage === 3 && !hasVariants) {
                prevStage = 2;
            }
            setCurrentStage(prevStage);
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

                {/* Stage 3: Design Selection - Collapsible Groups */}
                {currentStage === 3 && selectedProduct && allVariants.length > 0 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Palette size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'בחירת עיצוב' : 'Select Design'}</h2>
                            <p>{language === 'he' ? 'בחר עיצוב ולאחר מכן את הסגנון הספציפי' : 'Select a design then choose the specific style'}</p>
                        </div>

                        {/* Design Groups List - Collapsible */}
                        <div className="design-groups-container">
                            {allVariants.map(designGroup => (
                                <div key={designGroup.id} className="design-group-wrapper">
                                    {/* Design Group Header - Collapsible */}
                                    <div
                                        className={`design-group-header ${expandedDesignGroup?.id === designGroup.id ? 'expanded' : ''}`}
                                        onClick={() => handleDesignGroupClick(designGroup)}
                                    >
                                        <div className="design-group-info">
                                            <div className="design-group-icon">
                                                <Package size={24} />
                                            </div>
                                            <div className="design-group-text">
                                                <h4 className="design-group-name">{designGroup.name}</h4>
                                                <p className="design-group-desc">{designGroup.description}</p>
                                            </div>
                                        </div>
                                        <div className="design-group-meta">
                                            <span className="design-group-code">{designGroup.catalogCode}</span>
                                            <span className="design-group-price">
                                                {language === 'he' ? 'החל מ-' : 'From '}₪{designGroup.basePrice?.toLocaleString()}
                                            </span>
                                            <span className="design-group-count">
                                                {designGroup.variationCount} {language === 'he' ? 'סגנונות' : 'styles'}
                                            </span>
                                            {expandedDesignGroup?.id === designGroup.id ? (
                                                <ChevronUp size={20} className="expand-icon" />
                                            ) : (
                                                <ChevronDown size={20} className="expand-icon" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Variations - Image Grid */}
                                    {expandedDesignGroup?.id === designGroup.id && (
                                        <div className="design-variations-panel">
                                            <div className="variations-image-grid">
                                                {designVariations.map(variation => (
                                                    <div
                                                        key={variation.id}
                                                        className={`variation-image-card ${selectedVariant?.id === variation.id ? 'selected' : ''}`}
                                                        onClick={() => handleVariantSelect(variation)}
                                                    >
                                                        {/* Image/Thumbnail */}
                                                        <div className="variation-thumbnail">
                                                            {variation.imageUrl ? (
                                                                <img src={variation.imageUrl} alt={variation.name} />
                                                            ) : (
                                                                <div className="variation-placeholder">
                                                                    <Package size={28} />
                                                                    <span className="style-letter">
                                                                        {variation.catalogCode?.split('-')[1] || '?'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {selectedVariant?.id === variation.id && (
                                                                <div className="selected-overlay">
                                                                    <Check size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Info */}
                                                        <div className="variation-card-info">
                                                            <span className="variation-code">{variation.catalogCode}</span>
                                                            <span className="variation-color-scheme">{variation.colorScheme}</span>
                                                            <span className="variation-price">₪{variation.basePrice?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Selected Variation Summary */}
                        {selectedVariant && (
                            <div className="selection-summary">
                                <Check size={20} />
                                <span>
                                    {language === 'he' ? 'נבחר: ' : 'Selected: '}
                                    <strong>{selectedVariant.name}</strong>
                                    {' - '}₪{selectedVariant.basePrice?.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stage 4+: Parameter Groups (Dynamic) */}
                {currentStage > 3 && (selectedVariant || (!hasVariants && selectedProduct)) && parameters.length > 0 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <FileText size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'מילוי פרטי ההזמנה' : 'Order Details'}</h2>
                            <p>{language === 'he' ? 'ענה על השאלות הבאות' : 'Answer the following questions'}</p>

                            {/* Demo Fill Button */}
                            <button
                                type="button"
                                className="demo-fill-btn"
                                onClick={fillDemoParameters}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    left: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                <Sparkles size={16} />
                                {language === 'he' ? 'מילוי אוטומטי' : 'Auto Fill'}
                            </button>
                        </div>

                        <div className="parameters-container">
                            {parameters.map((param) => {
                                // Check conditional visibility (showWhen)
                                if (param.showWhen) {
                                    const { parameterId, operator = 'equals', optionId } = param.showWhen;
                                    const parentValue = selectedParams[parameterId];

                                    // Evaluate condition based on operator
                                    let conditionMet = false;
                                    switch (operator) {
                                        case 'equals':
                                            conditionMet = parentValue === optionId;
                                            break;
                                        case 'not_equals':
                                            conditionMet = parentValue && parentValue !== optionId;
                                            break;
                                        case 'exists':
                                            conditionMet = !!parentValue && parentValue !== '';
                                            break;
                                        case 'not_exists':
                                            conditionMet = !parentValue || parentValue === '';
                                            break;
                                        default:
                                            conditionMet = parentValue === optionId;
                                    }

                                    // Hide this parameter if condition is not met
                                    if (!conditionMet) {
                                        return null;
                                    }
                                }

                                return (
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
                                );
                            })}
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

                {/* Stage 4: No Parameters Message */}
                {currentStage > 3 && currentStage < totalStages && (selectedVariant || (!hasVariants && selectedProduct)) && parameters.length === 0 && (
                    <div className="wizard-stage">
                        <div className="stage-header">
                            <Check size={32} className="stage-icon" />
                            <h2>{language === 'he' ? 'אין פרמטרים נוספים' : 'No Additional Parameters'}</h2>
                            <p>{language === 'he' ? 'המוצר שנבחר לא דורש פרמטרים נוספים. ניתן להמשיך לסיכום.' : 'The selected product does not require additional parameters. You can proceed to summary.'}</p>
                        </div>
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
                                    ₪{calculatedPrice?.total?.toLocaleString() || selectedVariant?.basePrice?.toLocaleString() || selectedProduct?.basePrice?.toLocaleString() || '0'}
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
