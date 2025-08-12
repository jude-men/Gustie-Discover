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
