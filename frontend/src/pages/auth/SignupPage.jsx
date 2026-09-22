import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupSubmit = (e) => {
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
      setError('Passwords do not match.');
      return;
    }

    // Temporary Phase 1 behavior
    setStatusMessage('Account details validated! Firebase User Registration will be linked in Phase 2.');
    setTimeout(() => {
      navigate('/home');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Create Account</h1>
        <p className="text-xs text-neutral-500">
          Save your bespoke body measurements and unlock customized tailoring
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-fadeIn">
          <strong>FITFUSION Phase 1 Notice:</strong> {statusMessage}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
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
        />

        <Input
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange}
          required
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
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Create Account
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
