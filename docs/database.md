# FITFUSION Database Design & Firestore Architecture (Phase 6)

This document specifies the **Cloud Firestore** NoSQL data architecture, collection schemas, authentication relationships, security rules, and persistence flows implemented in **Phase 6**.

---

## 1. Firestore Architecture Overview

FITFUSION utilizes **Google Cloud Firestore** in Native Mode for structured, document-based persistence:

* **Authentication Source**: Firebase Authentication manages user credentials (passwords, tokens, identity verification).
* **Document Persistence**: Cloud Firestore persists application-level profile data, bespoke tailoring orders, and apparel catalog models.
* **Resilient Dual-Persistence**: For offline resilience and academic demo reliability, a seamless fallback layer coordinates between Cloud Firestore and browser `localStorage`.

```
[ User Action: Signup / Login ]
           │
           ▼
[ Firebase Authentication ]  ──> Token & UID
           │
           ▼ (Persist / Fetch Profile)
[ Firestore Collection: 'users' ] (users/{uid})
           │
           ▼
[ User Action: Customize Garment & Place Order ]
           │
           ▼
[ Firestore Collection: 'orders' ] (orders/{orderId})
    └── Contains: userId (tied to auth UID), complete bespoke specifications,
                  tailoring stages, customer info, addresses, and pricing.
           │
           ▼ (Fallback & Offline Sync)
[ Browser LocalStorage: 'fitfusion_orders' ]
```

---

## 2. Implemented Collections & Schemas

### A. `users` Collection (`users/{uid}`)
Stores customer profile records, indexed by the Firebase Authentication UID.

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Firebase Authentication User UID (matches document ID). |
| `name` / `displayName` | String | Customer's full name (e.g., "Alexander Wright"). |
| `email` | String | Customer's registered email address. |
| `phone` | String | 10-digit mobile number for tailoring dispatch updates. |
| `role` | String | User role (`customer`, `admin`, `tailor_partner`). Defaults to `customer`. |
| `createdAt` | String (ISO) | Timestamp when user profile was registered. |
| `updatedAt` | String (ISO) | Timestamp of last profile modification. |

> **Security Note**: Passwords and password hashes are **NEVER** stored in Firestore. Firebase Authentication securely handles credential storage and session signing.

---

### B. `orders` Collection (`orders/{orderId}`)
Stores all confirmed bespoke tailoring orders with frozen garment specifications.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `orderId` / `orderNumber` | String | Unique order reference code (e.g., `FF-2026-894210`). |
| `userId` | String | Firebase Auth UID of customer, or `"guest"`. |
| `customer` | Map / Object | `{ fullName, email, phone }` |
| `deliveryAddress` | Map / Object | `{ address, city, state, pincode }` |
| `shippingAddress` | Map / Object | Alias for compatibility with earlier modules. |
| `paymentMethod` | String | Selected payment mode (`Cash on Delivery (COD)`, `UPI Simulation`, etc.). |
| `paymentStatus` | String | Payment confirmation indicator (`Confirmed (Demo)`). |
| `orderStatus` / `status` | String | High-level status (`Order Confirmed`). |
| `tailoringStatus` | String | Active tailoring stage (`Pattern Drafting & Fabric Allocation`). |
| `items` | Array of Objects | Array of customized garment items (see item structure below). |
| `subtotal` | Number | Garment base cost subtotal in Indian Rupees (₹). |
| `delivery` | Number | Delivery charge (₹0 if subtotal ≥ ₹1,500, else ₹99). |
| `discount` | Number | Coupon discount applied in Indian Rupees (₹). |
| `coupon` / `couponCode` | String / Null | Applied promo code (e.g., `FIT10`, `CUSTOM20`). |
| `total` | Number | Final payable amount in Indian Rupees (₹). |
| `pricing` | Map / Object | Consolidated pricing object `{ subtotal, delivery, discount, total }`. |
| `createdAt` / `date` | String (ISO) | Order creation timestamp. |
| `formattedDate` | String | Formatted readable date (e.g., "26 Sep 2026, 03:30 pm"). |
| `updatedAt` | String (ISO) | Timestamp of last status change. |

#### Bespoke Item Structure (`orders.items[]`):
Each item in the `items` array preserves the complete tailoring configuration:
```json
{
  "cartItemId": "cart-1-1727339000000",
  "productId": "1",
  "productName": "Classic Cotton Shirt",
  "category": "Shirts",
  "productImage": null,
  "silhouetteColor": "from-blue-100 to-indigo-100",
  "accentColor": "#1E3A8A",
  "basePrice": 65,
  "selectedFabric": {
    "name": "Egyptian Giza Cotton",
    "composition": "100% Cotton 120s"
  },
  "selectedColor": {
    "name": "Crisp White",
    "hex": "#FFFFFF"
  },
  "designOptions": {
    "collar": "Classic",
    "cuff": "French",
    "buttons": "Pearl",
    "monogram": { "text": "AW", "font": "Serif", "placement": "Left Cuff" }
  },
  "collar": "Classic",
  "cuff": "French",
  "buttons": "Pearl",
  "monogram": { "text": "AW", "font": "Serif", "placement": "Left Cuff" },
  "size": "Custom Tailored",
  "customMeasurements": {
    "neck": "16.0",
    "chest": "42.0",
    "waist": "36.0",
    "shoulder": "18.5",
    "sleeve": "26.0",
    "length": "31.0"
  },
  "measurementUnit": "inches",
  "fit": "Slim",
  "selectedPerfume": {
    "id": "p2",
    "name": "Smoked Cedar & Vetiver",
    "price": 45
  },
  "perfumePrice": 45,
  "quantity": 1,
  "itemPrice": 110,
  "totalItemPrice": 110
}
```

