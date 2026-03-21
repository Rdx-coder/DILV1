# Dangi Innovation Lab - Backend API Documentation

## Overview
Production-ready Node.js backend with Express, MongoDB, JWT authentication, and email functionality.

## Base URL
```
http://localhost:8001/api
```

## Environment Setup

### Required Environment Variables (.env)
```env
NODE_ENV=production
PORT=8001
MONGO_URL=mongodb://localhost:27017/dil_database
DB_NAME=dil_database
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@dangiinnovationlab.com
ADMIN_PASSWORD=Admin@123
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=contact@dangiinnovationlab.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=contact@dangiinnovationlab.com
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use generated password in EMAIL_PASSWORD

---

## API Endpoints

### 1. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "environment": "production"
}
```

---

### 2. Authentication

#### Admin Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@dangiinnovationlab.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@dangiinnovationlab.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

#### Get Current Admin
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@dangiinnovationlab.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

---

### 3. Public Form Submissions

#### Submit Contact Form
**POST** `/api/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about programs",
  "message": "I would like to learn more about your programs.",
  "interest": "programs"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon.",
  "submission": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Submit Application
**POST** `/api/application`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "program": "Startups & Entrepreneurship",
  "message": "I want to apply for the startup program."
}
```

#### Subscribe to Newsletter
**POST** `/api/newsletter`

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "name": "Subscriber Name"
}
```

---

### 4. Admin Endpoints (Protected)

All admin endpoints require `Authorization: Bearer {token}` header.

#### Get Dashboard Stats
**GET** `/api/admin/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "byStatus": {
      "new": 25,
      "inProgress": 10,
      "replied": 100,
      "closed": 15
    },
    "byFormType": {
      "contact": 80,
      "application": 50,
      "mentorship": 10,
      "newsletter": 10
    },
    "recentSubmissions": 30
  }
}
```

#### Get All Submissions (with filters)
**GET** `/api/admin/submissions`

**Query Parameters:**
- `status` - Filter by status (new, in_progress, replied, closed)
- `formType` - Filter by form type (contact, application, mentorship, newsletter)
- `search` - Search by name, email, or subject
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (default: -createdAt)

**Example:**
```
GET /api/admin/submissions?status=new&formType=contact&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "formType": "contact",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Inquiry",
      "message": "Message text",
      "status": "new",
      "createdAt": "2024-01-20T12:00:00.000Z",
      "updatedAt": "2024-01-20T12:00:00.000Z"
    }
  ]
}
```

#### Get Single Submission
**GET** `/api/admin/submissions/:id`

**Response:**
```json
{
  "success": true,
  "submission": {
    "_id": "507f1f77bcf86cd799439011",
    "formType": "contact",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Message text",
    "status": "new",
    "replies": [],
    "createdAt": "2024-01-20T12:00:00.000Z",
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

#### Update Submission Status
**PUT** `/api/admin/submissions/:id/status`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "submission": { ... }
}
```

#### Reply to Submission
**POST** `/api/admin/submissions/:id/reply`

**Request Body:**
```json
{
  "subject": "Re: Your inquiry",
  "message": "Thank you for contacting us. Here is our response..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "submission": {
    ...
    "replies": [
      {
        "message": "Thank you for contacting us...",
        "sentBy": "admin@dangiinnovationlab.com",
        "sentAt": "2024-01-20T12:00:00.000Z"
      }
    ],
    "status": "replied"
  }
}
```

#### Delete Submission
**DELETE** `/api/admin/submissions/:id`

**Response:**
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Server Error

---

## Security Features

1. **Helmet.js** - Security headers
2. **Rate Limiting** - 100 requests per 15 minutes
3. **CORS** - Configured for frontend URL
4. **JWT Authentication** - 7-day expiration
5. **Password Hashing** - bcrypt with salt rounds 12
6. **Input Validation** - Sanitized and validated inputs

---

## Email Functionality

### Auto-Reply Email
Sent automatically when user submits contact form.

### Admin Reply Email
Sent when admin replies through dashboard. Includes:
- Professional email template
- Original message context
- DIL branding
- Organization footer

---

## Database Schema

### Admin Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission Collection
```javascript
{
  formType: String (enum: ['contact', 'application', 'mentorship', 'newsletter']),
  name: String,
  email: String,
  subject: String,
  message: String,
  interest: String,
  phone: String,
  status: String (enum: ['new', 'in_progress', 'replied', 'closed']),
  replies: [{
    message: String,
    sentBy: String,
    sentAt: Date
  }],
  metadata: Map,
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the API

### Using cURL

**Test Health Check:**
```bash
curl http://localhost:8001/api/health
```

**Admin Login:**
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dangiinnovationlab.com","password":"Admin@123"}'
```

**Submit Contact Form:**
```bash
curl -X POST http://localhost:8001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Test","message":"Testing the API"}'
```

**Get Submissions (with token):**
```bash
curl http://localhost:8001/api/admin/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Production Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure Gmail App Password
- [ ] Update FRONTEND_URL to production domain
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Review rate limiting settings
- [ ] Set up error tracking (Sentry, etc.)

---

## Admin Panel Access

**URL:** `http://localhost:3000/admin/login`

**Default Credentials:**
- Email: admin@dangiinnovationlab.com
- Password: Admin@123

**Features:**
- Dashboard with statistics
- View all form submissions
- Filter by status, type, date range
- Search by name/email
- Update submission status
- Reply directly via email
- Delete submissions
- Real-time status updates

---

## Support

For issues or questions:
- Email: contact@dangiinnovationlab.com
- Documentation: This file
