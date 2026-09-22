import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoNotice, setInfoNotice] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || '/home';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoNotice('');

    // Client-side validations
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Navigate to destination
      navigate(from, { replace: true });
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setInfoNotice(
      'Google Sign-In can be enabled in Firebase Console (Authentication > Sign-in method > Google). Email/Password authentication is fully active.'
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Sign In</h1>
        <p className="text-xs text-neutral-500">
          Access your bespoke measurement profiles and tailoring orders
        </p>
      </div>

      {infoNotice && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-fadeIn">
          <strong>Notice:</strong> {infoNotice}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-brand-dark">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-accent hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-brand-dark placeholder-neutral-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* Google Sign-in Option */}
      <div className="space-y-4 pt-2">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-neutral-400 absolute">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-neutral-200 rounded-lg bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="text-center pt-2 text-xs text-neutral-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-brand-accent hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
