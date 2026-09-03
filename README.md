# Booking-Web

## Fullstack Adventure Booking and Managing Platform

A comprehensive fullstack web application built with Node.js/Express backend and React/Vite frontend for managing adventure bookings, hotel reservations, and item rentals with advanced features like automated payouts, real-time chat, and multi-language support.

## 🏗️ High-Level Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│  (Node.js)      │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Vite          │    │ • Express.js    │    │ • MongoDB       │
│ • Redux Toolkit │    │ • Socket.IO     │    │ • Redis         │
│ • TailwindCSS   │    │ • Mongoose      │    │ • Cloudinary    │
│ • i18next       │    │ • JWT Auth      │    │ • PayPal        │
│ • Framer Motion │    │ • Multer        │    │ • Google        │
└─────────────────┘    └─────────────────┘    │   Translate     │
                                              └─────────────────┘
```

## 🚀 Core Features

### 1. **Adventure Booking System**
- **Adventure Management**: Create, update, and manage adventure experiences
- **Session Booking**: Time-based booking system for adventure sessions
- **Event Booking**: Large-scale event management and bookings
- **Category System**: Organized adventure categories and filtering
- **Location Integration**: Geographic location management with maps

### 2. **Hotel Booking System**
- **Hotel Management**: Complete hotel property management
- **Room Availability**: Real-time availability checking
- **Booking Management**: Reservation system with confirmation workflow
- **Multi-property Support**: Support for multiple hotel properties

### 3. **Shop & Item Rentals**
- **Item Catalog**: Comprehensive item management system
- **Shopping Cart**: Full cart functionality with persistence
- **Rental System**: Equipment and gear rental management
- **Inventory Tracking**: Real-time inventory management

### 4. **Real-Time Communication**
- **Socket.IO Integration**: Real-time bidirectional communication
- **Chat System**: User-to-user messaging with attachments
- **Live Notifications**: Real-time booking updates and notifications
- **Chat Widget**: Customer support chat widget

### 5. **Multi-Language Support with Redis Caching**
- **Google Translate API**: Automatic content translation
- **Redis Caching**: High-performance translation caching system
- **5 Languages Supported**: English, French, German, Spanish, Italian
- **Smart Translation**: Field-specific translation with fallbacks
- **Cache Management**: Efficient cache invalidation and management

### 6. **Automated Payout System**
- **PayPal Integration**: Direct payouts to service providers
- **Automated Cron Jobs**: Daily processing at 2 AM UTC
- **Platform Fee Structure**: 20% platform fee, 80% to providers
- **Multi-booking Support**: Event, hotel, and item booking payouts
- **Safety Checks**: 24-hour settlement period and validation
- **Manual Controls**: Admin override and monitoring capabilities

### 7. **Revolut Payment Integration**
- **Primary Payment Gateway**: Revolut as the main payment processor
- **Multi-Currency Support**: GBP, EUR, USD payment processing
- **Webhook Integration**: Real-time payment status updates
- **Secure Checkout**: Automatic payment capture and validation
- **Order Management**: Complete order tracking and status monitoring
- **Fallback Support**: PayPal integration as secondary payment method

### 8. **User Management & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User, instructor, admin, and hotel owner roles
- **Profile Management**: Comprehensive user profiles
- **Social Features**: Friend system and social interactions
- **Achievement System**: User and instructor achievement tracking

### 9. **Admin Dashboard**
- **Comprehensive Analytics**: Booking, revenue, and user analytics
- **Content Management**: Terms, declarations, and website settings
- **User Management**: User roles, permissions, and moderation
- **Financial Controls**: Transaction monitoring and payout management
- **System Monitoring**: Redis cache stats and translation metrics

## 🛠️ Technology Stack

### Frontend (Client)
```javascript
// Core Technologies
- React 18.3.1 with Hooks and Context API
- Vite for blazing-fast development and building
- Redux Toolkit for state management
- TailwindCSS + Radix UI for modern styling
- Framer Motion for smooth animations

// Key Libraries
- React Router Dom for navigation
- React Hook Form for form handling
- i18next for internationalization
- Socket.IO Client for real-time features
- Axios for API communication
- Date-fns for date manipulation
- React Leaflet for maps integration
```

### Backend (Server)
```javascript
// Core Technologies
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication

// Key Libraries
- Redis (ioredis) for caching and sessions
- Cloudinary for file storage and management
- Multer for file upload handling
- PayPal Server SDK for payment processing
- Google Cloud Translate for multilingual support
- Node-cron for scheduled tasks
- Nodemailer for email notifications
```

### External Services & APIs
```yaml
Database:
  - MongoDB: Primary database for all application data
  - Redis: Caching layer for translations and sessions

