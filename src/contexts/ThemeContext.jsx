import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { }
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    // Check localStorage or default to dark
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('crm-theme');
        return saved || 'dark';
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('crm-theme', theme);
    }, [theme]);

    // Primary Color State
    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('crm-primary-color') || 'purple';
    });

    const gradients = {
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    };

    // Apply color to document
    useEffect(() => {
        const gradient = gradients[primaryColor] || gradients.purple;
        document.documentElement.style.setProperty('--primary-gradient', gradient);
        localStorage.setItem('crm-primary-color', primaryColor);
    }, [primaryColor]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, primaryColor, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
