# Eventli Authentication Flow (MCP)

This document outlines the authentication architecture for the Eventli platform, designed for clarity and to guide future development.

## 1. Model (The Core Entities)

The authentication system is built around two primary tables and their relationship:

-   **`auth.users`**: The private, built-in Supabase table that stores sensitive user authentication data (email, hashed password, etc.). This table is managed entirely by Supabase Auth.
-   **`public.profiles`**: A public table that stores non-sensitive, application-specific user data. It is linked to `auth.users` via a `PRIMARY KEY` and `FOREIGN KEY` relationship on the `id` column.
    -   **`id (uuid)`**: Mirrors the `id` from `auth.users`.
    -   **`role (text)`**: The most critical field for our application logic. It can be either `'customer'` or `'seller'`, enforced by a `CHECK` constraint.
    -   **`full_name (text)`**: The user's full name.

The connection between these tables is automated by a PostgreSQL trigger (`handle_new_user`) in the database.

## 2. Context (The Current State)

The goal was to implement a complete, role-based authentication system for a new Next.js 15 project (Eventli). The database schema was pre-defined and created in Supabase (`database_setup.sql`). The primary challenge was to create a secure and maintainable code structure that supports two distinct user types (`customer` and `seller`) from the very beginning.

## 3. Policy & Implementation (What Was Done)

The implementation follows a server-centric, feature-based architecture.

1.  **Code Structure**:
    -   All authentication logic is encapsulated within the `src/features/auth` directory.
    -   UI components (`LoginForm`, `SignupForm`) are in `src/features/auth/components/`.
    -   Backend logic (Server Actions) is in `src/features/auth/actions/index.ts`.
    -   Reusable Supabase clients and middleware are located in `src/shared/lib/`.
    -   The `app` directory handles routing, delegating the UI rendering to the feature components.

2.  **Signup Flow**:
    -   The user fills out the `SignupForm`, providing their name, email, password, and selecting a `role` (`customer` or `seller`).
    -   The form submission triggers the `signup` Server Action.
    -   The `signup` action calls `supabase.auth.signUp()`. Crucially, it passes the user's selected `role` and `full_name` inside the `options.data` object.
    -   When Supabase Auth creates a new entry in `auth.users`, the `handle_new_user` SQL trigger automatically fires.
    -   This trigger reads the metadata from `NEW.raw_user_meta_data` (where `options.data` is stored) and inserts a new row into the `public.profiles` table with the correct `id`, `full_name`, and `role`.
    -   This ensures that every authenticated user has a corresponding profile with an assigned role right from the start.

3.  **Login Flow**:
    -   The user submits their credentials via the `LoginForm`.
    -   The `login` Server Action calls `supabase.auth.signInWithPassword()`.
    -   Upon successful login, the user is redirected to `/dashboard`.

4.  **Session Management & Security**:
    -   The `@supabase/ssr` library is used to create server and client Supabase clients that correctly manage cookies.
    -   A root `middleware.ts` file is implemented. Its *sole purpose* is to refresh the user's session cookie on every request, ensuring the user stays logged in.
    -   **Authorization is not handled in the middleware**. It is enforced at the data layer by the **Row Level Security (RLS)** policies defined in `database_setup.sql`. These policies ensure that a user can only access or modify data that they are permitted to, based on their `auth.uid()` and, where applicable, their `role`.

## 4. Plan (Next Steps)

With a working authentication system, the team can now proceed with building out the core application features in their respective modules:

-   **Seller Features (`src/features/services`)**:
    -   Build the UI for sellers to create, view, and manage their service listings (`/dashboard/listings/new`).
    -   Implement the Server Actions (`createListing`, `updateListing`) that interact with the `listings` table, protected by RLS policies that ensure only users with the `seller` role can perform these actions.
-   **Customer Features (`src/features/bookings`)**:
    -   Build the UI for customers to browse listings.
    -   Implement the booking/inquiry flow.
-   **Dashboard Enhancements**:
    -   Create role-specific dashboards. The `/dashboard` page can fetch the user's role from their `profile` and render a different component tree for customers vs. sellers.