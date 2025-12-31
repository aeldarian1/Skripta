# Technical Specifications - Skripta (Studentski Forum)

**Version:** 2.6.2
**Last Updated:** December 31, 2025
**Authors:** Jan Pavić, Damjan Josip Sartori, Marino Listeš

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Routes & Server Actions](#api-routes--server-actions)
6. [Frontend Architecture](#frontend-architecture)
7. [State Management](#state-management)
8. [Styling & Design System](#styling--design-system)
9. [Performance Optimizations](#performance-optimizations)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Environment Variables](#environment-variables)
13. [Build Configuration](#build-configuration)

---

## Tech Stack

### Core Framework
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5.x** - Type safety and better DX

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Row-Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Storage for user uploads
- **@supabase/ssr 0.8.0** - Server-side rendering support
- **@supabase/supabase-js 2.45.0** - JavaScript client

### Styling & UI
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library (Radix UI primitives)
  - @radix-ui/react-progress 1.1.8
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-tabs 1.1.13
- **class-variance-authority 0.7.0** - Component variants
- **tailwindcss-animate 1.0.7** - Animation utilities
- **next-themes 0.4.6** - Dark mode support
- **lucide-react 0.555.0** - Icon library

### Content & Forms
- **react-markdown 10.1.0** - Markdown rendering
- **remark-gfm 4.0.1** - GitHub Flavored Markdown
- **rehype-raw 7.0.0** - Raw HTML in markdown
- **rehype-sanitize 6.0.0** - XSS protection
- **react-syntax-highlighter 16.1.0** - Code syntax highlighting
- **react-hook-form 7.53.0** - Form state management
- **@hookform/resolvers 5.2.2** - Form validation integration
- **zod 4.1.13** - Schema validation

### Media Processing
- **react-easy-crop 5.5.6** - Image cropping
- **react-webcam 7.2.0** - Camera access
- **sharp 0.34.5** - Image optimization

### Email
- **nodemailer 7.0.11** - Email sending

### Monitoring & Analytics
- **@vercel/analytics 1.4.1** - Usage analytics
- **@vercel/speed-insights 1.1.0** - Performance monitoring

### Development Tools
- **ESLint 9.39.1** - Code linting
- **Puppeteer 24.34.0** - PDF generation & browser automation
- **Autoprefixer 10.0.1** - CSS vendor prefixes
- **PostCSS 8** - CSS transformations

---

## Architecture

### App Router Structure

The project uses Next.js 16 App Router with file-system based routing:

```
/app
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── globals.css             # Global styles
├── /auth                   # Authentication routes
│   ├── /login
│   ├── /register
│   └── /reset-password
├── /forum                  # Forum routes
│   ├── /select-university  # University selection
│   ├── /[university]/[faculty]  # Faculty forums
│   ├── /search             # Search functionality
│   └── /user/[username]    # User profiles
├── /admin                  # Admin panel
│   ├── /users
│   ├── /topics
│   ├── /replies
│   └── /analytics
├── /notifications          # Notifications page
├── /messages               # Private messaging
└── /api                    # API routes
    └── /cron               # Scheduled tasks
```

### Rendering Strategy

- **Server Components (RSC)** - Default for data fetching and initial renders
- **Client Components** - Interactive elements (forms, modals, real-time updates)
- **Server Actions** - Form submissions and mutations
- **ISR (Incremental Static Regeneration)** - Cached pages with revalidation

### Data Flow

1. **Server Components** fetch data using Supabase server client
2. **Server Actions** handle mutations (create, update, delete)
3. **Client Components** use Supabase client for real-time updates
4. **Optimistic Updates** for better UX on user interactions
5. **Revalidation** triggers on data mutations

---

## Database Schema

### Core Tables

#### `profiles`
Extended user information linked to `auth.users`:
```sql
- id: uuid (FK to auth.users)
- email: text (unique)
- username: text (unique)
- full_name: text
- avatar_url: text
- bio: text
- university: text
- faculty: text
- study_program: text
- graduation_year: integer
- current_year: integer
- role: user_role (enum: 'student', 'admin')
- reputation: integer (default: 0)
- email_verified: boolean
- follower_count: integer
- following_count: integer
- is_banned: boolean
- ban_reason: text
- banned_until: timestamptz
- warning_count: integer
- created_at: timestamptz
- updated_at: timestamptz
```

#### `universities`
```sql
- id: uuid
- name: text (e.g., "Sveučilište u Zagrebu")
- slug: text (e.g., "zagreb")
- created_at: timestamptz
```

#### `faculties`
```sql
- id: uuid
- university_id: uuid (FK)
- name: text (e.g., "FER")
- slug: text (e.g., "fer")
- created_at: timestamptz
```

#### `categories`
Auto-generated per faculty (6 categories × 12 faculties = 72 total):
```sql
- id: uuid
- faculty_id: uuid (FK)
- name: text (Opće, Pitanja, Studij, Karijera, Tehnologija, Off-topic)
- slug: text
- description: text
- icon: text
- color: text
- order_index: integer
- created_at: timestamptz
```

#### `topics`
```sql
- id: uuid
- title: text
- slug: text (unique)
- content: text (markdown)
- author_id: uuid (FK to profiles)
- category_id: uuid (FK to categories)
- is_pinned: boolean
- is_locked: boolean
- view_count: integer
- reply_count: integer
- last_reply_at: timestamptz
- last_reply_by: uuid (FK to profiles)
- created_at: timestamptz
- updated_at: timestamptz
```

#### `replies`
Threaded comment system:
```sql
- id: uuid
- content: text (markdown)
- author_id: uuid (FK to profiles)
- topic_id: uuid (FK to topics)
- parent_reply_id: uuid (FK to replies, nullable)
- is_solution: boolean
- upvotes: integer
- downvotes: integer
- created_at: timestamptz
- updated_at: timestamptz
```

#### `votes`
User votes tracking:
```sql
- id: uuid
- user_id: uuid (FK to profiles)
- reply_id: uuid (FK to replies)
- vote_type: integer (-1 = downvote, 1 = upvote)
- created_at: timestamptz
- UNIQUE(user_id, reply_id)
```

#### `notifications`
```sql
- id: uuid
- user_id: uuid (FK to profiles)
- type: text (reply, upvote, mention, pin, report_action, etc.)
- title: text
- message: text
- link: text
- read: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

#### `messages`
Private messaging:
```sql
- id: uuid
- sender_id: uuid (FK to profiles)
- recipient_id: uuid (FK to profiles)
- content: text
- read: boolean
- created_at: timestamptz
```

#### `content_reports`
User-generated content moderation:
```sql
- id: uuid
- reporter_id: uuid (FK to profiles)
- reported_user_id: uuid (FK to profiles)
- content_type: text (topic, reply)
- content_id: uuid
- reason: text
- status: text (pending, reviewed, dismissed)
- reviewed_by: uuid (FK to profiles)
- created_at: timestamptz
```

### Indexes

Performance-critical indexes:
```sql
- idx_topics_category ON topics(category_id)
- idx_topics_author ON topics(author_id)
- idx_topics_created_at ON topics(created_at DESC)
- idx_topics_slug ON topics(slug)
- idx_replies_topic ON replies(topic_id)
- idx_replies_author ON replies(author_id)
- idx_replies_created_at ON replies(created_at)
- idx_votes_reply ON votes(reply_id)
- idx_votes_user ON votes(user_id)
- idx_notifications_user ON notifications(user_id)
```

### Database Functions & Triggers

- `handle_new_user()` - Auto-create profile on auth.users insert
- `update_updated_at_column()` - Auto-update timestamps
- `increment_topic_views()` - Track unique views
- `update_reply_count()` - Keep reply counts in sync
- `update_vote_counts()` - Update upvote/downvote counts
- `notify_on_reply()` - Create notification on new reply
- `check_user_timeout()` - Prevent actions from timed-out users

---

## Authentication & Authorization

### Authentication Flow

1. **Supabase Auth** - Email/password authentication
2. **Server-Side Sessions** - Using `@supabase/ssr`
3. **Cookie-based** - HTTP-only cookies for security
4. **Email Verification** - Optional (configurable in Supabase)

### Authorization Levels

#### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  STUDENT = 'student',  // Default role
  ADMIN = 'admin'       // Full platform access
}
```

#### Row-Level Security (RLS)

All tables have RLS policies:

**Profiles:**
- Public: Read all
- Users: Update own profile
- Admins: Update any profile, ban users

**Topics:**
- Public: Read all
- Authenticated: Create
- Author: Update/delete own
- Admins: Update/delete any, pin, lock

**Replies:**
- Public: Read all
- Authenticated: Create
- Author: Update/delete own
- Admins: Delete any

**Votes:**
- Users: Insert/delete own votes
- Public: Read aggregated counts

### Middleware Protection

Server middleware checks authentication for protected routes:
- `/admin/*` - Admin only
- `/forum/*/new` - Authenticated users
- `/messages/*` - Authenticated users
- `/notifications` - Authenticated users

---

## API Routes & Server Actions

### API Routes (`/app/api`)

#### `/api/cron/refresh-stats`
- **Schedule:** Daily at 2:00 AM
- **Function:** Recalculate user reputation, topic view counts
- **Auth:** Vercel Cron secret

#### `/api/cron/weekly-maintenance`
- **Schedule:** Sunday at 3:00 AM
- **Function:** Clean up old notifications, temp data
- **Auth:** Vercel Cron secret

### Server Actions

Located throughout the app, commonly in:
- `/app/actions/` - Shared actions
- Component files - Co-located with forms

**Example actions:**
```typescript
// Create topic
async function createTopicAction(formData: FormData)

// Create reply
async function createReplyAction(formData: FormData)

// Vote on reply
async function voteAction(replyId: string, voteType: 1 | -1)

// Update profile
async function updateProfileAction(data: ProfileUpdateData)

// Admin: Ban user
async function banUserAction(userId: string, reason: string)
```

---

## Frontend Architecture

### Component Organization

```
/components
├── /ui                   # shadcn base components
├── /forum                # Forum-specific components
│   ├── MarkdownEditor.tsx
│   ├── MarkdownRenderer.tsx
│   ├── TopicCard.tsx
│   ├── ReplyForm.tsx
│   └── ReplyList.tsx
├── /auth                 # Auth forms
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── /layout               # Navigation
│   ├── Navbar.tsx
│   └── MobileNav.tsx
├── /notifications        # Notifications
│   ├── NotificationBell.tsx
│   └── NotificationList.tsx
├── /profile              # User profiles
└── /admin                # Admin components
```

### Component Patterns

#### Server Components (Default)
```typescript
// Fetch data directly
async function TopicPage({ params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', params.slug)
    .single();

  return <TopicView topic={topic} />;
}
```

#### Client Components
```typescript
'use client';

export function ReplyForm({ topicId }: { topicId: string }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createReplyAction(new FormData(e.target));
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Optimistic Updates
```typescript
'use client';

export function VoteButton({ replyId, initialVotes }: Props) {
  const [votes, setVotes] = useState(initialVotes);

  const handleVote = async (voteType: 1 | -1) => {
    // Optimistic update
    setVotes(prev => prev + voteType);

    try {
      await voteAction(replyId, voteType);
    } catch {
      // Rollback on error
      setVotes(prev => prev - voteType);
    }
  };

  return <button onClick={() => handleVote(1)}>↑ {votes}</button>;
}
```

---

## State Management

### Server State
- **React Server Components** - Default data fetching
- **Server Actions** - Mutations with automatic revalidation

### Client State
- **React useState** - Local component state
- **React Context** - Theme provider, user context
- **URL State** - Search params, pagination

### Form State
- **react-hook-form** - Form state management
- **Zod** - Schema validation
- **Server Actions** - Form submission

### Real-time Updates
- **Polling** - Notifications (30s interval)
- **Supabase Realtime** - Future: Live chat, presence

---

## Styling & Design System

### Tailwind Configuration

**Custom Colors:**
```javascript
colors: {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  info: 'hsl(var(--info))',
  purple: 'hsl(var(--purple))',
  // ... (see tailwind.config.ts)
}
```

**Custom Animations:**
- `float` - Floating effect (3s infinite)
- `pulse-glow` - Glowing pulse (2s infinite)
- `shake` - Shake effect (0.5s)
- `slide-up` - Slide up entrance (0.3s)
- `slide-down` - Slide down entrance (0.3s)

### Design Tokens

CSS Custom Properties in `globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Responsive Breakpoints

```javascript
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Component Variants (CVA)

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
  }
);
```

---

## Performance Optimizations

### Image Optimization

**Next.js Image Component:**
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  qualities: [75, 85],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

### Package Optimization

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@supabase/supabase-js'
  ],
}
```

### Caching Strategy

- **ISR (Incremental Static Regeneration):**
  ```typescript
  export const revalidate = 60; // Revalidate every 60 seconds
  ```

- **Static Generation:**
  ```typescript
  export async function generateStaticParams() {
    return [{ university: 'zagreb', faculty: 'fer' }];
  }
  ```

### Code Splitting

- **Dynamic Imports:**
  ```typescript
  const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), {
    loading: () => <MarkdownEditorSkeleton />,
    ssr: false,
  });
  ```

### Database Query Optimization

- **Parallel Queries:**
  ```typescript
  const [topics, categories, user] = await Promise.all([
    supabase.from('topics').select(),
    supabase.from('categories').select(),
    supabase.auth.getUser(),
  ]);
  ```

- **Selective Fields:**
  ```typescript
  .select('id, title, author:profiles(username, avatar_url)')
  ```

### Bundle Analysis

- **Production Console Removal:**
  ```javascript
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  }
  ```

---

## Security

### Content Security

1. **Markdown Sanitization**
   - `rehype-sanitize` - Strips dangerous HTML
   - Whitelist-based approach

2. **XSS Protection**
   - All user input sanitized
   - CSP headers (via Next.js)

3. **SQL Injection Prevention**
   - Parameterized queries via Supabase client
   - No raw SQL from user input

### Authentication Security

1. **HTTP-Only Cookies**
   - Session tokens not accessible to JavaScript
   - Automatic CSRF protection

2. **Row-Level Security (RLS)**
   - Database-level authorization
   - Can't bypass with direct API calls

3. **Rate Limiting**
   - Custom rate limiting in `/lib/rate-limit.ts`
   - Prevents spam and abuse

### Content Moderation

1. **Spam Detection** (`/lib/spam-detection.ts`)
   - Duplicate content detection
   - Link spam filtering
   - Croatian profanity filter

2. **User Reports**
   - Community-driven moderation
   - Admin review system

3. **User Timeouts**
   - Temporary bans
   - Automatic enforcement via database triggers

---

## Deployment

### Vercel (Recommended)

**Configuration:**
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-stats",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/weekly-maintenance",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`

### Environment Variables (Production)

Required in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Email credentials (if using Nodemailer)

### Build Process

1. **Type Checking** - TypeScript compilation
2. **Linting** - ESLint checks
3. **Optimization** - Tree-shaking, minification
4. **Image Optimization** - Sharp processing
5. **Route Generation** - Static and dynamic routes

---

## Environment Variables

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional

```env
# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Skripta <noreply@example.com>

# Vercel Cron Secret (auto-generated)
CRON_SECRET=your-cron-secret
```

---

## Build Configuration

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Next.js (`next.config.js`)

**Key Settings:**
- React Strict Mode enabled
- Production source maps disabled
- Console logs removed in production (except errors/warnings)
- Server actions body size: 15MB (for image uploads)
- Allowed origins for server actions (GitHub Codespaces support)

### ESLint (`.eslintrc.json`)

```json
{
  "extends": "next/core-web-vitals"
}
```

### PostCSS (`postcss.config.mjs`)

```javascript
{
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Setup

1. Create Supabase project
2. Run SQL scripts in order:
   - `supabase/schema.sql`
   - `supabase/notifications.sql`
   - `supabase/universities.sql`
   - `supabase/categories-per-faculty.sql`
   - `supabase/migrations/*.sql`

### Testing with Bots

```bash
# Run in Supabase SQL Editor
\i supabase/create_bots_with_content.sql

# Delete bots when done
\i supabase/delete_bot_users.sql
```

---

## Future Improvements

### Planned Features
- [ ] Real-time chat via Supabase Realtime
- [ ] Push notifications (PWA)
- [ ] Email digest system
- [ ] Advanced search (filters, facets)
- [ ] File attachments (PDFs, docs)
- [ ] Polls and surveys
- [ ] User achievements/badges

### Performance
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Query result caching

### DevOps
- [ ] Automated testing (Jest, Playwright)
- [ ] CI/CD pipeline improvements
- [ ] Staging environment
- [ ] Database backups automation

---

## License & Credits

**Project:** Skripta - Hrvatski Studentski Forum
**Authors:** Jan Pavić, Damjan Josip Sartori, Marino Listeš
**Framework:** Next.js (Vercel)
**Backend:** Supabase
**UI Components:** shadcn/ui (Radix UI)

---

**Last Updated:** December 31, 2025
