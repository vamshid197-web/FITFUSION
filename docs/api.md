# FITFUSION API Endpoint Specifications

This document outlines the planned REST API structure and endpoints for **FITFUSION**.

> **Note:** At this foundation stage, only the health-check endpoint (`GET /api/health`) is active in `server.js`. The categories below describe planned endpoints to be implemented during subsequent phases.

---

## Active Endpoints

### System Health
- **`GET /api/health`**
  - Description: Verifies API server liveness and service status.
  - Response:
    ```json
    {
      "success": true,
      "message": "FITFUSION API is running"
    }
    ```

---

## Planned API Categories

### 1. Authentication (`/api/auth`)
Handles user signup, token verification, session lifecycle, and password resets.
- `POST /api/auth/register` - Create customer account with email/password.
- `POST /api/auth/login` - Authenticate customer credentials and return session token.
- `POST /api/auth/firebase-sync` - Synchronize client-authenticated Firebase user token with backend profile.
- `POST /api/auth/logout` - Invalidate current session.
- `GET /api/auth/me` - Fetch currently authenticated user context.

### 2. Products (`/api/products`)
Manages customizable apparel catalog, silhouettes, and categories.
- `GET /api/products` - List all active customizable garments with pagination and category filters.
- `GET /api/products/:id` - Fetch detailed garment specifications, silhouette views, and compatible fabric IDs.
- `GET /api/products/:id/options` - Retrieve permitted custom styling options (collars, cuffs, buttons).

### 3. Fabrics (`/api/fabrics`)
Manages textile swatches, colors, textures, patterns, and availability.
- `GET /api/fabrics` - Browse available fabrics filtered by color, material, pattern, and season.
- `GET /api/fabrics/:id` - Retrieve high-resolution texture map, composition details, and unit cost.
- `GET /api/fabrics/recommended` - Get trending fabrics for current season or selected garment.

### 4. Customizations (`/api/customizations`)
Processes and validates tailored garment configuration choices.
- `POST /api/customizations/validate` - Validate compatibility of chosen silhouette, fabric, and styling accents.
- `POST /api/customizations/calculate-price` - Calculate dynamic pricing based on fabric tier and styling options.
- `POST /api/customizations/preview` - Generate or composite visual preview data for the customized outfit.

### 5. Cart (`/api/cart`)
Manages cart items, bespoke configurations, and fragrance add-ons.
- `GET /api/cart` - Retrieve current user/guest cart with itemized custom clothing configurations.
- `POST /api/cart/items` - Add a customized garment (with fabric, design options, measurements, and optional perfume) to cart.
- `PUT /api/cart/items/:itemId` - Update item quantity, tailoring specs, or add-ons.
- `DELETE /api/cart/items/:itemId` - Remove an item from the cart.
- `DELETE /api/cart` - Clear entire cart.

### 6. Orders (`/api/orders`)
Processes order placement, payment verification, and manufacturing status tracking.
- `POST /api/orders` - Place new bespoke clothing order from active cart.
- `GET /api/orders` - List past orders for the logged-in customer.
- `GET /api/orders/:id` - Retrieve detailed order summary, tailoring status, and consignment tracking.
- `POST /api/orders/:id/cancel` - Request order cancellation before fabric cutting stage.

### 7. Offers (`/api/offers`)
Validates promotional discount codes and cashback rules.
- `GET /api/offers` - List currently active public discount vouchers and cashback campaigns.
- `POST /api/offers/apply` - Validate coupon code against current cart items and subtotal.
- `POST /api/offers/remove` - Remove applied promotional discount from active cart.

### 8. Users (`/api/users`)
Customer profile management, delivery addresses, and saved measurement profiles.
- `GET /api/users/profile` - Fetch profile information and preferences.
- `PUT /api/users/profile` - Update profile contact details.
- `GET /api/users/addresses` - List saved shipping and billing addresses.
- `POST /api/users/addresses` - Add new delivery address.
- `GET /api/users/measurements` - Retrieve saved bespoke measurement profiles.
- `POST /api/users/measurements` - Save a new measurement profile (chest, waist, inseam, collar, etc.).

### 9. Admin (`/api/admin`)
Administrative controls for platform catalog, fabrics, orders, and promotions.
- `GET /api/admin/orders` - List all customer orders with filter by tailoring stage.
- `PUT /api/admin/orders/:id/status` - Advance order stage (`fabric_sourced` &rarr; `cutting` &rarr; `stitching` &rarr; `shipped`).
- `POST /api/admin/products` - Create new customizable apparel silhouette.
- `POST /api/admin/fabrics` - Add new fabric material swatch and upload texture.
- `POST /api/admin/perfumes` - Add fragrance product pairing.
- `POST /api/admin/offers` - Create new discount coupon or cashback rule.
