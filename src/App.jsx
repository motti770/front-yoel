import { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
  LogOut,
  Globe,
  Moon,
  Sun,
  Upload,
  Target,
  FolderOpen,
  ChevronDown,
  User,
  Info,
  AlertTriangle,
  CheckCircle,
  Warehouse
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getNavItemsForRole } from './utils/navigation';
import { translations, getUserLanguage, ukrainianDepartments } from './data/translations';
import { seedParochetData } from './utils/seedParochetData';
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
import LoginPage from './pages/LoginPage';
import ImportPage from './pages/ImportPage';
import Leads from './pages/Leads';
import AssetLibrary from './pages/AssetLibrary';
import StockOrders from './pages/StockOrders';
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
  Settings,
  Upload,
  Target,
  FolderOpen,
  Warehouse
};

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Language based on user's department (auto-detect) or manual override
  const autoLanguage = user ? getUserLanguage(user) : 'he';
  const [manualLanguage, setManualLanguage] = useState(null);
  const language = manualLanguage || autoLanguage;

  const location = useLocation();

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations.he[key] || key;
  };

  // Get navigation items based on current user's role
  const navItems = isAuthenticated ? getNavItemsForRole(user?.role || 'EMPLOYEE') : [];

  // Group nav items
  const groupedNavItems = isAuthenticated ? (() => {
    const categories = ['crm', 'production', 'inventory', 'management'];
    const groups = categories.reduce((acc, cat) => {
      const items = navItems.filter(item => item.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});

    const other = navItems.filter(item => !item.category);
    if (other.length > 0) groups['other'] = other;

    return groups;
  })() : {};

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

  // Check if we're on the login page
  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  // Current user for components
  const currentUser = user || { role: 'EMPLOYEE', firstName: '', lastName: '' };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: setManualLanguage }}>
      <div className="app-container" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">Y</div>
              {sidebarOpen && <span className="logo-text">The Shul CRM</span>}
            </div>
          </div>

          <nav className="sidebar-nav">
            {Object.entries(groupedNavItems).map(([category, items]) => (
              <div key={category} className="nav-group">
                {sidebarOpen && category !== 'other' && (
                  <div className="nav-group-title">
                    {category === 'crm' && (language === 'he' ? 'מכירות ולקוחות' : 'Sales & CRM')}
                    {category === 'production' && (language === 'he' ? 'ייצור ותפעול' : 'Production')}
                    {category === 'inventory' && (language === 'he' ? 'מלאי' : 'Inventory')}
                    {category === 'management' && (language === 'he' ? 'ניהול' : 'Management')}
                  </div>
                )}
                {!sidebarOpen && <div className="nav-divider" />}

                {items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={!sidebarOpen ? t(item.labelKey) : ''}
                    >
                      {Icon && <Icon size={20} />}
                      {sidebarOpen && <span>{t(item.labelKey)}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999, // Layer below sidebar (z-1000)
              backdropFilter: 'blur(2px)'
            }}
          />
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Top Header */}
          <header className="top-header">
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="icon-button header-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="page-title">
                {t(navItems.find(item => item.path === location.pathname)?.labelKey || 'dashboard')}
              </h1>
            </div>

            <div className="header-left">
              {/* Language Switcher */}
              <div className="language-switcher">
                <button
                  className="language-btn"
                  onClick={() => {
                    setShowLanguageSwitcher(!showLanguageSwitcher);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
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
                      IL Hebrew
                    </button>
                    <button
                      className={`lang-option ${language === 'uk' ? 'active' : ''}`}
                      onClick={() => {
                        setManualLanguage('uk');
                        setShowLanguageSwitcher(false);
                      }}
                    >
                      UA Ukrainian
                    </button>
                    <button
                      className={`lang-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => {
                        setManualLanguage('en');
                        setShowLanguageSwitcher(false);
                      }}
                    >
                      GB English
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Mobile Search Toggle */}
              <button
                className="icon-button mobile-search-trigger"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search size={20} />
              </button>

              <div className={`search-box ${showMobileSearch ? 'show-mobile' : ''}`}>
                <Search size={18} />
                <input type="text" placeholder={t('search')} />
                {showMobileSearch && (
                  <button className="close-search" onClick={() => setShowMobileSearch(false)}>×</button>
                )}
              </div>

              {/* Notifications */}
              <div className="notifications-wrapper" style={{ position: 'relative' }}>
                <button
                  className="icon-button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                    setShowLanguageSwitcher(false);
                  }}
                >
                  <Bell size={20} />
                  <span className="notification-badge">3</span>
                </button>

                {showNotifications && (
                  <div className="dropdown-menu notifications-dropdown">
                    <div className="dropdown-header">
                      <h3>{language === 'he' ? 'התראות' : 'Notifications'}</h3>
                      <button className="text-btn">{language === 'he' ? 'סמן הכל כנקרא' : 'Mark all read'}</button>
                    </div>
                    <div className="dropdown-content">
                      <div className="notification-item unread">
                        <div className="notif-icon success"><CheckCircle size={16} /></div>
                        <div className="notif-text">
                          <p className="notif-title">{language === 'he' ? 'משימת עיצוב הושלמה' : 'Design task completed'}</p>
                          <p className="notif-time">{language === 'he' ? 'לפני 10 דקות' : '10 mins ago'}</p>
                        </div>
                      </div>
                      <div className="notification-item unread">
                        <div className="notif-icon info"><Info size={16} /></div>
                        <div className="notif-text">
                          <p className="notif-title">{language === 'he' ? 'הזמנה חדשה #ORD-20250129-003' : 'New order #ORD-20250129-003'}</p>
                          <p className="notif-time">{language === 'he' ? 'לפני 25 דקות' : '25 mins ago'}</p>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notif-icon warning"><AlertTriangle size={16} /></div>
                        <div className="notif-text">
                          <p className="notif-title">{language === 'he' ? 'מלאי בד כחול נמוך - 5 יחידות' : 'Low blue fabric stock - 5 units'}</p>
                          <p className="notif-time">{language === 'he' ? 'לפני שעתיים' : '2 hours ago'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-footer">
                      <button className="text-btn-center">{language === 'he' ? 'צפה בכל ההתראות' : 'View all notifications'}</button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="user-profile-wrapper" style={{ position: 'relative' }}>
                <div
                  className="user-profile"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                    setShowLanguageSwitcher(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="avatar" style={{ background: roleColors[currentUser.role] }}>
                    {currentUser.firstName?.charAt(0) || ''}{currentUser.lastName?.charAt(0) || ''}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                    <span className="user-role">{roleLabels[currentUser.role]}</span>
                  </div>
                  <ChevronDown size={14} style={{ opacity: 0.5 }} />
                </div>

                {showProfileMenu && (
                  <div className="dropdown-menu profile-dropdown">
                    <div className="dropdown-header user-header">
                      <div className="avatar large" style={{ background: roleColors[currentUser.role] }}>
                        {currentUser.firstName?.charAt(0) || ''}{currentUser.lastName?.charAt(0) || ''}
                      </div>
                      <div className="user-details">
                        <h4>{currentUser.firstName} {currentUser.lastName}</h4>
                        <span>{currentUser.email}</span>
                        <span className="user-role-badge">{roleLabels[currentUser.role]}</span>
                      </div>
                    </div>
                    <div className="dropdown-links">
                      <button className="menu-item">
                        <User size={16} />
                        {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
                      </button>
                      <button className="menu-item">
                        <Settings size={16} />
                        {language === 'he' ? 'הגדרות' : 'Settings'}
                      </button>
                      <button className="menu-item">
                        <Bell size={16} />
                        {language === 'he' ? 'העדפות התראות' : 'Notification Preferences'}
                      </button>
                      <div className="divider"></div>
                      <button className="menu-item danger" onClick={logout}>
                        <LogOut size={16} />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="page-content">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <Customers currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/leads" element={
                <ProtectedRoute>
                  <Leads currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Tasks currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/workflows" element={
                <ProtectedRoute>
                  <Workflows currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/departments" element={
                <ProtectedRoute>
                  <Departments currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/parameters" element={
                <ProtectedRoute>
                  <Parameters currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <UsersPage currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/import" element={
                <ProtectedRoute>
                  <ImportPage currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/assets" element={
                <ProtectedRoute>
                  <AssetLibrary currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
              <Route path="/stock-orders" element={
                <ProtectedRoute>
                  <StockOrders currentUser={currentUser} t={t} language={language} />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

function App() {
  // Seed parochet data on app initialization
  useEffect(() => {
    const result = seedParochetData();
    if (result.success && !result.skipped) {
      console.log('[App] Parochet data seeded:', result.data);
    }
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
