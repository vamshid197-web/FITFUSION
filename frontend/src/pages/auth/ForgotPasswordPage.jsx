import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatusMessage(`Password reset request validated for ${email}. Firebase Auth password recovery email will trigger in Phase 2.`);
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
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed animate-fadeIn">
          <strong>Notice:</strong> {statusMessage}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
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
        />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Send Recovery Link
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
