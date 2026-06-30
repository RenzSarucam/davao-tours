# 🚐 Davao Tours — Vehicle Rental System

A full-stack vehicle rental booking system for Davao City, built with Next.js with a modern green-themed UI.

---

## ✨ Features

### Customer Side
- Browse vehicles and tour packages without logging in
- Register and log in as a customer
- Book a vehicle (login required)
- Edit profile — name, phone, and password
- View booking history

### Admin Panel (`/admin`)
- Secure admin-only login (separate from customer accounts)
- Dashboard overview
- Fleet management (add/edit/delete vehicles)
- Booking management
- Driver management
- Tour packages management
- Customer accounts management — view, search, and delete users

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | MariaDB (via XAMPP) |
| ORM | [Prisma 7](https://www.prisma.io/) + `@prisma/adapter-mariadb` |
| Auth | JWT (via `jose`) — separate cookies for admin & customer |
| Styling | Tailwind CSS v4 + inline styles (Grab green theme) |
| Password | `bcryptjs` |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [XAMPP](https://www.apachefriends.org/) with **MySQL/MariaDB** running
- PHPMyAdmin (included with XAMPP)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/davao-tours.git
cd davao-tours
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Open XAMPP and start **MySQL**. Then create the database in PHPMyAdmin or via shell:

```sql
CREATE DATABASE davao_tours;
```

### 4. Configure environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="mariadb://root:yourpassword@localhost:3306/davao_tours"
JWT_SECRET="your-secret-key-change-in-production"
```

> If your MySQL root has no password: `mariadb://root@localhost:3306/davao_tours`

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed sample data

```bash
# Add sample vehicles
npx tsx prisma/seed.ts

# Create admin account (username: admin / password: admin123)
npx tsx prisma/seed-admin.ts
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Accounts

| Role | Username / Email | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Customer | `renz@gmail.com` | `user123` |

> ⚠️ Change these credentials in production!

---

## 📁 Project Structure

```
davao-tours/
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Sample vehicles
│   ├── seed-admin.ts         # Admin account
│   └── create-customer.ts    # Sample customer
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── login/            # Login page
│   │   ├── register/         # Customer registration
│   │   ├── vehicles/         # Vehicle listing
│   │   ├── packages/         # Tour packages
│   │   ├── booking/          # Booking form
│   │   ├── profile/          # Edit profile
│   │   ├── my-bookings/      # Booking history
│   │   ├── admin/            # Admin panel
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── vehicles/     # Fleet management
│   │   │   ├── bookings/     # Booking management
│   │   │   ├── drivers/      # Driver management
│   │   │   ├── packages/     # Tour packages
│   │   │   └── users/        # Customer accounts
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── Navbar.tsx        # Main navigation
│   │   ├── AdminNav.tsx      # Admin sidebar nav
│   │   └── AdminHeader.tsx   # Admin user dropdown
│   └── lib/
│       ├── prisma.ts         # Prisma client
│       └── auth.ts           # JWT auth helpers
```

---

## 🎨 Design

Clean and modern green color palette:

| Color | Hex | Usage |
|---|---|---|
| Primary Green | `#00B14F` | Buttons, accents, active states |
| Dark Green | `#00803A` | Hover states, admin header |
| Light Green | `#E8F8EE` | Backgrounds, badges |
| Page Background | `#F7F8FA` | Page and panel backgrounds |

---

## 📄 License

This project is for educational purposes only.

---

Built with ❤️ for Davao City 🌴