# Next.js Routing & Architecture Specification

## What Advantages Does Next.js Give This Project?

Based on your forum/skripta codebase, Next.js provides these key advantages:

### 1. **Server-Side Rendering (SSR) & Performance**
- Forum content is rendered on the server before being sent to users
- Better SEO - search engines can index your topics and replies
- Faster initial page loads - users see content immediately
- Example: In `app/admin/page.tsx:77`, the dashboard fetches stats server-side

### 2. **File-Based Routing**
Your entire routing structure is just folders:
```
app/
├── admin/
│   ├── page.tsx          → /admin
│   ├── users/page.tsx    → /admin/users
│   └── topics/page.tsx   → /admin/topics
├── forum/
│   ├── page.tsx          → /forum
│   └── topic/[slug]/page.tsx → /forum/topic/some-topic
└── auth/
    ├── login/page.tsx    → /auth/login
    └── register/page.tsx → /auth/register
```

### 3. **Server Actions** (What You're Using!)
In `app/admin/actions.ts`, you use `'use server'` to create secure backend functions:
```typescript
export async function banUser(userId: string, reason?: string) {
  // This runs ONLY on the server - never exposed to client
  const { adminClient } = await checkAdminAccess();
  // Direct database access, secure operations
}
```

### 4. **Built-in Authentication & Security**
- Server components can check auth before rendering (see `app/admin/layout.tsx:20-39`)
- Credentials never exposed to the client
- CSRF protection built-in for server actions

### 5. **Optimized Image Loading**
- Automatic image optimization
- Lazy loading images
- WebP conversion

### 6. **API Routes Without Express**
- No need for separate backend server
- Server actions replace traditional API endpoints
- Reduced complexity

### 7. **Automatic Code Splitting**
- Each route loads only its needed JavaScript
- Faster navigation between pages
- Smaller bundle sizes

---

## What Are Routes and How Do They Work?

### Routes in Next.js App Router

A **route** is a URL path that maps to a specific page/component. Next.js uses the **file system** as the routing mechanism.

### File System = Routes

```
app/
├── page.tsx              → / (homepage)
├── about/
│   └── page.tsx          → /about
├── forum/
│   ├── page.tsx          → /forum
│   └── topic/
│       └── [slug]/
│           └── page.tsx  → /forum/topic/:slug (dynamic)
```

### Special Files in Next.js

Your project uses these:

| File | Purpose | Example in Your Project |
|------|---------|------------------------|
| `page.tsx` | The actual page content | `app/admin/page.tsx` |
| `layout.tsx` | Wraps multiple pages | `app/admin/layout.tsx:15` (sidebar + nav) |
| `loading.tsx` | Loading state | `app/admin/loading.tsx:3` (skeleton) |
| `error.tsx` | Error handling | `app/forum/error.tsx` |
| `actions.ts` | Server-side functions | `app/admin/actions.ts` |

### How It Works: Concrete Example from Your Project

Let's trace what happens when a user visits `/admin/users`:

**1. File Structure:**
```
app/
└── admin/
    ├── layout.tsx        ← Wraps everything in admin
    ├── loading.tsx       ← Shows while loading
    └── users/
        └── page.tsx      ← The actual users page
```

**2. What Next.js Does:**

```typescript
// Step 1: Check layout (app/admin/layout.tsx:15)
export default async function AdminLayout({ children }) {
  // ✅ Runs on SERVER
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/forum');

  // Return layout with sidebar + children
  return (
    <div>
      <Sidebar /> {/* Desktop sidebar */}
      <MobileNav /> {/* Mobile navigation */}
      <main>{children}</main> {/* users/page.tsx goes here */}
    </div>
  );
}
```

**3. Then Render the Page:**
```typescript
// app/admin/users/page.tsx
export default async function UsersPage() {
  // ✅ Also runs on SERVER
  const users = await fetchUsers(); // Direct DB query

  return <UsersTable users={users} />;
}
```

---

## How Next.js Routes Interplay with React

### The Relationship:

```
Next.js (Framework)
    ↓
Uses React (Library)
    ↓
Adds:
  - Routing (file-based)
  - Server Components
  - Data fetching
  - Optimization
```

### Server Components vs Client Components

**Server Components (Default in App Router):**
```typescript
// app/admin/page.tsx:78
// ✅ No 'use client' = Server Component
export default async function AdminDashboard() {
  const stats = await getAdminStats(); // Direct DB access
  return <div>{stats.totalUsers}</div>;
}
```
- Can use `async/await`
- Access database directly
- No JavaScript sent to client
- Cannot use React hooks (`useState`, `useEffect`)

**Client Components:**
```typescript
// app/admin/admin-error-boundary.tsx:1
'use client'; // ⚡ Marks as client component

export function AdminErrorBoundary({ children }) {
  // Can use React hooks
  // Runs in browser
  // Interactive features
}
```

### Routing Navigation

**In Regular React:** You'd use React Router
```typescript
import { BrowserRouter, Route, Link } from 'react-router-dom';
```

**In Next.js:** Built-in routing
```typescript
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Declarative navigation
<Link href="/admin/users">Users</Link>

// Programmatic navigation (server)
redirect('/auth/login');

// Programmatic navigation (client)
'use client';
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/forum');
```

---

## Key Differences from Pure React

| Feature | Pure React | Next.js + React |
|---------|-----------|----------------|
| **Routing** | External library (React Router) | Built-in (file system) |
| **Rendering** | Client-side only | Server + Client |
| **Data Fetching** | `useEffect` + fetch | Server Components + async |
| **API** | Separate Express server | Server Actions / Route Handlers |
| **SEO** | Poor (SPA) | Excellent (SSR) |
| **Performance** | Client renders everything | Server pre-renders |

---

## Why This Matters for Your Forum

1. **SEO**: Forum topics are indexed by Google (important for student search)
2. **Performance**: Fast initial load (users see content immediately)
3. **Security**: Admin actions run on server (users can't see admin logic)
4. **Simplicity**: No separate API server needed
5. **User Experience**: Smooth navigation, fast page transitions

Your project leverages all these advantages - it's not just a React app, it's a full-stack application with server-side logic, authentication, and database access all in one framework.
