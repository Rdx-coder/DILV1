# Dangi Innovation Lab - Complete Full-Stack Application

Production-ready nonprofit website with Node.js backend and React frontend, featuring complete admin panel for form management and email replies.

## 🚀 Features

### Frontend (React)
- **7 Public Pages**: Home, About, Programs, Mentorship, Transparency, Support, Contact
- **Professional Design**: Clean, modern nonprofit aesthetic with lime green branding
- **Responsive**: Mobile-first design, works on all devices
- **Form Submissions**: Contact forms integrated with backend API

### Backend (Node.js + Express)
- **RESTful API**: 12+ endpoints with proper error handling
- **MongoDB Database**: Submission and admin data storage
- **JWT Authentication**: Secure admin access with 7-day tokens
- **Email Service**: Nodemailer with Gmail SMTP integration
- **Security**: Helmet.js, CORS, rate limiting, password hashing
- **Production Ready**: Proper error handling, logging, validation

### Admin Panel
- **Secure Login**: JWT-based authentication
- **Dashboard**: Real-time statistics (total, new, replied submissions)
- **Submission Management**: View, filter, search, update status
- **Email Replies**: Send responses directly from dashboard
- **Filters**: By status, form type, date range, search
- **Status Tracking**: New, In Progress, Replied, Closed

---

## 🔑 Admin Access

**Login URL:** http://localhost:3000/admin/login

**Default Credentials:**
- Email: admin@dangiinnovationlab.com
- Password: ----

**⚠️ IMPORTANT:** Change default password in production!

---

## 🧪 Quick Test

### Test Backend API
```bash
cd /app/backend-node && ./test-api.sh
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api
- **Admin Panel**: http://localhost:3000/admin/login

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact` | Submit contact form | No |
| POST | `/api/auth/login` | Admin login | No |
| GET | `/api/admin/stats` | Dashboard statistics | Yes |
| GET | `/api/admin/submissions` | Get submissions | Yes |
| POST | `/api/admin/submissions/:id/reply` | Send email reply | Yes |

**Full Documentation:** `/app/backend-node/API_DOCUMENTATION.md`

---

## 🎯 Quick Start Guide

### 1. Configure Email (Optional)
Edit `/app/backend-node/.env`:
```env
EMAIL_USER=contact@dangiinnovationlab.com
EMAIL_PASSWORD=your_gmail_app_password
```

**Setup Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate password
3. Add to .env file

### 2. Access Admin Panel
1. Navigate to http://localhost:3000/admin/login
2. Login with credentials above
3. View submissions, send replies, manage status

### 3. Test Contact Form
1. Go to http://localhost:3000/contact
2. Fill form and submit
3. Check admin dashboard for submission
4. Send reply from dashboard

---

## 📊 Admin Panel Features

✅ **Dashboard Statistics** - Real-time counts
✅ **Filter Submissions** - By status, type, date
✅ **Search** - By name, email, subject
✅ **Status Management** - Update submission status
✅ **Email Replies** - Send responses directly
✅ **Delete** - Remove submissions
✅ **Auto-Reply** - Welcome emails sent automatically

---

## 🔒 Security

- JWT Authentication (7-day expiration)
- Password Hashing (Bcrypt, salt rounds 12)
- Rate Limiting (100 req/15 min)
- CORS Protection
- Helmet.js Security Headers
- Input Validation & Sanitization

---

## 📞 Support

**Email**: contact@dangiinnovationlab.com

**Version**: 1.0.0 - Production Ready ✅
