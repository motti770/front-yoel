import { useState } from 'react';
import {
    User,
    Bell,
    Palette,
    Shield,
    Save
} from 'lucide-react';
import './SettingsPage.css';

function SettingsPage({ currentUser }) {
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

    const [theme, setTheme] = useState('dark');

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
                                        className="color-option"
                                        style={{ background: color.gradient }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

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