File Storage:
  - Cloudinary: Image and file storage with CDN

Payment Processing:
  - PayPal: Payment processing and automated payouts
  - Revolut: Primary payment gateway for bookings and transactions

Translation:
  - Google Cloud Translate API: Real-time content translation

Development Tools:
  - Nodemon: Development server auto-restart
  - ESLint: Code linting and formatting
  - Prettier: Code formatting
```

## 🌐 Multi-Language System Architecture

### Translation Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Request  │───►│  Redis Cache    │───►│ Google Translate│
│   (with lang)   │    │   Check         │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Cache Hit?    │              │
         │              │   Return Data   │              │
         │              └─────────────────┘              │
         │                                                ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────►│  Format & Send  │◄───│  Cache Result   │
                        │   Response      │    │   (24h TTL)     │
                        └─────────────────┘    └─────────────────┘
```

### Supported Languages
- **English (en)**: Default language
- **French (fr)**: français
- **German (de)**: Deutsch  
- **Spanish (es)**: Español
- **Italian (it)**: Italiano

### Cache Strategy
- **Redis TTL**: 24-hour cache expiration
- **Base64 Encoding**: Efficient key generation
- **Batch Processing**: Up to 50 texts per API call
- **Fallback System**: Returns original text on translation failure

## � Revolut Payment System

### Payment Flow Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Checkout │───►│   Create Order  │───►│  Revolut API    │
│   (Frontend)    │    │   (Backend)     │    │   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ Store Order ID  │              │
         │              │ in Database     │              │
         │              └─────────────────┘              │
         │                                                ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────►│  Redirect to    │◄───│  Payment Page   │
                        │  Payment URL    │    │   Generated     │
                        └─────────────────┘    └─────────────────┘
```

### Supported Payment Methods
- **Revolut Pay**: Primary payment gateway
  - Multi-currency support (GBP, EUR, USD)
  - Automatic payment capture
  - Real-time webhook notifications
  - Secure redirect-based checkout

- **PayPal**: Secondary payment method
  - Legacy support for existing users
  - Payout integration for service providers
  - Backup payment option

### Payment Integration Features
```javascript
// Payment Methods by Service
Event Bookings:    Revolut (Primary) + PayPal (Fallback)
Hotel Bookings:    Revolut (Primary) + PayPal (Fallback)  
Item Rentals:      Revolut (Primary) + PayPal (Fallback)
Session Bookings:  Revolut (Primary) + PayPal (Fallback)

// Webhook Events
- ORDER_COMPLETED: Payment successfully processed
- ORDER_AUTHORISED: Payment authorized (auto-capture enabled)
- PAYMENT_FAILED: Payment processing failed
```

### Security & Compliance
- **PCI DSS Compliance**: Through Revolut's secure infrastructure
- **API Key Management**: Environment-based secret management
- **Webhook Validation**: Secure webhook signature verification
- **Order Tracking**: Complete audit trail for all transactions

### Payout Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cron Job      │───►│  Query Eligible │───►│  Calculate      │
│   (Daily 2AM)   │    │   Bookings      │    │   Amounts       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ • >24h old      │              │
         │              │ • Confirmed     │              │
         │              │ • Not paid out  │              │
         │              └─────────────────┘              │
         │                                                ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────►│  Send PayPal    │◄───│  80% to Provider│
                        │   Payout        │    │  20% Platform   │
                        └─────────────────┘    └─────────────────┘
```

### Fee Structure
- **Platform Fee**: 20% of booking amount
- **Provider Payout**: 80% of booking amount
- **Minimum Payout**: $10 USD threshold
- **Currency**: USD for all transactions

### Supported Booking Types
1. **Event Bookings**: Adventure instructors
2. **Hotel Bookings**: Hotel property owners
3. **Item Bookings**: Equipment rental providers (configurable)

## 🔄 Real-Time Features

### Socket.IO Implementation
```javascript
// Connection Management
- User room joining with userId
- Automatic reconnection handling
- Connection state management

// Message Features
- Real-time messaging between users
- File attachment support
- Message read status tracking
- Offline message queuing

// Notification System
- Booking confirmations
- Payment notifications
- System announcements
```

## 📱 API Structure

