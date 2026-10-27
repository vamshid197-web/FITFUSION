import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from './layouts/CustomerLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Common & Security
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import NotFoundPage from './pages/common/NotFoundPage.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Customer Pages (Main Shopping, Catalog, Customizer & Try-On)
import HomePage from './pages/home/HomePage.jsx';
import ShopPage from './pages/shop/ShopPage.jsx';
import ProductDetailsPage from './pages/product/ProductDetailsPage.jsx';
import CustomizePage from './pages/customize/CustomizePage.jsx';
import CartPage from './pages/cart/CartPage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import OrdersPage from './pages/orders/OrdersPage.jsx';
import OrderDetailsPage from './pages/orders/OrderDetailsPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import SavedDesignsPage from './pages/customization/SavedDesignsPage.jsx';
import WishlistPage from './pages/wishlist/WishlistPage.jsx';
import VirtualTryOnPage from './pages/tryon/VirtualTryOnPage.jsx';
import OutfitBuilderPage from './pages/outfit/OutfitBuilderPage.jsx';

// Phase 7 Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminOffersPage from './pages/admin/AdminOffersPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';

export default function App() {
  return (
    <ErrorBoundary title="Application Error" message="A temporary error occurred in the application view. Please reload or return home.">
      <>
      <ScrollToTop />
      <Routes>
        {/* 1. Public Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* 2. Public Main Shopping Homepage, Catalog, Customization, Outfit Builder, and Virtual Try-On */}
        <Route element={<CustomerLayout />}>
          {/* Unified Shopping Homepage */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          {/* Catalog & Product Details */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />

          {/* 3D Customization Studio */}
          <Route path="/customize" element={<CustomizePage />} />
          <Route path="/customize/:id" element={<CustomizePage />} />

          {/* Outfit Builder & Saved Designs */}
          <Route path="/outfit-builder" element={<OutfitBuilderPage />} />
          <Route path="/saved-designs" element={<SavedDesignsPage />} />

          {/* Kolors AI Virtual Try-On & Studio Routing Aliases */}
          <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
          <Route path="/virtual-try-on/:id" element={<VirtualTryOnPage />} />
          <Route path="/try-on" element={<VirtualTryOnPage />} />
          <Route path="/try-on/:id" element={<VirtualTryOnPage />} />
          <Route path="/live-fitting-room" element={<VirtualTryOnPage />} />
          <Route path="/live-fitting-room/:id" element={<VirtualTryOnPage />} />
          <Route path="/live-try-on" element={<VirtualTryOnPage />} />
          <Route path="/live-try-on/:id" element={<VirtualTryOnPage />} />

          {/* Shopping Cart & Wishlist accessible for browsing */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>

        {/* 3. Protected Customer Account Routes (Requires Firebase Authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
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
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/offers" element={<AdminOffersPage />} />
          </Route>
        </Route>

        {/* 5. Fallback 404 Route */}
        <Route element={<CustomerLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
    </ErrorBoundary>
  );
}
