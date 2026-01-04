/**
 * Login Page
 * Handles user authentication with i18n support
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2, Globe } from 'lucide-react';
import './LoginPage.css';

// Translations for login page
const loginTranslations = {
    he: {
        title: 'The Shul CRM',
        subtitle: 'הזן את פרטי הכניסה שלך כדי להמשיך',
        email: 'אימייל',
        emailPlaceholder: 'your@email.com',
        password: 'סיסמה',
        passwordPlaceholder: 'הזן סיסמה',
        login: 'התחבר',
        loggingIn: 'מתחבר...',
        fillTestCredentials: 'מלא פרטי בדיקה',
        version: 'The Shul CRM System v2.0',
        showPassword: 'הצג סיסמה',
        hidePassword: 'הסתר סיסמה',
        emailRequired: 'יש להזין אימייל',
        emailInvalid: 'כתובת אימייל לא תקינה',
        passwordRequired: 'יש להזין סיסמה',
        passwordMinLength: 'הסיסמה חייבת להכיל לפחות 6 תווים'
    },
    en: {
        title: 'The Shul CRM',
        subtitle: 'Enter your credentials to continue',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        login: 'Login',
        loggingIn: 'Logging in...',
        fillTestCredentials: 'Fill Test Credentials',
        version: 'The Shul CRM System v2.0',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email address',
        passwordRequired: 'Password is required',
        passwordMinLength: 'Password must be at least 6 characters'
    },
    uk: {
        title: 'The Shul CRM',
        subtitle: 'Введіть свої облікові дані, щоб продовжити',
        email: 'Електронна пошта',
        emailPlaceholder: 'your@email.com',
        password: 'Пароль',
        passwordPlaceholder: 'Введіть пароль',
        login: 'Увійти',
        loggingIn: 'Вхід...',
        fillTestCredentials: 'Заповнити тестові дані',
        version: 'The Shul CRM System v2.0',
        showPassword: 'Показати пароль',
        hidePassword: 'Сховати пароль',
        emailRequired: 'Потрібна електронна пошта',
        emailInvalid: 'Неправильна адреса електронної пошти',
        passwordRequired: 'Потрібен пароль',
        passwordMinLength: 'Пароль повинен містити щонайменше 6 символів'
    }
};

function LoginPage() {
    const navigate = useNavigate();
    const { login, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('he');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Check if we're in production mode
    const isProduction = import.meta.env.PROD;

    // Get translation
    const t = (key) => loginTranslations[language]?.[key] || loginTranslations.en[key] || key;

    // Validate a single field
    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                if (!value || value.trim() === '') {
                    return t('emailRequired');
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return t('emailInvalid');
                }
                return '';
            case 'password':
                if (!value || value.trim() === '') {
                    return t('passwordRequired');
                }
                if (value.length < 6) {
                    return t('passwordMinLength');
                }
                return '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {
            email: validateField('email', email),
            password: validateField('password', password)
        };
        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    // Handle field blur (mark as touched)
    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const error = validateField(fieldName, fieldName === 'email' ? email : password);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    // Handle field change
    const handleFieldChange = (fieldName, value) => {
        if (fieldName === 'email') {
            setEmail(value);
        } else {
            setPassword(value);
        }
        // Clear error when user starts typing (only if field was touched)
        if (touched[fieldName]) {
            const error = validateField(fieldName, value);
            setErrors(prev => ({ ...prev, [fieldName]: error }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        // Mark all fields as touched
        setTouched({ email: true, password: true });

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    // Quick login for testing (hidden in production)
    const handleTestLogin = () => {
        setEmail('admin@yoel.com');
        setPassword('Admin1234');
        setErrors({});
        setTouched({});
    };

    // Close language menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.login-language-switcher')) {
                setShowLanguageMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const isRtl = language === 'he';

    return (
        <div className="login-page" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="login-container">
                {/* Language Switcher */}
                <div className="login-language-switcher">
                    <button
                        type="button"
                        className="login-language-btn"
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        aria-expanded={showLanguageMenu}
                        aria-haspopup="listbox"
                        aria-label={language === 'he' ? 'בחר שפה' : language === 'uk' ? 'Вибрати мову' : 'Select language'}
                    >
                        <Globe size={16} />
                        <span>{language === 'he' ? 'עברית' : language === 'uk' ? 'Українська' : 'English'}</span>
                    </button>

                    {showLanguageMenu && (
                        <div className="login-language-dropdown" role="listbox">
                            <button
                                type="button"
                                className={`login-lang-option ${language === 'he' ? 'active' : ''}`}
                                onClick={() => { setLanguage('he'); setShowLanguageMenu(false); }}
                                role="option"
                                aria-selected={language === 'he'}
                            >
                                עברית
                            </button>
                            <button
                                type="button"
                                className={`login-lang-option ${language === 'en' ? 'active' : ''}`}
                                onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                                role="option"
                                aria-selected={language === 'en'}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                className={`login-lang-option ${language === 'uk' ? 'active' : ''}`}
                                onClick={() => { setLanguage('uk'); setShowLanguageMenu(false); }}
                                role="option"
                                aria-selected={language === 'uk'}
                            >
                                Українська
                            </button>
                        </div>
                    )}
                </div>

                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">Y</span>
                    </div>
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">{t('email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder={t('emailPlaceholder')}
                            required
                            disabled={loading}
                            aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                        />
                        {touched.email && errors.email && (
                            <span id="email-error" className="field-error" role="alert">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('password')}</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                placeholder={t('passwordPlaceholder')}
                                required
                                disabled={loading}
                                aria-invalid={touched.password && errors.password ? 'true' : 'false'}
                                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <span id="password-error" className="field-error" role="alert">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                {t('loggingIn')}
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                {t('login')}
                            </>
                        )}
                    </button>

                    {/* Test credentials button */}
                    <button
                        type="button"
                        className="test-login-button"
                        onClick={handleTestLogin}
                        disabled={loading}
                    >
                        {t('fillTestCredentials')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>{t('version')}</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
