# 🚀 Production Deployment Guide - Work It Out

## Overview
This guide walks you through deploying the Work It Out insurance quote platform to Hostinger or any other hosting provider.

## ✅ Pre-Deployment Checklist

- [x] Remove all demo/mock data
- [x] Configure production database scripts  
- [x] Update environment configuration
- [x] Add production seeding scripts
- [x] Test real data flow
- [x] Security headers configured
- [x] Build optimization enabled

## 📋 Prerequisites

1. **Hostinger Hosting Account** with Node.js support
2. **Database**: MySQL or PostgreSQL database
3. **Domain**: Configured domain name
4. **SSL Certificate**: HTTPS enabled

## 🗄️ Database Setup

### Step 1: Create Production Database

**On Hostinger:**
1. Go to your hosting panel
2. Create a new MySQL database
3. Note down the connection details:
   - Host
   - Port (usually 3306)
   - Database name
   - Username
   - Password

### Step 2: Update Database Schema

Update your Prisma schema for production:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"  // or "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🔧 Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.production.template .env.production
```

### Step 2: Fill in Production Values

```env
# Database (REQUIRED)
DATABASE_URL="mysql://username:password@hostname:3306/database_name"

# Next.js (REQUIRED)
NEXTAUTH_SECRET="your-32-character-secure-random-string"
NEXTAUTH_URL="https://yourdomain.com"

# Optional but recommended
OPENAI_API_KEY="your_openai_api_key"
COMPANY_NAME="Your Company Name"
COMPANY_EMAIL="info@yourdomain.com"
```

## 🔨 Build and Deploy

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

### Step 3: Build for Production

```bash
npm run production:build
```

### Step 4: Database Migration

```bash
npm run db:migrate
```

### Step 5: Seed Essential Data

```bash
npm run db:seed
```

### Step 6: Start Production Server

```bash
npm run production:start
```

## 🌐 Hostinger Specific Instructions

### 1. Upload Files

Upload the following to your Hostinger public_html directory:
- `.next/` (build output)
- `node_modules/`
- `package.json`
- `next.config.js`
- `.env.production` (rename to `.env`)
- `prisma/`

### 2. Configure Node.js Application

In Hostinger panel:
1. Go to **Node.js Apps**
2. Create new application
3. Set entry file: `server.js`
4. Set Node.js version: 18 or higher

### 3. Create server.js

Create a `server.js` file in your root directory:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

## 🔐 Security Configuration

### 1. Environment Variables
Ensure these are set in production:
- `NODE_ENV=production`
- `NEXTAUTH_SECRET` (secure random string)
- `DATABASE_URL` (production database)

### 2. Admin Access
Default admin credentials after seeding:
- Email: `admin@workitout.com`
- Password: Set through admin panel after first login

### 3. Security Headers
Already configured in `next.config.js`:
- CORS protection
- X-Frame-Options
- Content Security Policy
- Referrer Policy

## 📊 Post-Deployment Verification

### 1. Test Lead Collection
```bash
curl -X POST https://yourdomain.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@test.com",
    "insuranceType": "health"
  }'
```

### 2. Verify Admin Panel
1. Visit `https://yourdomain.com/admin`
2. Login with admin credentials
3. Check analytics dashboard
4. Verify lead data appears

### 3. Test Forms
1. Visit `https://yourdomain.com/health`
2. Complete the quote form
3. Verify lead appears in admin panel
4. Check analytics are updated

## 🔄 Ongoing Maintenance

### Database Backups
Set up automated backups in Hostinger panel or create a backup script:

```bash
# Create backup script
mysqldump -h hostname -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Log Monitoring
Monitor application logs for errors:
- Check Hostinger error logs
- Monitor API response times
- Track form completion rates

### Updates
To deploy updates:
1. Build locally: `npm run production:build`
2. Upload new `.next/` folder
3. Restart Node.js application in Hostinger panel

## 🆘 Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify DATABASE_URL format
- Check database credentials
- Ensure database exists

**Build Errors:**
- Run `npm run typecheck` to fix TypeScript errors
- Check `npm run lint` for code issues
- Verify all dependencies are installed

**Form Submission Issues:**
- Check API endpoints are accessible
- Verify CORS configuration
- Test with browser dev tools

**Admin Panel Access:**
- Ensure admin users were seeded
- Check authentication configuration
- Verify session settings

### Support
For technical issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints individually
4. Review database connections

## ✅ Deployment Complete!

Your Work It Out platform is now ready for production use with:

- ✅ Real lead collection and storage
- ✅ Complete admin analytics dashboard  
- ✅ Multi-form insurance quote system
- ✅ Visitor tracking and behavior analysis
- ✅ A/B testing capabilities
- ✅ AI-powered insights (if OpenAI configured)
- ✅ Secure authentication system
- ✅ Production-optimized performance

The platform will now collect real leads, track user behavior, and provide comprehensive analytics for your insurance quote business.