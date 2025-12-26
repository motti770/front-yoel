import { useState, createContext, useContext } from 'react';
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
  Target,
  FolderOpen,
  ChevronDown,
  User,
  Info,
  AlertTriangle
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getNavItemsForRole } from './data/mockData';
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
import LoginPage from './pages/LoginPage';
import ImportPage from './pages/ImportPage';
import Leads from './pages/Leads';
import AssetLibrary from './pages/AssetLibrary';
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
  FolderOpen
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

              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder={t('search')} />
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
                        <div className="notif-icon info"><Info size={16} /></div>
                        <div className="notif-text">
                          <p className="notif-title">{language === 'he' ? 'הזמנה חדשה התקבלה' : 'New order received'}</p>
                          <p className="notif-time">{language === 'he' ? 'לפני 5 דקות' : '5 mins ago'}</p>
                        </div>
                      </div>
                      <div className="notification-item unread">
                        <div className="notif-icon warning"><AlertTriangle size={16} /></div>
                        <div className="notif-text">
                          <p className="notif-title">{language === 'he' ? 'מלאי בד נמוך' : 'Low fabric stock'}</p>
                          <p className="notif-time">{language === 'he' ? 'לפני שעה' : '1 hour ago'}</p>
                        </div>
                      </div>
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
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
