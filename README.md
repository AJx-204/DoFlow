# 🚀 Organization Management App Monorepo

Welcome to the **Organization Management App**! This monorepo contains both the backend API and the frontend client for seamless management of organizations, teams, projects, and tasks—all secured with advanced role-based access control.

---

## ✨ Key Features

- **🔐 Authentication & Authorization**
    - Secure JWT-based login, registration, password reset, and email verification
    - Fine-grained role-based access at every level

- **🏢 Organization Management**
    - Create, update, and delete organizations
    - Invite/remove members, assign roles, transfer ownership

- **👥 Team Management**
    - Manage teams and memberships
    - Assign team roles and leaders

- **📁 Project Management**
    - Organize projects, assign teams/members, transfer ownership

- **✅ Task & Subtask Management**
    - Create, update, and track tasks/subtasks
    - Assign users, add comments, attachments, and links

- **📂 Section Management**
    - Organize tasks within projects using customizable sections

- **🔒 Role-Based Access Control**
    - Admin, moderator, leader, member, and viewer roles at all levels

- **📧 Email Notifications**
    - Automated emails for invites, removals, password resets, and more

- **☁️ File Uploads**
    - Attach files to tasks/comments via Cloudinary

- **📝 Activity Logs**
    - Track changes and actions across all resources

- **🔎 Search & Filtering**
    - Powerful search and filter for organizations, teams, projects, and tasks

- **📚 API Documentation**
    - Comprehensive docs for every endpoint

---

## 🛠️ Tech Stack

| Layer      | Technology                |
|------------|--------------------------|
| Backend    | Node.js, Express.js      |
| Frontend   | React.js, Vite           |
| Database   | MongoDB, Mongoose        |
| Auth       | JWT, bcrypt              |
| Email      | nodemailer               |
| File Upload| multer, Cloudinary       |
| Env Mgmt   | dotenv                   |
| Utilities  | cookie-parser, cors      |

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local/cloud)
- **Cloudinary** (for file uploads)
- **SMTP Email** credentials

### Installation

```sh
# 1. Clone the repository
git clone https://github.com/AJx-204/DoFlow.app
cd DoFlow.app

# 2. Install dependencies for both backend and frontend
npm install

# 3. Configure environment variables
cp backend/env.sample backend/.env
# Edit backend/.env with your credentials

# 4. Start the backend server
npm run dev:backend

# 5. Start the frontend client
npm run dev:frontend

# 6. run full app 
npm run start

```

---

## 📁 Project Structure

```plaintext
DoFlow.app/
├─ backend/
│   ├─ public/
│   ├─ src/
│   │   ├─ controllers/
│   │   ├─ database/
│   │   ├─ middleware/
│   │   ├─ model/
│   │   ├─ router/
│   │   ├─ service/
│   │   └─ utils/
│   ├─ .env
│   ├─ env.sample
│   ├─ package.json
│   └─ README.md
├─ frontend/
│   ├─ src/
│   ├─ public/
│   ├─ vite.config.js
│   ├─ package.json
│   └─ README.md
├─ package.json
├─ package-lock.json
└─ README.md
```

---

## 📦 NPM Scripts

In the root `package.json`:

- `npm run dev:backend` — Start backend server (in `backend/`)
- `npm run dev:frontend` — Start frontend client (in `frontend/`)
- `npm run start` — Run both backend and frontend concurrently

---

## 🌐 API Endpoints

- All backend endpoints are prefixed with: `/api/v1/`
- See [`Backend/src/router/`](backend/src/router/) for detailed route definitions.
- Full API documentation available in the repository.

---