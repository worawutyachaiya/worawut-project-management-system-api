# API Development Guide

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Setup Database

Run the SQL scripts in order:

```bash
mysql -u root -p < database/migrations/001_initial_schema.sql
mysql -u root -p < database/migrations/002_seed_data.sql
```

### 3. Configure Environment

Edit `.env.development` with your database credentials:

```
HOST=localhost
USER_NAME=root
PASSWORD=your_password
DB=project_management
JWT_SECRET=your-secret-key
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run at: `http://localhost:3000/api/pms`

## Test Users

| Email                  | Password   | Role       |
| ---------------------- | ---------- | ---------- |
| admin@company.com      | Admin@1234 | Admin      |
| manager@company.com    | Admin@1234 | Manager    |
| supervisor@company.com | Admin@1234 | Supervisor |
| employee@company.com   | Admin@1234 | Employee   |

## API Endpoints

### Authentication

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `PUT /auth/change-password` - Change password

### Users (Admin only)

- `GET /users` - List users
- `GET /users/:id` - Get user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Projects

- `GET /projects` - List projects
- `GET /projects/:id` - Get project
- `POST /projects` - Create project (Manager+)
- `PUT /projects/:id` - Update project
- `POST /projects/:id/finalize` - Finalize project
- `GET /projects/:id/analytics` - Get analytics

### Tasks

- `GET /tasks` - List tasks
- `GET /tasks/:id` - Get task
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `POST /tasks/:id/submit` - Submit for review
- `GET /tasks/:id/history` - Get history

### Approvals (Supervisor+)

- `GET /approvals/pending` - Get pending approvals
- `POST /approvals/tasks/:id/approve` - Approve
- `POST /approvals/tasks/:id/reject` - Reject
- `POST /approvals/tasks/:id/request-revision` - Request revision

### Comments

- `GET /comments/tasks/:taskId` - Get comments
- `POST /comments/tasks/:taskId` - Add comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Files

- `GET /files/tasks/:taskId` - Get files
- `POST /files/tasks/:taskId` - Upload file
- `DELETE /files/:id` - Delete file
