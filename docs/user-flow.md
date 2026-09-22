# FITFUSION Customer Journey & User Flow

This document details the complete planned customer shopping and tailoring flow for **FITFUSION** ("Design It. Customize It. Wear It.").

---

## High-Level Flowchart

```
Splash
  ↓
Login / Sign Up
  ↓
Home
  ↓
Shop
  ↓
Product Details
  ↓
Select Fabric
  ↓
Select Color
  ↓
Customize Design
  ↓
Select Size
  ↓
Custom Measurements
  ↓
Alter Fit
  ↓
Perfume Recommendation
  ↓
Visual Preview
  ↓
Smart Recommendations
  ↓
Offers / Cashback
  ↓
Cart
  ↓
Checkout
  ↓
Order Placed
  ↓
Order Tracking
  ↓
Profile
```

---

## Detailed Step-by-Step Flow

### 1. Splash Screen
- **Action**: Welcomes the customer with brand identity, tagline: *"Design It. Customize It. Wear It."*, and high-definition lifestyle bespoke apparel imagery.
- **Next**: Directs new or returning users toward authentication or exploration.

### 2. Login / Sign Up
- **Action**: Authenticate via Firebase Authentication (Email/Password or Google Sign-In) or proceed as a guest.
- **Next**: Lands user onto the personalized Home dashboard.

### 3. Home
- **Action**: Highlights trending apparel silhouettes, seasonal fabric spotlight collections, bespoke highlights, and recent personalized recommendations.
- **Next**: User clicks into curated categories or the main Shop catalog.

### 4. Shop
- **Action**: Filter and browse customizable apparel silhouettes (shirts, trousers, blazers, formal suits, casual wear, dresses).
- **Next**: User selects an apparel item to view details.

### 5. Product Details
- **Action**: Displays 360-degree photography of the base garment, tailoring craftsmanship details, base pricing, and custom options available.
- **Next**: User clicks "Start Customizing".

### 6. Select Fabric
- **Action**: Browse and select from curated fabric blends (Egyptian Giza cotton, Italian linen, Merino wool, silk blends) with high-res texture magnification.
- **Next**: Moves to color selection.

### 7. Select Color
- **Action**: Choose from rich, elegant color palettes and swatches (solids, melange, pinstripes, windowpane checks, herringbone).
- **Next**: Moves to detailed design customization.

### 8. Customize Design
- **Action**: Select detailed garment design components:
  - Collar styles (Cutaway, Mandarin, Classic Spread, Button-Down)
  - Cuffs (Double French, Single Button, Two-Button Convertible)
  - Buttons (Mother of Pearl, Horn, Brass, Matte Resin)
  - Placket style (French Front, Concealed, Standard)
  - Monogram placement, font, and embroidery thread color.
- **Next**: Moves to sizing.

### 9. Select Size
- **Action**: Choose standard ready-to-wear sizing (XS to 3XL) or opt directly for precision custom tailoring.
- **Next**: Moves to custom measurements step.

### 10. Custom Measurements
- **Action**: Input personal tailor measurements (chest, neck, shoulder, sleeve, waist, hip, inseam) with interactive measuring guide illustrations and video prompts.
- **Next**: Moves to fit refinement.

### 11. Alter Fit
- **Action**: Specify fit preferences (Ultra Slim, Tailored Fit, Classic Regular, Relaxed) and posture alterations (sloping shoulders, athletic torso, extra shirt length).
- **Next**: Receives fragrance recommendation.

### 12. Perfume Recommendation
- **Action**: Smart olfactory pairing engine suggests complementary luxury fragrances crafted to elevate the occasion and fabric style of the chosen outfit.
- **Next**: User can add fragrance or proceed to preview.

### 13. Visual Preview
- **Action**: Dynamic visual preview composites the selected silhouette, chosen fabric pattern, colorway, and customized accents for complete customer inspection.
- **Next**: View complementary style suggestions.

### 14. Smart Recommendations
- **Action**: Recommends accessories and complementary wardrobe pieces (cufflinks, pocket squares, leather belts, silk ties) that match the customized design.
- **Next**: Moves to offers.

### 15. Offers / Cashback
- **Action**: Apply promotional voucher codes, referral perks, and calculate eligible wallet cashback rewards.
- **Next**: Add to Cart.

### 16. Cart
- **Action**: Review configured bespoke apparel with full itemized breakdown (garment, fabric tier, styling customizations, measurements, fragrance add-ons, discounts).
- **Next**: Proceed to Checkout.

### 17. Checkout
- **Action**: Select or add delivery address, choose shipping speed, and complete payment.
- **Next**: Order placed confirmation.

### 18. Order Placed
- **Action**: Displays order confirmation number, receipt summary, and estimated tailoring and dispatch dates.
- **Next**: Seamless transition to order tracking.

### 19. Order Tracking
- **Action**: Live milestone status tracking through the bespoke craftsmanship lifecycle:
  1. Order Placed & Confirmed
  2. Fabric Sourced & Inspected
  3. Pattern Cutting
  4. Handcrafting & Stitching
  5. Quality Check & Ironing
  6. Dispatched & In Transit
  7. Delivered to Doorstep
- **Next**: Customer can view or adjust their profile.

### 20. Profile
- **Action**: Manage personal details, saved measurement profiles (e.g., "Office Slim", "Casual Comfort"), order history, saved fabrics, and cashback wallet balance.
