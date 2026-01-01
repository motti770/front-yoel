import { useState, useEffect } from 'react';
import { Shirt, Palette, AlertTriangle, Check, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { materialsService } from '../services/api';
import './MaterialSelector.css';

/**
 * Material Selector Component
 * Allows users to select materials (fabrics, threads, accessories) for a product
 * Checks stock availability and shows warnings for low stock
 */
function MaterialSelector({ productId, quantity = 1, language = 'he', onMaterialsChange }) {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [stockWarnings, setStockWarnings] = useState([]);

    // Material category labels
    const categoryLabels = {
        he: {
            FABRIC: 'בד',
            THREAD: 'חוטי רקמה',
            ACCESSORY: 'אביזרים',
            BACKING: 'בטנה'
        },
        en: {
            FABRIC: 'Fabric',
            THREAD: 'Embroidery Thread',
            ACCESSORY: 'Accessories',
            BACKING: 'Backing'
        }
    };

    const categoryIcons = {
        FABRIC: Shirt,
        THREAD: Palette,
        ACCESSORY: Package,
        BACKING: Package
    };

    // Fetch materials for the product
    useEffect(() => {
        if (productId) {
            fetchMaterials();
        }
    }, [productId]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            // Get materials associated with this product
            const result = await materialsService.getByProduct(productId);
            if (result.success) {
                // Handle both array and { materials: [] } formats
                const materialsList = Array.isArray(result.data)
                    ? result.data
                    : (result.data?.materials || []);
                setMaterials(materialsList);
                // Auto-expand first category
                const categories = [...new Set(materialsList.map(m => m.category))];
                if (categories.length > 0) {
                    setExpandedCategory(categories[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        } finally {
            setLoading(false);
        }
    };

    // Group materials by category
    const groupedMaterials = materials.reduce((acc, material) => {
        if (!acc[material.category]) acc[material.category] = [];
        acc[material.category].push(material);
        return acc;
    }, {});

    // Check stock availability when selection changes
    useEffect(() => {
        checkStockAvailability();
    }, [selectedMaterials, quantity]);

    const checkStockAvailability = () => {
        const warnings = [];
        Object.entries(selectedMaterials).forEach(([category, materialId]) => {
            const material = materials.find(m => m.id === materialId);
            if (material) {
                const requiredQty = quantity; // In real implementation, might need more complex calculation
                if (material.stockQuantity < requiredQty) {
                    warnings.push({
                        materialId,
                        name: language === 'he' ? material.name : (material.nameEn || material.name),
                        available: material.stockQuantity,
                        required: requiredQty,
                        type: 'critical'
                    });
                } else if (material.stockQuantity <= material.reorderLevel) {
                    warnings.push({
                        materialId,
                        name: language === 'he' ? material.name : (material.nameEn || material.name),
                        available: material.stockQuantity,
                        required: requiredQty,
                        type: 'low'
                    });
                }
            }
        });
        setStockWarnings(warnings);

        // Notify parent
        if (onMaterialsChange) {
            const selected = Object.entries(selectedMaterials).map(([category, materialId]) => {
                const material = materials.find(m => m.id === materialId);
                return {
                    category,
                    materialId,
                    material: material ? {
                        id: material.id,
                        name: material.name,
                        nameEn: material.nameEn,
                        code: material.code,
                        colorHex: material.colorHex,
                        stockQuantity: material.stockQuantity
                    } : null
                };
            }).filter(s => s.material);

            onMaterialsChange({
                selectedMaterials: selected,
                stockWarnings: warnings,
                hasStockIssues: warnings.some(w => w.type === 'critical')
            });
        }
    };

    const handleMaterialSelect = (category, materialId) => {
        setSelectedMaterials(prev => ({
            ...prev,
            [category]: materialId
        }));
    };

    const getStockStatus = (material) => {
        if (material.stockQuantity <= 0) return 'out';
        if (material.stockQuantity <= material.reorderLevel) return 'low';
        return 'ok';
    };

    const toggleCategory = (category) => {
        setExpandedCategory(prev => prev === category ? null : category);
    };

    if (loading) {
        return (
            <div className="material-selector loading">
                <span>{language === 'he' ? 'טוען חומרים...' : 'Loading materials...'}</span>
            </div>
        );
    }

    if (materials.length === 0) {
        return null; // No materials configured for this product
    }

    return (
        <div className="material-selector">
            <div className="material-selector-header">
                <Shirt size={18} />
                <h5>{language === 'he' ? 'בחירת חומרים' : 'Select Materials'}</h5>
            </div>

            {/* Stock Warnings */}
            {stockWarnings.length > 0 && (
                <div className="stock-warnings">
                    {stockWarnings.map(warning => (
                        <div
                            key={warning.materialId}
                            className={`stock-warning ${warning.type}`}
                        >
                            <AlertTriangle size={14} />
                            <span>
                                {warning.type === 'critical'
                                    ? (language === 'he'
                                        ? `${warning.name}: חסר במלאי! (נדרש ${warning.required}, יש ${warning.available})`
                                        : `${warning.name}: Out of stock! (Need ${warning.required}, have ${warning.available})`)
                                    : (language === 'he'
                                        ? `${warning.name}: מלאי נמוך (${warning.available} יחידות)`
                                        : `${warning.name}: Low stock (${warning.available} units)`)
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Material Categories */}
            <div className="material-categories">
                {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => {
                    const CategoryIcon = categoryIcons[category] || Package;
                    const isExpanded = expandedCategory === category;
                    const selectedMaterial = categoryMaterials.find(
                        m => m.id === selectedMaterials[category]
                    );

                    return (
                        <div key={category} className="material-category">
                            <button
                                type="button"
                                className={`category-header ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleCategory(category)}
                            >
                                <div className="category-info">
                                    <CategoryIcon size={16} />
                                    <span className="category-name">
                                        {categoryLabels[language]?.[category] || category}
                                    </span>
                                    {selectedMaterial && (
                                        <span className="selected-preview">
                                            {selectedMaterial.colorHex && (
                                                <span
                                                    className="color-dot"
                                                    style={{ background: selectedMaterial.colorHex }}
                                                />
                                            )}
                                            <span>
                                                {language === 'he'
                                                    ? selectedMaterial.name
                                                    : (selectedMaterial.nameEn || selectedMaterial.name)}
                                            </span>
                                            <Check size={14} className="check-icon" />
                                        </span>
                                    )}
                                </div>
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {isExpanded && (
                                <div className="material-options">
                                    {categoryMaterials.map(material => {
                                        const stockStatus = getStockStatus(material);
                                        const isSelected = selectedMaterials[category] === material.id;
                                        const isDisabled = stockStatus === 'out';

                                        return (
                                            <button
                                                key={material.id}
                                                type="button"
                                                className={`material-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} stock-${stockStatus}`}
                                                onClick={() => !isDisabled && handleMaterialSelect(category, material.id)}
                                                disabled={isDisabled}
                                            >
                                                {material.colorHex && (
                                                    <span
                                                        className="material-color"
                                                        style={{ background: material.colorHex }}
                                                    />
                                                )}
                                                <div className="material-info">
                                                    <span className="material-name">
                                                        {language === 'he'
                                                            ? material.name
                                                            : (material.nameEn || material.name)}
                                                    </span>
                                                    <span className="material-code">{material.code}</span>
                                                </div>
                                                <div className="material-stock">
                                                    <span className={`stock-indicator ${stockStatus}`}>
                                                        {stockStatus === 'out'
                                                            ? (language === 'he' ? 'אזל' : 'Out')
                                                            : stockStatus === 'low'
                                                                ? (language === 'he' ? 'נמוך' : 'Low')
                                                                : material.stockQuantity}
                                                    </span>
                                                    <span className="stock-unit">{material.stockUnit}</span>
                                                </div>
                                                {isSelected && <Check size={16} className="selected-check" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MaterialSelector;
