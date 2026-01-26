# 🧪 HOW TO TEST THE NEW PROFILE SYSTEM

**Quick Test Guide - Takes 5 Minutes**

---

## 🚀 Step 1: Start Both Servers

### Terminal 1 - API Server:
```bash
cd api
npm run dev
```
Wait for: `✅ Server running on port 5001`

### Terminal 2 - Frontend:
```bash
npm run dev
```
Wait for: `Ready on http://localhost:3000`

---

## 🧪 Step 2: Test Profile Page

### Get Your User ID:
1. Login to the app
2. Open browser console
3. Type: `localStorage.getItem('token')`
4. Copy your user ID from the token or use your student/teacher ID

### Visit Profile:
```
http://localhost:3000/profile/[YOUR-USER-ID]
```

**What you should see:**
- ✅ Profile header with your name
- ✅ Cover photo area (gradient if no photo)
- ✅ Profile stats (followers, skills, projects, etc.)
- ✅ Four tabs: About, Skills, Projects, Achievements
- ✅ About tab shows learning stats

---

## 🎯 Step 3: Test Skills System (FULLY WORKING!)

### Add a Skill:
1. Click **"Skills"** tab
2. Click **"Add Skill"** button
3. Fill in:
   - Skill Name: `JavaScript`
   - Category: `PROGRAMMING`
   - Level: `INTERMEDIATE`
4. Click **"Add Skill"**
5. ✅ Should see your skill appear!

### View Skill Details:
- ✅ See progress bar (50% for Intermediate)
- ✅ See category badge (blue for Programming)
- ✅ See endorsement count (0 initially)

### Add More Skills:
Try adding:
- `English` (Category: LANGUAGES, Level: ADVANCED)
- `Teaching` (Category: TEACHING, Level: EXPERT)
- `Mathematics` (Category: MATHEMATICS, Level: ADVANCED)

✅ Skills should group by category automatically!

---

## 👥 Step 4: Test Skill Endorsement

### Get Another User:
1. Login as different user (teacher/student)
2. Visit first user's profile
3. Go to Skills tab
4. Click **"Endorse"** button on any skill
5. ✅ Endorsement count increases!

---

## 📊 Step 5: Test API Directly

### Test Skills API:
```bash
# Get skills (replace USER_ID and TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/profile/USER_ID/skills

# Add skill
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skillName":"Python","category":"PROGRAMMING","level":"ADVANCED"}' \
  http://localhost:5001/api/profile/skills

# Endorse skill (replace SKILL_ID)
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Great programmer!"}' \
  http://localhost:5001/api/profile/skills/SKILL_ID/endorse
```

---

## ✅ What Should Work:

### Profile Page:
- [x] Loads without errors
- [x] Shows user info
- [x] Displays stats
- [x] Has 4 tabs
- [x] About tab shows learning stats

### Skills Tab:
- [x] Shows "Add Skill" button (own profile)
- [x] Can add skills successfully
- [x] Skills appear immediately
- [x] Grouped by category
- [x] Progress bars show correctly
- [x] Shows "Endorse" button (other profiles)
- [x] Endorsing works
- [x] Count updates

### API:
- [x] Server starts without errors
- [x] Skills endpoints respond
- [x] Data saves to database
- [x] Profile completion updates

---

## ❌ What Won't Work Yet:

- ❌ Projects tab (shows placeholder)
- ❌ Achievements tab (shows placeholder)
- ❌ No navigation link to profile yet
- ❌ Feed posts don't link to profile yet
- ❌ CreatePost doesn't show new types yet

**These are coming next!**

---

## 🐛 Troubleshooting

### Profile page doesn't load:
- Check if API server is running (port 5001)
- Check browser console for errors
- Verify you're logged in (have token)

### "Add Skill" doesn't work:
- Check browser console for API errors
- Verify token in localStorage
- Check API logs for errors

### Skills don't appear:
- Check if API call succeeded (Network tab)
- Try refreshing the page
- Check database has skills table

### Server errors:
- Run `cd api && npm install` to ensure deps installed
- Check `.env` file has DATABASE_URL
- Verify Prisma migration ran

---

## 📸 Expected Screenshots

### Profile Header:
```
┌─────────────────────────────────────┐
│  [Cover Photo - Gradient]           │
│                                      │
│  ┌──┐                               │
│  │👤│ John Doe                  [Edit]│
│  │L5│ Grade 10 Student              │
│  └──┘ 850 points • Phnom Penh       │
│                                      │
│  Stats: 12 followers • 5 skills     │
│                                      │
│  Profile Completion: 45% ▰▰▰▱▱▱     │
└─────────────────────────────────────┘
```

### Skills Tab:
```
┌─────────────────────────────────────┐
│  Skills & Expertise    [Add Skill]  │
│  5 skills • 2 verified              │
│                                      │
│  [All (5)] [Programming (2)]...     │
│                                      │
│  Programming                         │
│  ┌─────────────────────────────────┐│
│  │ JavaScript         [Endorse]    ││
│  │ Full-stack development          ││
│  │ Intermediate ▰▰▰▱ 50%          ││
│  │ 🏆 3 endorsements               ││
│  └─────────────────────────────────┘│
│                                      │
│  Languages                           │
│  ┌─────────────────────────────────┐│
│  │ English  ✓ Verified            ││
│  │ Advanced ▰▰▰▰ 75%              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## ✅ Success Criteria

You'll know it's working when:
1. Profile page loads with your data ✅
2. You can add a skill ✅
3. Skill appears in the list ✅
4. Progress bar shows correct level ✅
5. Another user can endorse your skill ✅
6. Endorsement count increases ✅
7. Skills group by category ✅
8. Filter buttons work ✅

---

## 🎉 If Everything Works:

**Congratulations!** 🎊

You now have:
- ✅ Working profile system
- ✅ Full skills management (add, view, endorse)
- ✅ Beautiful UI
- ✅ Real API integration
- ✅ Database persistence

**Next:** We'll add Projects section and navigation links!

---

## 📝 Report Issues

If something doesn't work:
1. Check browser console for errors
2. Check API server logs
3. Try the curl commands to test API directly
4. Share the error message

Most common issue: **Token expired** - Just login again!

---

**Happy Testing!** 🚀
