import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors.js';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a contact phone number for delivery coordination.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      await signup(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim()
      );
      navigate('/home', { replace: true });
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Create Account</h1>
        <p className="text-xs text-neutral-500">
          Save your bespoke body measurements and unlock customized tailoring
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSignupSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          id="name"
          name="name"
          type="text"
          placeholder="Alexander Wright"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={loading}
          helperText="Used strictly for tailoring dispatch updates"
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      <div className="text-center pt-2 text-xs text-neutral-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-accent hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
