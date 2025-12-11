/**
 * Login Page
 * Handles user authentication
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const { login, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    // Quick login for testing
    const handleTestLogin = () => {
        setEmail('admin@yoel.com');
        setPassword('Admin1234');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">Y</span>
                    </div>
                    <h1>The Shul CRM</h1>
                    <p>Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                Logging in...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Login
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className="test-login-button"
                        onClick={handleTestLogin}
                        disabled={loading}
                    >
                        Fill Test Credentials
                    </button>
                </form>

                <div className="login-footer">
                    <p>The Shul CRM System v2.0</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
