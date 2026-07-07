# Pinterest Clone - Full Stack Project

A full-stack Pinterest-inspired application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, pin creation, image uploads, and social interactions.

## 📋 Table of Contents

-   Overview
    
-   Features
    
-   Tech Stack
    
-   Project Structure
    
-   Installation & Setup
    
-   Environment Variables
    
-   API Endpoints
    
-   Contributing
    
-   License
    

* * *

## 📖 Overview

This is a Pinterest-like social media platform where users can:

-   Create accounts and authenticate using email/password or Google OAuth
    
-   Upload and share images as "pins"
    
-   Organize pins into categories
    
-   Interact with other users' content
    
-   Edit and delete their own pins
    
-   Search for pins and users
    

The project is fully containerized with separate Backend (Node.js/Express) and Frontend (React/Vite) applications.

* * *

## ✨ Features

### 🔐 Authentication

-   Email/Password Sign Up & Sign In with JWT tokens
    
-   Google OAuth integration for seamless login
    
-   Protected routes for authenticated users
    

### 📌 Pins

-   Create Pins with title, description, image upload, and category
    
-   Edit Pins (update title, description, image)
    
-   Delete Pins (with image cleanup from Cloudinary)
    
-   View Pin Details with comments section
    

### 👤 User Profiles

-   User profile pages displaying created pins
    
-   Avatar upload support
    
-   User-specific content management
    

### 🖼️ Media

-   Cloudinary integration for image upload and storage
    
-   Multiple image format support (JPG, PNG)
    
-   Image preview before upload
    

### 🔍 Search

-   Search pins by title, description, or category
    
-   Search users by name
    

### 📱 Responsive Design

-   Tailwind CSS for modern, responsive UI
    
-   Mobile-first approach
    

### 🧩 Additional Features

-   Masonry grid layout for pins
    
-   Toast notifications for user feedback
    
-   Loading states and spinners
    
-   Comment system on pins
    
-   Category-based filtering
    

* * *

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database (with Mongoose ODM) |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Cloudinary | Image upload & storage |
| Multer | File upload handling |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variables |

### Frontend

| Technology | Purpose |
| --- | --- |
| React.js | UI library |
| Vite | Build tool & dev server |
| React Router DOM | Navigation & routing |
| Tailwind CSS | Styling framework |
| React Icons | Icon library |
| Axios | HTTP client for API calls |
| Date-fns | Date formatting |
| React Loader Spinner | Loading animations |

### Tools & Deployment

-   ESLint & Prettier for code quality
    
-   Vercel ready (frontend configuration included)
    
-   Nodemon for development hot-reload
    

* * *

## 📂 Project Structure

