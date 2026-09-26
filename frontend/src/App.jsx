import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Common & Security
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';
import NotFoundPage from './pages/common/NotFoundPage.jsx';

// Public Pages
import LandingPage from './pages/home/LandingPage.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Protected Customer Pages
import HomePage from './pages/home/HomePage.jsx';
import ShopPage from './pages/shop/ShopPage.jsx';
import ProductDetailsPage from './pages/product/ProductDetailsPage.jsx';
import CustomizePage from './pages/customize/CustomizePage.jsx';
import CartPage from './pages/cart/CartPage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import OrdersPage from './pages/orders/OrdersPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';

// Phase 7 Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* 2. Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* 3. Protected Customer Routes (Requires Firebase Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<CustomerLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/customize/:id" element={<CustomizePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 4. Phase 7 Admin Management (Protected by Role-Based AdminRoute) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* 5. Fallback 404 Route */}
      <Route element={<CustomerLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
