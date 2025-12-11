import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Shield,
    Building2,
    Mail
} from 'lucide-react';
import { mockUsers, mockDepartments } from '../data/mockData';
import './UsersPage.css';

function UsersPage({ currentUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Only ADMIN can access this page
    if (currentUser.role !== 'ADMIN') {
        return (
            <div className="access-denied glass-card">
                <Shield size={48} />
                <h2>אין הרשאה</h2>
                <p>רק מנהלים ראשיים יכולים לגשת לדף זה</p>
            </div>
        );
    }

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleColors = {
        ADMIN: '#667eea',
        MANAGER: '#f5576c',
        EMPLOYEE: '#4facfe'
    };

    const roleLabels = {
        ADMIN: 'מנהל ראשי',
        MANAGER: 'מנהל',
        EMPLOYEE: 'עובד'
    };

    return (
        <div className="users-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>ניהול משתמשים</h2>
                    <p>{filteredUsers.length} משתמשים</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    משתמש חדש
                </button>
            </div>

            {/* Filters */}
            <div className="toolbar glass-card">
                <div className="toolbar-right">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="חיפוש משתמשים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">כל התפקידים</option>
                            <option value="ADMIN">מנהל ראשי</option>
                            <option value="MANAGER">מנהל</option>
                            <option value="EMPLOYEE">עובד</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="users-grid">
                {filteredUsers.map(user => (
                    <div key={user.id} className="user-card glass-card">
                        <div className="user-header">
                            <div
                                className="user-avatar"
                                style={{ background: roleColors[user.role] }}
                            >
                                {user.avatar}
                            </div>
                            <div
                                className="user-role-badge"
                                style={{
                                    background: `${roleColors[user.role]}20`,
                                    color: roleColors[user.role]
                                }}
                            >
                                <Shield size={12} />
                                {roleLabels[user.role]}
                            </div>
                        </div>

                        <div className="user-info">
                            <h3>{user.firstName} {user.lastName}</h3>
                            <a href={`mailto:${user.email}`} className="user-email">
                                <Mail size={14} />
                                {user.email}
                            </a>
                            {user.phone && (
                                <span className="user-phone">{user.phone}</span>
                            )}
                        </div>

                        {user.department && (
                            <div
                                className="user-department"
                                style={{
                                    background: `${user.department.color}20`,
                                    color: user.department.color
                                }}
                            >
                                <Building2 size={14} />
                                {user.department.name}
                            </div>
                        )}

                        <div className="user-meta">
                            <span>נוצר: {user.createdAt}</span>
                        </div>

                        <div className="user-actions">
                            <button className="action-btn">
                                <Edit size={16} />
                                עריכה
                            </button>
                            {user.id !== currentUser.id && (
                                <button className="action-btn danger">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Role Management Info */}
            <div className="roles-info glass-card">
                <h3>הרשאות לפי תפקיד</h3>
                <div className="roles-grid">
                    <div className="role-item">
                        <div className="role-header" style={{ borderColor: roleColors.ADMIN }}>
                            <Shield size={20} style={{ color: roleColors.ADMIN }} />
                            <span>מנהל ראשי (ADMIN)</span>
                        </div>
                        <ul>
                            <li>גישה מלאה לכל המערכת</li>
                            <li>ניהול משתמשים ותפקידים</li>
                            <li>מחיקת נתונים</li>
                            <li>הגדרות מערכת</li>
                        </ul>
                    </div>
                    <div className="role-item">
                        <div className="role-header" style={{ borderColor: roleColors.MANAGER }}>
                            <Shield size={20} style={{ color: roleColors.MANAGER }} />
                            <span>מנהל (MANAGER)</span>
                        </div>
                        <ul>
                            <li>צפייה ועריכה של כל הנתונים</li>
                            <li>ניהול הזמנות ומשימות</li>
                            <li>ניהול מוצרים ותהליכים</li>
                            <li>ללא גישה לניהול משתמשים</li>
                        </ul>
                    </div>
                    <div className="role-item">
                        <div className="role-header" style={{ borderColor: roleColors.EMPLOYEE }}>
                            <Shield size={20} style={{ color: roleColors.EMPLOYEE }} />
                            <span>עובד (EMPLOYEE)</span>
                        </div>
                        <ul>
                            <li>צפייה במשימות שלו בלבד</li>
                            <li>עדכון סטטוס משימות</li>
                            <li>Dashboard מצומצם</li>
                            <li>לוח שנה והגדרות אישיות</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