---

### C. `products` Collection (`products/{productId}`)
Stores base apparel silhouettes that can be customized.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Silhouette ID (e.g., `"1"`, `"2"`). |
| `name` | String | Garment title (e.g., "Classic Cotton Shirt"). |
| `category` | String | Apparel category (`Shirts`, `T-Shirts`, `Jackets`, etc.). |
| `basePrice` | Number | Foundation price in Indian Rupees (₹). |
| `rating` | Number | Customer feedback score (e.g., `4.8`). |
| `reviewsCount` | Number | Total feedback count. |
| `badge` | String | Display tag (`Featured`, `Trending`, etc.). |
| `description` | String | Tailoring cut and silhouette details. |
| `availableFabrics` | Array | Swatches available for this silhouette. |
| `availableColors` | Array | Approved colorways with hex codes. |
| `availableSizes` | Array | Standard sizing options + `"Custom Tailored"`. |
| `silhouetteColor` | String | Tailwind CSS gradient classes for silhouette rendering. |
| `accentColor` | String | Primary accent hex color code. |
| `available` | Boolean | Catalog availability flag. |

---

## 3. Authentication & Firestore Relationship

1. **User Sign Up (`SignupPage.jsx`)**:
   - Calls `createUserWithEmailAndPassword(auth, email, password)`.
   - Calls `updateProfile(user, { displayName })`.
   - Simultaneously persists `{ uid, name, email, phone, role: 'customer', createdAt, updatedAt }` into Firestore `users/{uid}` via `createUserProfile()`.
2. **User Login (`LoginPage.jsx`)**:
   - Calls `signInWithEmailAndPassword(auth, email, password)`.
   - `AuthContext`'s `onAuthStateChanged` hook detects session, queries `users/{uid}`, and populates `userProfile` state.
3. **User Profile View (`ProfilePage.jsx`)**:
   - Renders live profile data (name, email, phone number, role, member since) synchronized directly from Cloud Firestore.

---

## 4. Order Persistence Flow

```
1. Customer enters customization in CustomizePage
   └── Item placed into Cart with fabric, color, collar, cuff, buttons, measurements, perfume
2. Customer navigates to CheckoutPage
   └── Form pre-filled from userProfile (fullName, email, phone)
3. Customer submits "Place Order"
   ├── Validate address, PIN code, contact mobile number
   ├── Construct complete order object with unique ID (FF-2026-XXXXXX)
   ├── If authenticated:
   │     Call `createFirestoreOrder(newOrder, user.uid)`
   │     Write to Firestore collection `orders/{orderId}`
   ├── Save copy in browser `localStorage.fitfusion_orders` (offline cache / dual persistence)
   ├── Clear active cart via `clearCart()`
   └── Display Order Confirmation view with reference number and tailoring status
4. Customer visits OrdersPage (`/orders`)
   ├── Query Firestore orders where `userId == currentUser.uid`
   ├── Merge with cached local orders (removing duplicate IDs)
   ├── Sort in-memory newest orders first
   └── Render tailoring milestone stages (Confirmed -> Cutting -> Stitching -> QA -> Dispatched)
```

---

## 5. Firestore Security Rules

Production-grade rules defined in [`firestore.rules`](file:///C:/FITFUSION/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users Collection: User can read/write ONLY their own profile document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    // Orders Collection: User can read/create ONLY their own orders
    match /orders/{orderId} {
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow update: if false; // Order modification restricted
      allow delete: if false; // Client deletion disallowed
    }

    // Products Collection: Publicly readable, write restricted
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 6. Environment Variables Configuration

Configure the following variables in `frontend/.env` (based on `frontend/.env.example`):

```bash
# Vite API Backend
VITE_API_URL=http://localhost:5000/api

# Firebase Web Client Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 7. How to Seed Products to Firestore

FITFUSION includes a programmatic seeding function in `src/services/firestoreService.js`:

```javascript
import { seedProductsToFirestore } from './services/firestoreService.js';

// Call in console or admin initialization component:
seedProductsToFirestore().then(result => {
  console.log(`Seeded ${result.successful} products to Firestore!`);
});
```

If Firestore credentials are not configured, FITFUSION automatically and seamlessly falls back to `MOCK_PRODUCTS` in `src/data/mockProducts.js`.

---

## 8. Guest vs. Authenticated Persistence Behavior

| Feature | Authenticated User | Guest User |
| :--- | :--- | :--- |
| **Profile Data** | Persisted to Firestore `users/{uid}` | N/A (Redirected to `/login` for protected routes) |
| **Active Cart** | Persisted in `localStorage.fitfusion_cart` | Persisted in `localStorage.fitfusion_cart` |
| **Active Coupons** | Persisted in `localStorage.fitfusion_coupon` | Persisted in `localStorage.fitfusion_coupon` |
| **Order Placement** | Persisted to Cloud Firestore `orders/{orderId}` + local cache | Persisted in `localStorage.fitfusion_orders` |
| **Order History** | Loaded directly from Firestore (`userId == uid`) | Loaded from `localStorage.fitfusion_orders` |
| **Network Failure** | Graceful fallback to local cache with warning notice | Works seamlessly offline |
