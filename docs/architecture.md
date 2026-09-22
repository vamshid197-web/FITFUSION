# FITFUSION System Architecture

This document describes the high-level architecture of **FITFUSION**, a customized clothing shopping platform.

---

## Architecture Overview

FITFUSION follows a multi-tier client-server architecture designed for modularity, scalability, high responsiveness, and secure data handling.

```
+-------------------------------------------------------------+
|                      Frontend Layer                         |
|  - React (JSX) + Vite                                       |
|  - Tailwind CSS Styling System                              |
|  - React Router DOM for Navigation                          |
|  - Customization Preview Canvas & State Management          |
+-------------------------------------------------------------+
                               |
                               | HTTPS / REST API / JSON
                               v
+-------------------------------------------------------------+
|                     Backend API Layer                       |
|  - Node.js & Express.js REST Framework                      |
|  - Security & Middleware (CORS, Rate Limiter, Auth Guards)  |
|  - Controllers & Business Logic (Customization, Orders)     |
|  - Recommendation Engine (Perfumes & Sizing)                |
+-------------------------------------------------------------+
                               |
                               | Admin SDK / Cloud APIs
                               v
+-------------------------------------------------------------+
|               Data & Cloud Services Layer                   |
|  - Firebase Authentication (Identity & Access)              |
|  - Cloud Firestore (NoSQL Document Database)                |
|  - Firebase Cloud Storage (Fabrics, Swatches, Previews)     |
|  - Supporting External Services (Payments, Email/SMS alerts)|
+-------------------------------------------------------------+
```

---

## Detailed Layer Breakdown

### 1. Frontend Layer
- **Client Application**: Built with React and Vite to provide instant page loading and ultra-fast client-side routing.
- **Styling & Aesthetics**: Tailwind CSS powers a modern, high-contrast, responsive visual system adhering to bespoke fashion branding.
- **Routing & Modular Views**: React Router partitions customer workflows (catalog, visual customizer, fit adjustments, fragrance recommendations, cart, checkout) and administration portals.
- **State Management**: Context API and custom hooks orchestrate active garment selections, chosen fabrics, bespoke measurements, perfume pairings, and cart items.

### 2. Backend / API Layer
- **RESTful Endpoints**: Built with Express.js to expose structured endpoints for products, fabrics, customizations, cart operations, fragrance recommendations, and order processing.
- **Middleware & Security**: Handles CORS configuration, incoming JSON payload validation, logging, and security headers.
- **Domain Controllers**: Segregates business rules for tailored garment calculation, promotional coupon verification, measurement validation, and order lifecycle states.
- **Integration Adapters**: Prepared to interface securely with Firebase Admin SDK for backend-authenticated operations.

### 3. Database & Cloud Services Layer
- **Cloud Firestore**: Primary NoSQL document store housing collections for Users, Products, Fabrics, Perfumes, Customizations, Orders, Offers, and Measurement Profiles.
- **Firebase Authentication**: Validates customer sessions, supports OAuth providers, and enforces user authorization rules.
- **Cloud Storage**: Hosts media assets including fabric weave textures, pattern swatches, silhouette cutouts, customer upload references, and rendered preview composites.
- **Supporting Services**: Prepared for payment gateway webhooks (Stripe / Razorpay), transactional email dispatch, and logistics/shipping tracking APIs.
