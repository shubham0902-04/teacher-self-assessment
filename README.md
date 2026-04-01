<div align="center">

<br/>

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Cloudinary-File_Uploads-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />

<br/><br/>

# 🎓 Teacher Self-Assessment System

### A modern, full-stack platform for managing faculty performance evaluations across an entire institution — from setup to final approval.

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-ca1f23?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-00a651?style=for-the-badge)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](https://github.com)

</div>

---

<br/>

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🖼️ Screenshots](#️-screenshots)
- [🏗️ Architecture](#️-architecture)
- [🔐 Role-Based Access](#-role-based-access)
- [⚙️ Features](#️-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔌 API Reference](#-api-reference)
- [🌍 Environment Variables](#-environment-variables)
- [🤝 Contributing](#-contributing)

<br/>

---

## ✨ Overview

The **Teacher Self-Assessment System** is a comprehensive academic evaluation platform built for colleges and universities. It digitizes the entire faculty appraisal lifecycle — from admin configuration to faculty self-scoring, through multi-level review by HOD, Principal, and Chairman — replacing paper-based processes with a fast, transparent, and auditable workflow.

```
Faculty fills form  →  Submits to HOD  →  HOD reviews  →  Forwards to Principal  →  Finalized
```

Every evaluation is tracked in real-time, evidence files can be attached per entry, and all stakeholders have role-specific dashboards tailored to their responsibilities.

<br/>

---

## 🖼️ Screenshots

<div align="center">

| Admin Dashboard | Faculty Evaluation Form |
|:---:|:---:|
| *System setup checklist, animated stats, quick actions* | *Category accordion with multi-entry support* |

| Faculty Dashboard | Parameter Criteria Manager |
|:---:|:---:|
| *Status-aware CTA, assigned categories overview* | *Hierarchical criteria builder per parameter* |

</div>

<br/>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 16 App                        │
│                     (App Router + SSR)                       │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  Admin Panel │Faculty Portal│   HOD Portal  │Principal View │
│  /admin/*    │  /faculty/*  │    /hod/*     │ /principal/*  │
├──────────────┴──────────────┴───────────────┴───────────────┤
│                  Next.js API Routes (/api/*)                  │
│              JWT Auth · Role Guards · Validation             │
├─────────────────────────────────────────────────────────────┤
│          MongoDB (Mongoose ODM)  ·  Cloudinary CDN           │
└─────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🔐 Role-Based Access

| Role | Access | Capabilities |
|------|--------|-------------|
| 👑 **Admin** | `/admin/*` | Full system setup, user management, schema config |
| 🧑‍🏫 **Faculty** | `/faculty/*` | Self-assessment form, draft & submit evaluations |
| 🏫 **HOD** | `/hod/*` | Review dept. submissions, score, return or forward |
| 🎓 **Principal** | `/principal/*` | Final approval or return of HOD-forwarded evaluations |
| 🏛️ **Chairman** | `/director/*` | Institution-wide analytics and reports |

> All routes are protected by JWT middleware. Cookies are `httpOnly`, `SameSite=Lax`, and auto-expire. Role mismatch redirects to the appropriate home dashboard.

<br/>

---

## ⚙️ Features

### 🔧 Admin Panel

<details>
<summary><b>System Setup & Configuration</b></summary>
<br/>

- **7-step onboarding checklist** with live progress indicator
- Animated stat counters on the dashboard
- Quick-action shortcuts to every management module

</details>

<details>
<summary><b>Schools & Departments</b></summary>
<br/>

- Create, edit, delete, and toggle status of schools
- Departments are scoped to schools — cascading relationship
- Filter departments by school in the management table

</details>

<details>
<summary><b>Evaluation Schema Builder</b></summary>
<br/>

- **Categories** → **Parameters** → **Criteria (Fields)** — full 3-level hierarchy
- Each parameter supports: max marks cap, multiple entries toggle, evidence required flag
- Criteria fields define individual scoring inputs with their own max marks
- Visual accordion UI organized by category → parameter → criteria

</details>

<details>
<summary><b>User Management</b></summary>
<br/>

- Create users across all 5 roles
- Faculty and HOD are linked to a School + Department
- Inline edit — password field is optional during updates
- Role color badges for instant visual identification

</details>

<details>
<summary><b>Faculty Category Assignment</b></summary>
<br/>

- Matrix-style assignment table (Faculty × Category)
- Bulk-assign a category to all faculty in one click
- Bulk-select all categories for one faculty member
- Filter faculty by department; saved via bulk upsert API

</details>

---

### 🧑‍🏫 Faculty Portal

<details>
<summary><b>Dashboard</b></summary>
<br/>

- Real-time evaluation status pill (7 possible states)
- Assigned category cards with color coding
- Status-aware CTA button (Start / Continue / View)
- Contextual alert banners when evaluation is returned

</details>

<details>
<summary><b>Self-Assessment Form</b></summary>
<br/>

- Dynamic form built from admin-configured schema
- Collapsible category sections with per-category score progress bars
- Add multiple entries per parameter (when `allowMultipleEntries` is on)
- Per-field mark input with individual max marks cap
- Evidence file upload per entry via Cloudinary
- Live grand total score + per-category score bars
- **Save Draft** at any time without losing progress
- **Submit to HOD** with one click — form locks to read-only on submission
- Full restore of saved data on page reload

</details>

---

### 🔄 Evaluation Workflow

```
NOT_STARTED
    │
    ▼
  DRAFT ◄────────────────────┐
    │                        │
    ▼                        │
SUBMITTED_TO_HOD       RETURNED_BY_HOD
    │                        ▲
    ▼                        │
 (HOD Review) ───────────────┘
    │
    ▼
SUBMITTED_TO_PRINCIPAL ◄──────────┐
    │                             │
    ▼                             │
(Principal Review) ───── RETURNED_BY_PRINCIPAL
    │
    ▼
 FINALIZED ✅
```

<br/>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | MongoDB via Mongoose 9 |
| **Auth** | JWT (`jose` + `jsonwebtoken`) + httpOnly cookies |
| **File Storage** | Cloudinary |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Charts/Graphs** | Recharts |
| **Password Hashing** | bcryptjs |
| **Forms** | React Hook Form + Zod |

<br/>

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20.9.0`
- MongoDB Atlas or local MongoDB instance
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/teacher-self-assessment.git
cd teacher-self-assessment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values (see [Environment Variables](#-environment-variables) section).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

### 5. Create Your First Admin User

Seed an admin user directly into MongoDB or use a seed script:

```js
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Admin",
  email: "admin@college.edu",
  password: "",  // hash with bcrypt rounds=10
  role: "Admin",
  isActive: true
})
```

### 6. Build for Production

```bash
npm run build
npm start
```

<br/>

---

## 📁 Project Structure

```
teacher-self-assessment/
├── app/
│   ├── admin/                  # Admin panel pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── categories/
│   │   ├── parameters/
│   │   ├── parameter-fields/
│   │   ├── schools/
│   │   ├── departments/
│   │   ├── users/
│   │   ├── faculty-category-assignment/
│   │   └── settings/
│   ├── faculty/                # Faculty portal pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── evaluation/         # Self-assessment form
│   │   └── submissions/
│   ├── hod/                    # HOD portal
│   ├── principal/              # Principal portal
│   ├── director/               # Chairman portal
│   ├── login/
│   ├── api/                    # All API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── schools/
│   │   ├── departments/
│   │   ├── categories/
│   │   ├── parameters/
│   │   ├── parameter-fields/
│   │   ├── faculty/
│   │   ├── faculty-category-assignments/
│   │   ├── faculty-evaluation/
│   │   ├── evaluations/
│   │   └── upload/
│   ├── components/
│   │   ├── admin/              # AdminSidebar, etc.
│   │   └── faculty/            # FacultySidebar, etc.
│   ├── globals.css
│   └── layout.tsx
├── models/                     # Mongoose schemas
│   ├── User.ts
│   ├── School.ts
│   ├── Department.ts
│   ├── EvaluationCategory.ts
│   ├── EvaluationParameter.ts
│   ├── ParameterField.ts
│   ├── FacultyCategoryAssignment.ts
│   ├── TeacherEvaluation.ts
│   └── EvidenceFile.ts
├── lib/
│   ├── db/connect.ts           # MongoDB singleton connection
│   └── cloudinary.ts           # Cloudinary config
├── proxy.ts                    # JWT middleware (route protection)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

<br/>

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login, returns JWT in httpOnly cookie |
| `POST` | `/api/auth/logout` | Clears session cookie |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/[id]` | Update user (password optional) |
| `DELETE` | `/api/users/[id]` | Delete user |
| `GET` | `/api/faculties` | List faculty-role users only |
| `GET` | `/api/faculty/me` | Current faculty's profile + eval status |

### Evaluation Schema

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/categories` | List / create categories |
| `PUT/DELETE` | `/api/categories/[id]` | Update / delete category |
| `GET/POST` | `/api/parameters` | List / create parameters |
| `PUT/DELETE` | `/api/parameters/[id]` | Update / delete parameter |
| `GET/POST` | `/api/parameter-fields` | List / create criteria fields |
| `PUT/DELETE` | `/api/parameter-fields/[id]` | Update / delete field |

### Assignments & Evaluations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/faculty-category-assignments` | List / create assignment |
| `POST` | `/api/faculty-category-assignments/bulk` | Bulk upsert assignments |
| `GET` | `/api/faculty-evaluation/form-data` | Structured form schema for faculty |
| `GET/POST` | `/api/evaluations` | List all / create evaluation |
| `GET` | `/api/evaluations/my` | Current faculty's evaluation |
| `GET/PUT` | `/api/evaluations/[id]` | Get / update evaluation |
| `POST` | `/api/upload` | Upload evidence file to Cloudinary |

<br/>

---

## 🌍 Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/teacher-assessment

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NODE_ENV=development
```

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

<br/>

---

## 📊 Data Models Overview

```
School ──┬── Department ──┬── User (Faculty/HOD)
         │                └── FacultyCategoryAssignment
         │
         └── User (Principal)

EvaluationCategory ──── EvaluationParameter ──── ParameterField
                │
                └── FacultyCategoryAssignment ──── TeacherEvaluation
                                                        │
                                                   EvidenceFile
```

<br/>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

<br/>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

<br/>

---

<div align="center">

Made with ❤️ for academic institutions

<br/>

⭐ **Star this repo if you found it helpful!** ⭐

<br/>

![Next.js](https://img.shields.io/badge/Built_with-Next.js-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/Powered_by-MongoDB-47A248?style=flat-square&logo=mongodb)
![Deployed on Vercel](https://img.shields.io/badge/Deploy_on-Vercel-black?style=flat-square&logo=vercel)

</div>
