import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());
      setStatusMessage(
        `A password recovery email has been dispatched to ${email}. Please check your inbox and spam folders.`
      );
      setEmail('');
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Reset Password</h1>
        <p className="text-xs text-neutral-500">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium animate-fadeIn">
          &#10003; {statusMessage}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4">
        <Input
          label="Account Email"
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold"
          disabled={loading}
        >
          {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-neutral-600">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-brand-accent hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
