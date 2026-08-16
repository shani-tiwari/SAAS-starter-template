# Clerk Auth & API Breakdown Guide

A short, simple reference for how Clerk authentication, database syncing via webhooks, and the API routes are set up in this project.

---

## 1. Clerk Authentication Setup

### 🔹 Core Setup
* **`ClerkProvider` in `app/layout.tsx`**: Wraps the whole application so all components and hooks have access to user session data.
* **`middleware.ts`**:
  * Protects private routes by checking user session (`auth()`).
  * Defines **public routes** that do not require login: `'/'`, `'/sign-in'`, `'/sign-up'`, and `'/api/webhook/register'`.
  * Redirects unauthenticated users to `/sign-up`.
  * Checks user role (`publicMetadata.role`) to route admins to `/admin/dashboard` and regular users to `/dashboard`.
  * Prevents already logged-in users from revisiting sign-in/sign-up pages.

---

### 🔹 Custom Sign-In Flow
* **File**: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
* **Hook**: `useSignIn()` from `@clerk/nextjs`
* **Steps**:
  1. **Enter Credentials**: User submits email and password.
  2. **Authenticate**: Calls `signIn.password()` and `signIn.create()`.
  3. **Multi-Factor / Verification (if required)**:
     * If `signIn.status === 'needs_client_trust'` or `needs_second_factor`, sends OTP with `signIn.mfa.sendEmailCode()`.
     * User submits code -> verified with `signIn.mfa.verifyEmailCode({ code })`.
  4. **Finalize**: When `status === 'complete'`, calls `signIn.finalize()` and redirects to `/dashboard`.

---

### 🔹 Custom Sign-Up Flow
* **File**: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
* **Hook**: `useSignUp()` and `useAuth()` from `@clerk/nextjs`
* **Steps**:
  1. **Enter Info**: User enters email and password.
  2. **Create Candidate**: Calls `signUp.password({ emailAddress, password })`.
  3. **Send OTP**: Triggers email verification code via `signUp.verifications.sendEmailCode()`.
  4. **Verify Code**: User enters code -> verified with `signUp.verifications.verifyEmailCode({ code })`.
  5. **Finalize**: When `status === 'complete'`, calls `signUp.finalize()` and completes sign-up.

---

### ⚠️ Important Considerations
* **Catch-All Folders (`[[...sign-in]]` / `[[...sign-up]]`)**:
  * The double brackets `[[...]]` allow Clerk to handle all nested sub-paths without returning 404 errors.
* **Webhook Public Access**:
  * `/api/webhook/register` **must** be listed in `publicRoutes` in `middleware.ts` so Clerk's webhook server can reach it without getting blocked or redirected.
* **Database Sync**:
  * Clerk handles credentials; your PostgreSQL/Drizzle database gets the user record via the webhook (`user.created`).
* **Client vs Server Navigation**:
  * Use `router.push()` in Client Components (`'use client'`).
  * Use `NextResponse.redirect()` in Server Components and `middleware.ts`.

---

## 2. Deep Dive: Webhooks, Svix & Database Sync

### ❓ How is user data saved to DB without direct database calls on sign-up?
* **Decoupled Architecture**: The frontend only creates the account on Clerk servers and handles auth state.
* **Step-by-step Flow**:
  1. User signs up on your frontend -> Clerk creates the user in its secure cloud.
  2. Clerk automatically triggers an event: `user.created`.
  3. Clerk makes a background HTTP `POST` request to your backend URL: `/api/webhook/register`.
  4. Your route receives the event payload (contains user `id`, `email_addresses`, etc.).
  5. Your route executes `db.insert(user).values({ id: evt.data.id, email: primaryEmail.email_address, ... })` to store the user in PostgreSQL/Drizzle DB.
* **Why this is better**:
  * Prevents frontend failures or network drops from leaving your DB out of sync.
  * Captures users regardless of where they sign up (custom form, social login, Google/GitHub, etc.).

---

### ❓ If we never call `/api/webhook/register` in our frontend code, who calls it and how?
* **Who triggers the call?**:
  * **Clerk's backend servers** trigger it automatically, NOT your React/Next.js frontend. You never write a `fetch('/api/webhook/register')` in your UI components.
