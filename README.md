<div align="center">

# 🏭 Fouladyar Kourosh

### Steel Company Portal — Order & Cutting Management System

A modern, full-featured web application for managing steel orders, cutting invoices, and customer relationships.  
Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-orange)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-reference) • [License](#-license)

</div>

---

## 📖 About the Project

**Fouladyar Kourosh** is a comprehensive order and cutting management system designed for a steel manufacturing company. It provides:

- 🧑‍💼 **Customer Portal** — Customers can view their orders, track cutting progress, and download invoices
- 🛡️ **Admin Panel** — Admins manage customers, orders, and finalize cutting invoices
- ✂️ **Cutting Invoice System** — Detailed tracking of steel sheet cutting with weight calculations
- 📊 **Real-time Statistics** — Live dashboard with order counts, weights, and completion status

> **The system is built entirely client-side** using `json-server` as a mock backend — no external database required.

---

## ✨ Features

### 🧑‍💼 Customer Portal

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Login** | National ID + password authentication |
| 📝 **Registration** | Self-service signup with validation |
| 📋 **Order Dashboard** | View all orders with real-time status |
| ✂️ **Cutting Invoices** | View detailed cutting invoices per order |
| 📊 **Weight Tracking** | Total, cut, and remaining weight per order |
| 🔍 **Live Search** | Filter orders by number, type, brand, status |
| 🖨️ **Print Support** | Print invoices directly from browser |

### 🛡️ Admin Panel

| Feature | Description |
|---------|-------------|
| 🔐 **Restricted Access** | Role-based admin authentication |
| 👥 **Customer Management** | View all registered customers |
| 📦 **Order Management** | Track all orders across all customers |
| 📝 **Invoice Finalization** | Finalize cutting invoices & auto-complete orders |
| 📚 **Archive System** | Access finalized/archived invoices |
| 📊 **Dashboard Stats** | Total customers, active invoices, weights |
| 🎨 **Dark UI** | Modern glassmorphic dark theme |

### 🎯 Core Capabilities

- ✅ **Real-time weight calculation** using steel density (7.85 kg/dm³)
- ✅ **Multi-row invoice builder** with dynamic add/remove
- ✅ **8 cutting types** (Flat Sheet, Shutter, Trapezoidal, etc.)
- ✅ **Auto status updates** (Open → Cut → Completed)
- ✅ **Per-customer data isolation**
- ✅ **Session persistence** via localStorage
- ✅ **Fully responsive** — mobile, tablet, desktop

---

## 🚀 Demo

> **Add screenshots here:**
>
> | Customer Dashboard | Admin Panel | Cutting Invoice |
> |:---:|:---:|:---:|
> | ![Dashboard](./public/screenshots/dashboard.png) | ![Admin](./public/screenshots/admin.png) | ![Invoice](./public/screenshots/invoice.png) |

**Live Demo:** [fouladyar.vercel.app](https://fouladyar.vercel.app) *(coming soon)*

---

## 🛠️ Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>Framework</td>
    <td><b>Next.js 16</b></td>
    <td>React framework with App Router + Turbopack</td>
  </tr>
  <tr>
    <td>Language</td>
    <td><b>TypeScript 5</b></td>
    <td>Type-safe development</td>
  </tr>
  <tr>
    <td>Styling</td>
    <td><b>Tailwind CSS 4</b></td>
    <td>Utility-first CSS</td>
  </tr>
  <tr>
    <td>State</td>
    <td><b>Zustand 5</b></td>
    <td>Lightweight global state</td>
  </tr>
  <tr>
    <td>HTTP Client</td>
    <td><b>Axios</b></td>
    <td>API requests to json-server</td>
  </tr>
  <tr>
    <td>Icons</td>
    <td><b>Lucide React</b></td>
    <td>Beautiful, consistent icons</td>
  </tr>
  <tr>
    <td>Forms</td>
    <td><b>React Hook Form + Zod</b></td>
    <td>Form handling & validation</td>
  </tr>
  <tr>
    <td>Notifications</td>
    <td><b>React Hot Toast</b></td>
    <td>Toast notifications</td>
  </tr>
  <tr>
    <td>Mock Backend</td>
    <td><b>json-server</b></td>
    <td>REST API from db.json</td>
  </tr>
</table>

---

## 📦 Installation

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | **18+** |
| npm / yarn / pnpm | Latest |
| Git | Latest |

### Step-by-Step Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/fouladyar.git

# 2️⃣ Navigate to project
cd fouladyar

# 3️⃣ Install dependencies
npm install

# 4️⃣ Start the mock backend (Terminal 1)
npm run json-server

# 5️⃣ Start the dev server (Terminal 2)
npm run dev
```

### 🚀 One-Command Start (Recommended)

```bash
# Runs both json-server AND next dev concurrently
npm run dev:all
```

### 🌐 Access the App

| Service | URL |
|---------|-----|
| 🌍 App | http://localhost:3000 |
| 🔌 API | http://localhost:4000 |

---

## 📁 Project Structure

```
fouladyar/
│
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Landing page (role selector)
│   ├── 📄 providers.tsx             # Session restore provider
│   ├── 📄 globals.css               # Tailwind imports
│   │
│   ├── 📁 login/                    # Customer login
│   ├── 📁 register/                 # Customer registration
│   ├── 📁 dashboard/                # Customer dashboard
│   │   └── page.tsx                 # Orders list + stats
│   │
│   ├── 📁 orders/                   # Order management
│   │   └── new/page.tsx             # Create new order
│   │
│   ├── 📁 invoice/                  # Cutting invoice creation
│   │   └── [id]/page.tsx            # Create invoice for order
│   │
│   ├── 📁 invoices/                 # Customer invoice list
│   │   └── page.tsx                 # All cutting invoices
│   │
│   ├── 📁 invoice-view/             # Invoice detail view
│   │   └── [orderNumber]/page.tsx   # View/print invoice
│   │
│   ├── 📁 adminLogin/               # Admin login
│   │
│   ├── 📁 admin/                    # Admin panel
│   │   └── dashboard/page.tsx       # Admin dashboard
│   │
│   └── 📁 component/                # Shared components
│       ├── header.tsx               # Customer header
│       ├── footer.tsx               # Footer
│       ├── logo.tsx                 # Logo image
│       ├── statCard.tsx             # Stats card (light/dark)
│       ├── empty.tsx                # Empty state
│       └── refreshBtn.tsx           # Refresh button
│
├── 📁 store/
│   └── 📄 store.ts                  # Zustand store (auth + data)
│
├── 📁 public/
│   ├── logo.jpg                     # Company logo
│   └── screenshots/                 # README screenshots
│
├── 📄 db.json                       # Mock database
├── 📄 package.json                  # Dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 next.config.ts                # Next.js config
└── 📄 tailwind.config.ts            # Tailwind config
```

---

## 🎮 Usage

### 👤 Customer Flow

```
1. Open http://localhost:3000
2. Click "Customer Login"
3. Register (if new) OR login with National ID + password
   - Demo: National ID = 1234, Password = 1234
4. View your orders in the dashboard
5. Click "Cutting Invoice" on any order
6. Create a cutting invoice by filling rows
7. View/print your invoices
```

### 🛡️ Admin Flow

```
1. Open http://localhost:3000
2. Click "Employee Login"
3. Login with admin credentials
   - Demo: National ID = 1234, Password = 1234
4. Switch between tabs: Customers | Invoices | Archive
5. Click "Details" on any invoice
6. Finalize invoice (when remaining weight ≤ 50 kg)
7. Order auto-completes & moves to archive
```

### 🔑 Demo Credentials

| Role | National ID | Password |
|------|-------------|----------|
| 👤 Customer | `1234` | `1234` |
| 👤 Customer | `5678` | `5678` |
| 🛡️ Admin | `1234` | `1234` |

---

## 🔌 API Reference

The app uses **json-server** as a mock backend. All endpoints are RESTful.

### Base URL
```
http://localhost:4000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | List all customers |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers/:id` | Get single customer |
| `GET` | `/orders` | List all orders |
| `POST` | `/orders` | Create an order |
| `PATCH` | `/orders/:id` | Update an order |
| `GET` | `/orders?customerId=:id` | Get customer's orders |
| `GET` | `/invoice` | List all invoices |
| `POST` | `/invoice` | Create an invoice |
| `PATCH` | `/invoice/:id` | Update an invoice |
| `GET` | `/invoice?orderId=:id` | Get order's invoices |
| `GET` | `/users` | List admin users |

### Example: Create an Order

```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "140505135",
    "customerId": "1",
    "productType": "Black Sheet",
    "brand": "Mobarakeh",
    "thickness": 0.5,
    "width": 1.25,
    "totalWeight": 500,
    "status": "Open"
  }'
```

### Data Models

<details>
<summary><b>Customer</b></summary>

```typescript
interface Customer {
  id: string;
  name: string;
  nationalId: string;
  phone?: string;
  address?: string;
  password?: string;
  economicCode?: string;
  createdAt?: string;
}
```
</details>

<details>
<summary><b>Order</b></summary>

```typescript
interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: 'Open' | 'Cut' | 'Completed' | 'Shipped';
  productType: string;
  brand: string;
  thickness: number;
  width: number;
  totalWeight: number;
  cutWeight?: number;
  remainingWeight?: number;
  // ... more fields
}
```
</details>

<details>
<summary><b>Invoice</b></summary>

```typescript
interface Invoice {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: 'Cut Issued' | 'Finalized';
  items: InvoiceItem[];
  totalItems: number;
  totalWeightInvoices: number;
  notes?: string | null;
  finalizedAt?: string;
}

interface InvoiceItem {
  row: number;
  productType: string;
  brand: string;
  thickness: number;
  width: number;
  length: string;
  quantity: string;
  bundle: string;
  weight: number;
  cutType: string;
}
```
</details>

---

## 🧠 How It Works

### 🔄 Order Lifecycle

```
┌──────────┐     Cut Created      ┌──────────┐     Finalized     ┌───────────┐
│   Open   │ ──────────────────► │   Cut    │ ────────────────► │ Completed │
└──────────┘                     └──────────┘                   └───────────┘
     ▲                                                                │
     │                                                                │
     └────────────────── Auto-reopen if needed ◄──────────────────────┘
```

### ⚖️ Weight Calculation

Steel weight is calculated using:

```
Weight (kg) = Length (m) × Width (m) × Thickness (mm) × Density × Quantity
```

Where **Density = 7.85 kg/dm³** (standard steel density).

### 🔐 Authentication

- **Customer**: Login via `nationalId` + `password` → matched against `/customers`
- **Admin**: Login via `nationalId` + `password` + `role === 'admin'` → matched against `/users`
- **Session**: Stored in `localStorage` as `user` or `admin`

### 💾 State Management (Zustand)

```typescript
const {
  // Auth
  currentUser, isAuthenticated, login, logout,
  adminUser, isAdminAuthenticated, adminLogin, adminLogout,

  // Data
  allCustomers, allOrders, allInvoices,
  fetchAdminData, restoreSession,
} = useStore();
```

### 🎯 Invoice Finalization Logic

An invoice can be **finalized** only when:

```
Order Total Weight - Total Cut Weight ≤ 50 kg
```

When finalized:
1. Invoice status → `Finalized`
2. Order status → `Completed` (if remaining ≤ 50) or stays `Open`
3. Invoice moves to **Archive** tab in admin panel

---

## 🎨 Screenshots

### 🔐 Login Page
> ![Login](./public/screenshots/login.png)

### 📊 Customer Dashboard
> ![Dashboard](./public/screenshots/dashboard.png)

### ✂️ Cutting Invoice
> ![Invoice](./public/screenshots/invoice.png)

### 🛡️ Admin Panel
> ![Admin](./public/screenshots/admin.png)

---

## 🐛 Troubleshooting

### ❌ `Port 3000 is already in use`

```bash
# Kill the process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### ❌ `Missing script: "server"`

The script is called **`json-server`**, not `server`:

```bash
npm run json-server    # ✅ correct
npm run server         # ❌ wrong
```

### ❌ `Cannot find module 'json-server'`

```bash
npm install json-server --save-dev
```

### ❌ `--watch` argument not supported

If you're using `json-server@1.0.0-beta.15`, remove `--watch`:

```json
"json-server": "json-server db.json --port 4000"
```

### ❌ Data not persisting after refresh

Make sure `db.json` exists in the project root:

```bash
ls db.json   # should exist
```

If not, create it:

```json
{
  "customers": [],
  "orders": [],
  "invoice": [],
  "users": []
}
```

### ❌ Image not loading in `Logo`

Make sure `/public/logo.jpg` exists. If missing, add a placeholder.

---

## 📜 Available Scripts

| Command | Description | Port |
|---------|-------------|------|
| `npm run dev` | Start Next.js dev server | 3000 |
| `npm run build` | Build for production | — |
| `npm run start` | Start production server | 3000 |
| `npm run lint` | Run ESLint | — |
| `npm run json-server` | Start mock API server | 4000 |
| `npm run dev:all` | Run both concurrently | 3000 + 4000 |

---

## 🗺️ Roadmap

- [x] Customer authentication
- [x] Admin panel with dark UI
- [x] Cutting invoice system
- [x] Weight calculations
- [x] Archive system
- [ ] 📧 Email notifications
- [ ] 📱 PWA support
- [ ] 📊 Charts & analytics
- [ ] 🔍 Advanced filtering
- [ ] 📤 Export to PDF/Excel
- [ ] 🌐 Multi-language (EN/FA)
- [ ] 🔒 Real backend (PostgreSQL + Prisma)

---

## 🤝 Contributing

Contributions make open source amazing! 🎉

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

### 📋 Contribution Guidelines

- ✅ Follow TypeScript best practices
- ✅ Use conventional commits (`feat:`, `fix:`, `docs:`)
- ✅ Add tests for new features
- ✅ Update README if needed

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

<div align="center">

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-@YOUR_USERNAME-181717?logo=github)](https://github.com/YOUR_USERNAME)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://linkedin.com/in/YOUR_PROFILE)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?logo=gmail)](mailto:your.email@example.com)

</div>

---

## ⭐ Show Your Support

If this project helped you, please give it a **⭐ star**! It means a lot!

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/fouladyar&type=Date)](https://star-history.com/#YOUR_USERNAME/fouladyar&Date)

</div>

---

## 🙏 Acknowledgments

- 🏭 **Fouladyar Kourosh Group** — for the real-world use case
- [Next.js](https://nextjs.org/) — the React framework
- [Tailwind CSS](https://tailwindcss.com/) — for beautiful styling
- [Zustand](https://zustand-demo.pmnd.rs/) — for simple state management
- [Lucide Icons](https://lucide.dev/) — for gorgeous icons
- [json-server](https://github.com/typicode/json-server) — for the mock backend
- All the **contributors** who help improve this project 💙

---

<div align="center">

### 🏭 Built with ❤️ for the Steel Industry

**Fouladyar Kourosh Group © 2026**

[⬆ Back to Top](#-fouladyar-kourosh)

</div>