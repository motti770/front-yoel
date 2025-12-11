import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Layers
} from 'lucide-react';
import { mockProducts } from '../data/mockData';
import './Products.css';

function Products({ currentUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredProducts = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categoryLabels = {
        RITUAL: 'יודאיקה',
        FURNITURE: 'ריהוט',
        PERSONAL: 'אישי'
    };

    const statusLabels = {
        ACTIVE: 'פעיל',
        DISCONTINUED: 'הופסק'
    };

    const categoryColors = {
        RITUAL: '#667eea',
        FURNITURE: '#f5576c',
        PERSONAL: '#4facfe'
    };

    return (
        <div className="products-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-info">
                    <h2>מוצרים</h2>
                    <p>{filteredProducts.length} מוצרים</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    מוצר חדש
                </button>
            </div>

            {/* Filters */}
            <div className="toolbar glass-card">
                <div className="toolbar-right">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="חיפוש מוצרים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">כל הקטגוריות</option>
                            <option value="RITUAL">יודאיקה</option>
                            <option value="FURNITURE">ריהוט</option>
                            <option value="PERSONAL">אישי</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Layers size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">כל הסטטוסים</option>
                            <option value="ACTIVE">פעיל</option>
                            <option value="DISCONTINUED">הופסק</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card glass-card">
                        <div className="product-image">
                            <Package size={48} />
                            {product.stockQuantity === 0 && (
                                <div className="out-of-stock-badge">
                                    <AlertTriangle size={14} />
                                    אזל מהמלאי
                                </div>
                            )}
                            {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                                <div className="low-stock-badge">
                                    <AlertTriangle size={14} />
                                    מלאי נמוך
                                </div>
                            )}
                        </div>

                        <div className="product-content">
                            <div className="product-header">
                                <span
                                    className="category-badge"
                                    style={{
                                        background: `${categoryColors[product.category]}20`,
                                        color: categoryColors[product.category]
                                    }}
                                >
                                    {categoryLabels[product.category]}
                                </span>
                                <span className="product-sku">{product.sku}</span>
                            </div>

                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>

                            <div className="product-meta">
                                <div className="meta-item">
                                    <span className="meta-label">מחיר</span>
                                    <span className="meta-value price">₪{product.price.toLocaleString()}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">מלאי</span>
                                    <span className={`meta-value stock ${product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 3 ? 'low' : ''}`}>
                                        {product.stockQuantity}
                                    </span>
                                </div>
                            </div>

                            {product.workflow && (
                                <div className="workflow-tag">
                                    <Layers size={14} />
                                    {product.workflow.name}
                                </div>
                            )}

                            <div className="product-actions">
                                <button className="action-btn" title="צפייה">
                                    <Eye size={16} />
                                </button>
                                <button className="action-btn" title="עריכה">
                                    <Edit size={16} />
                                </button>
                                <button className="action-btn danger" title="מחיקה">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;