### Authentication Endpoints
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/logout       - User logout
GET    /api/auth/profile      - Get user profile
PUT    /api/auth/profile      - Update profile
```

### Booking Endpoints
```
GET    /api/adventure         - List adventures
POST   /api/adventure         - Create adventure
GET    /api/hotel             - List hotels
POST   /api/hotelBooking      - Create hotel booking
GET    /api/session           - List sessions
POST   /api/sessionBooking    - Create session booking
```

### Payment & Payout Endpoints
```
GET    /api/payout            - Get payout history
POST   /api/payout/trigger    - Manual payout trigger
GET    /api/transaction       - Transaction history
```

### Translation & Cache Endpoints
```
GET    /api/translation/stats - Cache statistics
DELETE /api/translation/cache - Clear translation cache
```

## � Automated Payout System

### Payout Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cron Job      │───►│  Query Eligible │───►│  Calculate      │
│   (Daily 2AM)   │    │   Bookings      │    │   Amounts       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ • >24h old      │              │
         │              │ • Confirmed     │              │
         │              │ • Not paid out  │              │
         │              └─────────────────┘              │
         │                                                ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────►│  Send PayPal    │◄───│  80% to Provider│
                        │   Payout        │    │  20% Platform   │
                        └─────────────────┘    └─────────────────┘
```

### Fee Structure
- **Platform Fee**: 20% of booking amount
- **Provider Payout**: 80% of booking amount
- **Minimum Payout**: $10 USD threshold
- **Currency**: USD for all transactions

### Supported Booking Types
1. **Event Bookings**: Adventure instructors
2. **Hotel Bookings**: Hotel property owners
3. **Item Bookings**: Equipment rental providers (configurable)

## �🗄️ Database Schema Overview

### Core Collections & Relationships

#### User Management
```javascript
User {
  _id: ObjectId
  email: String (unique, indexed)
  name: String
  role: Enum ["user", "admin", "instructor", "hotel", "superadmin"]
  profilePicture: String
  phoneNumber: String
  verified: Boolean
  level: Number
  
  // PayPal Integration Fields
  paypalPayerId: String (indexed)
  paypalEmail: String
  paypalLinkedAt: Date
  paypalEmailConfirmed: Boolean
  paypalAccountStatus: Enum
  paypalPermissionsGranted: Boolean
  paypalOnboardingCompleted: Boolean
  
  // Relationships
  instructor: ObjectId → Instructor
  admin: ObjectId → Admin
  friends: [ObjectId] → User
  adventures: [ObjectId] → Adventure
  reviews: [ObjectId] → Review
}

Instructor {
  _id: ObjectId
  documentVerified: Enum ["pending", "verified", "rejected"]
  description: [String]
  adventure: ObjectId → Adventure
  location: ObjectId → Location
  avgReview: Number
  portfolioMedias: [String]
  certificate: String
  governmentId: String
  languages: [String]
  sessions: [ObjectId] → Booking
  reviews: [ObjectId] → Review
}

Admin {
  _id: ObjectId
  permissions: [String]
  departmentId: ObjectId
  lastLoginAt: Date
  isActive: Boolean
}
```

#### Adventure & Location System
```javascript
Adventure {
  _id: ObjectId
  name: String (indexed)
  description: String
  location: [ObjectId] → Location
  medias: [String] (min: 1)
  thumbnail: String
  previewVideo: String
  exp: Number
  instructor: [ObjectId] → User
  // Relationship fields for sessions and bookings
}

Location {
  _id: ObjectId
  name: String
  address: String
  coordinates: {
    latitude: Number
    longitude: Number
  }
  city: String
  country: String
  zipCode: String
}

Category {
  _id: ObjectId
  name: String (unique)
}
```

