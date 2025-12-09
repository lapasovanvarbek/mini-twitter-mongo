# 🐦 Mini Twitter Clone - Backend API

A production-ready Twitter/X clone backend built with NestJS, MongoDB, BullMQ, and WebSockets. This project demonstrates advanced backend patterns including real-time updates, queue processing, authentication, and scalable architecture.

## ✨ Features

### 🔐 Authentication & Users

- User registration and login with JWT
- Password hashing with bcrypt
- Protected routes with JWT guards
- User profile management
- Soft delete support

### 📝 Posts

- Create, read, and delete posts (280 character limit)
- Like/unlike posts
- Reply to posts
- Extract mentions (@username) and hashtags (#tag)
- Post engagement counters (likes, replies, reposts)

### 👥 Social Features

- Follow/unfollow users
- Get followers and following lists
- User engagement metrics

### 📰 Timeline

- Home timeline (feed) with posts from followed users
- User-specific posts timeline
- Fan-out pattern for efficient timeline generation
- Pagination support

### ⚡ Real-time Updates (WebSocket)

- Real-time notifications for:
  - New posts in timeline
  - Post likes
  - Mentions
  - New followers
- JWT-authenticated WebSocket connections
- Room-based message broadcasting

### 🔄 Background Jobs (BullMQ)

- Asynchronous timeline fan-out processing
- Queue-based job processing with Redis
- Retry logic and error handling

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (v11)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Queue:** [BullMQ](https://docs.bullmq.io/) with Redis
- **WebSocket:** [Socket.io](https://socket.io/)
- **Authentication:** JWT with [Passport](http://www.passportjs.org/)
- **Validation:** [class-validator](https://github.com/typestack/class-validator)
- **API Documentation:** [Swagger/OpenAPI](https://swagger.io/)
- **Language:** TypeScript

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0 (or yarn)
- **MongoDB** (local or remote instance)
- **Redis** (for BullMQ queues)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mini-twitter-mongo
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/twitter-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
```

### 4. Start Services

**MongoDB:**

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update DATABASE_URL in .env
```

**Redis:**

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 5. Run the Application

```bash
# Development mode (with hot reload)
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI:** http://localhost:3000/api/docs

The Swagger interface provides:

- Interactive API testing
- Request/response schemas
- Authentication testing
- All available endpoints

## 🔌 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users

- `GET /users/profile` - Get current user profile (Protected)
- `GET /users/:username` - Get user by username
- `PUT /users/profile` - Update current user profile (Protected)

### Posts

- `POST /posts` - Create a new post (Protected)
- `GET /posts` - Get all posts (paginated)
- `GET /posts/:id` - Get post by ID
- `POST /posts/:id/like` - Like a post (Protected)
- `DELETE /posts/:id/like` - Unlike a post (Protected)
- `DELETE /posts/:id` - Delete a post (Protected)

### Follows

- `POST /follows/:username` - Follow a user (Protected)
- `DELETE /follows/:username` - Unfollow a user (Protected)
- `GET /follows/followers` - Get followers list (Protected)
- `GET /follows/following` - Get following list (Protected)

### Timeline

- `GET /timeline/home` - Get home timeline/feed (Protected)

## 🔌 WebSocket Events

### Connection

Connect to WebSocket with JWT token:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### Events Received

- `connected` - Connection confirmed

  ```json
  {
    "message": "Connected to Twitter Clone WebSocket",
    "userId": "user-id",
    "username": "username"
  }
  ```

- `new-post` - New post in timeline

  ```json
  {
    "type": "new-post",
    "post": {
      "_id": "post-id",
      "content": "Post content",
      "authorId": { "username": "...", "displayName": "..." },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

- `post-liked` - Someone liked your post

  ```json
  {
    "type": "post-liked",
    "postId": "post-id",
    "liker": { "username": "...", "displayName": "..." }
  }
  ```

- `mentioned` - You were mentioned in a post

  ```json
  {
    "type": "mentioned",
    "postId": "post-id",
    "author": { "username": "...", "displayName": "..." }
  }
  ```

- `new-follower` - Someone started following you
  ```json
  {
    "type": "new-follower",
    "follower": {
      "username": "...",
      "displayName": "...",
      "profileImage": "..."
    }
  }
  ```

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── strategies/   # Passport JWT strategy
│   │   └── auth.service.ts
│   ├── users/            # User management
│   │   ├── schema/      # Mongoose schemas
│   │   ├── services/
│   │   └── users.controller.ts
│   ├── posts/            # Posts module
│   │   ├── schema/
│   │   ├── services/
│   │   └── posts.controller.ts
│   ├── follows/          # Follow relationships
│   │   ├── schema/
│   │   ├── services/
│   │   └── follows.controller.ts
│   ├── timeline/         # Timeline/feed generation
│   │   ├── schema/
│   │   ├── services/
│   │   └── timeline.controller.ts
│   ├── queue/            # Background job processing
│   │   ├── processors/  # Job processors
│   │   └── producers/    # Job producers
│   └── websocket/        # WebSocket gateway
│       └── websocket.gateway.ts
├── common/               # Shared utilities
│   ├── decorators/      # Custom decorators
│   └── guards/          # Auth guards
└── main.ts              # Application entry point
```

## 🎯 Completed Phases

### ✅ Phase 1: Authentication

- JWT-based authentication
- User registration and login
- Password hashing
- Protected routes

### ✅ Phase 2: Users Module

- User CRUD operations
- Profile management
- Soft delete support

### ✅ Phase 3: Posts Module

- Post creation and management
- Like/unlike functionality
- Mentions and hashtags extraction
- Reply support

### ✅ Phase 4: Timeline & Follows

- Follow/unfollow system
- Timeline generation
- Fan-out pattern implementation
- Pagination

### ✅ Phase 5: Queue System

- BullMQ integration
- Background job processing
- Timeline fan-out jobs
- Redis integration

### ✅ Phase 6: WebSocket

- Real-time WebSocket gateway
- JWT authentication for WebSocket
- Real-time notifications
- Event broadcasting

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📝 Code Quality

```bash
# Format code
yarn format

# Lint and fix
yarn lint

# Format and lint
yarn format:fix
```

## 🚀 Deployment Considerations

### Environment Variables

- Set strong `JWT_SECRET` in production
- Use secure MongoDB connection strings
- Configure Redis for production
- Set appropriate CORS origins

### Database Indexes

The application includes optimized indexes for:

- User lookups (username, email)
- Post queries (author, createdAt)
- Timeline entries (userId, createdAt)
- Follow relationships

### Performance

- Timeline fan-out uses background jobs
- Redis caching for frequently accessed data
- Pagination on all list endpoints
- Efficient MongoDB queries with indexes

## 📖 Learning Resources

This project was built as a learning exercise. Key concepts covered:

- **NestJS:** Modules, Controllers, Services, Dependency Injection, Guards, Decorators
- **MongoDB/Mongoose:** Schemas, Models, Relationships, Population, Indexes, Soft Deletes
- **JWT:** Token generation, validation, Passport strategies
- **BullMQ:** Queue management, job processing, retry logic
- **WebSockets:** Real-time communication, Socket.io, room management
- **TypeScript:** Type safety, interfaces, generics

## 🤝 Contributing

This is a personal learning project, but suggestions and improvements are welcome!

## 📄 License

This project is for educational purposes.

## 🎓 What's Next?

Potential enhancements:

1. **Image Upload & Processing**
   - File upload endpoints
   - Image processing with Sharp
   - CDN integration

2. **Advanced Features**
   - Reposts/Retweets
   - Bookmarks
   - Search functionality
   - Trending topics

3. **Notifications System**
   - Notification preferences
   - Email notifications
   - Push notifications

4. **Testing**
   - Unit tests for services
   - E2E tests for API endpoints
   - Integration tests

5. **Performance**
   - Redis caching layer
   - Database query optimization
   - Rate limiting

6. **Security**
   - Rate limiting
   - Input sanitization
   - CORS configuration
   - Security headers

7. **Monitoring**
   - Logging (Winston/Pino)
   - Error tracking
   - Performance monitoring

---

**Built with ❤️ using NestJS**
