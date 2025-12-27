import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    User,
    Bell,
    Palette,
    Shield,
    Save,
    Check,
    GitBranch,
    Plus,
    Trash2,
    GripVertical,
    Edit3
} from 'lucide-react';
import './SettingsPage.css';

function SettingsPage({ currentUser }) {
    const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

    const [profile, setProfile] = useState({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });

    // Pipeline Stages State
    const [salesStages, setSalesStages] = useState(() => {
        const saved = localStorage.getItem('salesPipelineStages');
        return saved ? JSON.parse(saved) : [
            { id: 'NEW', label: 'חדש', color: '#6366f1' },
            { id: 'CONTACT', label: 'יצירת קשר', color: '#3b82f6' },
            { id: 'MEETING', label: 'פגישה', color: '#8b5cf6' },
            { id: 'NEGOTIATION', label: 'משא ומתן', color: '#f59e0b' },
            { id: 'WON', label: 'זכייה', color: '#10b981' },
            { id: 'LOST', label: 'הפסד', color: '#ef4444' }
        ];
    });
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('#6366f1');
    const [editingStage, setEditingStage] = useState(null);

    const savePipelineStages = (stages) => {
        setSalesStages(stages);
        localStorage.setItem('salesPipelineStages', JSON.stringify(stages));
    };

    const addStage = () => {
        if (!newStageName.trim()) return;
        const id = newStageName.toUpperCase().replace(/\s+/g, '_');
        const newStages = [...salesStages, { id, label: newStageName, color: newStageColor }];
        savePipelineStages(newStages);
        setNewStageName('');
        setNewStageColor('#6366f1');
    };

    const removeStage = (stageId) => {
        if (['WON', 'LOST'].includes(stageId)) return; // Can't remove these
        const newStages = salesStages.filter(s => s.id !== stageId);
        savePipelineStages(newStages);
    };

    const updateStage = (stageId, updates) => {
        const newStages = salesStages.map(s => s.id === stageId ? { ...s, ...updates } : s);
        savePipelineStages(newStages);
        setEditingStage(null);
    };


    return (
        <div className="settings-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>הגדרות</h2>
                    <p>ניהול חשבון והעדפות</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-section glass-card">
                    <div className="section-header">
                        <User size={20} />
                        <h3>פרטי חשבון</h3>
                    </div>
                    <div className="settings-content">
                        <div className="form-row">
                            <div className="form-group">
                                <label>שם פרטי</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label>שם משפחה</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>אימייל</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div className="form-group">
                            <label>טלפון</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="input"
                                placeholder="050-1234567"
                            />
                        </div>
                        <button className="btn btn-primary">
                            <Save size={16} />
                            שמור שינויים
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section glass-card">
                    <div className="section-header">
                        <Bell size={20} />
                        <h3>התראות</h3>
                    </div>
                    <div className="settings-content">
                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">התראות אימייל</span>
                                    <span className="toggle-desc">קבלת עדכונים במייל</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">התראות Push</span>
                                    <span className="toggle-desc">התראות בדפדפן</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">התראות SMS</span>
                                    <span className="toggle-desc">קבלת הודעות טקסט</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.sms}
                                        onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="settings-section glass-card">
                    <div className="section-header">
                        <Palette size={20} />
                        <h3>מראה</h3>
                    </div>
                    <div className="settings-content">
                        <div className="form-group">
                            <label>ערכת נושא</label>
                            <div className="theme-options">
                                {['dark', 'light', 'auto'].map(t => (
                                    <button
                                        key={t}
                                        className={`theme-option ${theme === t ? 'active' : ''}`}
                                        onClick={() => setTheme(t)}
                                    >
                                        {t === 'dark' ? 'כהה' : t === 'light' ? 'בהיר' : 'אוטומטי'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>צבע ראשי</label>
                            <div className="color-options">
                                {[
                                    { name: 'purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                                    { name: 'pink', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                                    { name: 'blue', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                                    { name: 'green', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
                                ].map(color => (
                                    <button
                                        key={color.name}
                                        className={`color-option ${primaryColor === color.name ? 'active' : ''}`}
                                        style={{ background: color.gradient }}
                                        onClick={() => setPrimaryColor(color.name)}
                                    >
                                        {(primaryColor === color.name || (!primaryColor && color.name === 'purple')) && <Check size={16} color="white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Pipeline Settings */}
                {currentUser.role === 'ADMIN' && (
                    <div className="settings-section glass-card">
                        <div className="section-header">
                            <GitBranch size={20} />
                            <h3>שלבי מכירות (Pipeline)</h3>
                        </div>
                        <div className="settings-content">
                            <p style={{ opacity: 0.7, marginBottom: '16px' }}>
                                הגדר את השלבים שכל ליד עובר בתהליך המכירה
                            </p>

                            {/* Current Stages */}
                            <div className="pipeline-stages-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                {salesStages.map((stage, index) => (
                                    <div key={stage.id} className="stage-item" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        borderInlineStart: `4px solid ${stage.color}`
                                    }}>
                                        <GripVertical size={16} style={{ opacity: 0.4, cursor: 'grab' }} />
                                        <span className="stage-number" style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: stage.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </span>

                                        {editingStage === stage.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    defaultValue={stage.label}
                                                    style={{ flex: 1 }}
                                                    onBlur={(e) => updateStage(stage.id, { label: e.target.value })}
                                                    autoFocus
                                                />
                                                <input
                                                    type="color"
                                                    defaultValue={stage.color}
                                                    onChange={(e) => updateStage(stage.id, { color: e.target.value })}
                                                    style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px' }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ flex: 1 }}>{stage.label}</span>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => setEditingStage(stage.id)}
                                                    style={{ opacity: 0.6 }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </>
                                        )}

                                        {!['WON', 'LOST'].includes(stage.id) && (
                                            <button
                                                className="icon-btn danger"
                                                onClick={() => removeStage(stage.id)}
                                                style={{ opacity: 0.6 }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add New Stage */}
                            <div className="add-stage-form" style={{
                                display: 'flex',
                                gap: '8px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: '1px dashed rgba(255,255,255,0.2)'
                            }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="שם שלב חדש..."
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="color"
                                    value={newStageColor}
                                    onChange={(e) => setNewStageColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px' }}
                                />
                                <button className="btn btn-primary" onClick={addStage}>
                                    <Plus size={16} />
                                    הוסף שלב
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security */}
                <div className="settings-section glass-card">
                    <div className="section-header">
                        <Shield size={20} />
                        <h3>אבטחה</h3>
                    </div>
                    <div className="settings-content">
                        <div className="form-group">
                            <label>סיסמה נוכחית</label>
                            <input type="password" className="input" placeholder="הזן סיסמה נוכחית" />
                        </div>
                        <div className="form-group">
                            <label>סיסמה חדשה</label>
                            <input type="password" className="input" placeholder="הזן סיסמה חדשה" />
                        </div>
                        <div className="form-group">
                            <label>אימות סיסמה</label>
                            <input type="password" className="input" placeholder="הזן סיסמה חדשה שוב" />
                        </div>
                        <button className="btn btn-outline">
                            <Shield size={16} />
                            עדכון סיסמה
                        </button>
                    </div>
                </div>
            </div>

            {/* Current User Info */}
            <div className="user-info-card glass-card">
                <h3>פרטי משתמש מחובר</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">שם</span>
                        <span className="info-value">{currentUser.firstName} {currentUser.lastName}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">תפקיד</span>
                        <span className="info-value role">{currentUser.role}</span>
                    </div>
                    {currentUser.department && (
                        <div className="info-item">
                            <span className="info-label">מחלקה</span>
                            <span className="info-value" style={{ color: currentUser.department.color }}>
                                {currentUser.department.name}
                            </span>
                        </div>
                    )}
                    <div className="info-item">
                        <span className="info-label">אימייל</span>
                        <span className="info-value">{currentUser.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