````
📦 ShareMe
├── 📁 BackEnd/                  # Backend Server
│   ├── 📁 config/               # Configuration files
│   │   └── cloudinary.js        # Cloudinary setup
│   ├── 📁 Controllers/          # Route controllers
│   │   ├── pinsControllers.js   # Pin CRUD operations
│   │   └── userControllers.js   # User authentication & profile
│   ├── 📁 Middleware/           # Custom middleware
│   │   ├── authRequire.js       # JWT authentication
│   │   └── pinUpload.js         # Image upload middleware
│   ├── 📁 Models/               # Mongoose models
│   │   ├── pinsModel.js         # Pin schema
│   │   └── userModel.js         # User schema
│   ├── 📁 Routes/               # API routes
│   │   ├── pinRoutes.js         # Pin endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── 📁 Scripts/              # Utility scripts
│   │   ├── clearOldImages.js    # Cleanup script
│   │   └── UploadImages.js      # Bulk upload script
│   ├── 📁 uploads/              # Local uploads (temp)
│   ├── 📁 utils/                # Utility functions
│   │   └── multerConfig.js      # Multer configuration
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                # Entry point
│   └── index.vercel.js          # Vercel deployment config
│
├── 📁 FrontEnd/                 # Frontend Application
│   ├── 📁 public/               # Public assets
│   │   ├── favicon.png
│   │   ├── logo.svg
│   │   └── manifest.json
│   ├── 📁 src/                  # Source code
│   │   ├── 📁 Actions/          # Redux-like actions
│   │   ├── 📁 api/              # API service layer
│   │   │   └── index.js         # Axios configuration
│   │   ├── 📁 app/              # App configuration
│   │   │   └── routes.jsx       # React Router routes
│   │   ├── 📁 assets/           # Static assets
│   │   ├── 📁 components/       # Reusable components
│   │   │   ├── Alert.jsx
│   │   │   ├── CategorySelect.jsx
│   │   │   ├── Comments.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PinsMasonry.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SideBar.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── ...
│   │   ├── 📁 Containers/       # Layout containers
│   │   │   ├── Layout.jsx
│   │   │   └── Pins.jsx
│   │   ├── 📁 context/          # React Context
│   │   │   ├── PinContext.js
│   │   │   └── UserContext.js
│   │   ├── 📁 hooks/            # Custom hooks
│   │   │   ├── useGetPins.js
│   │   │   ├── useGoogleLogin.js
│   │   │   ├── useImageUpload.js
│   │   │   └── ...
│   │   ├── 📁 pages/            # Page components
│   │   │   ├── CreatePin.jsx
│   │   │   ├── EditPin.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Pin.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── 📁 utils/            # Utility functions
│   │   │   ├── BufferToDataURL.js
│   │   │   ├── data.js
│   │   │   ├── formatDate.js
│   │   │   └── imageUtils.js
│   │   ├── App.js               # Main App component
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Frontend environment
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── vite.config.js           # Vite configuration
│   └── vercel.json              # Vercel deployment config
│
├── .gitignore
├── package.json
├── Prerquestes.txt              # Setup instructions
└── README.md                    # Project documentation
````

* * *

## 🚀 Installation & Setup

### Prerequisites

-   Node.js (v16 or later)
    
-   MongoDB (local or Atlas)
    
-   Cloudinary account (for image upload)
    

### Step 1: Clone the Repository

bash

git clone https://[github.com/omarYasir/ShareMe.git](https://github.com/OmarYasirR/shareMe_vite)
  
cd ShareMe

### Step 2: Backend Setup

bash

cd BackEnd
npm install

Create a `.env` file in the `BackEnd` directory:

env

PORT=5000
MONGO\_URI=mongodb://localhost:27017/ShareMe
JWT\_SECRET=your\_jwt\_secret\_key
CLOUDINARY\_CLOUD\_NAME=your\_cloud\_name
CLOUDINARY\_API\_KEY=your\_api\_key
CLOUDINARY\_API\_SECRET=your\_api\_secret

Start the backend server:

bash

npm run dev
\# or
npm start

### Step 3: Frontend Setup

bash

cd ../FrontEnd
npm install

Create a `.env` file in the `FrontEnd` directory:

env

VITE\_API\_URL=http://localhost:5000
VITE\_GOOGLE\_CLIENT\_ID=your\_google\_client\_id

Start the frontend development server:

bash

npm run dev

### Step 4: Access the Application

