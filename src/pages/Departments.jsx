import {
    Plus,
    Building2,
    Users,
    CheckSquare,
    Edit,
    Trash2
} from 'lucide-react';
import { mockDepartments } from '../data/mockData';
import './Departments.css';

function Departments({ currentUser }) {
    const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
    const canDelete = currentUser.role === 'ADMIN';

    return (
        <div className="departments-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>מחלקות</h2>
                    <p>{mockDepartments.length} מחלקות</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        מחלקה חדשה
                    </button>
                )}
            </div>

            <div className="departments-grid">
                {mockDepartments.map(dept => (
                    <div key={dept.id} className="department-card glass-card">
                        <div
                            className="dept-color-bar"
                            style={{ background: dept.color }}
                        ></div>

                        <div className="dept-content">
                            <div className="dept-header">
                                <div
                                    className="dept-icon"
                                    style={{ background: `${dept.color}20`, color: dept.color }}
                                >
                                    <Building2 size={24} />
                                </div>
                                <div className="dept-status">
                                    <span className={`status-dot ${dept.isActive ? 'active' : ''}`}></span>
                                    {dept.isActive ? 'פעיל' : 'לא פעיל'}
                                </div>
                            </div>

                            <h3>{dept.name}</h3>
                            <span className="dept-code">{dept.code}</span>
                            <p>{dept.description}</p>

                            <div className="dept-stats">
                                <div className="stat-item">
                                    <Users size={18} />
                                    <div className="stat-info">
                                        <span className="stat-value">{dept.employeeCount}</span>
                                        <span className="stat-label">עובדים</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <CheckSquare size={18} />
                                    <div className="stat-info">
                                        <span className="stat-value">{dept.activeTasks}</span>
                                        <span className="stat-label">משימות</span>
                                    </div>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="dept-actions">
                                    <button className="action-btn">
                                        <Edit size={16} />
                                        עריכה
                                    </button>
                                    {canDelete && (
                                        <button className="action-btn danger">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Departments;
