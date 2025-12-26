import { useState, useEffect } from 'react';
import { Palette, DollarSign, Info } from 'lucide-react';
import { parametersService, productsService } from '../services/api';
import './ProductConfigurator.css';

/**
 * Product Configurator Component
 * Allows users to select product parameters and calculates price in real-time
 */
function ProductConfigurator({ product, onConfigurationChange, language = 'he' }) {
    const [parameters, setParameters] = useState([]);
    const [selectedParams, setSelectedParams] = useState({});
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch product parameters
    useEffect(() => {
        if (product?.id) {
            fetchParameters();
        }
    }, [product?.id]);

    const fetchParameters = async () => {
        try {
            setLoading(true);
            // Use productsService to get parameters for this specific product
            const response = await productsService.getParameters(product.id);

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
            // Local calculation for immediate feedback (until API is connected)
            let basePrice = product.price || product.basePrice || 0;
            let optionsPrice = 0;
            const breakdown = [];

            parameters.forEach(param => {
                const selectedOptionId = selectedParams[param.id];
                if (selectedOptionId) {
                    if (param.type === 'SELECT' || param.type === 'COLOR') {
                        const option = param.options?.find(o => o.id === selectedOptionId);
                        if (option) {
                            optionsPrice += (option.priceImpact || 0);
                            if (option.priceImpact > 0) {
                                breakdown.push({
                                    name: `${param.name}: ${option.label}`,
                                    value: option.priceImpact
                                });
                            }
                        }
                    }
                }
            });

            setCalculatedPrice({
                finalPrice: basePrice + optionsPrice,
                breakdown
            });

            // Notify parent
            if (onConfigurationChange) {
                onConfigurationChange({
                    selectedParameters: Object.entries(selectedParams).map(([k, v]) => ({ parameterId: k, optionId: v })),
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

    if (loading) {
        return <div className="configurator-loading">{language === 'he' ? 'טוען...' : 'Loading...'}</div>;
    }

    if (!product) return null;

    return (
        <div className="product-configurator">
            <div className="configurator-header">
                <h4>{language === 'he' ? 'התאמה אישית' : 'Customize Product'}</h4>
                <p>{language === 'he' ? 'בחר אפשרויות למוצר' : 'Select options for this product'}</p>
            </div>

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
                                <input
                                    type="number"
                                    className="parameter-input"
                                    placeholder={param.description || param.name}
                                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                    required={isRequired}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

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
