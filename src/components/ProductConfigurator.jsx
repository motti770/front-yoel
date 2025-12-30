import { useState, useEffect } from 'react';
import { Palette, DollarSign, Info, Upload, FileText, CheckSquare, Square } from 'lucide-react';
import { parametersService, productsService } from '../services/api';
import './ProductConfigurator.css';

/**
 * Product Configurator Component
 * Allows users to select product parameters and calculates price in real-time
 */
function ProductConfigurator({ product, onConfigurationChange, onVariantSelect, language = 'he' }) {
    const [parameters, setParameters] = useState([]);
    const [selectedParams, setSelectedParams] = useState({});
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Variant selection state
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // Fetch variants if product is a base product (has no parent)
    useEffect(() => {
        if (product?.id && !product.parentProductId) {
            fetchVariants();
        } else if (product?.id && product.parentProductId) {
            // If product is already a variant, use it directly
            setSelectedVariant(product);
        }
    }, [product?.id]);

    // Fetch product parameters (after variant selected or if no variants)
    useEffect(() => {
        const productToUse = selectedVariant || product;
        if (productToUse?.id && (selectedVariant || product?.parentProductId)) {
            fetchParameters(productToUse);
        }
    }, [selectedVariant, product?.id]);

    const fetchVariants = async () => {
        try {
            setLoadingVariants(true);
            // Get all products that have this product as parent
            const response = await productsService.getAll();
            if (response.success) {
                const allProducts = response.data;
                const productVariants = allProducts.filter(p => p.parentProductId === product.id);
                setVariants(productVariants);
                // If we have variants, stop loading to show variant selection
                if (productVariants.length > 0) {
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Failed to fetch variants:', err);
        } finally {
            setLoadingVariants(false);
        }
    };

    const fetchParameters = async (productToFetch) => {
        try {
            setLoading(true);
            // Use productsService to get parameters for this specific product
            const response = await productsService.getParameters(productToFetch.id);

            if (response.success) {
                const rawParams = response.data.parameters || response.data || [];
                if (rawParams.length > 0) {
                    setParameters(rawParams);
                } else {
                    // Fallback for new products without params - show defaults
                    setParameters(getDefaultParameters());
                }
            } else {
                setParameters(getDefaultParameters());
            }
        } catch (err) {
            console.error('Failed to fetch parameters:', err);
            setParameters(getDefaultParameters());
        } finally {
            setLoading(false);
        }
    };

    // Default parameters if DB is empty
    const getDefaultParameters = () => [
        {
            id: 'param-size',
            name: language === 'he' ? 'גודל' : 'Size',
            type: 'SELECT',
            isRequired: true,
            description: language === 'he' ? 'בחר את גודל המוצר' : 'Select product size',
            options: [
                { id: 'size-s', label: 'Small', priceImpact: 0 },
                { id: 'size-m', label: 'Medium', priceImpact: 50 },
                { id: 'size-l', label: 'Large', priceImpact: 100 },
                { id: 'size-xl', label: 'Extra Large', priceImpact: 150 }
            ]
        },
        {
            id: 'param-color',
            name: language === 'he' ? 'צבע בד' : 'Fabric Color',
            type: 'COLOR',
            isRequired: true,
            description: language === 'he' ? 'בחר את צבע הבד העיקרי' : 'Select main fabric color',
            options: [
                { id: 'col-navy', label: 'Navy Blue', colorHex: '#000080', priceImpact: 0 },
                { id: 'col-burgundy', label: 'Burgundy', colorHex: '#800020', priceImpact: 0 },
                { id: 'col-cream', label: 'Cream', colorHex: '#FFFDD0', priceImpact: 0 },
                { id: 'col-black', label: 'Black', colorHex: '#000000', priceImpact: 0 },
                { id: 'col-gold', label: 'Gold', colorHex: '#FFD700', priceImpact: 20 }
            ]
        },
        {
            id: 'param-text',
            name: language === 'he' ? 'הקדשה / טקסט' : 'Dedication / Text',
            type: 'TEXT',
            isRequired: false,
            description: language === 'he' ? 'טקסט לרקמה (אופציונלי)' : 'Text for embroidery (optional)'
        }
    ];

    // Calculate price when selection changes
    useEffect(() => {
        if (Object.keys(selectedParams).length > 0) {
            calculatePrice();
        }
    }, [selectedParams]);

    const calculatePrice = async () => {
        try {
            // Local calculation for immediate feedback
            const productToUse = selectedVariant || product;
            let basePrice = productToUse.price || productToUse.basePrice || 0;
            let optionsPrice = 0;
            const breakdown = [];

            parameters.forEach(param => {
                const selectedValue = selectedParams[param.id];
                if (selectedValue === undefined || selectedValue === null || selectedValue === '') return;

                let paramPrice = 0;
                let paramLabel = '';

                // Handle different parameter types
                switch (param.type) {
                    case 'SELECT':
                    case 'COLOR':
                        const option = param.options?.find(o => o.id === selectedValue);
                        if (option) {
                            paramPrice = option.priceImpact || 0;
                            paramLabel = `${param.name}: ${option.label}`;
                        }
                        break;

                    case 'BOOLEAN':
                        const boolOption = param.options?.find(o => o.id === selectedValue);
                        if (boolOption) {
                            paramPrice = boolOption.priceImpact || 0;
                            paramLabel = `${param.name}: ${boolOption.label}`;
                        }
                        break;

                    case 'NUMBER':
                    case 'NUMBER_OR_NONE':
                        if (selectedValue && selectedValue !== 'none' && !isNaN(selectedValue)) {
                            const numValue = Number(selectedValue);
                            if (param.priceImpactFormula) {
                                // Evaluate formula (e.g., "height * 10" or "width * 8")
                                try {
                                    const formula = param.priceImpactFormula.replace(param.id.replace('param-', ''), numValue);
                                    paramPrice = eval(formula) || 0;
                                } catch (e) {
                                    paramPrice = param.priceImpact || 0;
                                }
                            } else {
                                paramPrice = param.priceImpact || 0;
                            }
                            paramLabel = `${param.name}: ${numValue}${param.unit ? ' ' + param.unit : ''}`;
                        }
                        break;

                    case 'SELECT_WITH_NUMBER':
                        // Format: "optionId:count" (e.g., "yes:50")
                        if (selectedValue && selectedValue.includes(':')) {
                            const [optId, count] = selectedValue.split(':');
                            const opt = param.options?.find(o => o.id === optId);
                            if (opt && count && !isNaN(count)) {
                                const numCount = Number(count);
                                if (param.priceImpactFormula) {
                                    try {
                                        const formula = param.priceImpactFormula.replace('count', numCount);
                                        paramPrice = eval(formula) || 0;
                                    } catch (e) {
                                        paramPrice = opt.priceImpact || 0;
                                    }
                                } else {
                                    paramPrice = (opt.priceImpact || 0) * numCount;
                                }
                                paramLabel = `${param.name}: ${opt.label} (${numCount})`;
                            }
                        }
                        break;

                    case 'TEXT':
                    case 'TEXTAREA':
                        if (param.priceImpact) {
                            paramPrice = param.priceImpact;
                            paramLabel = param.name;
                        }
                        break;

                    case 'FILE_UPLOAD':
                        // File uploads typically don't affect price directly
                        break;

                    default:
                        break;
                }

                if (paramPrice > 0) {
                    optionsPrice += paramPrice;
                    breakdown.push({
                        name: paramLabel,
                        value: paramPrice
                    });
                }
            });

            setCalculatedPrice({
                finalPrice: basePrice + optionsPrice,
                breakdown
            });

            // Notify parent
            if (onConfigurationChange) {
                onConfigurationChange({
                    selectedParameters: Object.entries(selectedParams).map(([k, v]) => ({
                        parameterId: k,
                        value: v
                    })),
                    finalPrice: basePrice + optionsPrice,
                    breakdown
                });
            }

        } catch (err) {
            console.error('Failed to calculate price:', err);
        }
    };

    const handleParameterChange = (parameterId, optionId) => {
        setSelectedParams(prev => ({
            ...prev,
            [parameterId]: optionId
        }));
    };

    // Show loading only if:
    // - We're loading AND (no variants available OR a variant is already selected)
    // This allows showing variant selection even while parameters are loading
    if (loading && (variants.length === 0 || selectedVariant)) {
        return <div className="configurator-loading">{language === 'he' ? 'טוען פרמטרים...' : 'Loading parameters...'}</div>;
    }

    if (!product) return null;

    return (
        <div className="product-configurator">
            <div className="configurator-header">
                <h4>{language === 'he' ? 'התאמה אישית' : 'Customize Product'}</h4>
                <p>{language === 'he' ? 'בחר אפשרויות למוצר' : 'Select options for this product'}</p>
            </div>

            {/* Variant Selection (if base product with variants) */}
            {variants.length > 0 && !selectedVariant && (
                <div className="variant-selection">
                    <div className="variant-header">
                        <h5>{language === 'he' ? 'בחר דגם ורמת מורכבות' : 'Select Design & Complexity'}</h5>
                        <p>{language === 'he' ? `נמצאו ${variants.length} דגמים זמינים` : `${variants.length} designs available`}</p>
                    </div>

                    {loadingVariants ? (
                        <div className="variants-loading">{language === 'he' ? 'טוען דגמים...' : 'Loading designs...'}</div>
                    ) : (
                        <div className="variants-grid">
                            {/* Group by design tag */}
                            {(() => {
                                const grouped = {};
                                variants.forEach(v => {
                                    if (!grouped[v.designTag]) grouped[v.designTag] = [];
                                    grouped[v.designTag].push(v);
                                });

                                return Object.entries(grouped).map(([designTag, designVariants]) => (
                                    <div key={designTag} className="design-group">
                                        <h6 className="design-name">{designTag}</h6>
                                        <div className="complexity-options">
                                            {designVariants
                                                .sort((a, b) => {
                                                    const order = { SIMPLE: 1, MEDIUM: 2, FULL: 3 };
                                                    return order[a.complexityLevel] - order[b.complexityLevel];
                                                })
                                                .map(variant => (
                                                    <button
                                                        key={variant.id}
                                                        type="button"
                                                        className="variant-card"
                                                        onClick={() => {
                                                            setSelectedVariant(variant);
                                                            if (onVariantSelect) {
                                                                onVariantSelect(variant);
                                                            }
                                                        }}
                                                    >
                                                        <div className="variant-complexity">
                                                            {variant.complexityLevel === 'SIMPLE' && (language === 'he' ? 'פשוטה' : 'Simple')}
                                                            {variant.complexityLevel === 'MEDIUM' && (language === 'he' ? 'בינונית' : 'Medium')}
                                                            {variant.complexityLevel === 'FULL' && (language === 'he' ? 'מלאה' : 'Full')}
                                                        </div>
                                                        <div className="variant-catalog-code">{variant.catalogCode}</div>
                                                        <div className="variant-price">₪{variant.basePrice.toLocaleString()}</div>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Show selected variant info */}
            {selectedVariant && (
                <div className="selected-variant-info">
                    <div className="variant-badge">
                        <strong>{language === 'he' ? 'דגם נבחר:' : 'Selected:'}</strong> {selectedVariant.name}
                    </div>
                    <button
                        type="button"
                        className="change-variant-btn"
                        onClick={() => {
                            setSelectedVariant(null);
                            setSelectedParams({});
                            setCalculatedPrice(null);
                        }}
                    >
                        {language === 'he' ? 'שנה דגם' : 'Change Design'}
                    </button>
                </div>
            )}

            {/* Parameters Form - only show if variant is selected OR product has no variants */}
            {(selectedVariant || (variants.length === 0 && product?.parentProductId)) && (
                <div className="parameters-form">
                {parameters.map((param) => {
                    const isRequired = param.isRequired;

                    return (
                        <div key={param.id} className="parameter-field">
                            <label className="parameter-label">
                                {param.name}
                                {isRequired && <span className="required-star">*</span>}
                            </label>
                            {param.description && (
                                <div className="parameter-hint">
                                    <Info size={14} />
                                    <span>{param.description}</span>
                                </div>
                            )}

                            {/* Render based on parameter type */}
                            {param.type === 'COLOR' && (
                                <div className="color-options">
                                    {param.options?.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`color-option ${selectedParams[param.id] === option.id ? 'selected' : ''}`}
                                            onClick={() => handleParameterChange(param.id, option.id)}
                                            title={option.label}
                                        >
                                            <div className="color-circle-wrapper">
                                                <div
                                                    className="color-swatch-circle"
                                                    style={{ background: option.colorHex }}
                                                />
                                            </div>
                                            <span className="color-label">{option.label}</span>
                                            {option.priceImpact !== 0 && (
                                                <span className="option-price">
                                                    {option.priceImpact > 0 ? '+' : ''}${option.priceImpact}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {param.type === 'SELECT' && (
                                <select
                                    className="parameter-select"
                                    value={selectedParams[param.id] || ''}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    required={isRequired}
                                >
                                    <option value="">
                                        {language === 'he' ? 'בחר...' : 'Select...'}
                                    </option>
                                    {param.options?.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                            {option.priceImpact !== 0 && ` (+$${option.priceImpact})`}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {param.type === 'TEXT' && (
                                <input
                                    type="text"
                                    className="parameter-input"
                                    placeholder={param.description || param.name}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    required={isRequired}
                                />
                            )}

                            {param.type === 'NUMBER' && (
                                <div className="number-input-wrapper">
                                    <input
                                        type="number"
                                        className="parameter-input"
                                        placeholder={param.description || param.name}
                                        value={selectedParams[param.id] || ''}
                                        onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                        required={isRequired}
                                        min={param.min}
                                        max={param.max}
                                    />
                                    {param.unit && <span className="input-unit">{param.unit}</span>}
                                </div>
                            )}

                            {param.type === 'NUMBER_OR_NONE' && (
                                <div className="number-or-none-wrapper">
                                    <select
                                        className="parameter-select"
                                        value={selectedParams[param.id] === 'none' || !selectedParams[param.id] ? 'none' : 'custom'}
                                        onChange={(e) => {
                                            if (e.target.value === 'none') {
                                                handleParameterChange(param.id, 'none');
                                            }
                                        }}
                                    >
                                        <option value="none">{language === 'he' ? 'ללא' : 'None'}</option>
                                        <option value="custom">{language === 'he' ? 'מותאם אישית' : 'Custom'}</option>
                                    </select>
                                    {selectedParams[param.id] !== 'none' && selectedParams[param.id] !== undefined && (
                                        <div className="custom-number-input">
                                            <input
                                                type="number"
                                                className="parameter-input"
                                                placeholder={param.description || '0'}
                                                value={selectedParams[param.id] === 'none' ? '' : selectedParams[param.id]}
                                                onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                                min={param.min}
                                                max={param.max}
                                            />
                                            {param.unit && <span className="input-unit">{param.unit}</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {param.type === 'BOOLEAN' && (
                                <div className="boolean-options">
                                    {param.options?.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`boolean-option ${selectedParams[param.id] === option.id ? 'selected' : ''}`}
                                            onClick={() => handleParameterChange(param.id, option.id)}
                                        >
                                            {selectedParams[param.id] === option.id ? (
                                                <CheckSquare size={20} />
                                            ) : (
                                                <Square size={20} />
                                            )}
                                            <span>{option.label}</span>
                                            {option.priceImpact !== 0 && (
                                                <span className="option-price">
                                                    {option.priceImpact > 0 ? '+' : ''}₪{option.priceImpact}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {param.type === 'SELECT_WITH_NUMBER' && (
                                <div className="select-with-number-wrapper">
                                    <select
                                        className="parameter-select"
                                        value={selectedParams[param.id]?.split(':')[0] || ''}
                                        onChange={(e) => {
                                            const optionId = e.target.value;
                                            const currentCount = selectedParams[param.id]?.split(':')[1] || '0';
                                            handleParameterChange(param.id, `${optionId}:${currentCount}`);
                                        }}
                                        required={isRequired}
                                    >
                                        <option value="">{language === 'he' ? 'בחר...' : 'Select...'}</option>
                                        {param.options?.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedParams[param.id]?.split(':')[0] && (
                                        <input
                                            type="number"
                                            className="parameter-input count-input"
                                            placeholder={language === 'he' ? 'כמות' : 'Count'}
                                            value={selectedParams[param.id]?.split(':')[1] || ''}
                                            onChange={(e) => {
                                                const optionId = selectedParams[param.id]?.split(':')[0];
                                                handleParameterChange(param.id, `${optionId}:${e.target.value}`);
                                            }}
                                            min="0"
                                        />
                                    )}
                                </div>
                            )}

                            {param.type === 'TEXTAREA' && (
                                <textarea
                                    className="parameter-textarea"
                                    placeholder={param.description || param.name}
                                    value={selectedParams[param.id] || ''}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    required={isRequired}
                                    rows={param.rows || 4}
                                />
                            )}

                            {param.type === 'FILE_UPLOAD' && (
                                <div className="file-upload-wrapper">
                                    <label className="file-upload-label">
                                        <Upload size={20} />
                                        <span>{language === 'he' ? 'העלה קובץ' : 'Upload File'}</span>
                                        <input
                                            type="file"
                                            className="file-input-hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Store file name for now (in real app, upload to server)
                                                    handleParameterChange(param.id, file.name);
                                                }
                                            }}
                                            accept={param.accept || '*'}
                                        />
                                    </label>
                                    {selectedParams[param.id] && (
                                        <div className="uploaded-file">
                                            <FileText size={16} />
                                            <span>{selectedParams[param.id]}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            )}

            {/* Price Breakdown */}
            {calculatedPrice && (
                <div className="price-breakdown">
                    <div className="breakdown-header">
                        <DollarSign size={18} />
                        <h5>{language === 'he' ? 'פירוט מחיר' : 'Price Breakdown'}</h5>
                    </div>
                    <div className="breakdown-items">
                        {calculatedPrice.breakdown.map((item, idx) => (
                            <div key={idx} className="breakdown-item">
                                <span className="item-name">{item.name || item.optionLabel}</span>
                                <span className="item-value">${item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="breakdown-total">
                        <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                        <span className="total-price">${calculatedPrice.finalPrice}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductConfigurator;
