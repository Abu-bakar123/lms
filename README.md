# Learning Management System (LMS) - MERN Stack

A comprehensive full-stack Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### User Roles & Permissions

- **Admin**: Full CRUD operations on users and courses, analytics dashboard
- **Instructor**: Create, edit, delete their own courses and upload lessons
- **Student**: Browse, enroll, and track progress in courses

### Core Functionality

- JWT-based authentication with secure password hashing
- Role-Based Access Control (RBAC) middleware
- Course creation and management with lessons
- Student enrollment and progress tracking
- Responsive UI with Bootstrap
- RESTful API architecture

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT (JSON Web Token) for authentication
- Bcrypt for password hashing
- Dotenv for environment variables

### Frontend
- React.js
- React Router for navigation
- Axios for HTTP requests
- Bootstrap 5 for styling

## Project Structure

```
lms/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── userController.js
│   │   └── enrollmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rbacMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Enrollment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── userRoutes.js
│   │   └── enrollmentRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

Start the backend server:

```bash
npm run dev
# or
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Admin/Instructor)
- `PUT /api/courses/:id` - Update course (Admin/Owner)
- `DELETE /api/courses/:id` - Delete course (Admin/Owner)

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/my-courses` - Get student's enrolled courses
- `POST /api/enrollments` - Enroll in a course
- `PUT /api/enrollments/:id` - Update enrollment progress
- `DELETE /api/enrollments/:id` - Unenroll from course

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access to all resources, analytics dashboard |
| Instructor | Create/manage own courses, view enrolled students |
| Student | Browse courses, enroll, track progress |

## Database Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- role: String (enum: 'admin', 'instructor', 'student')
- avatar: String (optional)
- createdAt: Date

### Course
- title: String (required)
- description: String (required)
- instructor: ObjectId (ref: User)
- thumbnail: String (optional)
- category: String
- level: String (beginner, intermediate, advanced)
- lessons: Array of objects
- price: Number
- isPublished: Boolean
- createdAt: Date
- updatedAt: Date

### Enrollment
- student: ObjectId (ref: User)
- course: ObjectId (ref: Course)
- progress: Number (0-100)
- completedLessons: Array of lesson IDs
- enrolledAt: Date

## License

MIT License
