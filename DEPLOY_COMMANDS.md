# 🎯 Deployment Commands - Quick Reference

## 📋 Copy-Paste Ready Commands

---

## 🔑 Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output → Use as `JWT_SECRET` in Render

---

## 🗄️ Neon Database Connection String Format

```bash
postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require
```

**Important:** Must end with `?sslmode=require`

---

## 🔧 Render Configuration

### Build Command
```bash
npm install && npx prisma generate && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
JWT_SECRET=your-generated-secret-from-openssl
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

---

## 🌐 Vercel Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_APP_NAME=School Management System
```

---

## 🔄 Render Shell Commands

### Run Database Migrations
```bash
npx prisma migrate deploy
```

### Seed Database (Optional)
```bash
npx prisma db seed
```

### Check Prisma Status
```bash
npx prisma migrate status
```

### View Database Schema
```bash
npx prisma studio
```

---

## 🧪 Testing URLs

### Backend Health Check
```
https://your-render-url.onrender.com/api/health
```

### Frontend
```
https://your-vercel-url.vercel.app
```

### Test Login
```
Email: admin@school.edu.kh
Password: Admin@123
```

---

## 🔄 Deploying Updates

### Automatic Deploy (Both Platforms)
```bash
git add .
git commit -m "Your changes description"
git push origin main
```

Both Vercel and Render auto-deploy in ~2-3 minutes!

---

## 💾 Database Migration Workflow

```bash
# 1. Create migration locally
cd api
npx prisma migrate dev --name your_migration_name

# 2. Commit and push
git add .
git commit -m "Migration: your_migration_name"
git push origin main

# 3. Deploy migration in Render Shell
npx prisma migrate deploy
```

---

## 📊 Check Service Status

### Render Logs (Real-time)
```
Dashboard → Your Service → Logs tab
```

### Vercel Deployment Logs
```
Dashboard → Your Project → Deployments → Click deployment
```

### Neon Database Dashboard
```
https://console.neon.tech → Your Project
```

---

## 🐛 Quick Fixes

### Fix CORS Error
```bash
# In Render Environment Variables:
CORS_ORIGIN=https://your-exact-vercel-url.vercel.app

# Must match exactly:
# ✅ https://app.vercel.app
# ❌ https://app.vercel.app/
# ❌ http://app.vercel.app
# ❌ app.vercel.app
```

### Rebuild Frontend
```bash
# Vercel Dashboard:
Deployments → Latest → Redeploy
```

### Restart Backend
```bash
# Render Dashboard:
Manual Deploy → Deploy latest commit
```

### Reset Database (Careful!)
```bash
# In Render Shell:
npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed
```

---

## 📦 Backup Database

### Automatic Backup (Neon)
```
Point-in-time restore: 7 days (automatic)
```

### Manual Backup
```bash
# Get connection string from Neon dashboard
pg_dump "postgresql://user:pass@ep-xxx.neon.tech/dbname" > backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
psql "postgresql://user:pass@ep-xxx.neon.tech/dbname" < backup_20251220.sql
```

---

## 🔍 Debugging Commands

### Check Environment Variables (Render)
```bash
# In Render Shell:
printenv | grep -E "DATABASE_URL|JWT_SECRET|CORS_ORIGIN"
```

### Test Database Connection
```bash
# In Render Shell:
npx prisma db pull
```

### Check Node Version
```bash
node --version
npm --version
```

---

## 📱 PWA Testing

### Lighthouse Audit (Chrome DevTools)
```
F12 → Lighthouse → Progressive Web App → Generate report
```

### Test Service Worker (Console)
```javascript
navigator.serviceWorker.getRegistrations()
```

### Test PWA Installed
```javascript
window.matchMedia('(display-mode: standalone)').matches
```

### Clear Service Worker (If stuck)
```javascript
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
```

---

## 🎯 Essential URLs (Update with Yours)

```bash
# Dashboards
Vercel:  https://vercel.com/dashboard
Render:  https://dashboard.render.com
Neon:    https://console.neon.tech

# Your Production App
Frontend: https://your-app.vercel.app
Backend:  https://your-api.onrender.com/api
Database: Your Neon dashboard

# GitHub
Repo:     https://github.com/yourusername/SchoolManagementApp
```

---

## 💡 Pro Tips

### Keep Render Awake (Optional)
```javascript
// Add to a cron job or external service
setInterval(() => {
  fetch('https://your-render-url.onrender.com/api/health')
}, 14 * 60 * 1000) // Every 14 minutes
```

### Monitor Bandwidth (Vercel)
```
Dashboard → Your Project → Analytics
```

### Monitor Storage (Neon)
```
Console → Your Project → Storage tab
```

---

## 🚨 Emergency Commands

### Force Redeploy Everything
```bash
# 1. Clear Vercel cache
Vercel Dashboard → Settings → Clear cache

# 2. Redeploy Vercel
Deployments → Redeploy

# 3. Redeploy Render
Manual Deploy → Clear build cache → Deploy

# 4. Restart database
Neon Dashboard → Operations → Restart (if needed)
```

### Rollback Deployment
```bash
# Vercel: Go to previous deployment → Promote to Production
# Render: Redeploy a previous commit from dashboard
```

---

## ✅ Post-Deployment Checklist

```bash
# Test these in order:
1. [ ] Backend health: /api/health
2. [ ] Frontend loads
3. [ ] Login works
4. [ ] Dashboard shows
5. [ ] Can create student
6. [ ] Can enter grades
7. [ ] Can generate report
8. [ ] PWA install prompt shows
9. [ ] No console errors
10. [ ] Test on mobile device
```

---

**Save this file for quick reference during deployment!** 📌
