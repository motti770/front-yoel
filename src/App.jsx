import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CheckSquare,
  GitBranch,
  Building2,
  Sliders,
  Calendar,
  BarChart3,
  UserCog,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Globe
} from 'lucide-react';
import { mockUsers, getNavItemsForRole } from './data/mockData';
import { translations, getUserLanguage, ukrainianDepartments } from './data/translations';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Workflows from './pages/Workflows';
import Departments from './pages/Departments';
import Parameters from './pages/Parameters';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

// Language Context
export const LanguageContext = createContext({
  language: 'he',
  t: (key) => key,
  setLanguage: () => { }
});

export const useLanguage = () => useContext(LanguageContext);

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CheckSquare,
  GitBranch,
  Building2,
  Sliders,
  Calendar,
  BarChart3,
  UserCog,
  Settings
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(mockUsers[0]); // Default: ADMIN
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  // Language based on user's department (auto-detect) or manual override
  const autoLanguage = getUserLanguage(currentUser);
  const [manualLanguage, setManualLanguage] = useState(null);
  const language = manualLanguage || autoLanguage;

  const location = useLocation();

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations.he[key] || key;
  };

  // Get navigation items based on current user's role
  const navItems = getNavItemsForRole(currentUser.role);

  // Role colors
  const roleColors = {
    ADMIN: '#667eea',
    MANAGER: '#f5576c',
    EMPLOYEE: '#4facfe'
  };

  const roleLabels = {
    ADMIN: t('admin'),
    MANAGER: t('manager'),
    EMPLOYEE: t('employee')
  };

  // Check if user is in Ukrainian department
  const isUkrainianDept = ukrainianDepartments.includes(currentUser.departmentId);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: setManualLanguage }}>
      <div className="app-container" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">הש</div>
              {sidebarOpen && <span className="logo-text">The Shul CRM</span>}
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  {Icon && <Icon size={20} />}
                  {sidebarOpen && <span>{t(item.labelKey)}</span>}
                </Link>
              );
            })}
          </nav>

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </aside>

        {/* Main Content */}
        <div className="main-content">
          {/* Top Header */}
          <header className="top-header">
            <div className="header-right">
              <h1 className="page-title">
                {t(navItems.find(item => item.path === location.pathname)?.labelKey || 'dashboard')}
              </h1>
            </div>

            <div className="header-left">
              {/* Language Switcher */}
              <div className="language-switcher">
                <button
                  className="language-btn"
                  onClick={() => setShowLanguageSwitcher(!showLanguageSwitcher)}
                >
                  <Globe size={18} />
                  <span>{language === 'he' ? 'עב' : language === 'uk' ? 'УК' : 'EN'}</span>
                </button>

                {showLanguageSwitcher && (
                  <div className="language-dropdown">
                    <button
                      className={`lang-option ${language === 'he' ? 'active' : ''}`}
                      onClick={() => {
                        setManualLanguage('he');
                        setShowLanguageSwitcher(false);
                      }}
                    >
                      🇮🇱 עברית
                    </button>
                    <button
                      className={`lang-option ${language === 'uk' ? 'active' : ''}`}
                      onClick={() => {
                        setManualLanguage('uk');
                        setShowLanguageSwitcher(false);
                      }}
                    >
                      🇺🇦 Українська
                    </button>
                    <button
                      className={`lang-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => {
                        setManualLanguage('en');
                        setShowLanguageSwitcher(false);
                      }}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                )}
              </div>

              {/* Role Switcher for Testing */}
              <div className="role-switcher">
                <button
                  className="role-switcher-btn"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  style={{ borderColor: roleColors[currentUser.role] }}
                >
                  <span
                    className="role-indicator"
                    style={{ background: roleColors[currentUser.role] }}
                  ></span>
                  <span>{t('viewAs')} {roleLabels[currentUser.role]}</span>
                  <ChevronDown size={16} />
                </button>

                {showRoleSwitcher && (
                  <div className="role-dropdown">
                    <div className="dropdown-header">{language === 'he' ? 'בחר משתמש לבדיקה:' : 'Виберіть користувача:'}</div>
                    {mockUsers.map(user => (
                      <button
                        key={user.id}
                        className={`role-option ${currentUser.id === user.id ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentUser(user);
                          setManualLanguage(null); // Reset to auto language for new user
                          setShowRoleSwitcher(false);
                        }}
                      >
                        <div className="role-option-avatar" style={{ background: roleColors[user.role] }}>
                          {user.avatar}
                        </div>
                        <div className="role-option-info">
                          <span className="role-option-name">{user.firstName} {user.lastName}</span>
                          <span className="role-option-role">{roleLabels[user.role]}</span>
                          {user.department && (
                            <span className="role-option-dept" style={{ color: user.department.color }}>
                              {user.department.name}
                              {ukrainianDepartments.includes(user.departmentId) && ' 🇺🇦'}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder={t('search')} />
              </div>

              <button className="icon-button">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>

              <div className="user-profile">
                <div className="avatar" style={{ background: roleColors[currentUser.role] }}>
                  {currentUser.avatar}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="user-role">{roleLabels[currentUser.role]}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard currentUser={currentUser} t={t} language={language} />} />
              <Route path="/customers" element={<Customers currentUser={currentUser} t={t} language={language} />} />
              <Route path="/products" element={<Products currentUser={currentUser} t={t} language={language} />} />
              <Route path="/orders" element={<Orders currentUser={currentUser} t={t} language={language} />} />
              <Route path="/tasks" element={<Tasks currentUser={currentUser} t={t} language={language} />} />
              <Route path="/workflows" element={<Workflows currentUser={currentUser} t={t} language={language} />} />
              <Route path="/departments" element={<Departments currentUser={currentUser} t={t} language={language} />} />
              <Route path="/parameters" element={<Parameters currentUser={currentUser} t={t} language={language} />} />
              <Route path="/calendar" element={<CalendarPage currentUser={currentUser} t={t} language={language} />} />
              <Route path="/analytics" element={<Analytics currentUser={currentUser} t={t} language={language} />} />
              <Route path="/users" element={<UsersPage currentUser={currentUser} t={t} language={language} />} />
              <Route path="/settings" element={<SettingsPage currentUser={currentUser} t={t} language={language} />} />
            </Routes>
          </main>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
