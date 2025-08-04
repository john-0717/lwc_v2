# LWC Backend API

Life With Christ - Backend API built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - Google OAuth integration
  - JWT-based authentication
  - Role-based access control (Admin, Writer, Member, User)
  - Profile completion flow

- **Prayer Management**
  - Create, read, update prayer requests
  - Prayer interactions (users can pray for requests)
  - Prayer categories and status tracking
  - Anonymous prayer options
  - Prayer statistics

- **User Management**
  - User profiles with detailed information
  - Admin user management
  - User preferences and settings
  - Activity tracking

- **Content Management**
  - Article creation and management
  - Support for text and PDF content
  - SEO-friendly slugs
  - Comment system with moderation

- **Security Features**
  - Rate limiting
  - Input validation
  - Error handling
  - CORS configuration
  - Helmet security headers

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret
   - Google OAuth credentials (optional)
   - Email configuration (optional)

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/sign-in` - Sign in with Google
- `POST /api/v1/auth/finish-sign-up` - Complete profile setup
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/logout` - Logout

### User Routes (Authenticated)
- `POST /api/v1/user/add-prayer-request` - Add prayer request
- `GET /api/v1/user/prayer-listing` - Get user's prayers
- `POST /api/v1/user/update-prayer` - Add/remove prayer for request
- `POST /api/v1/user/prayer/:id/update` - Add prayer update
- `PUT /api/v1/user/prayer/:id/status` - Update prayer status
- `GET /api/v1/user/dashboard-stats` - Get user dashboard stats

### Public Routes
- `GET /api/v1/public/prayer-listing` - Get public prayers
- `GET /api/v1/public/prayer-stats` - Get prayer statistics
- `GET /api/v1/public/articles` - Get published articles
- `GET /api/v1/public/article/:slug` - Get single article
- `GET /api/v1/public/community-stats` - Get community stats
- `GET /api/v1/public/prayer-categories` - Get prayer categories
- `GET /api/v1/public/article-categories` - Get article categories

### Admin Routes (Admin Only)
- `GET /api/v1/admin/dashboard-stats` - Admin dashboard stats
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `PUT /api/v1/admin/users/:id/role` - Update user role
- `GET /api/v1/admin/prayers` - Get all prayers
- `PUT /api/v1/admin/prayers/:id/moderate` - Moderate prayer
- `GET /api/v1/admin/articles` - Get all articles
- `DELETE /api/v1/admin/users/:id` - Deactivate user
- `GET /api/v1/admin/system-health` - System health check

## Database Models

### User Model
- Basic information (name, email, phone, etc.)
- Spiritual information (testimony, interests, church)
- Preferences and settings
- Role and status management
- Authentication data

### Prayer Model
- Prayer request details
- Author information
- Prayer interactions
- Categories and tags
- Status tracking
- Updates and testimonies

### Article Model
- Content management (text/PDF)
- Author and publishing info
- SEO optimization
- Comments and engagement
- Categorization and tagging

## Middleware

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Validation**: Input validation using express-validator
- **Error Handling**: Centralized error handling
- **Logging**: Request/response logging
- **Rate Limiting**: API rate limiting
- **Security**: Helmet security headers

## Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lwc_database

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Optional: Email, Cloudinary, Google OAuth
```

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Check code style
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring and logging

## Security Considerations

- JWT tokens expire in 7 days
- Rate limiting: 100 requests per 15 minutes
- Input validation on all endpoints
- CORS configured for frontend domain
- Helmet security headers enabled
- Password hashing with bcrypt
- MongoDB injection prevention

## API Response Format

```json
{
  "status": true,
  "message": "Success message",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Error Handling

All errors return consistent format:
```json
{
  "status": false,
  "message": "Error message",
  "errors": ["Validation errors array"]
}
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License