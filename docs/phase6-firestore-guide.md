# FITFUSION - Phase 6 Backend & Firestore Persistence Guide

This guide provides a comprehensive overview of Phase 6: **Backend & Firestore Persistence** for the FITFUSION Customized Clothing Platform.

---

## What Was Accomplished in Phase 6

1. **Extended Firebase Client Initialization**:
   - Reused the existing `frontend/src/services/firebase.js` without duplicating files or introducing external dependencies.
   - Initialized and exported `db = getFirestore(app)` alongside `auth` and `app`.
2. **Unified Firestore Service Layer (`frontend/src/services/firestoreService.js`)**:
   - **User Profile Service**: `createUserProfile()`, `getUserProfile()`, `updateUserProfile()`.
   - **Order Persistence Service**: `createFirestoreOrder()`, `getUserOrders()`.
   - **Product Catalog Service**: `getProductsFromFirestore()`, `seedProductsToFirestore()`.
   - **Sanitization Helper**: Automatically strips `undefined` keys to ensure strict Firestore payload compliance.
3. **User Profile Persistence**:
   - On signup, customer's name, email, and phone number are persisted into `users/{uid}` in Cloud Firestore.
   - Passwords remain strictly handled by Firebase Authentication.
   - In `AuthContext.jsx`, user profile state is retrieved on session initialization and login, exposing `userProfile` across the application.
   - `ProfilePage.jsx` displays synchronized phone number, role, member date, and cloud sync status.
4. **Order Persistence & Customization Integrity**:
   - `CheckoutPage.jsx` persists complete order configurations into Firestore `orders/{orderId}`, tagged with the authenticated user's UID.
   - All bespoke configurations (fabric, weave, colorway, collar, cuff, buttons, monogram, size, tailored measurements in inches, fit preference, and paired luxury perfume) are frozen into the order document.
   - Dual-persistence layer saves a copy in `localStorage` for offline caching and demo resilience.
   - Cart is cleared only upon successful order registration.
5. **Live Orders Page**:
   - `OrdersPage.jsx` queries Firestore for orders where `userId == currentUser.uid`.
   - In-memory sorting ensures newest orders appear first without requiring complex composite index builds.
   - Comprehensive error boundaries and friendly messages ensure zero screen crashes if Firebase is unconfigured or offline.
6. **Product Catalog Support**:
   - `ShopPage.jsx` integrates `getProductsFromFirestore()`.
   - If Firestore collection is empty or credentials are not yet configured, the app seamlessly falls back to `MOCK_PRODUCTS`.
7. **Firestore Security Rules**:
   - Created `firestore.rules` at project root with strict user-isolation for `users` and `orders`, and public read access for `products`.
8. **JSON Schema**:
   - Created `database/schema/firestore-schema.json` with draft 2020-12 specifications.

---

## Firestore Collection Structure

### 1. `users`
```text
users/{uid}
├── uid: string
├── name: string
├── displayName: string
├── email: string
├── phone: string
├── role: "customer" | "admin" | "tailor"
├── createdAt: ISO string
└── updatedAt: ISO string
```

### 2. `orders`
```text
orders/{orderId}
├── id: string (e.g. "FF-2026-894210")
├── orderId: string
├── orderNumber: string
├── userId: string
├── customer: { fullName, email, phone }
├── deliveryAddress: { address, city, state, pincode }
├── paymentMethod: string
├── paymentStatus: string
├── orderStatus: string
├── tailoringStatus: string
├── items: [
│     {
│       productId, productName, category, productImage,
│       selectedFabric, selectedColor, designOptions,
│       collar, cuff, buttons, monogram,
│       size, customMeasurements, measurementUnit, fit,
│       selectedPerfume, perfumePrice,
│       quantity, itemPrice, totalItemPrice
│     }
│   ]
├── subtotal: number
├── delivery: number
├── discount: number
├── couponCode: string | null
├── total: number
├── pricing: { subtotal, delivery, discount, total }
├── createdAt: ISO string
├── formattedDate: string
└── updatedAt: ISO string
```

### 3. `products`
```text
products/{productId}
├── id: string
├── name: string
├── category: string
├── basePrice: number
├── rating: number
├── reviewsCount: number
├── badge: string
├── description: string
├── availableFabrics: array
├── availableColors: array
├── availableSizes: array
├── silhouetteColor: string
├── accentColor: string
├── available: boolean
└── createdAt: ISO string
```

---

## How to Test and Demo Phase 6

1. **Start the Frontend**:
   ```powershell
   cd C:\FITFUSION\frontend
   npm.cmd run dev
   ```
2. **Create an Account**:
   - Go to `/signup`.
   - Enter Name, Email, Phone Number, and Password.
   - Check that account is created and redirects to `/home`.
3. **Verify Profile Persistence**:
   - Click on the Profile icon or navigate to `/profile`.
   - Confirm that your name, email, phone number, and "Customer" role are displayed.
4. **Customize an Outfit**:
   - Select a garment from `/shop` or click "Customizer" in the navigation.
   - Choose a Fabric (e.g., Egyptian Giza Cotton), Color (Crisp White), Collar (French or Cutaway), Cuff (French Double), Buttons (Pearl), Size (Custom Tailored), enter neck/chest/waist measurements, and pair a perfume (Smoked Cedar & Vetiver).
   - Proceed to Cart.
5. **Checkout**:
   - Proceed to `/checkout`. Notice that Full Name, Email, and Phone are automatically pre-filled from your profile!
   - Fill in address, city, state, and 6-digit PIN code.
   - Select payment simulation (COD, UPI, or Card).
   - Click **Place Order**.
   - Notice the loading state: "Placing Bespoke Order...".
   - The Order Confirmation plaque appears with the unique reference number (e.g., `FF-2026-XXXXXX`).
6. **Review Orders Page**:
   - Click "View All Orders" or go to `/orders`.
   - Verify that your order is loaded, showing the complete tailoring milestone lifecycle, garment specs, and pricing in Indian Rupees (₹).
