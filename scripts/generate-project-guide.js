// Script to generate a comprehensive PDF guide for the Skripta project
// This creates a detailed explanation of the tech stack and architecture

const fs = require('fs');
const path = require('path');

// We'll generate HTML content that can be easily converted to PDF
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skripta Project - Internal Architecture Guide</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            page-break-before: always;
        }
        h1:first-of-type {
            page-break-before: avoid;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
        }
        h3 {
            color: #1e3a8a;
            margin-top: 20px;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #dc2626;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 0.85em;
            line-height: 1.4;
        }
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        .info-box {
            background: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }
        .success-box {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }
        .concept-box {
            background: #f3e8ff;
            border: 2px solid #9333ea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            text-align: left;
        }
        th {
            background: #f1f5f9;
            font-weight: 600;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        li {
            margin: 5px 0;
        }
        .cover {
            text-align: center;
            padding: 100px 0;
        }
        .cover h1 {
            font-size: 3em;
            border: none;
            margin-bottom: 20px;
        }
        .cover .subtitle {
            font-size: 1.5em;
            color: #64748b;
            margin-bottom: 10px;
        }
        .cover .meta {
            color: #94a3b8;
            margin-top: 50px;
        }
        .toc {
            page-break-after: always;
        }
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        .toc li {
            margin: 8px 0;
        }
        .toc a {
            color: #2563eb;
            text-decoration: none;
        }
        .diagram {
            background: #f8fafc;
            border: 2px solid #cbd5e1;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
            font-family: monospace;
        }
        @media print {
            body {
                padding: 0;
            }
            h1 {
                page-break-after: avoid;
            }
            h2, h3 {
                page-break-after: avoid;
            }
            pre, .info-box, .warning-box, .success-box, .concept-box {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

<div class="cover">
    <h1>Skripta Student Forum</h1>
    <div class="subtitle">Internal Architecture Guide</div>
    <div class="subtitle">Understanding the Tech Stack & How It All Works</div>
    <div class="meta">
        <p><strong>Project:</strong> Croatian University Student Forum</p>
        <p><strong>Tech Stack:</strong> Next.js 16 | React 19 | TypeScript | Supabase | Tailwind CSS</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
</div>

<div class="toc">
    <h1>Table of Contents</h1>
    <ul>
        <li><strong>1. Project Overview</strong> - What is this project?</li>
        <li><strong>2. Technology Stack Explained</strong> - Understanding each technology</li>
        <li><strong>3. Architecture Overview</strong> - How everything fits together</li>
        <li><strong>4. How the Application Works</strong> - Request flow and data flow</li>
        <li><strong>5. Key Features Explained</strong> - Forum, Auth, Notifications</li>
        <li><strong>6. Database & Data Model</strong> - How data is stored</li>
        <li><strong>7. Common Patterns & Examples</strong> - Real code examples</li>
        <li><strong>8. Glossary</strong> - Important terms explained</li>
    </ul>
</div>

<h1>1. Project Overview</h1>

<h2>What is Skripta?</h2>

<p><strong>Skripta</strong> is an online forum platform designed specifically for students at Croatian universities. Think of it like Reddit or a traditional forum, but focused on academic discussions.</p>

<div class="info-box">
    <strong>Main Purpose:</strong> Students can discuss courses, ask questions, share study materials, and connect with peers from their university and faculty.
</div>

<h3>Hierarchical Structure</h3>

<p>The forum is organized in a three-level hierarchy:</p>

<div class="diagram">
<pre>
Universities (4 total)
    ├── Zagreb
    ├── Split
    ├── Rijeka
    └── Osijek
        │
        ├── Faculties (12 total, 3 per university)
        │   ├── FER (Faculty of Electrical Engineering)
        │   ├── PMF (Faculty of Science)
        │   └── Others...
        │       │
        │       ├── Categories (72 total, 6 per faculty)
        │       │   ├── General Discussion
        │       │   ├── Questions & Help
        │       │   ├── Study Materials
        │       │   ├── Career & Jobs
        │       │   ├── Technology
        │       │   └── Off-topic
        │       │       │
        │       │       ├── Topics (Posts/Threads)
        │       │       │   │
        │       │       │   └── Replies (Comments)
</pre>
</div>

<h3>Core Features</h3>

<table>
    <thead>
        <tr>
            <th>Feature</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Authentication</strong></td>
            <td>Users register with email verification, login securely</td>
        </tr>
        <tr>
            <td><strong>Forum Posts</strong></td>
            <td>Create topics (threads), write replies (comments)</td>
        </tr>
        <tr>
            <td><strong>Voting System</strong></td>
            <td>Upvote/downvote replies, reputation system</td>
        </tr>
        <tr>
            <td><strong>Notifications</strong></td>
            <td>Get notified of replies, upvotes, mentions</td>
        </tr>
        <tr>
            <td><strong>User Profiles</strong></td>
            <td>View stats, academic info, post history</td>
        </tr>
        <tr>
            <td><strong>Admin Panel</strong></td>
            <td>Moderate content, manage users, view analytics</td>
        </tr>
        <tr>
            <td><strong>Search</strong></td>
            <td>Full-text search across all topics</td>
        </tr>
        <tr>
            <td><strong>Markdown Support</strong></td>
            <td>Rich text formatting with code highlighting</td>
        </tr>
    </tbody>
</table>

<h1>2. Technology Stack Explained</h1>

<p>This section explains each technology used in the project in simple terms.</p>

<h2>2.1 Frontend Technologies</h2>

<h3>React (v19.2.3)</h3>

<div class="concept-box">
    <h4>What is React?</h4>
    <p><strong>React</strong> is a JavaScript library for building user interfaces. Instead of manipulating HTML directly, you create reusable <strong>components</strong>.</p>

    <p><strong>Think of it like:</strong> Building with LEGO blocks. Each block (component) is reusable and can be combined to create complex structures.</p>
</div>

<p><strong>Example:</strong> A button component</p>

<pre><code>function Button({ text, onClick }) {
  return (
    &lt;button className="bg-blue-500 text-white px-4 py-2" onClick={onClick}&gt;
      {text}
    &lt;/button&gt;
  );
}

// Use it multiple times
&lt;Button text="Submit" onClick={handleSubmit} /&gt;
&lt;Button text="Cancel" onClick={handleCancel} /&gt;
</code></pre>

<div class="info-box">
    <strong>Key React Concepts Used in Skripta:</strong>
    <ul>
        <li><strong>Components:</strong> Reusable UI pieces (TopicCard, ReplyForm, Navbar)</li>
        <li><strong>State:</strong> Data that changes over time (form inputs, voting state)</li>
        <li><strong>Props:</strong> Passing data from parent to child components</li>
        <li><strong>Hooks:</strong> Special functions like <code>useState</code>, <code>useEffect</code></li>
    </ul>
</div>

<h3>Next.js (v16.1.1)</h3>

<div class="concept-box">
    <h4>What is Next.js?</h4>
    <p><strong>Next.js</strong> is a framework built on top of React that adds powerful features like:</p>
    <ul>
        <li><strong>Server-Side Rendering (SSR):</strong> Pages are generated on the server before being sent to the browser</li>
        <li><strong>File-based Routing:</strong> Create a file, get a route automatically</li>
        <li><strong>API Routes:</strong> Build backend endpoints alongside your frontend</li>
        <li><strong>Performance Optimizations:</strong> Automatic code splitting, image optimization</li>
    </ul>

    <p><strong>Think of it like:</strong> React is a car engine, Next.js is the entire car with steering wheel, brakes, GPS, etc.</p>
</div>

<h4>App Router (Next.js 16 Feature)</h4>

<p>The project uses Next.js's newest routing system called the <strong>App Router</strong>.</p>

<div class="diagram">
<pre>
File Structure → URL Routes

app/
├── page.tsx                      → /
├── forum/
│   ├── page.tsx                  → /forum
│   ├── [university]/
│   │   └── [faculty]/
│   │       ├── page.tsx          → /forum/zagreb/fer
│   │       └── topic/
│   │           └── [slug]/
│   │               └── page.tsx  → /forum/zagreb/fer/topic/my-first-post
│   └── search/
│       └── page.tsx              → /forum/search
└── admin/
    └── page.tsx                  → /admin
</pre>
</div>

<div class="warning-box">
    <strong>Important Concept: Dynamic Routes</strong>
    <p>Folders with brackets like <code>[university]</code> or <code>[slug]</code> are <strong>dynamic segments</strong>.</p>
    <ul>
        <li><code>[university]</code> can match "zagreb", "split", "rijeka", or "osijek"</li>
        <li><code>[slug]</code> can match any topic slug like "how-to-learn-react"</li>
    </ul>
    <p>The matched value becomes available as a parameter in your code.</p>
</div>

<h4>Server Components vs Client Components</h4>

<p>Next.js 16 introduces a fundamental distinction:</p>

<table>
    <thead>
        <tr>
            <th>Server Components</th>
            <th>Client Components</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Run ONLY on the server</td>
            <td>Run in the browser (and on server during SSR)</td>
        </tr>
        <tr>
            <td>Can directly access databases</td>
            <td>Cannot access databases directly</td>
        </tr>
        <tr>
            <td>No JavaScript sent to browser</td>
            <td>JavaScript sent to browser</td>
        </tr>
        <tr>
            <td>Cannot use useState, useEffect</td>
            <td>Can use all React hooks</td>
        </tr>
        <tr>
            <td>Default in App Router</td>
            <td>Need <code>'use client'</code> directive</td>
        </tr>
        <tr>
            <td><strong>Example:</strong> Fetching topics from database</td>
            <td><strong>Example:</strong> Vote button with click handler</td>
        </tr>
    </tbody>
</table>

<div class="success-box">
    <strong>Why This Matters:</strong>
    <ul>
        <li>Server Components are faster (less JavaScript to download)</li>
        <li>Server Components are more secure (sensitive logic stays on server)</li>
        <li>Client Components enable interactivity (buttons, forms, animations)</li>
    </ul>
</div>

<h3>TypeScript (v5)</h3>

<div class="concept-box">
    <h4>What is TypeScript?</h4>
    <p><strong>TypeScript</strong> is JavaScript with <strong>types</strong>. It catches bugs before runtime.</p>

    <p><strong>JavaScript (no types):</strong></p>
    <pre><code>function addNumbers(a, b) {
  return a + b;
}

addNumbers(5, "10");  // Returns "510" (string concatenation!) - BUG!</code></pre>

    <p><strong>TypeScript (with types):</strong></p>
    <pre><code>function addNumbers(a: number, b: number): number {
  return a + b;
}

addNumbers(5, "10");  // ❌ ERROR: Argument of type 'string' is not assignable to parameter of type 'number'</code></pre>
</div>

<p><strong>In Skripta:</strong> TypeScript ensures data shapes match database schemas, preventing bugs.</p>

<pre><code>// types/database.ts
export interface Topic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  category_id: string;
  upvotes: number;
  reply_count: number;
}

// Now you can't accidentally misspell or use wrong types
const topic: Topic = {
  title: "My First Post",
  content: "Hello world!",
  // ... must include all required fields with correct types
};</code></pre>

<h3>Tailwind CSS (v3.4.18)</h3>

<div class="concept-box">
    <h4>What is Tailwind CSS?</h4>
    <p><strong>Tailwind</strong> is a utility-first CSS framework. Instead of writing custom CSS, you use pre-defined utility classes.</p>

    <p><strong>Traditional CSS:</strong></p>
    <pre><code>&lt;button class="submit-button"&gt;Submit&lt;/button&gt;

&lt;style&gt;
.submit-button {
  background-color: blue;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
&lt;/style&gt;</code></pre>

    <p><strong>Tailwind CSS:</strong></p>
    <pre><code>&lt;button class="bg-blue-500 text-white px-4 py-2 rounded"&gt;Submit&lt;/button&gt;</code></pre>
</div>

<div class="info-box">
    <strong>Tailwind Classes Used in Skripta:</strong>
    <ul>
        <li><code>bg-blue-500</code> - Background color blue</li>
        <li><code>text-white</code> - White text color</li>
        <li><code>px-4 py-2</code> - Padding (4 units horizontal, 2 vertical)</li>
        <li><code>rounded</code> - Rounded corners</li>
        <li><code>hover:bg-blue-600</code> - Darker blue on hover</li>
        <li><code>dark:bg-gray-800</code> - Different color in dark mode</li>
    </ul>
</div>

<h2>2.2 Backend Technologies</h2>

<h3>Supabase</h3>

<div class="concept-box">
    <h4>What is Supabase?</h4>
    <p><strong>Supabase</strong> is a "Backend-as-a-Service" (BaaS) platform. It provides:</p>
    <ul>
        <li><strong>PostgreSQL Database:</strong> Store all your data</li>
        <li><strong>Authentication:</strong> User login, registration, password reset</li>
        <li><strong>Storage:</strong> Upload files (avatars, attachments)</li>
        <li><strong>Real-time:</strong> Live updates when data changes</li>
        <li><strong>Auto-generated APIs:</strong> Access your database via REST or GraphQL</li>
    </ul>

    <p><strong>Think of it like:</strong> Firebase alternative, but with a real PostgreSQL database you can access with SQL.</p>
</div>

<h4>Supabase Client Types in Skripta</h4>

<p>The project uses <strong>three different Supabase clients</strong> depending on the context:</p>

<table>
    <thead>
        <tr>
            <th>Client Type</th>
            <th>Where Used</th>
            <th>Purpose</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Server Client</strong></td>
            <td>Server Components, Server Actions</td>
            <td>Access database with user's authentication, respects Row Level Security</td>
        </tr>
        <tr>
            <td><strong>Browser Client</strong></td>
            <td>Client Components</td>
            <td>Interactive features, real-time updates in browser</td>
        </tr>
        <tr>
            <td><strong>Service Role Client</strong></td>
            <td>Admin operations</td>
            <td>Bypass Row Level Security for admin tasks</td>
        </tr>
    </tbody>
</table>

<div class="warning-box">
    <strong>Row Level Security (RLS):</strong>
    <p>RLS is a PostgreSQL feature that enforces data access rules at the database level.</p>
    <p><strong>Example:</strong> A policy might say "users can only edit their own posts". Even if someone tries to hack the API, the database itself will reject unauthorized edits.</p>
</div>

<h3>PostgreSQL Database</h3>

<div class="concept-box">
    <h4>What is PostgreSQL?</h4>
    <p><strong>PostgreSQL</strong> (or "Postgres") is a powerful, open-source relational database.</p>

    <p><strong>Relational Database:</strong> Data is organized in tables with rows and columns, like Excel spreadsheets. Tables can relate to each other.</p>
</div>

<p><strong>Example Tables in Skripta:</strong></p>

<div class="diagram">
<pre>
profiles table:
┌──────────┬──────────┬────────────┬───────┐
│ id       │ username │ email      │ role  │
├──────────┼──────────┼────────────┼───────┤
│ user-123 │ john_doe │ john@ex... │ student│
│ user-456 │ jane_sm  │ jane@ex... │ admin │
└──────────┴──────────┴────────────┴───────┘

topics table:
┌──────────┬───────────────┬────────────┬───────────────┐
│ id       │ title         │ content    │ author_id     │
├──────────┼───────────────┼────────────┼───────────────┤
│ topic-1  │ How to React? │ I need...  │ user-123      │
│ topic-2  │ Database tips │ Here's ... │ user-456      │
└──────────┴───────────────┴────────────┴───────────────┘
                                           │
                                           └─→ Relates to profiles.id
</pre>
</div>

<h2>2.3 Additional Libraries</h2>

<h3>Zod (v4.1.13)</h3>

<div class="concept-box">
    <h4>What is Zod?</h4>
    <p><strong>Zod</strong> is a TypeScript-first schema validation library. It validates data at runtime.</p>

    <p><strong>Why needed?</strong> TypeScript only checks types during development. Zod checks types when your app is actually running (e.g., validating user input from forms).</p>
</div>

<p><strong>Example: Registration Form Validation</strong></p>

<pre><code>import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, _ and - allowed'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

// Validate user input
const result = registerSchema.safeParse({
  email: 'test@example.com',
  username: 'john123',
  password: 'SecurePass1',
});

if (!result.success) {
  console.log(result.error.issues); // Array of validation errors
}</code></pre>

<h3>React Markdown</h3>

<div class="concept-box">
    <h4>What is Markdown?</h4>
    <p><strong>Markdown</strong> is a simple markup language for formatting text.</p>

    <p><strong>Markdown syntax:</strong></p>
    <pre><code># Heading
**bold text**
*italic text*
[link](https://example.com)

\`\`\`javascript
function hello() {
  console.log("Code block!");
}
\`\`\`</code></pre>

    <p>The <strong>react-markdown</strong> library converts this into styled HTML.</p>
</div>

<div class="info-box">
    <strong>In Skripta:</strong> Users can write posts using Markdown for formatting. The library includes:
    <ul>
        <li><code>remark-gfm</code> - GitHub Flavored Markdown (tables, task lists)</li>
        <li><code>rehype-sanitize</code> - Prevents XSS attacks by cleaning malicious HTML</li>
        <li><code>react-syntax-highlighter</code> - Syntax highlighting for code blocks</li>
    </ul>
</div>

<h3>shadcn/ui</h3>

<div class="concept-box">
    <h4>What is shadcn/ui?</h4>
    <p><strong>shadcn/ui</strong> is a collection of reusable, accessible UI components built with Radix UI and Tailwind CSS.</p>

    <p><strong>Unlike traditional libraries:</strong> Components are copied into your project, so you have full control to customize them.</p>
</div>

<p><strong>Components used in Skripta:</strong></p>
<ul>
    <li><code>Button</code> - Buttons with variants (primary, secondary, ghost)</li>
    <li><code>Input</code> - Text inputs with validation states</li>
    <li><code>Card</code> - Container for topic cards, reply cards</li>
    <li><code>Tabs</code> - Tab navigation for profile pages</li>
    <li><code>Select</code> - Dropdown menus (university/faculty selection)</li>
    <li><code>Progress</code> - Loading indicators</li>
</ul>

<h1>3. Architecture Overview</h1>

<h2>3.1 The Big Picture</h2>

<div class="diagram">
<pre>
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │            React Components (Client & Server)             │ │
│  │  - Navigation Bar    - Topic Cards    - Reply Forms       │ │
│  │  - Vote Buttons      - Notifications  - User Profiles     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ▲                                  │
│                              │  HTML + JavaScript               │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER (Vercel)                    │
│                                                                 │
│  ┌────────────────────┐      ┌────────────────────────────┐    │
│  │   Middleware       │      │   Server Components        │    │
│  │ - Auth Check       │      │ - Fetch Data from DB       │    │
│  │ - Route Protection │      │ - Render Initial HTML      │    │
│  └────────────────────┘      └────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Server Actions                             │   │
│  │  - Handle Form Submissions  - Create/Edit/Delete Posts  │   │
│  │  - Vote on Replies          - Send Notifications        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                  │
│                              │  SQL Queries                     │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE (Backend)                        │
│                                                                 │
│  ┌────────────────────┐      ┌────────────────────────────┐    │
│  │  PostgreSQL DB     │      │   Authentication           │    │
│  │ - profiles         │      │ - User Sign Up/Login       │    │
│  │ - topics           │      │ - Email Verification       │    │
│  │ - replies          │      │ - Password Reset           │    │
│  │ - notifications    │      │ - Session Management       │    │
│  │ - votes            │      └────────────────────────────┘    │
│  │ - categories       │                                        │
│  │ - universities     │      ┌────────────────────────────┐    │
│  │ - faculties        │      │   Storage                  │    │
│  └────────────────────┘      │ - User Avatars             │    │
│                              │ - Topic Attachments        │    │
│  ┌────────────────────┐      └────────────────────────────┘    │
│  │  Row Level Security│                                        │
│  │  - Access Policies │      ┌────────────────────────────┐    │
│  │  - Data Protection │      │   Realtime                 │    │
│  └────────────────────┘      │ - Typing Indicators        │    │
│                              │ - Live Updates             │    │
│                              └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
</pre>
</div>

<h2>3.2 Request Flow - What Happens When You Visit a Page</h2>

<div class="success-box">
    <h4>Example: User visits <code>/forum/zagreb/fer/topic/how-to-learn-react</code></h4>
</div>

<p><strong>Step-by-Step Breakdown:</strong></p>

<ol>
    <li>
        <strong>Browser sends request to Next.js server</strong>
        <ul>
            <li>User clicks link or types URL</li>
            <li>HTTP GET request sent to server</li>
        </ul>
    </li>

    <li>
        <strong>Middleware intercepts request</strong>
        <pre><code>// lib/supabase/middleware.ts
export async function updateSession(request) {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // If accessing /forum/* and not logged in → redirect to /auth/login
  if (!user && request.nextUrl.pathname.startsWith('/forum')) {
    return NextResponse.redirect('/auth/login');
  }

  // If user exists, check email verification
  if (user && !user.email_confirmed_at) {
    return NextResponse.redirect('/auth/verify-email');
  }

  // Check if user is banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.redirect('/auth/banned');
  }

  // All checks passed, continue to page
  return response;
}</code></pre>
    </li>

    <li>
        <strong>Next.js finds the matching page component</strong>
        <ul>
            <li>Looks for <code>app/forum/[university]/[faculty]/topic/[slug]/page.tsx</code></li>
            <li>Extracts parameters: <code>university = "zagreb"</code>, <code>faculty = "fer"</code>, <code>slug = "how-to-learn-react"</code></li>
        </ul>
    </li>

    <li>
        <strong>Server Component fetches data</strong>
        <pre><code>// app/forum/[university]/[faculty]/topic/[slug]/page.tsx
export default async function TopicPage({ params }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch topic, replies, and other data IN PARALLEL
  const [topicData, repliesData, categoriesData] = await Promise.all([
    supabase
      .from('topics')
      .select('*, author:profiles(*), category:categories(*)')
      .eq('slug', params.slug)
      .single(),

    supabase
      .from('replies')
      .select('*, author:profiles(*), attachments(*)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true }),

    supabase
      .from('categories')
      .select('*')
      .eq('faculty_id', facultyId)
  ]);

  // Render the page with data
  return (
    &lt;TopicContent
      topic={topicData}
      replies={repliesData}
      currentUser={user}
    /&gt;
  );
}</code></pre>
    </li>

    <li>
        <strong>Server renders HTML</strong>
        <ul>
            <li>Server Components generate HTML with the fetched data</li>
            <li>Client Components are marked for hydration</li>
            <li>Full HTML page is generated</li>
        </ul>
    </li>

    <li>
        <strong>HTML + JavaScript sent to browser</strong>
        <ul>
            <li>Browser receives complete HTML (fast First Contentful Paint)</li>
            <li>JavaScript for Client Components is downloaded</li>
            <li>React "hydrates" the page (makes it interactive)</li>
        </ul>
    </li>

    <li>
        <strong>Page becomes interactive</strong>
        <ul>
            <li>Vote buttons become clickable</li>
            <li>Reply form can accept input</li>
            <li>Notification bell starts polling</li>
        </ul>
    </li>
</ol>

<h2>3.3 Data Flow - How User Actions Work</h2>

<div class="success-box">
    <h4>Example: User upvotes a reply</h4>
</div>

<p><strong>Step-by-Step Breakdown:</strong></p>

<ol>
    <li>
        <strong>User clicks upvote button</strong>
        <pre><code>// components/forum/reply-card.tsx (Client Component)
'use client';

export function ReplyCard({ reply, currentUserId }) {
  const [optimisticVote, setOptimisticVote] = useState(reply.user_vote?.vote_type);

  async function handleUpvote() {
    // Optimistic update (instant UI feedback)
    setOptimisticVote(1);

    // Call server action
    await voteOnReply(reply.id, 1);

    // Refresh page data
    router.refresh();
  }

  return (
    &lt;button onClick={handleUpvote}&gt;
      ↑ {reply.upvotes}
    &lt;/button&gt;
  );
}</code></pre>
    </li>

    <li>
        <strong>Server Action processes the vote</strong>
        <pre><code>// app/forum/actions.ts
'use server';

export async function voteOnReply(replyId: string, voteType: number) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Upsert vote (insert or update if exists)
  const { error } = await supabase
    .from('votes')
    .upsert({
      user_id: user.id,
      reply_id: replyId,
      vote_type: voteType,
    }, {
      onConflict: 'user_id,reply_id'
    });

  if (error) {
    return { error: error.message };
  }

  // Success! Database triggers will handle the rest
  revalidatePath('/forum/topic/[slug]');
  return { success: true };
}</code></pre>
    </li>

    <li>
        <strong>Database triggers fire</strong>
        <pre><code>-- Database trigger on votes table
CREATE TRIGGER update_reply_vote_count
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_reply_votes();

-- Trigger function
CREATE FUNCTION update_reply_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate upvotes and downvotes for the reply
  UPDATE replies
  SET
    upvotes = (SELECT COUNT(*) FROM votes WHERE reply_id = NEW.reply_id AND vote_type = 1),
    downvotes = (SELECT COUNT(*) FROM votes WHERE reply_id = NEW.reply_id AND vote_type = -1)
  WHERE id = NEW.reply_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;</code></pre>
    </li>

    <li>
        <strong>Notification created</strong>
        <pre><code>-- Another trigger creates notification for reply author
CREATE TRIGGER create_upvote_notification
AFTER INSERT ON votes
FOR EACH ROW
WHEN (NEW.vote_type = 1)
EXECUTE FUNCTION create_notification_for_upvote();</code></pre>
    </li>

    <li>
        <strong>Page revalidates and updates</strong>
        <ul>
            <li><code>router.refresh()</code> re-fetches data from the server</li>
            <li>Updated vote count appears</li>
            <li>Reply author gets notification</li>
        </ul>
    </li>
</ol>

<h1>4. How the Application Works</h1>

<h2>4.1 Authentication System</h2>

<h3>User Registration Flow</h3>

<div class="diagram">
<pre>
User fills form → Client validation → Server Action
    │                    │                  │
    │                    ├─→ Zod schema     │
    │                    └─→ Check errors   │
    │                                       │
    │                                       ▼
    │                         Check username/email available
    │                                       │
    │                                       ▼
    │                         Create auth user (Supabase Auth)
    │                                       │
    │                                       ▼
    │                         Database trigger creates profile
    │                                       │
    │                                       ▼
    │                         Generate 6-digit verification code
    │                                       │
    │                                       ▼
    │                         Send email via Nodemailer
    │                                       │
    │                                       ▼
    │                         Redirect to /auth/verify-email
</pre>
</div>

<p><strong>Code Example - Registration Form:</strong></p>

<pre><code>// app/auth/register/page.tsx
'use client';

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, undefined);

  return (
    &lt;form action={formAction}&gt;
      &lt;input name="email" type="email" required /&gt;
      &lt;input name="username" type="text" required /&gt;
      &lt;input name="password" type="password" required /&gt;

      {state?.error && &lt;p className="text-red-500"&gt;{state.error}&lt;/p&gt;}

      &lt;button type="submit"&gt;Register&lt;/button&gt;
    &lt;/form&gt;
  );
}

// app/auth/actions.ts
'use server';

export async function register(prevState: any, formData: FormData) {
  // 1. Extract form data
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // 2. Validate with Zod
  const validation = registerSchema.safeParse({ email, username, password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 3. Check if username/email already exists
  const supabase = await createServerSupabaseClient();
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username, email')
    .or(\`username.eq.\${username},email.eq.\${email}\`)
    .single();

  if (existingUser) {
    return { error: 'Username or email already taken' };
  }

  // 4. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username } // Metadata
    }
  });

  if (error) {
    return { error: error.message };
  }

  // 5. Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await supabase.from('email_verification_tokens').insert({
    user_id: data.user!.id,
    token: code,
    expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });

  // 6. Send verification email
  await sendVerificationEmail(email, code);

  // 7. Redirect
  redirect('/auth/verify-email');
}</code></pre>

<h3>Session Management</h3>

<div class="info-box">
    <strong>How Sessions Work:</strong>
    <ol>
        <li>User logs in → Supabase creates session token</li>
        <li>Session stored in HTTP-only cookies (secure, not accessible by JavaScript)</li>
        <li>Middleware checks session on every request</li>
        <li>Server Components can access user via <code>supabase.auth.getUser()</code></li>
        <li>Session automatically refreshes before expiry</li>
    </ol>
</div>

<h2>4.2 Forum Features</h2>

<h3>Creating a Topic</h3>

<div class="diagram">
<pre>
User clicks "New Topic" → Fill form (title, content, category)
    │                            │
    │                            ├─→ Markdown preview (live)
    │                            └─→ Spam detection (client-side)
    │
    ▼
Submit form → Server Action validates
    │                  │
    │                  ├─→ Check rate limiting (3 topics/hour max)
    │                  ├─→ Content moderation (profanity filter)
    │                  └─→ Spam detection (server-side)
    │
    ▼
Create topic in database
    │
    ├─→ Generate slug from title ("How to React?" → "how-to-react")
    ├─→ Upload attachments to Supabase Storage
    ├─→ Process @mentions → create notifications
    └─→ Update user stats (topic_count++)
    │
    ▼
Redirect to /forum/[university]/[faculty]/topic/[slug]
</pre>
</div>

<p><strong>Code Example - Topic Creation:</strong></p>

<pre><code>// app/forum/actions.ts
'use server';

export async function createTopic(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const categoryId = formData.get('category_id') as string;

  // Validate
  const validation = topicSchema.safeParse({ title, content, categoryId });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Rate limiting check
  const recentTopics = await supabase
    .from('topics')
    .select('id')
    .eq('author_id', user.id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .count();

  if (recentTopics.count >= 3) {
    return { error: 'You can only create 3 topics per hour' };
  }

  // Spam detection
  const spamResult = detectSpam(content);
  if (spamResult.isSpam) {
    return { error: \`Spam detected: \${spamResult.reason}\` };
  }

  // Content moderation
  const moderation = await moderateContent({ content, userId: user.id, contentType: 'topic' });
  if (!moderation.approved) {
    return { error: \`Content rejected: \${moderation.reason}\` };
  }

  // Generate slug
  const slug = generateSlug(title);

  // Create topic
  const { data: topic, error } = await supabase
    .from('topics')
    .insert({
      title,
      content: moderation.content, // May be censored
      slug,
      author_id: user.id,
      category_id: categoryId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Process mentions
  const mentions = extractMentions(content);
  if (mentions.length > 0) {
    await createMentionNotifications(mentions, topic.id, user.id);
  }

  // Redirect to new topic
  revalidatePath('/forum');
  redirect(\`/forum/\${university}/\${faculty}/topic/\${slug}\`);
}</code></pre>

<h3>Reply System</h3>

<div class="info-box">
    <strong>Key Features:</strong>
    <ul>
        <li><strong>Threaded replies:</strong> Replies can have replies (parent_reply_id)</li>
        <li><strong>Voting:</strong> Each reply can be upvoted/downvoted</li>
        <li><strong>Solution marking:</strong> Topic author can mark a reply as the solution</li>
        <li><strong>Editing:</strong> Authors can edit their replies within 15 minutes</li>
        <li><strong>Attachments:</strong> Upload files (images, PDFs) up to 5MB</li>
    </ul>
</div>

<h3>Voting System</h3>

<p>The voting system uses a clever database design:</p>

<pre><code>-- votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  reply_id UUID REFERENCES replies(id),
  vote_type INTEGER, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP,

  UNIQUE(user_id, reply_id) -- User can only vote once per reply
);

-- replies table has computed columns
CREATE TABLE replies (
  id UUID PRIMARY KEY,
  content TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  -- ... other fields
);

-- Trigger keeps counts in sync
CREATE TRIGGER update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION recalculate_vote_counts();</code></pre>

<div class="success-box">
    <strong>Why This Design?</strong>
    <ul>
        <li>Fast reads: Vote counts are pre-calculated, no need to COUNT(*) on every page load</li>
        <li>Prevents double voting: UNIQUE constraint ensures one vote per user per reply</li>
        <li>Easy to change vote: UPDATE instead of INSERT</li>
        <li>Accurate counts: Triggers keep data consistent</li>
    </ul>
</div>

<h2>4.3 Notification System</h2>

<h3>How Notifications Are Created</h3>

<p>Notifications are created in <strong>three ways</strong>:</p>

<table>
    <thead>
        <tr>
            <th>Trigger Method</th>
            <th>Example</th>
            <th>Implementation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Database Triggers</strong></td>
            <td>New reply on a topic</td>
            <td>Postgres function fires automatically</td>
        </tr>
        <tr>
            <td><strong>Server Actions</strong></td>
            <td>User @mentions someone</td>
            <td>Explicit call to <code>createNotification()</code></td>
        </tr>
        <tr>
            <td><strong>Admin Actions</strong></td>
            <td>Topic pinned by admin</td>
            <td>Admin panel action creates notification</td>
        </tr>
    </tbody>
</table>

<p><strong>Database Trigger Example:</strong></p>

<pre><code>-- Create notification when someone replies to a topic
CREATE FUNCTION notify_topic_author()
RETURNS TRIGGER AS $$
BEGIN
  -- Get topic author
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    link,
    is_read
  )
  SELECT
    t.author_id,
    'reply_to_topic',
    'New reply on your topic',
    p.username || ' replied to: ' || t.title,
    '/forum/topic/' || t.slug,
    false
  FROM topics t
  JOIN profiles p ON p.id = NEW.author_id
  WHERE t.id = NEW.topic_id
    AND t.author_id != NEW.author_id; -- Don't notify yourself

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_reply_notification
AFTER INSERT ON replies
FOR EACH ROW
EXECUTE FUNCTION notify_topic_author();</code></pre>

<h3>How Notifications Are Delivered</h3>

<div class="diagram">
<pre>
Server Component (Navbar)
    │
    ├─→ Fetches initial notifications from DB
    │   SELECT * FROM notifications
    │   WHERE user_id = current_user
    │   ORDER BY created_at DESC
    │   LIMIT 10
    │
    ▼
Pass to Client Component (NotificationBell)
    │
    ├─→ Shows unread count badge
    ├─→ Dropdown with recent notifications
    │
    ▼
Every 30 seconds: Poll for new notifications
    │
    ├─→ Fetch notifications created after last check
    ├─→ Update badge count
    └─→ Show toast for new notifications
    │
    ▼
User clicks notification
    │
    ├─→ Mark as read (UPDATE notifications SET is_read = true)
    └─→ Navigate to link
</pre>
</div>

<p><strong>Code Example - Notification Bell:</strong></p>

<pre><code>// components/layout/navbar.tsx (Server Component)
export async function Navbar() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return &lt;NavbarLoggedOut /&gt;;

  // Fetch initial notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    &lt;nav&gt;
      &lt;NotificationBell
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
        userId={user.id}
      /&gt;
    &lt;/nav&gt;
  );
}

// components/notifications/notification-bell.tsx (Client Component)
'use client';

export function NotificationBell({ initialNotifications, initialUnreadCount, userId }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [lastChecked, setLastChecked] = useState(new Date());

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data: newNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', lastChecked.toISOString())
        .order('created_at', { ascending: false });

      if (newNotifications && newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);

        // Show toast notification
        toast(\`You have \${newNotifications.length} new notification(s)\`);
      }

      setLastChecked(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, lastChecked]);

  async function markAsRead(notificationId) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
  }

  return (
    &lt;div className="relative"&gt;
      &lt;button&gt;
        🔔
        {unreadCount > 0 && (
          &lt;span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5"&gt;
            {unreadCount}
          &lt;/span&gt;
        )}
      &lt;/button&gt;

      &lt;Dropdown&gt;
        {notifications.map(notification => (
          &lt;NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          /&gt;
        ))}
      &lt;/Dropdown&gt;
    &lt;/div&gt;
  );
}</code></pre>

<h2>4.4 Admin Panel</h2>

<div class="info-box">
    <strong>Admin Features:</strong>
    <ul>
        <li><strong>User Management:</strong> Ban users, change roles, view activity</li>
        <li><strong>Topic Moderation:</strong> Pin, lock, delete topics</li>
        <li><strong>Reply Moderation:</strong> Delete inappropriate replies</li>
        <li><strong>Report Management:</strong> Review user-reported content</li>
        <li><strong>Analytics:</strong> View platform statistics and trends</li>
    </ul>
</div>

<h3>Admin Protection</h3>

<p>Admin routes are protected at multiple levels:</p>

<pre><code>// app/admin/layout.tsx (Server Component)
export default async function AdminLayout({ children }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/forum'); // Not authorized
  }

  return (
    &lt;div className="admin-layout"&gt;
      &lt;AdminSidebar /&gt;
      &lt;main&gt;{children}&lt;/main&gt;
    &lt;/div&gt;
  );
}</code></pre>

<h3>Service Role Client for Admin Actions</h3>

<p>Some admin actions need to bypass Row Level Security:</p>

<pre><code>// Example: Admin deleting any user's content
'use server';

export async function adminDeleteTopic(topicId: string) {
  // First check if current user is admin
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  // Use service role client to bypass RLS
  const serviceSupabase = createServiceRoleClient();

  const { error } = await serviceSupabase
    .from('topics')
    .delete()
    .eq('id', topicId);

  if (error) return { error: error.message };

  revalidatePath('/admin/topics');
  return { success: true };
}</code></pre>

<h1>5. Key Features Explained</h1>

<h2>5.1 Markdown Editor & Renderer</h2>

<h3>Why Markdown?</h3>

<div class="concept-box">
    <p>Markdown allows users to format text without learning HTML or using a complex rich text editor.</p>
    <p><strong>Security concern:</strong> If users could write raw HTML, they could inject malicious scripts (XSS attacks).</p>
    <p><strong>Solution:</strong> Markdown is safe by default, and we sanitize the output with <code>rehype-sanitize</code>.</p>
</div>

<h3>Live Preview Implementation</h3>

<pre><code>// components/forum/markdown-editor.tsx
'use client';

export function MarkdownEditor({ initialValue, onChange }) {
  const [content, setContent] = useState(initialValue || '');
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'

  function handleChange(e) {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  }

  return (
    &lt;div&gt;
      &lt;Tabs value={activeTab} onValueChange={setActiveTab}&gt;
        &lt;TabsList&gt;
          &lt;TabsTrigger value="write"&gt;Write&lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="preview"&gt;Preview&lt;/TabsTrigger&gt;
        &lt;/TabsList&gt;

        &lt;TabsContent value="write"&gt;
          &lt;textarea
            value={content}
            onChange={handleChange}
            placeholder="Write your post in Markdown..."
            className="w-full h-64 p-4 font-mono"
          /&gt;

          &lt;MarkdownHelp /&gt; {/* Shows syntax guide */}
        &lt;/TabsContent&gt;

        &lt;TabsContent value="preview"&gt;
          &lt;MarkdownRenderer content={content} /&gt;
        &lt;/TabsContent&gt;
      &lt;/Tabs&gt;
    &lt;/div&gt;
  );
}

// components/forum/markdown-renderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export function MarkdownRenderer({ content }) {
  return (
    &lt;ReactMarkdown
      remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown
      rehypePlugins={[rehypeRaw, rehypeSanitize]} // Allow & sanitize HTML
      components={{
        // Custom code block renderer with syntax highlighting
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\\w+)/.exec(className || '');
          return !inline && match ? (
            &lt;SyntaxHighlighter
              language={match[1]}
              PreTag="div"
              {...props}
            &gt;
              {String(children).replace(/\\n$/, '')}
            &lt;/SyntaxHighlighter&gt;
          ) : (
            &lt;code className={className} {...props}&gt;
              {children}
            &lt;/code&gt;
          );
        },

        // Custom link renderer (opens external links in new tab)
        a({ href, children }) {
          const isExternal = href?.startsWith('http');
          return (
            &lt;a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-blue-600 hover:underline"
            &gt;
              {children}
            &lt;/a&gt;
          );
        },
      }}
    &gt;
      {content}
    &lt;/ReactMarkdown&gt;
  );
}</code></pre>

<h2>5.2 Real-time Typing Indicators</h2>

<div class="info-box">
    <strong>Feature:</strong> When someone is typing a reply, other users see "UserX is typing..." below the topic.
</div>

<h3>Implementation with Supabase Realtime</h3>

<pre><code>// components/forum/topic-page.tsx
'use client';

export function TopicPage({ topic }) {
  const [typingUsers, setTypingUsers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to presence channel for this topic
    const channel = supabase.channel(\`topic:\${topic.id}\`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter(user => user.isTyping);
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topic.id]);

  return (
    &lt;div&gt;
      &lt;TopicContent topic={topic} /&gt;

      {typingUsers.length > 0 && (
        &lt;div className="text-sm text-gray-500 italic"&gt;
          {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        &lt;/div&gt;
      )}

      &lt;ReplyForm topicId={topic.id} /&gt;
    &lt;/div&gt;
  );
}

// components/forum/reply-form.tsx
export function ReplyForm({ topicId }) {
  const [content, setContent] = useState('');
  const supabase = createClient();
  const channel = useRef(null);

  useEffect(() => {
    channel.current = supabase.channel(\`topic:\${topicId}\`);
    channel.current.subscribe();

    return () => {
      if (channel.current) {
        channel.current.untrack();
        supabase.removeChannel(channel.current);
      }
    };
  }, [topicId]);

  function handleTyping(e) {
    setContent(e.target.value);

    // Broadcast typing status
    if (e.target.value.length > 0) {
      channel.current?.track({
        username: currentUser.username,
        isTyping: true,
      });
    } else {
      channel.current?.untrack();
    }
  }

  return (
    &lt;textarea
      value={content}
      onChange={handleTyping}
      placeholder="Write a reply..."
    /&gt;
  );
}</code></pre>

<h2>5.3 Content Moderation & Spam Detection</h2>

<h3>Spam Detection Rules</h3>

<pre><code>// lib/spam-detection.ts

export function detectSpam(content: string) {
  // 1. Link spam (too many URLs)
  const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
  const urls = content.match(urlRegex) || [];
  if (urls.length > 3) {
    return { isSpam: true, reason: 'Too many links' };
  }

  // 2. Excessive caps (more than 60% uppercase)
  const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.6 && content.length > 20) {
    return { isSpam: true, reason: 'Excessive capitalization' };
  }

  // 3. Emoji spam (more than 30% emojis)
  const emojiRegex = /[\\p{Emoji}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount / content.length > 0.3) {
    return { isSpam: true, reason: 'Too many emojis' };
  }

  // 4. Repeated characters (e.g., "hellooooooo")
  const repeatRegex = /(.)\\1{5,}/;
  if (repeatRegex.test(content)) {
    return { isSpam: true, reason: 'Repeated characters' };
  }

  return { isSpam: false };
}

export async function detectDuplicate(userId: string, content: string) {
  const supabase = await createServerSupabaseClient();

  // Check if user posted same content in last 5 minutes
  const { data: recent } = await supabase
    .from('replies')
    .select('content')
    .eq('author_id', userId)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .limit(10);

  const duplicate = recent?.some(r => r.content === content);
  return duplicate;
}

export async function detectRapidPosting(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Check if user posted more than 3 times in last minute
  const { count } = await supabase
    .from('replies')
    .select('id', { count: 'exact' })
    .eq('author_id', userId)
    .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());

  return count > 3;
}</code></pre>

<h3>Profanity Filter (Croatian)</h3>

<pre><code>// lib/content-moderation.ts

const CROATIAN_BAD_WORDS = [
  // List of Croatian profanity...
];

export function moderateContent({ content, userId, contentType }) {
  let moderatedContent = content;
  let severity = 'none';
  let flagged = false;

  // Check for profanity
  const lowerContent = content.toLowerCase();
  for (const word of CROATIAN_BAD_WORDS) {
    if (lowerContent.includes(word)) {
      // Replace with asterisks
      const regex = new RegExp(word, 'gi');
      moderatedContent = moderatedContent.replace(regex, '***');
      severity = 'medium';
      flagged = true;
    }
  }

  return {
    approved: !flagged || severity !== 'high',
    content: moderatedContent,
    severity,
    reason: flagged ? 'Profanity detected and censored' : null,
  };
}</code></pre>

<h2>5.4 User Profiles & Reputation System</h2>

<h3>Reputation Calculation</h3>

<pre><code>-- Database function to calculate reputation
CREATE FUNCTION calculate_user_reputation(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  reputation INTEGER := 0;
BEGIN
  -- +5 points per topic created
  SELECT COALESCE(COUNT(*) * 5, 0) INTO reputation
  FROM topics WHERE author_id = user_id;

  -- +1 point per reply
  reputation := reputation + (
    SELECT COALESCE(COUNT(*), 0) FROM replies WHERE author_id = user_id
  );

  -- +2 points per upvote received
  reputation := reputation + (
    SELECT COALESCE(COUNT(*) * 2, 0)
    FROM votes v
    JOIN replies r ON r.id = v.reply_id
    WHERE r.author_id = user_id AND v.vote_type = 1
  );

  -- -1 point per downvote received
  reputation := reputation - (
    SELECT COALESCE(COUNT(*), 0)
    FROM votes v
    JOIN replies r ON r.id = v.reply_id
    WHERE r.author_id = user_id AND v.vote_type = -1
  );

  -- +10 points per solution marked
  reputation := reputation + (
    SELECT COALESCE(COUNT(*) * 10, 0)
    FROM replies
    WHERE author_id = user_id AND is_solution = true
  );

  RETURN GREATEST(reputation, 0); -- Can't go below 0
END;
$$ LANGUAGE plpgsql;</code></pre>

<h1>6. Database & Data Model</h1>

<h2>6.1 Entity Relationship Diagram</h2>

<div class="diagram">
<pre style="font-size: 0.7em; line-height: 1.3;">
┌─────────────────┐
│   universities  │
│─────────────────│
│ id (PK)         │
│ name            │
│ code            │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    faculties    │
│─────────────────│
│ id (PK)         │
│ university_id   │───┐
│ name            │   │
│ code            │   │
└────────┬────────┘   │
         │            │
         │ 1:N        │
         ▼            │
┌─────────────────┐   │        ┌─────────────────┐
│   categories    │   │        │    profiles     │
│─────────────────│   │        │─────────────────│
│ id (PK)         │   │        │ id (PK)         │
│ faculty_id      │───┘        │ username (UQ)   │
│ name            │            │ email (UQ)      │
│ slug            │            │ full_name       │
│ description     │            │ avatar_url      │
└────────┬────────┘            │ bio             │
         │                     │ university_id   │──┐
         │ 1:N                 │ faculty_id      │  │
         ▼                     │ role            │  │
┌─────────────────┐            │ reputation      │  │
│     topics      │            │ is_banned       │  │
│─────────────────│            │ created_at      │  │
│ id (PK)         │            └────────┬────────┘  │
│ title           │                     │           │
│ content         │                     │           │
│ slug (UQ)       │                     │ 1:N       │
│ author_id       │─────────────────────┘           │
│ category_id     │─────┐                           │
│ is_pinned       │     │                           │
│ is_locked       │     │                           │
│ view_count      │     │                           │
│ reply_count     │     │                           │
│ created_at      │     │                           │
│ updated_at      │     │                           │
└────────┬────────┘     │                           │
         │              │                           │
         │ 1:N          │                           │
         ▼              │                           │
┌─────────────────┐     │                           │
│     replies     │     │                           │
│─────────────────│     │                           │
│ id (PK)         │     │                           │
│ content         │     │                           │
│ topic_id        │─────┘                           │
│ author_id       │─────────────────────────────────┘
│ parent_reply_id │───┐ (self-referencing for threading)
│ is_solution     │   │
│ upvotes         │   │
│ downvotes       │   │
│ created_at      │   │
│ updated_at      │   │
└────────┬────────┘   │
         │            │
         │ 1:N        │ 1:N
         ▼            ▼
┌─────────────────┐   │
│      votes      │   │
│─────────────────│   │
│ id (PK)         │   │
│ user_id         │───┤
│ reply_id        │───┘
│ vote_type       │
│ created_at      │
│ UNIQUE(user_id, │
│        reply_id)│
└─────────────────┘

┌─────────────────┐
│  notifications  │
│─────────────────│
│ id (PK)         │
│ user_id         │───→ profiles.id
│ type            │
│ title           │
│ content         │
│ link            │
│ is_read         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   bookmarks     │
│─────────────────│
│ id (PK)         │
│ user_id         │───→ profiles.id
│ topic_id        │───→ topics.id
│ created_at      │
│ UNIQUE(user_id, │
│        topic_id)│
└─────────────────┘

┌─────────────────┐
│   attachments   │
│─────────────────│
│ id (PK)         │
│ file_name       │
│ file_url        │
│ file_size       │
│ mime_type       │
│ topic_id        │───→ topics.id (nullable)
│ reply_id        │───→ replies.id (nullable)
│ uploaded_by     │───→ profiles.id
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     reports     │
│─────────────────│
│ id (PK)         │
│ reporter_id     │───→ profiles.id
│ content_type    │
│ content_id      │
│ reason          │
│ status          │
│ resolved_by     │───→ profiles.id (nullable)
│ created_at      │
└─────────────────┘
</pre>
</div>

<h2>6.2 Row Level Security (RLS) Policies</h2>

<div class="concept-box">
    <h4>What is Row Level Security?</h4>
    <p>RLS lets you define access rules directly in the database. Even if someone bypasses your application code, the database enforces the rules.</p>
</div>

<p><strong>Example Policies:</strong></p>

<pre><code>-- Topics are readable by everyone
CREATE POLICY "Topics are viewable by everyone"
ON topics FOR SELECT
USING (true);

-- Only authenticated users can create topics
CREATE POLICY "Authenticated users can create topics"
ON topics FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Only topic author can update their own topics
CREATE POLICY "Users can update own topics"
ON topics FOR UPDATE
USING (auth.uid() = author_id);

-- Only topic author or admins can delete topics
CREATE POLICY "Authors or admins can delete topics"
ON topics FOR DELETE
USING (
  auth.uid() = author_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can only see their own notifications
CREATE POLICY "Users see own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Prevent users from seeing other users' private data
CREATE POLICY "Users see own email"
ON profiles FOR SELECT
USING (
  true -- Everyone can see profiles
)
WITH CHECK (
  auth.uid() = id -- But only update own profile
);</code></pre>

<h2>6.3 Database Triggers & Functions</h2>

<h3>Automatic Profile Creation</h3>

<pre><code>-- When a user signs up via Supabase Auth, automatically create profile
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();</code></pre>

<h3>Maintain Reply Counts</h3>

<pre><code>-- Keep topic.reply_count accurate
CREATE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics
    SET
      reply_count = reply_count + 1,
      last_reply_at = NOW()
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics
    SET reply_count = reply_count - 1
    WHERE id = OLD.topic_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_reply_count
AFTER INSERT OR DELETE ON replies
FOR EACH ROW
EXECUTE FUNCTION update_topic_reply_count();</code></pre>

<h1>7. Common Patterns & Examples</h1>

<h2>7.1 Fetching Data in Server Components</h2>

<pre><code>// app/forum/[university]/[faculty]/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function FacultyPage({ params }) {
  const supabase = await createServerSupabaseClient();
  const { university, faculty } = params;

  // Fetch all data in parallel for best performance
  const [categoriesResult, facultyResult, statsResult] = await Promise.all([
    // Get categories for this faculty
    supabase
      .from('categories')
      .select('*')
      .eq('faculty_id', faculty),

    // Get faculty details
    supabase
      .from('faculties')
      .select('*, university:universities(*)')
      .eq('code', faculty)
      .eq('universities.code', university)
      .single(),

    // Get faculty stats (custom RPC function)
    supabase.rpc('get_faculty_stats', { faculty_code: faculty })
  ]);

  return (
    &lt;div&gt;
      &lt;h1&gt;{facultyResult.data.name}&lt;/h1&gt;
      &lt;p&gt;{statsResult.data.topic_count} topics&lt;/p&gt;

      &lt;CategoriesList categories={categoriesResult.data} /&gt;
    &lt;/div&gt;
  );
}</code></pre>

<h2>7.2 Form Handling with Server Actions</h2>

<pre><code>// Client Component
'use client';

import { useFormState } from 'react-dom';
import { updateProfile } from './actions';

export function EditProfileForm({ profile }) {
  const [state, formAction] = useFormState(updateProfile, undefined);

  return (
    &lt;form action={formAction}&gt;
      &lt;input
        name="bio"
        defaultValue={profile.bio}
        placeholder="Tell us about yourself..."
      /&gt;

      &lt;select name="university_id" defaultValue={profile.university_id}&gt;
        &lt;option value="1"&gt;Zagreb&lt;/option&gt;
        &lt;option value="2"&gt;Split&lt;/option&gt;
      &lt;/select&gt;

      {state?.error && &lt;p className="text-red-500"&gt;{state.error}&lt;/p&gt;}
      {state?.success && &lt;p className="text-green-500"&gt;Profile updated!&lt;/p&gt;}

      &lt;button type="submit"&gt;Save Changes&lt;/button&gt;
    &lt;/form&gt;
  );
}

// Server Action
'use server';

export async function updateProfile(prevState, formData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const bio = formData.get('bio');
  const universityId = formData.get('university_id');

  // Validate
  if (bio.length > 500) {
    return { error: 'Bio must be less than 500 characters' };
  }

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({ bio, university_id: universityId })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/forum/user/[username]');
  return { success: true };
}</code></pre>

<h2>7.3 Optimistic UI Updates</h2>

<pre><code>// Client Component for voting
'use client';

export function VoteButtons({ reply, userVote }) {
  const router = useRouter();
  const [optimisticVote, setOptimisticVote] = useState(userVote?.vote_type);
  const [isLoading, setIsLoading] = useState(false);

  async function handleVote(voteType) {
    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const previousVote = optimisticVote;
    setOptimisticVote(voteType);

    try {
      const result = await voteOnReply(reply.id, voteType);

      if (result.error) {
        // Revert on error
        setOptimisticVote(previousVote);
        toast.error(result.error);
      } else {
        // Refresh to get accurate counts from server
        router.refresh();
      }
    } catch (error) {
      // Revert on error
      setOptimisticVote(previousVote);
      toast.error('Failed to vote');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    &lt;div className="flex gap-2"&gt;
      &lt;button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={optimisticVote === 1 ? 'text-blue-600' : 'text-gray-400'}
      &gt;
        ↑ {reply.upvotes}
      &lt;/button&gt;

      &lt;button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={optimisticVote === -1 ? 'text-red-600' : 'text-gray-400'}
      &gt;
        ↓ {reply.downvotes}
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

<h2>7.4 Loading States with Suspense</h2>

<pre><code>// app/forum/[university]/[faculty]/loading.tsx
export default function Loading() {
  return (
    &lt;div className="space-y-4"&gt;
      {/* Skeleton loader */}
      {[1, 2, 3].map(i => (
        &lt;div key={i} className="animate-pulse"&gt;
          &lt;div className="h-6 bg-gray-200 rounded w-3/4 mb-2"&gt;&lt;/div&gt;
          &lt;div className="h-4 bg-gray-200 rounded w-1/2"&gt;&lt;/div&gt;
        &lt;/div&gt;
      ))}
    &lt;/div&gt;
  );
}

// app/forum/[university]/[faculty]/page.tsx
// Next.js automatically shows loading.tsx while page.tsx is fetching data
export default async function FacultyPage({ params }) {
  // This async data fetching triggers the loading state
  const data = await fetchData();
  return &lt;Content data={data} /&gt;;
}</code></pre>

<h1>8. Glossary</h1>

<h3>General Web Development Terms</h3>

<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>API (Application Programming Interface)</strong></td>
            <td>A way for different software to communicate. Like a waiter taking your order to the kitchen.</td>
        </tr>
        <tr>
            <td><strong>REST API</strong></td>
            <td>A standard way to build APIs using HTTP requests (GET, POST, PUT, DELETE).</td>
        </tr>
        <tr>
            <td><strong>SSR (Server-Side Rendering)</strong></td>
            <td>Generating HTML on the server before sending to the browser, instead of in the browser with JavaScript.</td>
        </tr>
        <tr>
            <td><strong>Hydration</strong></td>
            <td>When the browser receives server-rendered HTML and React attaches event listeners to make it interactive.</td>
        </tr>
        <tr>
            <td><strong>Component</strong></td>
            <td>A reusable piece of UI (like a button, card, or form).</td>
        </tr>
        <tr>
            <td><strong>State</strong></td>
            <td>Data that can change over time (like form inputs, toggle states, counters).</td>
        </tr>
        <tr>
            <td><strong>Props</strong></td>
            <td>Data passed from parent component to child component (like function parameters).</td>
        </tr>
    </tbody>
</table>

<h3>Next.js Specific Terms</h3>

<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>App Router</strong></td>
            <td>Next.js 13+ routing system using the <code>app/</code> directory with file-based routing.</td>
        </tr>
        <tr>
            <td><strong>Server Component</strong></td>
            <td>Component that runs only on the server. Can access databases directly. No client-side JavaScript.</td>
        </tr>
        <tr>
            <td><strong>Client Component</strong></td>
            <td>Component with <code>'use client'</code> directive. Runs on both server (SSR) and client. Can use React hooks.</td>
        </tr>
        <tr>
            <td><strong>Server Action</strong></td>
            <td>Function with <code>'use server'</code> that runs on the server. Used for form submissions and mutations.</td>
        </tr>
        <tr>
            <td><strong>Dynamic Route</strong></td>
            <td>Route with variable segments like <code>[id]</code> or <code>[slug]</code>.</td>
        </tr>
        <tr>
            <td><strong>Middleware</strong></td>
            <td>Code that runs before a request is completed. Used for auth checks, redirects, etc.</td>
        </tr>
        <tr>
            <td><strong>ISR (Incremental Static Regeneration)</strong></td>
            <td>Caching strategy that regenerates static pages periodically without rebuilding entire site.</td>
        </tr>
        <tr>
            <td><strong>revalidatePath()</strong></td>
            <td>Function to clear cache for a specific path and re-fetch fresh data.</td>
        </tr>
    </tbody>
</table>

<h3>Database Terms</h3>

<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>PostgreSQL</strong></td>
            <td>Powerful open-source relational database. Like Excel but much more powerful and designed for apps.</td>
        </tr>
        <tr>
            <td><strong>Table</strong></td>
            <td>Collection of data organized in rows and columns (like a spreadsheet).</td>
        </tr>
        <tr>
            <td><strong>Row</strong></td>
            <td>Single record in a table (like one user, one topic, one reply).</td>
        </tr>
        <tr>
            <td><strong>Column</strong></td>
            <td>Field in a table (like username, email, created_at).</td>
        </tr>
        <tr>
            <td><strong>Primary Key (PK)</strong></td>
            <td>Unique identifier for each row (usually an ID).</td>
        </tr>
        <tr>
            <td><strong>Foreign Key (FK)</strong></td>
            <td>Column that references another table's primary key (creates relationships).</td>
        </tr>
        <tr>
            <td><strong>RLS (Row Level Security)</strong></td>
            <td>Database-level access control. Rules that determine who can see/edit which rows.</td>
        </tr>
        <tr>
            <td><strong>Trigger</strong></td>
            <td>Automatic action that fires when data changes (like auto-updating counts).</td>
        </tr>
        <tr>
            <td><strong>Migration</strong></td>
            <td>Script that changes the database structure (add tables, columns, etc.).</td>
        </tr>
        <tr>
            <td><strong>Query</strong></td>
            <td>Request for data from the database (SELECT, INSERT, UPDATE, DELETE).</td>
        </tr>
    </tbody>
</table>

<h3>Authentication Terms</h3>

<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Authentication (Auth)</strong></td>
            <td>Verifying who you are (login with username/password).</td>
        </tr>
        <tr>
            <td><strong>Authorization</strong></td>
            <td>Determining what you can do (are you an admin?).</td>
        </tr>
        <tr>
            <td><strong>Session</strong></td>
            <td>Period of time you're logged in. Stored in cookies.</td>
        </tr>
        <tr>
            <td><strong>Token</strong></td>
            <td>Encrypted string that proves your identity (like a digital ID card).</td>
        </tr>
        <tr>
            <td><strong>Cookie</strong></td>
            <td>Small piece of data stored in your browser (used for sessions).</td>
        </tr>
        <tr>
            <td><strong>HTTP-only Cookie</strong></td>
            <td>Cookie that JavaScript can't access (more secure).</td>
        </tr>
    </tbody>
</table>

<h3>Project-Specific Terms</h3>

<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Topic</strong></td>
            <td>A forum thread/post. Top-level content in a category.</td>
        </tr>
        <tr>
            <td><strong>Reply</strong></td>
            <td>A comment on a topic (can be nested for threading).</td>
        </tr>
        <tr>
            <td><strong>Slug</strong></td>
            <td>URL-friendly version of a title ("How to React?" → "how-to-react").</td>
        </tr>
        <tr>
            <td><strong>Upvote/Downvote</strong></td>
            <td>Rating system for replies (+1 or -1).</td>
        </tr>
        <tr>
            <td><strong>Reputation</strong></td>
            <td>User score based on activity and upvotes received.</td>
        </tr>
        <tr>
            <td><strong>Pin</strong></td>
            <td>Make a topic stay at the top of the list.</td>
        </tr>
        <tr>
            <td><strong>Lock</strong></td>
            <td>Prevent new replies on a topic.</td>
        </tr>
        <tr>
            <td><strong>Solution</strong></td>
            <td>Reply marked as solving the topic's question.</td>
        </tr>
    </tbody>
</table>

<hr>

<div class="success-box" style="margin-top: 40px;">
    <h3>🎉 You've Reached the End!</h3>
    <p>This guide covered:</p>
    <ul>
        <li>✅ All technologies used in the project (React, Next.js, TypeScript, Supabase, etc.)</li>
        <li>✅ How the application architecture works (Server Components, Client Components, Server Actions)</li>
        <li>✅ Data flow from user action to database and back</li>
        <li>✅ Key features implementation (auth, forum, notifications, moderation)</li>
        <li>✅ Database design and security with RLS</li>
        <li>✅ Real code examples you can reference</li>
    </ul>

    <p><strong>For your presentation:</strong> Focus on the architecture diagrams, request/data flow explanations, and how the different pieces work together. Use the code examples to demonstrate specific features if needed.</p>

    <p><strong>Good luck with your presentation! 🚀</strong></p>
</div>

</body>
</html>
`;

// Write the HTML content to a file
const outputPath = path.join(__dirname, '..', 'PROJECT_INTERNAL_GUIDE.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log(`✅ HTML guide generated: ${outputPath}`);
console.log(`\nTo convert to PDF:`);
console.log(`1. Open the HTML file in your browser`);
console.log(`2. Press Ctrl+P (Windows) or Cmd+P (Mac)`);
console.log(`3. Select "Save as PDF"`);
console.log(`4. Save as PROJECT_INTERNAL_GUIDE.pdf`);
console.log(`\nAlternatively, you can use a tool like wkhtmltopdf or Puppeteer.`);