-   Frontend: [http://localhost:5173](http://localhost:5173/)
    
-   Backend API: [http://localhost:5000](http://localhost:5000/)
    

* * *

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend (`.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

* * *

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users/signup` | Register new user |
| POST | `/api/users/signin` | Login user |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Pins

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/pins` | Get all pins |
| GET | `/api/pins/:id` | Get pin by ID |
| POST | `/api/pins` | Create new pin |
| PUT | `/api/pins/:id` | Update pin |
| DELETE | `/api/pins/:id` | Delete pin |
| GET | `/api/pins/user/:userId` | Get pins by user |
| GET | `/api/pins/search/:query` | Search pins |

### Comments

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/pins/:pinId/comments` | Add comment |
| DELETE | `/api/pins/:pinId/comments/:commentId` | Delete comment |

* * *

## 🤝 Contributing

1.  Fork the repository
    
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
    
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
    
4.  Push to the branch (`git push origin feature/AmazingFeature`)
    
5.  Open a Pull Request
    

### Coding Standards

-   Use ESLint and Prettier for code formatting
    
-   Follow React best practices (hooks, functional components)
    
-   Write meaningful commit messages
    

* * *

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://license/) file for details.

* * *

## 📞 Contact

Your Name

-   GitHub: [@yourusername](https://github.com/yourusername)
    
-   Email: your.email@example.com
    

* * *

## 🙏 Acknowledgments

-   [MongoDB](https://www.mongodb.com/) - Database
    
-   [Cloudinary](https://cloudinary.com/) - Image hosting
    
-   [Vite](https://vitejs.dev/) - Frontend build tool
    
-   [Tailwind CSS](https://tailwindcss.com/) - UI framework
    
-   [React Icons](https://react-icons.github.io/react-icons/) - Icon library
    

* * *

## 📸 Screenshots

### Home Page

[https://via.placeholder.com/600x350/1a1a2e/ffffff?text=Home+Page](https://via.placeholder.com/600x350/1a1a2e/ffffff?text=Home+Page)

### Pin Creation

[https://via.placeholder.com/600x350/1a1a2e/ffffff?text=Create+Pin](https://via.placeholder.com/600x350/1a1a2e/ffffff?text=Create+Pin)

### User Profile

[https://via.placeholder.com/600x350/1a1a2e/ffffff?text=User+Profile](https://via.placeholder.com/600x350/1a1a2e/ffffff?text=User+Profile)

* * *

### 🔧 Troubleshooting

Issue: `npm` commands not working

bash

\# Clear npm cache
npm cache clean \--force
\# Delete node\_modules and reinstall
rm \-rf node\_modules package-lock.json
npm install

Issue: MongoDB connection error

-   Ensure MongoDB is running locally or check your `MONGO_URI`
    
-   For Atlas, check network access whitelist
    

Issue: Cloudinary upload fails

-   Verify your Cloudinary credentials
    
-   Ensure your account has enough storage
    

* * *

### 📦 Deployment

#### Deploy Backend (Vercel)

1.  Push code to GitHub
    
2.  Import project on Vercel
    
3.  Set environment variables in Vercel dashboard
    
4.  Deploy
    

#### Deploy Frontend (Vercel)

bash

cd FrontEnd
npm run build
vercel \--prod

* * *

# Made with ❤️ using the MERN Stackmentation

## Project Overview

ShopHub is a full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). The platform provides a complete online shopping experience with user authentication, product management, shopping cart functionality, order processing, and payment integration.

## Technology Stack

### Backend Technologies

-   Runtime Environment: Node.js
    
-   Framework: Express.js
    
-   Database: MongoDB with Mongoose ODM
    
-   Caching: Redis
    
-   Authentication: JWT (JSON Web Tokens) with refresh token rotation
    
-   File Storage: Cloudinary
    
-   Payment Processing: Stripe, Razorpay
    
-   Email Service: Nodemailer with Handlebars templates
    
-   Queue Processing: Bull (Redis-based)
    
-   Validation: express-validator
    
-   Security: Helmet, CORS, xss-clean, express-mongo-sanitize, hpp
    
-   Logging: Winston with daily rotation
    
-   Testing: Jest
    

### Frontend Technologies

-   Framework: React
    
-   State Management: Redux Toolkit
    
-   Routing: React Router DOM
    
-   UI Components: Tailwind CSS
    
-   Form Handling: React Hook Form with Yup validation
    
-   HTTP Client: Axios with interceptors
    
-   Animations: Framer Motion
    
-   Payment Integration: Stripe Elements
    
-   Icons: React Icons
    
-   Build Tool: Vite
    

## System Architecture

The application follows a three-tier architecture:

1.  Presentation Layer: React frontend with responsive UI
    
2.  Application Layer: Express.js REST API with modular controllers and services
    
3.  Data Layer: MongoDB for persistent storage, Redis for caching and queues
    

## Project Structure

### Backend Structure

text

backend/
├── src/
│   ├── config/           # Configuration files (database, redis, cloudinary)
│   ├── models/           # Mongoose data models
│   ├── controllers/      # Request handlers and business logic
│   ├── services/         # Reusable business logic layer
│   ├── middleware/       # Custom middleware functions
│   ├── routes/           # API route definitions
│   ├── validators/       # Request validation schemas
│   ├── utils/            # Helper functions and utilities
│   ├── jobs/             # Background job definitions
│   ├── sockets/          # WebSocket handlers
│   ├── templates/        # Email templates
│   ├── docs/             # API documentation
│   └── tests/            # Unit and integration tests
├── uploads/              # Temporary file storage
├── logs/                 # Application logs
└── scripts/              # Database seeding and maintenance scripts

### Frontend Structure

text

frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── store/            # Redux slices and store configuration
│   ├── services/         # API service layer
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── assets/           # Static assets
│   └── styles/           # Global CSS and Tailwind configuration

## Core Features

### User Management

-   User registration and authentication with JWT
    
-   Password reset functionality via email
    
-   Email verification for new accounts
    
-   Profile management and update
    
-   Address book management
    
-   Order history and tracking
    

### Product Management

-   Product catalog with pagination and filtering
    
-   Category-based organization with hierarchical structure
    
-   Product search functionality
    
-   Product reviews and ratings
    
-   Inventory tracking
    
-   Featured products display
    

### Shopping Cart

-   Persistent cart storage with Redis caching
    
-   Cart item management (add, update, remove)
    
-   Coupon code application
    
-   Price calculation and tax estimation
    
-   Cart synchronization across devices
    

### Order Processing

-   Order creation and management
    
-   Order status tracking with timeline
    
-   Invoice generation (PDF)
    
-   Email notifications for order updates
    
-   Order cancellation and return requests
    

### Payment Integration

-   Stripe payment processing
    
-   Cash on Delivery option
    
-   Payment intent creation and confirmation
    
-   Webhook handling for payment events
    
-   Refund processing for administrators
    

### Admin Dashboard

-   Comprehensive analytics and reporting
    
-   Product management (CRUD operations)
    
-   Order management with status updates
    
-   User management with role assignment
    
-   Coupon management
    
-   System logs and cache management
    

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/refresh-token | Refresh JWT token |
| POST | /api/v1/auth/logout | User logout |
| POST | /api/v1/auth/forgot-password | Request password reset |
| POST | /api/v1/auth/reset-password | Reset password with token |
| GET | /api/v1/auth/verify-email/:token | Verify email address |

### Product Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/products | Get all products with filters |
| GET | /api/v1/products/:id | Get product by ID |
| GET | /api/v1/products/slug/:slug | Get product by slug |
| POST | /api/v1/products | Create new product (admin) |
| PUT | /api/v1/products/:id | Update product (admin) |
| DELETE | /api/v1/products/:id | Delete product (admin) |
| GET | /api/v1/products/:id/reviews | Get product reviews |

### Cart Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/cart | Get user cart |
| POST | /api/v1/cart/add | Add item to cart |
| PUT | /api/v1/cart/update | Update cart item quantity |
| DELETE | /api/v1/cart/remove/:productId | Remove item from cart |
| DELETE | /api/v1/cart/clear | Clear entire cart |
| POST | /api/v1/cart/coupon | Apply coupon to cart |
| DELETE | /api/v1/cart/coupon | Remove coupon from cart |

### Order Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/orders | Create new order |
| GET | /api/v1/orders | Get user orders |
| GET | /api/v1/orders/:id | Get order by ID |
| POST | /api/v1/orders/:id/cancel | Cancel order |
| GET | /api/v1/orders/:id/track | Track order status |
| GET | /api/v1/orders/:id/invoice | Download order invoice |

### Category Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/categories | Get all categories |
| GET | /api/v1/categories/tree | Get hierarchical category tree |
| GET | /api/v1/categories/:id | Get category by ID |
| POST | /api/v1/categories | Create new category (admin) |
| PUT | /api/v1/categories/:id | Update category (admin) |
| DELETE | /api/v1/categories/:id | Delete category (admin) |

### Payment Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/payments/create-intent | Create payment intent |
| POST | /api/v1/payments/confirm | Confirm payment |
| GET | /api/v1/payments/methods | Get available payment methods |
| GET | /api/v1/payments/history | Get payment history |
| POST | /api/v1/payments/initiate-cod | Initiate COD payment |
| POST | /api/v1/payments/refund/:orderId | Process refund (admin) |

### Admin Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/admin/dashboard/stats | Get dashboard statistics |
| GET | /api/v1/admin/reports/revenue | Get revenue reports |
| GET | /api/v1/admin/top-products | Get top selling products |
| GET | /api/v1/admin/users | Get all users |
| PUT | /api/v1/admin/users/:id/role | Update user role |
| GET | /api/v1/admin/orders | Get all orders |
| GET | /api/v1/admin/products | Get all products |
| POST | /api/v1/admin/cache/clear | Clear Redis cache |

## Authentication Flow

1.  User registers with email and password
    
2.  Password is hashed using bcrypt before storage
    
3.  Upon login, JWT access token and refresh token are generated
    
4.  Access token expires in 7 days, refresh token in 30 days
    
5.  Refresh token is stored in Redis for invalidation on logout
    
6.  Protected routes verify JWT using Passport.js JWT strategy
    
7.  Token refresh endpoint provides new tokens when access token expires
    

## Database Schema Design

### User Schema

-   name, email, password (hashed)
    
-   role (user, admin, moderator)
    
-   isEmailVerified flag
    
-   addresses array (references Address collection)
    
-   wishlist array (references Product collection)
    
-   preferences object (newsletter, notifications, language, currency)
    

### Product Schema

-   name, slug, description, shortDescription
    
-   price, compareAtPrice, costPerItem
    
-   quantity, soldQuantity
    
-   category reference
    
-   images array with Cloudinary URLs
    
-   tags, attributes, variants
    
-   ratings average and count
    
-   viewCount, purchaseCount
    

### Order Schema

-   orderNumber (auto-generated)
    
-   items array with product snapshots
    
-   subtotal, shippingCost, tax, discount, totalAmount
    
-   status (pending, processing, confirmed, shipped, delivered, cancelled)
    
-   paymentStatus (pending, paid, failed, refunded)
    
-   shippingAddress, billingAddress
    
-   trackingNumber, trackingUrl
    
-   timeline array for order status history
    

## Security Implementation

-   Password hashing with bcrypt (12 salt rounds)
    
-   JWT tokens with expiration
    
-   HTTP-only cookies for refresh tokens (optional)
    
-   Request rate limiting
    
-   NoSQL injection prevention via mongo-sanitize
    
-   XSS protection via xss-clean
    
-   Parameter pollution prevention via hpp
    
-   Helmet.js for security headers
    
-   CORS configuration for specific origins
    
-   Input validation and sanitization
    

## Caching Strategy

-   Redis caching for frequently accessed data
    
-   Category tree cached for 5 minutes
    
-   Product lists cached with query-based keys
    
-   Cart data cached with user-specific keys
    
-   Cache invalidation on data mutations
    
-   Cache patterns cleared using pattern matching
    

## Queue Processing

-   Bull queues for background jobs
    
-   Order processing queue for inventory updates
    
-   Email queue for asynchronous email delivery
    
-   Image processing queue for Cloudinary uploads
    
-   Cron jobs for scheduled tasks (expired cart cleanup, inventory updates)
    

## Error Handling

-   Centralized error handling middleware
    
-   Custom ApiError class for operational errors
    
-   Async handler wrapper to avoid try-catch repetition
    
-   Consistent error response format
    
-   Validation error formatting
    
-   Graceful shutdown on uncaught exceptions
    

## Installation and Setup

### Prerequisites

-   Node.js (version 18 or higher)
    
-   MongoDB (local or Atlas)
    
-   Redis server
    
-   Stripe account for payment processing
    
-   Cloudinary account for image storage
    
-   SMTP server for email (Gmail, SendGrid, etc.)
    

### Environment Variables

Backend (.env):

text

NODE\_ENV=development
PORT=5000
MONGODB\_URI=mongodb://localhost:27017/ecommerce
REDIS\_URL=redis://localhost:6379
JWT\_SECRET=your\_jwt\_secret
JWT\_REFRESH\_SECRET=your\_refresh\_secret
CLOUDINARY\_CLOUD\_NAME=your\_cloud\_name
CLOUDINARY\_API\_KEY=your\_api\_key
CLOUDINARY\_API\_SECRET=your\_api\_secret
STRIPE\_SECRET\_KEY=your\_stripe\_secret\_key
EMAIL\_HOST=smtp.gmail.com
EMAIL\_USER=your\_email@gmail.com
EMAIL\_PASSWORD=your\_app\_password
CLIENT\_URL=http://localhost:3000

Frontend (.env):

text

VITE\_API\_URL=http://localhost:5000/api/v1
VITE\_STRIPE\_PUBLIC\_KEY=your\_stripe\_publishable\_key

### Installation Steps

Backend Setup:

text

cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run seed:categories
npm run seed:products
npm run dev

Frontend Setup:

text

cd frontend
npm install
cp .env.example .env
# Configure environment variables
npm run dev

Docker Setup:

text

docker-compose up -d

## Testing

Run tests:

text

\# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage

## Deployment

### Backend Deployment

-   Set NODE\_ENV to production
    
-   Use process manager like PM2
    
-   Configure proper CORS origins
    
-   Enable HTTPS with SSL certificate
    
-   Set up database indexes for production
    
-   Configure log rotation
    

### Frontend Deployment

-   Build with vite build
    
-   Deploy to static hosting (Netlify, Vercel, AWS S3)
    
-   Configure environment variables for production
    
-   Enable gzip compression
    
-   Set up CDN for static assets
    

## Performance Optimization

-   Database indexing on frequently queried fields
    
-   Redis caching for API responses
    
-   Image optimization with Cloudinary
    
-   Pagination for large data sets
    
-   Debounced search inputs
    
-   Lazy loading for admin routes
    
-   Code splitting with React.lazy
    

## Monitoring and Logging

-   Winston logging with daily rotation
    
-   Morgan HTTP request logging
    
-   Error logging to separate files
    
-   Redis cache hit/miss monitoring
    
-   API response time tracking
    
-   Health check endpoint at /health
    

## Contributing Guidelines

1.  Fork the repository
    
2.  Create a feature branch
    
3.  Write tests for new features
    
4.  Ensure all tests pass
    
5.  Submit pull request for review
    

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please contact the development team through the project repository or email support at support@shophub.com.

## Version History

-   Version 1.0.0 - Initial release with core e-commerce functionality
    
-   Version 1.1.0 - Added admin dashboard and reporting
    
-   Version 1.2.0 - Integrated payment gateways
    
-   Version 1.3.0 - Added queue processing and caching
    

## Acknowledgments

-   Stripe for payment processing
    
-   Cloudinary for image management
    
-   MongoDB Atlas for database hosting
    
-   Redis for caching infrastructure
    

This response is AI-generated, for reference only.