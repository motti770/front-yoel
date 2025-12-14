import { useState } from 'react';
import {
    Upload,
    Package,
    Users,
    ShoppingCart,
    FileSpreadsheet,
    X,
    ArrowLeft,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import BulkImporter from '../components/BulkImporter';
import Modal from '../components/Modal';
import { customersService, productsService, ordersService } from '../services/api';
import './ImportPage.css';

// Entity configurations for import
const ENTITY_CONFIGS = {
    customers: {
        icon: Users,
        color: '#667eea',
        label: { he: 'לקוחות', en: 'Customers' },
        description: { he: 'ייבוא לקוחות חדשים למערכת', en: 'Import new customers to the system' },
        fields: [
            { key: 'name', label: 'שם לקוח / Customer Name', type: 'text', required: true },
            { key: 'email', label: 'אימייל / Email', type: 'email', required: true },
            { key: 'phone', label: 'טלפון / Phone', type: 'tel', required: false },
            { key: 'companyName', label: 'חברה / Company', type: 'text', required: false },
            { key: 'status', label: 'סטטוס / Status', type: 'select', required: false }
        ],
        service: customersService
    },
    products: {
        icon: Package,
        color: '#f5576c',
        label: { he: 'מוצרים', en: 'Products' },
        description: { he: 'ייבוא מוצרים וקטלוג', en: 'Import products and catalog' },
        fields: [
            { key: 'name', label: 'שם מוצר / Product Name', type: 'text', required: true },
            { key: 'sku', label: 'מק"ט / SKU', type: 'text', required: true },
            { key: 'price', label: 'מחיר / Price', type: 'number', required: true },
            { key: 'stockQuantity', label: 'מלאי / Stock', type: 'number', required: false },
            { key: 'description', label: 'תיאור / Description', type: 'text', required: false },
            { key: 'category', label: 'קטגוריה / Category', type: 'select', required: false }
        ],
        service: productsService
    },
    orders: {
        icon: ShoppingCart,
        color: '#00f2fe',
        label: { he: 'הזמנות', en: 'Orders' },
        description: { he: 'ייבוא הזמנות קיימות', en: 'Import existing orders' },
        fields: [
            { key: 'customerId', label: 'מזהה לקוח / Customer ID', type: 'text', required: true },
            { key: 'totalAmount', label: 'סכום / Amount', type: 'number', required: true },
            { key: 'status', label: 'סטטוס / Status', type: 'select', required: false },
            { key: 'notes', label: 'הערות / Notes', type: 'text', required: false }
        ],
        service: ordersService
    }
};

function ImportPage({ t, language }) {
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showImporter, setShowImporter] = useState(false);
    const [recentImports, setRecentImports] = useState([]);

    const handleEntitySelect = (entityKey) => {
        setSelectedEntity(entityKey);
    };

    const handleStartImport = () => {
        if (selectedEntity) {
            setShowImporter(true);
        }
    };

    const handleImport = async (data) => {
        const config = ENTITY_CONFIGS[selectedEntity];
        if (config && config.service) {
            const result = await config.service.create(data);
            if (!result.success) {
                throw new Error(result.error?.message || 'Import failed');
            }
            return result.data;
        }
        throw new Error('Unknown entity type');
    };

    const handleImportComplete = () => {
        // Add to recent imports
        setRecentImports(prev => [{
            entity: selectedEntity,
            date: new Date().toISOString(),
            count: 0 // Would be updated with actual count
        }, ...prev.slice(0, 4)]);

        setShowImporter(false);
        setSelectedEntity(null);
    };

    const labels = {
        he: {
            title: 'ייבוא נתונים',
            subtitle: 'ייבוא נתונים בכמות מקבצים חיצוניים',
            selectEntity: 'בחר סוג נתונים לייבוא',
            startImport: 'התחל ייבוא',
            recentImports: 'ייבואים אחרונים',
            noRecent: 'אין ייבואים אחרונים',
            supportedFormats: 'פורמטים נתמכים: CSV, Excel (.xlsx)',
            tips: 'טיפים לייבוא מוצלח',
            tip1: 'ודאו שהקובץ מכיל כותרות עמודות בשורה הראשונה',
            tip2: 'השתמשו בפורמט תאריכים עקבי',
            tip3: 'גבו את הנתונים שלכם לפני הייבוא'
        },
        en: {
            title: 'Import Data',
            subtitle: 'Bulk import data from external files',
            selectEntity: 'Select data type to import',
            startImport: 'Start Import',
            recentImports: 'Recent Imports',
            noRecent: 'No recent imports',
            supportedFormats: 'Supported formats: CSV, Excel (.xlsx)',
            tips: 'Tips for successful import',
            tip1: 'Make sure your file has column headers in the first row',
            tip2: 'Use consistent date formats',
            tip3: 'Back up your data before importing'
        }
    };

    const txt = labels[language] || labels.he;

    return (
        <div className="import-page">
            {/* Header */}
            <div className="page-header glass-card">
                <div className="header-content">
                    <div className="header-icon">
                        <Upload size={32} />
                    </div>
                    <div className="header-text">
                        <h1>{txt.title}</h1>
                        <p>{txt.subtitle}</p>
                    </div>
                </div>
                <div className="supported-formats">
                    <FileSpreadsheet size={16} />
                    <span>{txt.supportedFormats}</span>
                </div>
            </div>

            {/* Entity Selection */}
            <div className="import-section">
                <h2>{txt.selectEntity}</h2>
                <div className="entity-grid">
                    {Object.entries(ENTITY_CONFIGS).map(([key, config]) => (
                        <div
                            key={key}
                            className={`entity-card glass-card ${selectedEntity === key ? 'selected' : ''}`}
                            onClick={() => handleEntitySelect(key)}
                        >
                            <div className="entity-icon" style={{ background: config.color }}>
                                <config.icon size={28} />
                            </div>
                            <div className="entity-info">
                                <h3>{config.label[language] || config.label.he}</h3>
                                <p>{config.description[language] || config.description.he}</p>
                            </div>
                            {selectedEntity === key && (
                                <div className="selected-indicator">
                                    <CheckCircle2 size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {selectedEntity && (
                    <div className="import-action">
                        <button className="btn btn-primary btn-lg" onClick={handleStartImport}>
                            <Upload size={20} />
                            {txt.startImport}
                            {language === 'he' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Tips Section */}
            <div className="tips-section glass-card">
                <h3>{txt.tips}</h3>
                <ul>
                    <li><CheckCircle2 size={16} />{txt.tip1}</li>
                    <li><CheckCircle2 size={16} />{txt.tip2}</li>
                    <li><CheckCircle2 size={16} />{txt.tip3}</li>
                </ul>
            </div>

            {/* Recent Imports */}
            {recentImports.length > 0 && (
                <div className="recent-imports glass-card">
                    <h3>{txt.recentImports}</h3>
                    <div className="recent-list">
                        {recentImports.map((imp, idx) => {
                            const config = ENTITY_CONFIGS[imp.entity];
                            return (
                                <div key={idx} className="recent-item">
                                    <div className="recent-icon" style={{ background: config?.color }}>
                                        {config && <config.icon size={16} />}
                                    </div>
                                    <div className="recent-info">
                                        <span>{config?.label[language]}</span>
                                        <span className="recent-date">
                                            {new Date(imp.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Import Modal */}
            <Modal
                isOpen={showImporter}
                onClose={() => setShowImporter(false)}
                title=""
                size="large"
                hideHeader
            >
                {selectedEntity && (
                    <BulkImporter
                        entityType={selectedEntity}
                        targetFields={ENTITY_CONFIGS[selectedEntity].fields}
                        onImport={handleImport}
                        language={language}
                        onClose={handleImportComplete}
                    />
                )}
            </Modal>
        </div>
    );
}

export default ImportPage;
