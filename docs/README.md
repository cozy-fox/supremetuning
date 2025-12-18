# Supreme Tuning Admin Panel

## Complete Software Delivery Documentation

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Project Type:** Web Application  
**Framework:** Next.js 16 with React 19  
**Database:** MongoDB 7.x

---

## 📖 Documentation Index

This documentation package includes the following files:

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](./README.md) | This file - Overview and quick start | Everyone |
| [INSTALLATION.md](./INSTALLATION.md) | Complete installation guide | Developers |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide | DevOps/Developers |
| [DATABASE.md](./DATABASE.md) | Database schema and operations | Developers |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API documentation | Developers |
| [COMPONENTS.md](./COMPONENTS.md) | React components reference | Developers |
| [FUNCTIONS.md](./FUNCTIONS.md) | All functions with examples | Developers |
| [USER_MANUAL.md](./USER_MANUAL.md) | Complete user guide | Project Owner/Admins |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions | Everyone |
| [SECURITY.md](./SECURITY.md) | Security documentation | Developers/DevOps |
| [MAINTENANCE.md](./MAINTENANCE.md) | System maintenance guide | DevOps/Admins |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB 7.x (local or Atlas)
- npm or yarn package manager

### Installation (Development)

```bash
# Clone the repository
git clone <repository-url>
cd supremetuning

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your settings
# MONGODB_URI=your-mongodb-connection-string
# JWT_SECRET=your-secret-key

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Default Login
- **Username:** admin
- **Password:** (contact developer for initial password)

---

## 📋 Project Overview

### What is Supreme Tuning Admin Panel?

Supreme Tuning Admin Panel is a comprehensive web application for managing a car chiptuning business database. It allows administrators to:

- **Manage Vehicle Data:** Brands, groups, models, generations, engines
- **Configure Tuning Stages:** Stage 1, 1+, 2, 2+ with power/price specifications
- **Bulk Operations:** Update multiple prices at once
- **Data Organization:** Move items between categories
- **Backup & Recovery:** Audit logs and database backups
- **Multi-language:** Dutch and English support

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
├─────────────────────────────────────────────────────────────┤
│                 Next.js App Router                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Pages     │  │  Components  │  │    API Routes    │  │
│  │  (React 19)  │  │  (JSX/CSS)   │  │  (REST + JSON)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Library Layer                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────┐   │
│  │  auth   │  │  data   │  │  backup  │  │  mongodb    │   │
│  │  .js    │  │  .js    │  │ service  │  │  .js        │   │
│  └─────────┘  └─────────┘  └──────────┘  └─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   MongoDB Database                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐  │
│  │ brands │ │ groups │ │ models │ │  types  │ │ engines │  │
│  └────────┘ └────────┘ └────────┘ └─────────┘ └─────────┘  │
│  ┌────────┐ ┌────────────┐ ┌──────────────┐                 │
│  │ stages │ │ audit_logs │ │ full_backups │                 │
│  └────────┘ └────────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Data Hierarchy

The application manages data in a hierarchical structure:

```
Brand (e.g., Audi)
  └── Group (e.g., Standard, RS)
       └── Model (e.g., A3, RS3)
            └── Generation/Type (e.g., 8Y - 2020 →)
                 └── Engine (e.g., 35 TFSI 1.5T 150HP)
                      └── Stage (Stage 1, 1+, 2, 2+)
```

### Performance Groups

Some brands have performance sub-brands:
- **Audi:** RS (RS3, RS4, RS6, RS7)
- **BMW:** M (M3, M4, M5, M8)
- **Mercedes:** AMG (C43 AMG, E63 AMG)

Standard groups always appear first in lists.

---

## 🔧 Key Features

### 1. Visual Data Editor
- Hierarchical tree navigation
- Inline editing capabilities
- Real-time updates

### 2. Bulk Price Updates
- Update by brand, model, generation, or engine
- Percentage-based adjustments
- Fixed price assignments
- Individual stage pricing

### 3. Move Operations
- Relocate models between groups/brands
- Move generations between models
- Transfer engines between generations

### 4. Backup System
- Automatic audit logging
- Full database backups
- Point-in-time recovery

### 5. Responsive Design
- Desktop-optimized interface
- Mobile support with hamburger menu (<380px)
- Touch-friendly dialogs

---

## 📞 Support

For technical support, contact your development team.

For usage questions, refer to [USER_MANUAL.md](./USER_MANUAL.md).

---

*© 2024 Supreme Tuning. All rights reserved.*