#### Booking System
```javascript
// Event-based Bookings
EventBooking {
  _id: ObjectId
  user: ObjectId → User (indexed)
  event: ObjectId → Event (indexed)
  participants: Number (1-20)
  amount: Number
  status: Enum ["pending", "confirmed", "cancelled", "completed"]
  paymentStatus: Enum ["pending", "completed", "failed", "refunded"]
  paymentMethod: Enum ["revolut", "paypal", "card"]
  paymentOrderId: String
  transactionId: String
  bookingDate: Date
  paymentCompletedAt: Date
  cancelledAt: Date
  cancelReason: String
  
  // Adventure tracking
  adventureInstructors: [{
    adventure: ObjectId → Adventure
    instructor: ObjectId → User
  }]
  adventureCompletionStatus: [{
    adventure: ObjectId → Adventure
    completed: Boolean
    completedAt: Date
  }]
  
  contactInfo: {
    email: String
    phone: String
  }
}

// Session-based Bookings
Booking {
  _id: ObjectId
  user: ObjectId → User (indexed)
  session: ObjectId → Session
  groupMember: [ObjectId] → User
  status: Enum ["pending", "confirmed", "cancelled"]
  transactionId: String
  amount: Number
  bookingDate: Date
  modeOfPayment: Enum ["paypal", "cash", "revolut"]
}

Session {
  _id: ObjectId
  days: Enum ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  status: Enum ["active", "inactive", "cancelled", "expired", "completed"]
  price: Number
  priceType: Enum ["perHour", "perPerson", "perGroup", "perDay", "perMonth"]
  expiresAt: Date
  startTime: Date
  capacity: Number
  adventureId: ObjectId → Adventure
  instructorId: ObjectId → User
  location: ObjectId → Location
  notes: String
  booking: [ObjectId] → Booking
}

// Hotel Bookings
HotelBooking {
  _id: ObjectId
  user: ObjectId → User (indexed)
  hotel: ObjectId → Hotel (indexed)
  guests: Number
  numberOfRooms: Number
  checkInDate: Date
  checkOutDate: Date
  status: Enum ["pending", "confirmed", "cancelled"]
  paymentStatus: Enum ["pending", "completed", "failed"]
  transactionId: String
  amount: Number
  modeOfPayment: Enum ["card", "paypal", "revolut"]
  specialRequests: String
}

Hotel {
  _id: ObjectId
  name: String
  pricePerNight: Number
  rating: Number
  location: ObjectId → Location
  fullAddress: String
  contactNo: String
  managerName: String
  noRoom: Number
  category: Enum ["camping", "hotel", "glamping"]
  description: String
  verified: Enum ["pending", "approved", "rejected"]
  // Additional hotel fields...
}
```

#### E-commerce System
```javascript
Item {
  _id: ObjectId
  name: String
  description: String
  price: Number
  rentalPrice: Number
  category: String
  stock: Number
  images: [String]
  adventures: [ObjectId] → Adventure
  availability: Enum ["available", "rented", "maintenance"]
}

ItemBooking {
  _id: ObjectId
  user: ObjectId → User (indexed)
  items: [{
    item: ObjectId → Item
    quantity: Number
    purchase: Boolean
    rentalPeriod: {
      startDate: Date
      endDate: Date
    }
  }]
  amount: Number
  status: Enum ["pending", "confirmed", "completed", "cancelled"]
  modeOfPayment: Enum ["paypal", "cash", "revolut"]
  paymentOrderId: String
  paymentStatus: Enum ["pending", "completed", "failed", "cancelled"]
  paymentCompletedAt: Date
}

Cart {
  _id: ObjectId
  user: ObjectId → User (indexed)
  items: [{
    item: ObjectId → Item
    quantity: Number
    purchase: Boolean
    rentalPeriod: {
      startDate: Date
      endDate: Date
    }
  }]
}
```

#### Events System
```javascript
Event {
  _id: ObjectId
  title: String
  description: String
  date: Date
  startTime: String
  endTime: String
  location: String
  coordinates: {
    latitude: Number
    longitude: Number
  }
  mapEmbedUrl: String
  level: Number (1-10)
  image: String
  maxParticipants: Number
  currentParticipants: Number
  price: Number
  currency: String
  category: String
  status: Enum ["active", "cancelled", "completed"]
  adventures: [ObjectId] → Adventure
  instructors: [ObjectId] → User
}
```

#### Communication System
```javascript
Message {
  _id: ObjectId
  from: ObjectId → User (indexed)
  to: ObjectId → User (indexed)
  content: String
  attachments: [String]
  timestamp: Date
  isRead: Boolean
  messageType: Enum ["text", "image", "file", "system"]
}

FriendRequest {
  _id: ObjectId
  from: ObjectId → User
  to: ObjectId → User
  status: Enum ["pending", "accepted", "rejected"]
  sentAt: Date
  respondedAt: Date
}
```

#### Payment & Transaction System
```javascript
Payout {
  _id: ObjectId
  user: ObjectId → User (indexed)
  amount: Number
  currency: String (default: "USD")
  note: String
  batchId: String (indexed)
  itemId: String (indexed)
  status: Enum ["QUEUED", "SENT", "SUCCESS", "FAILED"]
  rawResponse: Mixed
  createdAt: Date
  updatedAt: Date
}
```

