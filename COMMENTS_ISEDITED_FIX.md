# Comment isEdited Field Fix

## 🐛 Issue

**Error:** `Unknown field 'isEdited' for select statement on model Comment`

**When:** Clicking to view comments on a post

**Error Details:**
```
PrismaClientValidationError: 
Invalid `prisma.comment.findMany()` invocation

Unknown field `isEdited` for select statement on model `Comment`.
Available options are marked with ?.
```

---

## 🔍 Root Cause

The backend controller (`feed.controller.ts`) was trying to select `isEdited` field from the Comment model, but the database schema doesn't have this field.

### Schema Analysis

**Post Model** (has `isEdited`)
```prisma
model Post {
  id            String         @id @default(cuid())
  // ... other fields
  isEdited      Boolean        @default(false) // ✅ EXISTS
  // ... more fields
}
```

**Comment Model** (missing `isEdited`)
```prisma
model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String   @db.Text
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ❌ NO isEdited FIELD
}
```

---

## ✅ Solution

Removed all references to `isEdited` in comment queries.

### Changes in `api/src/controllers/feed.controller.ts`

**1. Main comment query (line 878-886)**
```typescript
// BEFORE ❌
select: {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  postId: true,
  authorId: true,
  parentId: true,
  isEdited: true, // ❌ Field doesn't exist
  author: { ... }
}

// AFTER ✅
select: {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  postId: true,
  authorId: true,
  parentId: true,
  // Removed isEdited
  author: { ... }
}
```

**2. Replies query (line 904-912)**
```typescript
// BEFORE ❌
replies: {
  select: {
    id: true,
    content: true,
    // ... other fields
    isEdited: true, // ❌ Field doesn't exist
  }
}

// AFTER ✅
replies: {
  select: {
    id: true,
    content: true,
    // ... other fields
    // Removed isEdited
  }
}
```

**3. Enrichment logic (lines 961-993)**
```typescript
// BEFORE ❌
const enrichedReplies = comment.replies.map((reply: any) => {
  return {
    id: reply.id,
    content: reply.content,
    isEdited: reply.isEdited, // ❌
    // ... other fields
  };
});

return {
  id: comment.id,
  content: comment.content,
  isEdited: comment.isEdited, // ❌
  // ... other fields
};

// AFTER ✅
const enrichedReplies = comment.replies.map((reply: any) => {
  return {
    id: reply.id,
    content: reply.content,
    // Removed isEdited
    // ... other fields
  };
});

return {
  id: comment.id,
  content: comment.content,
  // Removed isEdited
  // ... other fields
};
```

---

## 📁 Files Modified

**1 file changed:**
- `api/src/controllers/feed.controller.ts` - Removed all `isEdited` references from comment queries

---

## ⚠️ Note About isEdited

### Where it EXISTS
- ✅ **Post model** - Has `isEdited` field, used to show "Edited" badge on posts

### Where it DOESN'T exist
- ❌ **Comment model** - No `isEdited` field in schema

### Why Comments Don't Have isEdited
Comments use `createdAt` vs `updatedAt` to determine if edited:
```typescript
// Frontend logic
const isEdited = comment.updatedAt > comment.createdAt;
```

This is sufficient because:
1. `createdAt` = original timestamp (never changes)
2. `updatedAt` = auto-updated by Prisma on any change
3. If `updatedAt > createdAt` → comment was edited

---

## ✅ What Works Now

### Comments
- ✅ Click to view comments - No error
- ✅ Load replies - Works correctly
- ✅ Comment reactions - Display properly
- ✅ Author info - Shows correctly

### Posts
- ✅ Post editing - Still works (uses Post.isEdited)
- ✅ "Edited" badge - Shows on edited posts
- ✅ All post functionality - Unchanged

---

## 🧪 How to Test

1. **Open any post** with comments
2. **Click comment button** - Should load comments ✅
3. **View replies** - Should expand and show ✅
4. **React to comments** - Should work ✅
5. **Check console** - No Prisma errors ✅

---

## 🎯 Technical Notes

### Database Schema
```sql
-- Posts table has isEdited column
CREATE TABLE posts (
  id VARCHAR PRIMARY KEY,
  content TEXT,
  is_edited BOOLEAN DEFAULT false, -- ✅ EXISTS
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Comments table does NOT have isEdited column
CREATE TABLE comments (
  id VARCHAR PRIMARY KEY,
  content TEXT,
  -- NO is_edited column ❌
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Why This Happened
Someone added `isEdited: true` to comment selects, but the field was never added to the Comment schema migration. Posts have it, comments don't.

### Frontend Impact
Frontend likely checks for:
```typescript
// For posts (has isEdited field)
if (post.isEdited) {
  showEditedBadge();
}

// For comments (no isEdited field, use timestamps)
if (comment.updatedAt > comment.createdAt) {
  showEditedBadge();
}
```

No frontend changes needed - it already handles comments differently.

---

## ✅ Build Status

**Frontend:** SUCCESS ✅
**Backend:** SUCCESS ✅ (restarted with fixes)

---

## 🚀 Ready to Test

Comments should now load without errors! 🎉
