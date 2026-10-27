# FITFUSION — Online Production Deployment & Hosting Guide

This guide provides step-by-step instructions to configure, build, and deploy the **FITFUSION** web application and its AI Virtual Try-On backend service to the internet with high availability, full HTTPS security, and custom domain routing.

> **CRITICAL SECURITY & BUDGET NOTICE**:
> FITFUSION is fully configured for production. No domain purchases or live cloud deployments are initiated automatically. All steps below are designed for self-service deployment or automated CI/CD when you are ready.

---

## 1. Architecture Overview

FITFUSION consists of two core tiers:

1. **Frontend (Client Tier)**:
   - Built with **React 18 + Vite + Tailwind CSS + Three.js**.
   - Static Single Page Application (SPA).
   - Designed to deploy to edge CDNs: **Vercel**, **Firebase Hosting**, **Netlify**, or **Cloudflare Pages**.
   - Production builds automatically use relative `/api` paths or the domain configured in `VITE_API_URL` (no hardcoded localhost).

2. **Backend (API & AI Service Tier)**:
   - Built with **Node.js + Express + Gradio Client + Fal.ai client**.
   - Handles ephemeral photo uploads, catalog garment resolutions, and AI VTON model dispatching.
   - Designed to deploy to containerized hosts: **Render**, **Railway**, **Google Cloud Run**, or **AWS ECS/App Runner**.
   - Configured with `trust proxy 1` for HTTPS termination behind SSL reverse proxies and dynamic CORS domain whitelisting.

---

## 2. Environment Variables Reference

### A. Backend Environment Variables (`backend/.env`)

| Variable | Environment | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Production | `production` | Enables production optimizations and disables stack leaks. |
| `PORT` | Production | `5000` (or injected by host `$PORT`) | Server listener port. |
| `HOST` | Production | `0.0.0.0` | Binds to all network interfaces for container routing. |
| `CLIENT_URL` | Production | `https://fitfusion.yourdomain.com` | Primary frontend web URL for strict CORS validation. |
| `ALLOWED_ORIGINS` | Production | `https://fitfusion.yourdomain.com,https://app.yourdomain.com` | Comma-separated list of additional allowed CORS origins. |
| `KOLORS_PROVIDER` | Production | `fal-ai` or `hf-kolors` | Chosen AI VTON provider (`fal-ai` recommended for production). |
| `FAL_KEY` | Optional / Prod | `fal_xxx...` | Fal.ai API key for fast serverless generation. |
| `FAL_KOLORS_ENDPOINT` | Optional | `https://fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on` | Official Fal.ai Kolors serverless endpoint. |
| `HF_TOKEN` | Optional | `hf_xxx...` | Hugging Face personal access token for higher ZeroGPU priority. |
| `ALLOW_COMMUNITY_HF`| Optional | `true` | Allows connecting to public Hugging Face ZeroGPU community space. |
| `VTON_DENOISE_STEPS`| Production | `22` | Generation quality balance (15–30 steps). |

### B. Frontend Environment Variables (`frontend/.env`)

| Variable | Environment | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production | `https://api.yourdomain.com/api` (or empty for same-domain) | Backend REST API endpoint. |
| `VITE_BACKEND_URL` | Production | `https://api.yourdomain.com` (or empty for same-domain) | Backend root URL. |
| `VITE_FIREBASE_API_KEY` | Production | `AIzaSy...` | Firebase Web API key for auth & Firestore. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Production | `fitfusion-103d7.firebaseapp.com` | Firebase Auth domain. |
| `VITE_FIREBASE_PROJECT_ID` | Production | `fitfusion-103d7` | Google Cloud / Firebase project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET`| Production | `fitfusion-103d7.firebasestorage.app` | Cloud Storage bucket for catalog assets. |

---

## 3. Recommended Deployment Options

### Strategy 1: Modern Cloud (Render + Vercel) — Recommended

- **Backend**: Deploy on **Render** (Web Service, Node environment).
  1. Link your GitHub repository.
  2. Set Root Directory to `backend`.
  3. Build Command: `npm install`
  4. Start Command: `node src/server.js`
  5. Add Environment Variables from `backend/.env.example`.
  6. Render provides a free managed HTTPS URL (e.g., `https://fitfusion-api.onrender.com`).

- **Frontend**: Deploy on **Vercel** or **Firebase Hosting**.
  1. For Vercel: Set Root Directory to `frontend`.
  2. Build Command: `npm run build`
  3. Output Directory: `dist`
  4. Add Environment Variable: `VITE_API_URL=https://fitfusion-api.onrender.com/api` and `VITE_BACKEND_URL=https://fitfusion-api.onrender.com`.
  5. Deploy. Vercel provides automatic global edge CDN and SSL certificate.

### Strategy 2: Single-Domain Deployment (Reverse Proxy via NGINX or Caddy)

If hosting on a single VPS (DigitalOcean / AWS EC2 / Hetzner):
1. Build frontend: `cd frontend && npm run build` -> output in `frontend/dist`.
2. Start backend: `cd backend && NODE_ENV=production node src/server.js`.
3. Configure NGINX reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /var/www/fitfusion/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Routing
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }
}
```

---

## 4. Custom Domain & DNS Setup

To link a custom domain (e.g. `yourdomain.com`):

1. **Root Domain (`yourdomain.com`)**:
   - Create an **A Record** pointing to your frontend CDN / server IP (e.g. Vercel: `76.76.21.21`).
2. **Subdomain for API (`api.yourdomain.com`)**:
   - Create a **CNAME Record** pointing to your backend host (e.g. `fitfusion-api.onrender.com`).
3. **SSL / TLS Certificate**:
   - Managed automatically via Let's Encrypt / Vercel SSL / Render SSL.
   - Ensure Cloudflare SSL mode is set to **Full (Strict)** if using Cloudflare proxying.

---

## 5. Pre-Deployment Verification Checklist

- [x] Run `npm run build` in `frontend/` — builds successfully with zero lint or packaging errors.
- [x] Verified zero hardcoded `http://localhost` fallback in production mode.
- [x] Zero `console.log` statements in `frontend/src` production code.
- [x] API server configured with `app.set('trust proxy', 1)` for HTTPS proxy headers.
- [x] CORS middleware supports dynamic origins via `CLIENT_URL` and `ALLOWED_ORIGINS`.
- [x] All 7 Product Categories and 3D Garment Studio verified intact.
- [x] Hugging Face Gradio ZeroGPU verified with valid predict signature `client.predict(2, [person, garment, seed, isRandom])`.
- [x] Prominent "Open Original Kolors Studio" fallback button implemented for Hugging Face Space CSP restrictions.
