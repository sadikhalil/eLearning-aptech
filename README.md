---
title: Elearning Bakcend
emoji: 📉
colorFrom: green
colorTo: green
sdk: docker
pinned: false
---

# 🎓 LearnFlow — E-Learning Platform

A full-stack e-learning platform built with **React.js**, **FastAPI**, and **PostgreSQL**. Features JWT authentication, course management, video progress tracking, and role-based access for students, instructors, and admins.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://learnflow-frontend.vercel.app |
| Backend  | https://sadiakhalil-elearning-bakcend.hf.space |
| API Docs | https://sadiakhalil-elearning-bakcend.hf.space/docs |

---

## ✨ Features

### 👨‍🎓 Student
- Register and login with JWT authentication
- Browse and search course catalog
- Enroll in free and paid courses
- Watch video lessons with progress tracking
- Resume videos from last watched position
- Track overall course completion percentage
- Earn certificates on course completion

### 🎓 Instructor
- Create and manage courses
- Upload video lessons to Cloudinary
- Set course pricing, level, and category
- View enrolled students

### ⚙️ Admin
- Full admin dashboard with analytics
- Manage all users (activate/deactivate)
- Create and publish courses
- View platform stats — users, revenue, enrollments
- Enrollment chart and top courses

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP requests + JWT interceptor |
| React Hook Form | Form handling |
| Zustand | State management |
| Tailwind CSS | Utility styling |
| React Player | Video playback |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| PostgreSQL | Primary database |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| JWT (python-jose) | Authentication tokens |
| bcrypt | Password hashing |
| Cloudinary | Video/image storage |
| Pydantic | Data validation |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Hugging Face Spaces | Backend hosting |
| Neon | Cloud PostgreSQL database |
| Cloudinary | Media storage |

---

## 📁 Project Structure

```
elearning-platform/
│
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── api/                       # Axios API calls
│   │   │   ├── axiosInstance.js       # JWT interceptor + auto refresh
│   │   │   ├── authApi.js             # Auth endpoints
│   │   │   ├── courseApi.js           # Course endpoints
│   │   │   └── progressApi.js         # Progress + enrollment
│   │   ├── components/
│   │   │   ├── auth/                  # Login, Register, ProtectedRoute
│   │   │   ├── courses/               # CourseCard, VideoPlayer, CourseCatalog
│   │   │   ├── dashboard/             # ProgressBar, AdminStats
│   │   │   └── layout/                # Navbar, Sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global auth state
│   │   ├── hooks/                     # useAuth, useCourses
│   │   ├── pages/                     # Home, Courses, Dashboard, Admin...
│   │   └── utils/
│   │       └── tokenUtils.js          # JWT helpers
│   ├── .env                           # Local environment variables
│   ├── .env.production                # Production environment variables
│   └── vercel.json                    # Vercel deployment config
│
└── backend/                           # FastAPI + PostgreSQL
    ├── app/
    │   ├── api/v1/endpoints/          # Auth, Courses, Enrollments, Progress
    │   ├── core/                      # Config, Security, Dependencies
    │   ├── db/                        # Database connection
    │   ├── models/                    # SQLAlchemy ORM models
    │   ├── schemas/                   # Pydantic schemas
    │   ├── services/                  # Business logic
    │   ├── middleware/                # CORS, Rate limiting, Logger
    │   └── main.py                    # FastAPI app entry point
    ├── Dockerfile                     # Hugging Face deployment
    └── requirements.txt               # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL or Neon account


## 🔐 Authentication & Roles

### How it works
- JWT access token (30 min) + refresh token (7 days)
- Token stored in localStorage
- Auto-refresh on expiry — user never gets logged out
- Role-based protected routes

### User Roles

| Role | How to Register | Access |
|---|---|---|
| **Student** | `/register` → select Student | Courses, Dashboard, Progress |
| **Instructor** | `/register` → select Instructor | + Create courses, Upload videos |
| **Admin** | `/admin-register` + secret code | + Admin panel, User management |

### Admin Secret Code
Default: `LEARNFLOW_ADMIN_2024`
Change it in `backend/.env`:
```
ADMIN_SECRET_CODE=your-custom-code
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register     Register new user
POST   /api/v1/auth/login        Login and get tokens
POST   /api/v1/auth/refresh      Refresh access token
GET    /api/v1/auth/me           Get current user
POST   /api/v1/auth/logout       Logout
```

### Courses
```
GET    /api/v1/courses           List all courses
GET    /api/v1/courses/{id}      Get single course
POST   /api/v1/courses           Create course (instructor)
PUT    /api/v1/courses/{id}      Update course (instructor)
DELETE /api/v1/courses/{id}      Delete course (instructor)
PATCH  /api/v1/courses/{id}/publish    Publish course
POST   /api/v1/courses/{id}/thumbnail  Upload thumbnail
POST   /api/v1/courses/{id}/lessons    Add lesson
POST   /api/v1/courses/{id}/lessons/{lid}/video  Upload video
```

### Enrollments
```
POST   /api/v1/enrollments/{course_id}   Enroll in course
DELETE /api/v1/enrollments/{course_id}   Unenroll
GET    /api/v1/enrollments/my-courses    My enrolled courses
GET    /api/v1/enrollments/check/{id}    Check enrollment status
```

### Progress Tracking
```
POST   /api/v1/progress/{lesson_id}      Update lesson progress
GET    /api/v1/progress/course/{id}      Get full course progress
```

### Admin
```
GET    /api/v1/admin/stats               Platform statistics
GET    /api/v1/admin/recent-enrollments  Recent enrollments
GET    /api/v1/admin/top-courses         Top courses by enrollment
GET    /api/v1/admin/users-summary       Users breakdown by role
```

## 🔧 Environment Variables

### Backend
| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SECRET_KEY` | JWT signing key | ✅ |
| `ALGORITHM` | JWT algorithm (HS256) | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | ✅ |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | ✅ |
| `ADMIN_SECRET_CODE` | Code for admin registration | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | Optional |

### Frontend
| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |

---

## 📝 License

MIT License — free to use and modify.

---

## 👩‍💻 Developer

Built by **Sadia Khalil**


---







Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
