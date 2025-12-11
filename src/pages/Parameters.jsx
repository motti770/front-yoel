import { useState } from 'react';
import {
    Plus,
    Sliders,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    Palette
} from 'lucide-react';
import { mockParameters } from '../data/mockData';
import './Parameters.css';

function Parameters({ currentUser }) {
    const [expandedParam, setExpandedParam] = useState(null);

    const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

    const typeLabels = {
        TEXT: 'טקסט',
        SELECT: 'בחירה',
        COLOR: 'צבע',
        NUMBER: 'מספר',
        DATE: 'תאריך'
    };

    const typeColors = {
        TEXT: '#4facfe',
        SELECT: '#667eea',
        COLOR: '#f5576c',
        NUMBER: '#fee140',
        DATE: '#00f2fe'
    };

    return (
        <div className="parameters-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>פרמטרים</h2>
                    <p>{mockParameters.length} פרמטרים</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        פרמטר חדש
                    </button>
                )}
            </div>

            <div className="parameters-list">
                {mockParameters.map(param => (
                    <div key={param.id} className="parameter-card glass-card">
                        <div
                            className="param-header"
                            onClick={() => setExpandedParam(expandedParam === param.id ? null : param.id)}
                        >
                            <div className="param-icon" style={{ background: `${typeColors[param.type]}20`, color: typeColors[param.type] }}>
                                {param.type === 'COLOR' ? <Palette size={20} /> : <Sliders size={20} />}
                            </div>

                            <div className="param-info">
                                <h3>{param.name}</h3>
                                <p>{param.description}</p>
                                <div className="param-meta">
                                    <span className="type-badge" style={{ background: `${typeColors[param.type]}20`, color: typeColors[param.type] }}>
                                        {typeLabels[param.type]}
                                    </span>
                                    <span className="code-badge">{param.code}</span>
                                    {param.isRequired && <span className="required-badge">חובה</span>}
                                    {param.options.length > 0 && <span className="options-count">{param.options.length} אפשרויות</span>}
                                </div>
                            </div>

                            <button className="expand-btn">
                                {expandedParam === param.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {expandedParam === param.id && param.options.length > 0 && (
                            <div className="param-options">
                                <h4>אפשרויות</h4>
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
                                                    <button className="action-btn"><Edit size={14} /></button>
                                                    <button className="action-btn danger"><Trash2 size={14} /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {canEdit && (
                                    <button className="add-option-btn">
                                        <Plus size={16} />
                                        הוסף אפשרות
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Parameters;
