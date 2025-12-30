import { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    CheckSquare,
    Square,
    DollarSign,
    Package,
    Loader2,
    Check
} from 'lucide-react';
import ProductConfigurator from './ProductConfigurator';
import { productsService } from '../services/api';
import './ConvertToOrderWizard.css';

/**
 * Convert Lead to Order Wizard
 * Multi-step wizard for converting leads to orders with product selection and configuration
 */
function ConvertToOrderWizard({ lead, language = 'he', onConvert, onCancel, saving }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [checks, setChecks] = useState({ offerAccepted: false, designApproved: false });

    // Product selection
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Configuration
    const [configuration, setConfiguration] = useState(null);
    const [priceRange, setPriceRange] = useState(null);

    // Load products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsService.getAll();
            if (response.success) {
                const allProducts = response.data;
                // Only show base products (no parent) or products without variants
                const baseProducts = allProducts.filter(p => !p.parentProductId);
                setProducts(baseProducts);

                // If lead already has a product, pre-select it
                if (lead.productId) {
                    const leadProduct = allProducts.find(p => p.id === lead.productId);
                    if (leadProduct) {
                        setSelectedProduct(leadProduct);
                        // If it's a variant, also set it
                        if (leadProduct.parentProductId) {
                            setSelectedVariant(leadProduct);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    // Calculate price range for a product
    const calculatePriceRange = (product, variants = []) => {
        if (!product) return null;

        // If product is a variant itself
        if (product.parentProductId) {
            const basePrice = product.basePrice || 0;
            // Get parameter price impacts (need to fetch parameters)
            return {
                min: basePrice,
                max: basePrice + 2000, // Estimate based on max parameter impacts
                basePrice
            };
        }

        // If product has variants
        if (variants.length > 0) {
            const prices = variants.map(v => v.basePrice || 0);
            return {
                min: Math.min(...prices),
                max: Math.max(...prices) + 2000, // Add estimate for parameters
                hasVariants: true
            };
        }

        // Simple product
        const basePrice = product.basePrice || product.price || 0;
        return {
            min: basePrice,
            max: basePrice + 2000,
            basePrice
        };
    };

    // Filter products by search
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            product.name?.toLowerCase().includes(search) ||
            product.sku?.toLowerCase().includes(search) ||
            product.catalogCode?.toLowerCase().includes(search) ||
            product.designTag?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search)
        );
    });

    // Handle product selection
    const handleProductSelect = async (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);

        // Calculate initial price range
        if (product.parentProductId) {
            // It's already a variant
            setPriceRange(calculatePriceRange(product));
            setSelectedVariant(product);
        } else {
            // It's a base product - fetch variants
            const response = await productsService.getAll();
            if (response.success) {
                const variants = response.data.filter(p => p.parentProductId === product.id);
                setPriceRange(calculatePriceRange(product, variants));
            }
        }
    };

    // Handle variant selection (from ProductConfigurator)
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setPriceRange(calculatePriceRange(variant));
    };

    // Handle configuration change
    const handleConfigurationChange = (config) => {
        setConfiguration(config);

        // Update price range with exact price
        if (config.finalPrice) {
            setPriceRange(prev => ({
                ...prev,
                exact: config.finalPrice
            }));
        }
    };

    // Can proceed to next step?
    const canProceedToStep2 = checks.offerAccepted && checks.designApproved;
    const canProceedToStep3 = selectedProduct && (selectedVariant || !selectedProduct.parentProductId);
    const canProceedToStep4 = configuration && configuration.finalPrice;

    // Handle conversion
    const handleConvert = () => {
        if (onConvert) {
            onConvert({
                lead,
                product: selectedVariant || selectedProduct,
                configuration,
                finalPrice: configuration.finalPrice
            });
        }
    };

    return (
        <div className="convert-wizard">
            {/* Progress Steps */}
            <div className="wizard-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">{currentStep > 1 ? <Check size={16} /> : '1'}</div>
                    <div className="step-label">{language === 'he' ? 'אישורים' : 'Checks'}</div>
                </div>
                <div className="step-divider"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">{currentStep > 2 ? <Check size={16} /> : '2'}</div>
                    <div className="step-label">{language === 'he' ? 'בחירת מוצר' : 'Product'}</div>
                </div>
                <div className="step-divider"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                    <div className="step-number">{currentStep > 3 ? <Check size={16} /> : '3'}</div>
                    <div className="step-label">{language === 'he' ? 'התאמות' : 'Config'}</div>
                </div>
                <div className="step-divider"></div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                    <div className="step-number">4</div>
                    <div className="step-label">{language === 'he' ? 'סיכום' : 'Summary'}</div>
                </div>
            </div>

            {/* Wizard Content */}
            <div className="wizard-content">
                {/* Step 1: Pre-conversion Checks */}
                {currentStep === 1 && (
                    <div className="wizard-step">
                        <h3>{language === 'he' ? 'בדיקות חובה לפני המרה' : 'Pre-conversion Checks'}</h3>
                        <div className="lead-summary">
                            <h4>{lead.name}</h4>
                            <p>{lead.company}</p>
                            <p className="estimated-value">
                                {language === 'he' ? 'שווי משוער:' : 'Estimated:'} ₪{Number(lead.estimatedValue || 0).toLocaleString()}
                            </p>
                        </div>

                        <div className="checklist">
                            <div
                                className="check-item"
                                onClick={() => setChecks(prev => ({ ...prev, offerAccepted: !prev.offerAccepted }))}
                            >
                                {checks.offerAccepted ?
                                    <CheckSquare size={20} className="checked" /> :
                                    <Square size={20} className="unchecked" />
                                }
                                <span>{language === 'he' ? 'הצעת מחיר אושרה על ידי הלקוח' : 'Price offer accepted by customer'}</span>
                            </div>
                            <div
                                className="check-item"
                                onClick={() => setChecks(prev => ({ ...prev, designApproved: !prev.designApproved }))}
                            >
                                {checks.designApproved ?
                                    <CheckSquare size={20} className="checked" /> :
                                    <Square size={20} className="unchecked" />
                                }
                                <span>{language === 'he' ? 'עיצוב/מפרט אושר על ידי הלקוח' : 'Design/specs approved by customer'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Product Selection */}
                {currentStep === 2 && (
                    <div className="wizard-step">
                        <h3>{language === 'he' ? 'בחירת מוצר' : 'Select Product'}</h3>

                        {/* Smart Search */}
                        <div className="search-box-wizard">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder={language === 'he' ? 'חפש מוצר... (שם, קוד, דגם, תיאור)' : 'Search product... (name, code, design, description)'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Product Results */}
                        <div className="products-list">
                            {filteredProducts.length === 0 ? (
                                <div className="no-results">
                                    {language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                                        onClick={() => handleProductSelect(product)}
                                    >
                                        <div className="product-icon">
                                            <Package size={24} />
                                        </div>
                                        <div className="product-details">
                                            <h4>{product.name}</h4>
                                            {product.sku && <p className="product-sku">{product.sku}</p>}
                                            {product.description && <p className="product-desc">{product.description}</p>}
                                        </div>
                                        <div className="product-price">
                                            {priceRange && selectedProduct?.id === product.id ? (
                                                <>
                                                    {priceRange.hasVariants ? (
                                                        <span className="price-range">
                                                            ₪{priceRange.min.toLocaleString()} - ₪{priceRange.max.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="price-single">₪{priceRange.basePrice?.toLocaleString()}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="price-single">₪{(product.basePrice || product.price || 0).toLocaleString()}</span>
                                            )}
                                        </div>
                                        {selectedProduct?.id === product.id && (
                                            <div className="selected-indicator">
                                                <Check size={20} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Product Configuration */}
                {currentStep === 3 && (
                    <div className="wizard-step">
                        <h3>{language === 'he' ? 'התאמת המוצר' : 'Product Configuration'}</h3>

                        {selectedProduct && (
                            <div className="selected-product-header">
                                <Package size={20} />
                                <span>{selectedProduct.name}</span>
                            </div>
                        )}

                        {selectedProduct && (
                            <ProductConfigurator
                                product={selectedProduct}
                                onConfigurationChange={handleConfigurationChange}
                                onVariantSelect={handleVariantSelect}
                                language={language}
                            />
                        )}
                    </div>
                )}

                {/* Step 4: Summary & Confirmation */}
                {currentStep === 4 && (
                    <div className="wizard-step">
                        <h3>{language === 'he' ? 'סיכום והמרה' : 'Summary & Confirmation'}</h3>

                        <div className="summary-section">
                            <div className="summary-item">
                                <strong>{language === 'he' ? 'לקוח:' : 'Customer:'}</strong>
                                <span>{lead.name} ({lead.company})</span>
                            </div>
                            <div className="summary-item">
                                <strong>{language === 'he' ? 'מוצר:' : 'Product:'}</strong>
                                <span>{(selectedVariant || selectedProduct)?.name}</span>
                            </div>
                            {configuration && configuration.selectedParameters && (
                                <div className="summary-item">
                                    <strong>{language === 'he' ? 'התאמות:' : 'Customizations:'}</strong>
                                    <div className="params-list">
                                        {configuration.selectedParameters.map((param, idx) => (
                                            <div key={idx} className="param-item">
                                                {param.parameterId}: {param.optionId}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="summary-item price-item">
                                <strong>{language === 'he' ? 'מחיר סופי:' : 'Final Price:'}</strong>
                                <span className="final-price">₪{configuration?.finalPrice?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Wizard Actions */}
            <div className="wizard-actions">
                {currentStep > 1 && (
                    <button
                        className="btn btn-outline"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={saving}
                    >
                        <ChevronLeft size={16} />
                        {language === 'he' ? 'הקודם' : 'Previous'}
                    </button>
                )}

                <div style={{ flex: 1 }}></div>

                <button
                    className="btn btn-outline"
                    onClick={onCancel}
                    disabled={saving}
                >
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                </button>

                {currentStep < 4 ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={
                            (currentStep === 1 && !canProceedToStep2) ||
                            (currentStep === 2 && !canProceedToStep3) ||
                            (currentStep === 3 && !canProceedToStep4)
                        }
                    >
                        {language === 'he' ? 'הבא' : 'Next'}
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={handleConvert}
                        disabled={saving || !canProceedToStep4}
                    >
                        {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
                        {language === 'he' ? 'צור הזמנה' : 'Create Order'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ConvertToOrderWizard;
