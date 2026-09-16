<div align="center">

# 🏗️ Fouladyar Kourosh

### Comprehensive Customer Management System for Steel Industry

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-2D3748?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

A modern, full-featured customer management system built for a steel manufacturing company — handling orders, cutting invoices, customer tracking, and admin workflows with a clean, minimal UI.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots) • [Getting Started](#-getting-started) • [Live Demo](#-live-demo)

</div>

---

## 📖 About The Project

**Fouladyar Kourosh** is a comprehensive CRM (Customer Relationship Management) system designed specifically for the steel and metal cutting industry. It streamlines the entire workflow from order registration to final cutting invoices, with dedicated portals for both customers and administrators.

### 🎯 What Problem Does It Solve?

Steel cutting companies deal with:
- Complex order tracking with multiple dimensions (length, width, thickness)
- Partial cutting invoices per order
- Weight calculations (based on density formula: `L × W × T × 7.85 × Qty`)
- Remaining weight tracking across multiple cutting sessions
- Customer-specific dashboards

This system solves all of that in a single, elegant interface.

---

## ✨ Features

### 👤 Customer Portal
- 🔐 **Authentication** — Register & login with National ID
- 📊 **Personal Dashboard** — Live stats: total orders, cut weight, remaining weight
- 📋 **Order Tracking** — Search & filter orders by number, brand, product type
- ✂️ **Cutting Invoice Creation** — Multi-row form with auto weight calculation
- 🖨️ **Printable Invoices** — Clean print layout (LTR-ready)

### 🛡️ Admin Portal
- 🔐 **Restricted Access** — Dark mode admin panel with role-based auth
- 👥 **Customer Management** — View all customers with order counts
- 📦 **Order Oversight** — Monitor all orders system-wide
- ✂️ **Invoice Finalization** — Progressive bar showing cut progress per order
- 📚 **Archive System** — Auto-archived finalized invoices
- 📊 **System Stats** — Real-time KPIs across all data

### 🎨 Design & UX
- 🎨 **Minimal Design** — Clean slate + blue palette (Stripe-inspired)
- 🌓 **Dual Themes** — Light (customer) + Dark (admin) for role contrast
- 🌍 **Bilingual Ready** — Full RTL (Persian) and LTR (English) versions
- 📱 **Fully Responsive** — Mobile, tablet, desktop
- ⚡ **Zero Layout Shift** — Optimized for performance
- ✨ **Micro-interactions** — Smooth hover states, glows, transitions

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| **Next.js 14** (App Router) | Framework, routing, SSR |
| **React 18** | UI library |
| **Tailwind CSS** | Styling & design system |
| **Zustand** | Global state management |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

### Backend (Demo)
| Tech | Purpose |
|------|---------|
| **json-server** | Mock REST API for demo purposes |
| **db.json** | Static data store |

> ⚠️ **Note:** The current backend uses `json-server` for demonstration. Production deployment would use **NestJS** or **Express** with **MongoDB/PostgreSQL**.

---

## 📸 Screenshots

### 🏠 Landing Page
![Home Page](./screenshots/home.png)
*Clean landing with dual login options (Customer / Employee)*

### 🔐 Login
![Login Page](./screenshots/login.png)
*Minimal card-based authentication*

### 📊 Customer Dashboard
![Customer Dashboard](./screenshots/dashboard.png)
*Live stats + searchable orders table*

### ✂️ Cutting Invoice
![Cutting Invoice](./screenshots/invoice.png)
*Multi-row form with auto weight calculation*

### 🛡️ Admin Panel
![Admin Panel](./screenshots/admin.png)
*Dark mode admin dashboard with tabs (Customers / Invoices / Archive)*

### 📋 Invoice Details Modal
![Invoice Modal](./screenshots/invoice-modal.png)
*Progressive bar showing cut completion status*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/fouladyar-kourosh.git
cd fouladyar-kourosh

# 2. Install dependencies
npm install

# 3. Start the mock API server (in a separate terminal)
npx json-server --watch db.json --port 4000

# 4. Start the dev server
npm run dev