* **How does Clerk know our endpoint URL?**:
  * You configure your webhook URL in the **Clerk Dashboard** (Webhooks ➔ Add Endpoint ➔ set URL like `https://yourdomain.com/api/webhook/register` or tunnel like `https://xxx.loca.lt/api/webhook/register` for localhost).
  * You select which events to listen to (e.g., `user.created`).
* **Why is it added to `publicRoutes` in `middleware.ts`?**:
  * Clerk is an external server — it has **no user login cookie/session**.
  * If it is NOT in `publicRoutes`, your `middleware.ts` will treat Clerk as an unauthenticated visitor and redirect the request to `/sign-up`.
  * Marking it public lets Clerk's webhook `POST` request reach `app/api/webhook/register/route.ts` directly, where **Svix** takes care of authenticating the request.

---

### ❓ How does Svix help?
* **Security & Authenticity**: `/api/webhook/register` is an open endpoint on the internet. Anyone could send fake requests to spam your database.
* **Signature Verification**:
  * Clerk signs the request payload using your secret key (`WEBHOOK_SECRET`).
  * Clerk sends headers with every request: `svix-id`, `svix-timestamp`, and `svix-signature`.
  * **Svix library** (`wh.verify(...)`) checks these signatures:
    * ✅ Proves the request **100% came from Clerk** and not an attacker.
    * ✅ Ensures the data was **not altered** in transit.
    * ✅ Protects against replay attacks (resending old captured requests).

---

### ❓ Why is there no page/UI for `/api/webhook/register`?
* **`route.ts` vs `page.tsx`**:
  * **`page.tsx`** = Frontend UI (renders HTML/React for humans in a web browser).
  * **`route.ts`** = Backend API endpoint (handles HTTP methods like `GET`/`POST` and returns JSON/Responses).
* **Machine-to-Machine Communication**:
  * This endpoint is meant only for Clerk's server to talk directly to your Next.js server in the background.
  * No human ever visits or needs to see a webpage for it.

---

## 3. API Folder Breakdown (`app/api`)

All endpoints use Next.js App Router route handlers with HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).

```
app/api/
├── admin/
│   └── route.ts
├── subscription/
│   └── route.ts
├── todos/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── webhook/
    └── register/
        └── route.ts
```

---

### 📁 `app/api/admin/route.ts`
* **Purpose**: Admin role validation helper.
* **Functionality**:
  * `isAdmin(userId)`: Reads user metadata from Clerk (`clerkClient.users.getUser(userId)`) and returns `true` if `role === 'admin'`.

---

### 📁 `app/api/subscription/route.ts`
* **Purpose**: Manage user subscriptions in the database.
* **`GET`**:
  * Checks if the logged-in user (`auth()`) is currently subscribed.
  * Auto-updates `is_subscribed = false` if the `subscription_ends` date has expired.
* **`POST`**:
  * Activates/renews subscription for 1 month (`subscription_ends = now + 1 month`).
  * Sets `is_subscribed = true` in Drizzle DB.

---

### 📁 `app/api/todos/route.ts`
* **Purpose**: List and create todos for the authenticated user.
* **`GET`**:
  * Fetches todos belonging to the user (`user_id === userId`).
  * Supports search filtering (`?search=term`) and returns total count.
* **`POST`**:
  * Checks subscription paywall: Free users (not subscribed) are limited to **maximum 3 todos**.
  * If within limit, inserts a new todo with `title` and `userId`.

---

### 📁 `app/api/todos/[id]/route.ts`
* **Purpose**: Manage a specific todo item by ID.
* **`PUT`**:
  * Updates todo status (`completed: true/false`).
  * Validates that the todo exists and belongs to the current user.
* **`DELETE`**:
  * Deletes the todo item from the database after verifying ownership.

---

### 📁 `app/api/webhook/register/route.ts`
* **Purpose**: Sync Clerk user creation with your local database.
* **`POST`**:
  * Verifies incoming webhook signature using **Svix** (`svix-id`, `svix-timestamp`, `svix-signature`, and `WEBHOOK_SECRET`).
  * Listens for `user.created` event from Clerk.
  * Inserts the new user record into Drizzle DB (`id`, `email`, `is_subscribed: false`).