#### Content Management
```javascript
Terms {
  _id: ObjectId
  title: String
  version: String
  content: String
  status: Enum ["draft", "published"]
  publishedBy: String
  publishedAt: Date
  updatedAt: Date
}

Declaration {
  _id: ObjectId
  title: String
  version: String
  content: String
  adventures: [ObjectId] → Adventure
  createdAt: Date
  updatedAt: Date
}

WebsiteSettings {
  _id: ObjectId
  siteName: String
  siteDescription: String
  contactEmail: String
  socialMedia: {
    facebook: String
    twitter: String
    instagram: String
  }
  features: {
    shopEnabled: Boolean
    hotelsEnabled: Boolean
    eventsEnabled: Boolean
  }
  maintenance: {
    enabled: Boolean
    message: String
  }
}
```

#### Achievement System
```javascript
UserAchievement {
  _id: ObjectId
  user: ObjectId → User
  achievement: ObjectId → Achievement
  unlockedAt: Date
  progress: Number
}

InstructorAchievement {
  _id: ObjectId
  instructor: ObjectId → User
  achievement: ObjectId → Achievement
  unlockedAt: Date
  progress: Number
}

UserAdventureExperience {
  _id: ObjectId
  user: ObjectId → User
  adventure: ObjectId → Adventure
  experienceLevel: Number
  completedSessions: Number
  lastActivityDate: Date
}
```

#### Support & Documentation
```javascript
Ticket {
  _id: ObjectId
  user: ObjectId → User
  subject: String
  description: String
  status: Enum ["open", "in-progress", "resolved", "closed"]
  priority: Enum ["low", "medium", "high", "urgent"]
  assignedTo: ObjectId → Admin
  responses: [{
    author: ObjectId → User
    content: String
    timestamp: Date
    isInternal: Boolean
  }]
  createdAt: Date
  updatedAt: Date
}

Document {
  _id: ObjectId
  title: String
  content: String
  category: String
  isPublic: Boolean
  author: ObjectId → User
  lastModified: Date
}

OTP {
  _id: ObjectId
  userId: ObjectId → User
  code: String
  type: Enum ["email", "phone"]
  expiresAt: Date
  verified: Boolean
  attempts: Number
}
```

### Database Indexes & Performance
```javascript
// Critical Indexes for Performance
User: { email: 1 }, { paypalPayerId: 1 }
EventBooking: { user: 1 }, { event: 1 }, { paymentOrderId: 1 }
HotelBooking: { user: 1 }, { hotel: 1 }
Booking: { user: 1 }, { session: 1 }
Message: { from: 1 }, { to: 1 }, { timestamp: -1 }
Payout: { user: 1 }, { status: 1 }, { batchId: 1 }
Adventure: { name: "text" }, { location: 1 }
```

### Data Relationships Summary
- **One-to-Many**: User → Bookings, Hotel → HotelBookings, Adventure → Sessions
- **Many-to-Many**: User ↔ Friends, Adventure ↔ Instructors, Event ↔ Adventures
- **One-to-One**: User → Instructor, User → Admin
- **Embedded Documents**: Coordinates in Events, Contact info in EventBooking

## 🚀 Getting Started

### Prerequisites
```bash
Node.js (v18+)
MongoDB (v5+)
Redis (v6+)
```

### Environment Variables
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/booking-web
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
CLIENT_URL=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

### Installation & Setup

#### Backend Setup
```bash
cd Backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd Client
npm install
npm run dev
```

### Database Initialization
The application automatically creates default terms and declarations on first startup.

## 📊 Performance Features

### Caching Strategy
- **Redis Translation Cache**: 24-hour TTL for translations
- **Database Query Optimization**: Indexed queries and pagination
- **File CDN**: Cloudinary for optimized media delivery

### Real-time Optimization
- **Socket Connection Pooling**: Efficient connection management
- **Message Queuing**: Offline message handling
- **Lazy Loading**: Component and route-based code splitting

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Granular permissions
- **Input Validation**: Comprehensive data validation
- **File Upload Security**: Type and size validation
- **CORS Protection**: Configured cross-origin policies
- **Rate Limiting**: API endpoint protection

## 🔮 Future Enhancements

- **Mobile App**: React Native implementation
- **Advanced Analytics**: Business intelligence dashboard
- **AI Recommendations**: Machine learning-based suggestions
- **Blockchain Payments**: Cryptocurrency payment integration
- **Advanced Search**: Elasticsearch integration
- **Video Chat**: WebRTC video calling features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Booking-Web** - Revolutionizing adventure booking with modern technology and seamless user experience.