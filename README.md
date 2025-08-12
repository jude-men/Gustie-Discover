# Gustie Discover

A full-stack web application for Gustavus Adolphus College students to discover, create, and participate in campus activities, events, and community gatherings.

## 🌟 Features

- **Activity Discovery**: Browse upcoming sports events, cultural activities, academic workshops, and social gatherings
- **Event Creation**: Students and student senate can create and manage campus activities
- **Real-time Updates**: Stay informed about trending events and activity changes
- **User Authentication**: Secure login/registration system with role-based permissions
- **Modern UI/UX**: Beautiful, responsive design optimized for all devices
- **Category Organization**: Activities organized by Sports, Academic, Social, Cultural, Community Service, and Food & Dining
- **Interactive Features**: Like activities, comment on events, and engage with the community

## 🚀 Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **SQLite** - Database (easily configurable to PostgreSQL/MySQL)
- **JWT** - Authentication
- **Zod** - Input validation
- **bcryptjs** - Password hashing

### Frontend
- **React** with **TypeScript**
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **React Hook Form** - Form management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd gustie-discover
```

### 2. Backend Setup
```bash
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client and set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd ../server/frontend
npm install

# Start the frontend development server
npm start
```

The frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: Student accounts with roles (Student, Student Senate, Admin)
- **Categories**: Activity categories (Sports, Academic, Social, etc.)
- **Activities**: Campus events and activities
- **Comments**: User comments on activities
- **Likes**: User likes/favorites for activities

## 👥 User Roles

- **Student**: Can view and like activities, create comments
- **Student Senate**: Can create, edit, and manage activities
- **Admin**: Full system access and user management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh authentication token

### Activities
- `GET /api/activities` - List activities with filtering and pagination
- `GET /api/activities/:id` - Get single activity details
- `POST /api/activities` - Create new activity (authenticated)
- `PUT /api/activities/:id` - Update activity (author/admin only)
- `DELETE /api/activities/:id` - Delete activity (author/admin only)
- `POST /api/activities/:id/like` - Like/unlike activity
- `POST /api/activities/:id/comments` - Add comment to activity

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin/senate only)
- `PUT /api/categories/:id` - Update category (admin/senate only)
- `DELETE /api/categories/:id` - Delete category (admin/senate only)

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id/role` - Update user role (admin only)

## 🎨 UI/UX Design

The application features a modern, clean design inspired by Gustavus Adolphus College's brand:

- **Color Scheme**: Gustie Gold (#FFC72C) primary, complemented by clean grays and whites
- **Typography**: Inter font family for excellent readability
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Accessibility**: Semantic HTML, proper ARIA labels, and keyboard navigation support

## 🚀 Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure production database (PostgreSQL recommended)
3. Run database migrations: `npm run db:push`
4. Build the application: `npm run build`
5. Start the production server: `npm start`

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy the `build` folder to your hosting provider
3. Configure environment variables for production API endpoints

## 📝 Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd server/frontend
npm test
```

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npm run db:push --force-reset
npm run db:seed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📱 Sample Users

The seeded database includes these test accounts:

- **Admin**: admin@gustavus.edu
- **Student Senate**: senate@gustavus.edu  
- **Students**: john.doe@gustavus.edu, jane.smith@gustavus.edu

*Note: For demo purposes, any password is accepted during login*

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure SQLite file permissions are correct
2. **Port conflicts**: Check that ports 3000 and 3001 are available
3. **Module not found errors**: Run `npm install` in both server and frontend directories
4. **CORS issues**: Verify the CORS_ORIGINS environment variable includes your frontend URL

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 About Gustavus Adolphus College

Gustavus Adolphus College is a highly selective, private, coeducational, residential liberal arts college affiliated with the Evangelical Lutheran Church in America. Founded in 1862, Gustavus has built a national reputation for excellence in liberal arts education.

---

Built with ❤️ for the Gustie community 