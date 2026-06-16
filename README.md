Accessories by DN - Monorepo


Welcome to the official repository for Accessories by DN, a modern, mobile-first e-commerce ecosystem. This project is structured as a Monorepo containing two completely separate Next.js applications that connect to a single, centralized Firebase database.

/website: The elegant, customer-facing e-commerce storefront for browsing items, managing a cart, and completing Cash on Delivery (COD) checkouts.
https://github.com/V-Ashen/accessories-by-DN.git

/admin-panel: The secure, role-restricted management dashboard for catalog management, stock updates, order processing, and staff administration.
https://accessories-by-dn-admin.vercel.app/


🛠️ Tech Stack & Key Integrations


Frontend Framework: Next.js 14+ (App Router, TypeScript, Tailwind CSS)
Database: Cloud Firestore (NoSQL, optimized with transactional queries)
Authentication: Firebase Authentication (Email/Password & Google SSO)
Media Hosting: Cloudinary (Free tier content delivery network for product images)
Transactional Email: Resend API (Automated HTML order receipt delivery)
State Management: Zustand (Lightweight global state for shopping cart and auth)


📂 Project Structure

accessories-by-dn-repo/
├── website/              # Customer Front-End Storefront (Port 3000)
│   ├── src/app/          # Pages & API routes (App Router)
│   ├── src/components/   # Modular UI elements (Cart, Navbar, Success page)
│   ├── src/store/        # Global state (Zustand Cart & Auth)
│   └── public/           # Static assets (Banners, Logos, Icons)
│
└── admin-panel/          # Back-End Management Dashboard (Port 3001)
    ├── src/app/          # Admin pages (Dashboard, Orders, Catalog, Staff)
    ├── src/components/   # Administrative UI elements (Guard, Sidebar)
    └── src/store/        # Admin global state (Zustand Auth)


🚀 Key Functional Systems

1. Atomic Stock Management & Transactions
To prevent overselling during high-traffic social media spikes (e.g., viral TikTok clips), the checkout page uses a Firestore Transaction. Before completing an order, the system locks the product documents, verifies that stockQuantity >= requestedQuantity, decrements the stock, and creates the order document in a single atomic database operation.

2. Dynamic 0-1-2 Role-Based Access Control (RBAC)
The admin panel is guarded by a strict hierarchical access control system:
Master Admin (Level 0): Ultimate operational privileges. Can manage all tables, customize permission sets, and manage other administrators. Level 0 users cannot be edited or deleted by other administrators.
Admin (Level 1): Full management access. Can create lower-level roles and modify staff (Level 2), but is strictly barred from modifying or deleting Level 0 administrators.
Staff / Cashier (Level 2): Restricted operational access. Can view analytics and process orders, but cannot manage users or administrative configurations.

3. Non-Blocking Image Uploads
To stay within free-tier quotas, the system avoids Firebase Storage and utilizes Cloudinary. Images uploaded through the admin panel are transferred directly to Cloudinary via unsigned frontend presets, and only the secure URL strings are saved to Firestore, keeping operational costs at $0.