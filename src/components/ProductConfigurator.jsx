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
                // Handle different data structures (Mock vs Real API)
                // Real API typically returns assignments: [{ parameter: { ... } }]
                // Mock might return direct parameters: [{ ... }]
                const rawParams = response.data.parameters || response.data || [];
                setParameters(rawParams);
            } else if (product.parameterAssignments) {
                // Fallback to product embedded parameters if available
                setParameters(product.parameterAssignments);
            }
        } catch (err) {
            console.error('Failed to fetch parameters:', err);
            // Fallback
            if (product.parameterAssignments) {
                setParameters(product.parameterAssignments);
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate price when selection changes
    useEffect(() => {
        if (Object.keys(selectedParams).length > 0) {
            calculatePrice();
        }
    }, [selectedParams]);

    const calculatePrice = async () => {
        try {
            const selectedParameters = Object.entries(selectedParams).map(([parameterId, optionId]) => ({
                parameterId,
                optionId
            }));

            const response = await parametersService.calculatePrice(product.id, selectedParameters);
            if (response.success) {
                setCalculatedPrice(response.data);
                // Notify parent component
                if (onConfigurationChange) {
                    onConfigurationChange({
                        selectedParameters,
                        finalPrice: response.data.finalPrice,
                        breakdown: response.data.breakdown
                    });
                }
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

    if (!product || !parameters || parameters.length === 0) {
        return null;
    }

    return (
        <div className="product-configurator">
            <div className="configurator-header">
                <h4>{language === 'he' ? 'התאמה אישית' : 'Customize Product'}</h4>
                <p>{language === 'he' ? 'בחר אפשרויות למוצר' : 'Select options for this product'}</p>
            </div>

            <div className="parameters-form">
                {parameters.map((assignment) => {
                    const param = assignment.parameter || assignment;
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
                                            <div
                                                className="color-swatch"
                                                style={{ background: option.colorHex }}
                                            />
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
