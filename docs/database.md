# FITFUSION Database Design & Entity Specifications

This document outlines the planned NoSQL schema model and entity specifications for **FITFUSION**, targeting Cloud Firestore / Firebase.

> **Note:** At this foundation stage, database collections are not yet created. This document acts as the reference design for upcoming data modeling.

---

## Planned Entities & Collections

### 1. Users (`users`)
Stores customer accounts, credentials, preferences, and roles.
- `id` (String, UUID/UID): Unique user identifier.
- `email` (String): User's primary email address.
- `displayName` (String): Full customer name.
- `phone` (String): Contact phone number.
- `role` (String): Role (`customer`, `admin`, `tailor_partner`).
- `savedMeasurementProfiles` (Array of Reference IDs): Linked measurement records.
- `createdAt` / `updatedAt` (Timestamp): Record creation and modification timestamps.

### 2. Products (`products`)
Base apparel silhouettes that can be customized.
- `id` (String): Unique product identifier.
- `name` (String): Garment name (e.g., "Classic Oxford Tailored Shirt", "Double-Breasted Blazer").
- `category` (String): Clothing category (e.g., `shirts`, `trousers`, `blazers`, `suits`, `dresses`).
- `basePrice` (Number): Base price before fabric and bespoke options.
- `description` (String): Garment cut and silhouette details.
- `images` (Array of Strings): Front, back, and side silhouette reference URLs.
- `compatibleFabrics` (Array of Fabric IDs): Fabrics approved for this garment cut.
- `customizationOptions` (Object): Permitted customization features (collar styles, cuff types, buttons).
- `isActive` (Boolean): Product visibility status.

### 3. Fabrics (`fabrics`)
Available textiles, materials, and patterns for bespoke garment creation.
- `id` (String): Unique fabric identifier.
- `name` (String): Fabric title (e.g., "Egyptian Giza Cotton 120s", "Italian Merino Wool").
- `material` (String): Composition (e.g., 100% Cotton, Linen Blend, Silk-Wool).
- `color` (String): Primary color name.
- `colorHex` (String): Hexadecimal color code for real-time visualization.
- `pattern` (String): Pattern type (`solid`, `striped`, `checkered`, `houndstooth`, `herringbone`).
- `textureUrl` (String): High-resolution seamless texture asset for visual preview.
- `pricePerUnit` (Number): Additional cost multiplier or fixed charge for this fabric.
- `season` (String): Recommended seasonality (`all_season`, `summer`, `winter`).
- `inStock` (Boolean): Availability toggle.

### 4. Perfumes (`perfumes`)
Fragrances curated to complement customized outfits.
- `id` (String): Unique perfume identifier.
- `name` (String): Fragrance title (e.g., "Velvet Oud & Bergamot", "Sea Salt & Neroli").
- `brand` / `line` (String): Fragrance collection.
- `notes` (Object): Top, heart, and base olfactory notes.
- `occasion` (Array of Strings): Occasions (`formal`, `evening`, `summer_casual`, `boardroom`).
- `price` (Number): Purchase price for complementary add-on.
- `volumeMl` (Number): Bottle size in ml.
- `imageUrl` (String): Product bottle render URL.

### 5. Customizations (`customizations`)
Detailed configuration chosen by the user for a specific garment.
- `id` (String): Unique customization record ID.
- `productId` (String): Base apparel ID.
- `fabricId` (String): Selected textile ID.
- `selectedOptions` (Object): Key-value selections:
  - `collarStyle` (e.g., "Cutaway", "Mandarin", "Button-Down")
  - `cuffStyle` (e.g., "French Double Cuff", "Two-Button Rounded")
  - `pocketStyle` (e.g., "None", "Single V-Pocket")
  - `buttonStyle` (e.g., "Mother of Pearl", "Matte Horn")
  - `monogram` (Object: text, font, threadColor, placement)
  - `placketStyle` (e.g., "French Front", "Standard Placket")
- `totalCustomizationCost` (Number): Sum of add-on features.

### 6. Measurements (`measurements`)
Personalized tailoring dimensions associated with a user or order.
- `id` (String): Unique measurement record ID.
- `userId` (String): Customer ID owner.
- `profileName` (String): Profile label (e.g., "Formal Fitted", "Relaxed Fit").
- `fitPreference` (String): Fit preference (`slim_fit`, `tailored_fit`, `regular_fit`, `relaxed_fit`).
- `metrics` (Object, in cm or inches):
  - `neck`
  - `chest`
  - `waist`
  - `hip`
  - `shoulderWidth`
  - `sleeveLength`
  - `bicep`
  - `wrist`
  - `shirtLength` / `trouserLength`
  - `inseam`
- `specialInstructions` (String): Specific posture or alteration requests.

### 7. Cart (`carts`)
Current active bag items for guest or logged-in users.
- `id` (String): Unique cart ID.
- `userId` (String, nullable for guests): Associated user.
- `items` (Array of Objects):
  - `productId` (String)
  - `customizationId` (String)
  - `measurementId` (String)
  - `perfumeAddonId` (String, optional)
  - `quantity` (Number)
  - `unitPrice` (Number)
- `appliedOfferId` (String, optional): Active coupon code.
- `subtotal` (Number)
- `discountAmount` (Number)
- `estimatedTotal` (Number)

### 8. Orders (`orders`)
Confirmed tailoring and clothing purchases.
- `id` (String): Unique order identifier.
- `orderNumber` (String): Customer-facing order code (e.g., "FF-2026-8942").
- `userId` (String): Customer ID.
- `items` (Array of Objects): Frozen snapshot of customized garments, measurements, and perfumes.
- `shippingAddress` (Object): Delivery address details.
- `status` (String): Tailoring stages (`placed`, `fabric_sourced`, `cutting`, `stitching`, `quality_checked`, `shipped`, `delivered`).
- `pricing` (Object): Subtotal, customization fees, tax, shipping, discount, total.
- `perfumePairings` (Array of Perfume IDs): Selected fragrance add-ons.
- `trackingNumber` (String, optional): Courier consignment number.
- `createdAt` / `updatedAt` (Timestamp): Lifecycle timestamps.

### 9. Addresses (`addresses`)
Saved delivery and billing addresses for customer accounts.
- `id` (String): Unique address record ID.
- `userId` (String): Customer identifier.
- `recipientName` (String): Delivery recipient name.
- `street` (String): Street address, apartment / suite number.
- `city` (String): City.
- `state` (String): State / Province.
- `postalCode` (String): ZIP / PIN code.
- `country` (String): Country.
- `isDefault` (Boolean): Default shipping selection flag.

### 10. Offers (`offers`)
Promotions, discounts, and cashback rules.
- `id` (String): Unique offer ID.
- `code` (String): Promo code (e.g., "BESPOKE20", "FIRSTFUSION").
- `discountType` (String): `percentage` or `fixed_amount`.
- `discountValue` (Number): Discount rate or currency reduction.
- `cashbackPercentage` (Number, optional): Wallet cashback rebate.
- `minOrderValue` (Number): Minimum qualifying subtotal.
- `validFrom` / `validUntil` (Timestamp): Expiration window.
- `usageLimit` (Number): Max overall redemptions.
- `isActive` (Boolean): Promotion status.
