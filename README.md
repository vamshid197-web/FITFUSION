# FITFUSION

## Design It. Customize It. Wear It.

A customized clothing shopping platform where users can select clothing, customize fabric, color, design, size and fit, receive perfume recommendations, preview their customized outfit, apply offers/cashback, and place orders.

> **Status:** The project is currently in the initial **foundation/scaffolding stage**. Architecture, directories, configuration, and documentation placeholders are established. Actual application features will be implemented in subsequent development phases.

---

## Project Overview

**FITFUSION** redefines the personal fashion shopping experience by bridging bespoke tailoring and modern e-commerce. Customers can browse apparel silhouettes, choose premium fabrics, personalize styling details (collars, sleeves, stitching, patterns), input custom body measurements or adjust standard sizing for tailored fit, discover complementary fragrance pairings, visually preview their tailored ensembles, apply coupons and cashback, and seamlessly complete checkout.

---

## Main Features (Planned)

1. **Custom Clothing Catalog**: Browse curated garment types (shirts, trousers, blazers, ethnic wear, dresses, and casual attire).
2. **Fabric & Swatch Selection**: Choose from diverse textures, blends, patterns, and weights with high-resolution visual previews.
3. **Interactive Design Customizer**: Personalize garment accents, cuts, collars, cuffs, monograms, buttons, and hemlines.
4. **Tailored Measurements & Fit Profiler**: Input detailed body measurements or alter standard dimensions for a perfect personalized fit.
5. **Fragrance & Perfume Pairing**: Smart recommendation engine suggesting artisanal fragrances tailored to clothing styles and occasions.
6. **Live Visual Preview**: Real-time visual rendering of custom selections before placing an order.
7. **Offers, Discounts & Cashback**: Dynamic promotional code validation and wallet cashback mechanisms.
8. **Cart & Secure Checkout**: Comprehensive order management with itemized tailoring summaries and delivery scheduling.
9. **Order Tracking & Measurement Archive**: Track manufacturing, tailoring, quality check, and shipping stages while saving measurement profiles for future orders.
10. **Administrative Suite**: Inventory management for fabrics, styles, perfumes, orders, and promotional campaigns.

---

## Technology Stack

### Frontend
- **Library**: React 18 / 19
- **Build Tool**: Vite
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Architecture**: RESTful API
- **Middleware**: CORS, Express JSON, Dotenv

### Database & Storage (Planned)
- **Database**: Cloud Firestore / Firebase
- **File Storage**: Cloud Storage (for custom designs, swatches, and product renders)

### Authentication (Planned)
- **Service**: Firebase Authentication (Email/Password, Google OAuth)

---

## Project Structure

```text
FITFUSION/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       │
│       ├── components/
│       │   ├── common/
│       │   ├── product/
│       │   ├── customization/
│       │   ├── cart/
│       │   └── order/
│       │
│       ├── pages/
│       │   ├── auth/
│       │   ├── home/
│       │   ├── shop/
│       │   ├── product/
│       │   ├── customize/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── orders/
│       │   ├── profile/
│       │   └── admin/
│       │
│       ├── layouts/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── server.js
│
├── database/
│   ├── schema/
│   └── seeds/
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── user-flow.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Development Roadmap

- [x] **Phase 1: Foundation & Scaffolding** *(Current)*
  - Establish directory structure, base configurations, and documentation.
  - Setup React + Vite + Tailwind CSS frontend shell.
  - Setup Express REST API server with health-check endpoint.
- [ ] **Phase 2: Database Schema & Authentication**
  - Implement Firebase/Firestore connection and schema rules.
  - User authentication and role-based access control (Customer, Admin).
- [ ] **Phase 3: Catalog & Customization Engine**
  - Product catalog, fabric selection, and customization workflow.
  - Custom measurement profiles and fit adjustments.
- [ ] **Phase 4: Perfume Recommendations & Visual Preview**
  - Integrated fragrance recommendation module.
  - Outfit preview canvas.
- [ ] **Phase 5: Cart, Checkout & Orders**
  - Cart state management, promotional offers, and checkout processing.
  - Order manufacturing & delivery tracking pipeline.
- [ ] **Phase 6: Admin Dashboard & Analytics**
  - Administration of orders, products, fabrics, perfumes, and coupons.

---

## Installation

Clone the repository and install dependencies for both frontend and backend:

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Running the Application

### Running Backend
From the `backend` directory:
```bash
# Start development server
npm run dev

# Or start production server
npm start
```
The server will start on `http://localhost:5000` (or the port defined in `.env`).  
Health check endpoint: `GET http://localhost:5000/api/health`.

### Running Frontend
From the `frontend` directory:
```bash
# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
The Vite development server will open at `http://localhost:5173`.

---

## Environment Variables

Copy the provided template `.env.example` files to `.env` in both folders:

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

*(Refer to `backend/.env.example` and `frontend/.env.example` for full configuration options).*

---

## Future Enhancements

- **3D Garment Simulation**: Real-time 3D draping and fabric physics rendering.
- **AR Virtual Dressing Room**: Augmented reality mirror preview for mobile devices.
- **AI Stylist & Fabric Matcher**: Intelligent color coordination and fabric recommendation based on occasion, skin undertones, and climate.
- **Bespoke Monogramming Preview**: Interactive embroidery thread color, typography, and placement preview.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
