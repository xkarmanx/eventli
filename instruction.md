Comprehensive Project Plan: Full-Stack Event Platform


Introduction

This document provides a comprehensive, chronological development plan for a full-stack Event Platform. The platform will empower event organizers to create, manage, and list events, while allowing customers to browse, book, and pay for them seamlessly.
The project will be constructed using a modern, robust technology stack selected for its developer experience, performance, and scalability. The core technologies are Next.js 15 utilizing the App Router, Supabase as the all-in-one backend (Postgres, Authentication, Storage, Edge Functions), and Stripe for secure payment processing.1 The user interface will be built with Tailwind CSS and the highly customizable Shadcn/ui component collection.4
The architectural philosophy is server-centric, prioritizing security and performance by leveraging Next.js Server Components and Server Actions. This approach moves sensitive logic and data fetching to the server, minimizing client-side exposure. A critical aspect of this architecture is placing authentication and authorization checks as close to the data access layer as possible, a modern best practice that enhances security over older, middleware-based patterns.6

Part 1: Foundational Setup and Architecture

This initial phase focuses on establishing a solid, scalable, and maintainable project foundation. All subsequent development will build upon the decisions and structures defined here.

Project Initialization and Tooling


Next.js Project Setup

The project will be initialized as a new Next.js application using the command npx create-next-app@latest.7 During setup, TypeScript and Tailwind CSS will be enabled to ensure type safety and a utility-first styling workflow from the outset.
A key structural decision is the adoption of a src/ directory. This convention clearly separates application source code from root-level configuration files (e.g., next.config.js, tsconfig.json), leading to a cleaner project root and aligning with best practices for large-scale applications.9

Supabase Project Setup

A new project will be created via the Supabase dashboard.12 The essential credentials, including the Project URL,
anon key, and service_role key, will be retrieved and stored securely.
To ensure a consistent and reliable development workflow, the Supabase CLI will be integral. It will be initialized in the project directory using bunx supabase init. This enables a complete local Supabase stack, including Postgres, Auth, and Storage, mirroring the production environment. This practice is crucial for maintaining development and production parity, which de-risks the entire development lifecycle by allowing migrations and features to be tested in a safe, isolated environment before deployment.14 The local instance will be linked to the hosted project using
bun run supabase:link.

Environment Variables

All sensitive keys and configuration variables will be managed through environment variables. A .env.local file, which is ignored by Git, will be created at the project root to store secrets for local development. This includes Supabase keys, Stripe keys, and any other third-party API credentials.15 To facilitate team collaboration and onboarding, a
.env.local.example file will be committed to the repository, listing all required variables without their values.

Codebase Structure and Conventions

A well-defined folder structure is paramount for long-term maintainability. This project will adopt a feature-centric organization within the src/ directory, a pattern that scales effectively by collocating related logic.10
The primary directories will be:
src/app/: This directory will house all application routes, adhering to the Next.js App Router conventions. It will contain page.tsx and layout.tsx files for defining UI, as well as route groups (group) for organizing routes without affecting the URL path.7
src/components/: This is the home for all React components, subdivided for clarity:
ui/: Contains general-purpose UI primitives. This folder will be primarily populated by the Shadcn/ui CLI, providing a library of unstyled, accessible components like buttons and inputs.10
features/: For complex, multi-part components that are tied to specific business logic, such as an event-creation-form or a booking-calendar.
layout/: For high-level structural components like Header, Footer, and Sidebar that are used across multiple pages.10
src/lib/: This directory is for modules that contain complex logic or interact with external services. A strict distinction will be made between lib and utils to improve clarity and testability. The lib folder will contain files like supabase.ts (for initializing Supabase clients) and stripe.ts.10
src/utils/: This directory is reserved for pure, side-effect-free helper functions that have no external dependencies, such as date formatters or class name utilities. This separation ensures that utilities are highly reusable and easy to unit test.
src/schemas/: A dedicated directory for all Zod validation schemas. Centralizing schemas here establishes a single source of truth for data validation, which can be imported and used consistently across both client-side components and server-side actions.19
src/actions/: This directory will contain all Next.js Server Actions, cleanly separating server-side mutation logic from the UI layer.19

UI Foundation with Shadcn/ui and Theming

The UI foundation will be built using Shadcn/ui, initialized with npx shadcn-ui@latest init. This command sets up a components.json configuration file and helper utilities.5 The core philosophy of Shadcn/ui is not to provide a traditional component library but to offer a set of well-designed, accessible components whose source code is copied directly into the project. This gives the development team complete ownership and control over the components' styling, behavior, and functionality.5
Theming will be implemented using CSS variables, the recommended approach for Shadcn/ui, allowing for easy customization and support for both light and dark modes from the project's inception. The application's color palette, typography, and border-radius will be defined in src/styles/globals.css.5 Core components like buttons, cards, inputs, and forms will be added as needed via the Shadcn/ui CLI (
npx shadcn-ui@latest add...), ensuring the project remains lean and only includes necessary code.18

Part 2: Database and Authentication Backend

This phase establishes the application's data persistence layer and the complete security model, including database schema, user roles, access control, and authentication flows.

Database Schema Design and Implementation

The database schema is the blueprint of the application's data model. All schema changes, including table and column creation, will be managed exclusively through Supabase migration files generated via the CLI (supabase/migrations/). This migration-first approach ensures that the database schema is version-controlled, auditable, and can be reliably deployed across all environments, from local development to production.15 The Supabase dashboard's table editor will be used for viewing data, not for making schema modifications.
The schema will be designed around four core entities: users (profiles), events, bookings, and categories. Relationships will be enforced with foreign key constraints, and ON DELETE CASCADE will be used where appropriate to maintain data integrity—for example, deleting a user will automatically remove their associated events and bookings.23 The schema will also be designed with future integrations in mind, such as including a
stripe_customer_id column in the profiles table to link users with their Stripe payment information.24
A separate profiles table will be created to store public user information. This is a standard and recommended practice with Supabase Auth, as it keeps application-specific user data separate from the sensitive authentication data in the private auth.users table.25
The definitive database schema is detailed below.

Table Name
Column Name
Data Type
Constraints
Default Value
Description
profiles
id
uuid
PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE


Foreign key to the main auth user.


updated_at
timestamptz


now()
Timestamp of the last update.


full_name
text




User's full name.


avatar_url
text




URL for the user's profile picture.


role
text
NOT NULL
'customer'
User role ('customer' or 'organizer').


stripe_customer_id
text
UNIQUE


Stripe customer ID for payments.
categories
id
uuid
PRIMARY KEY
gen_random_uuid()
Unique identifier for the category.


name
text
NOT NULL, UNIQUE


Name of the category (e.g., "Music", "Tech").
events
id
uuid
PRIMARY KEY
gen_random_uuid()
Unique identifier for the event.


organizer_id
uuid
NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE


The user who created the event.


category_id
uuid
REFERENCES categories(id) ON DELETE SET NULL


The category of the event.


title
text
NOT NULL


Title of the event.


description
text




Detailed description of the event.


image_url
text




URL for the event's banner image.


start_time
timestamptz
NOT NULL


Event start date and time.


end_time
timestamptz
NOT NULL


Event end date and time.


location
text




Physical or virtual location of the event.


price
numeric(10, 2)
NOT NULL, CHECK (price >= 0)
0.00
Price for one booking.


total_tickets
integer
NOT NULL, CHECK (total_tickets > 0)


Total number of available tickets.


tickets_sold
integer
NOT NULL
0
Number of tickets already sold.


is_published
boolean
NOT NULL
false
Whether the event is visible to the public.


created_at
timestamptz


now()
Timestamp of creation.
bookings
id
uuid
PRIMARY KEY
gen_random_uuid()
Unique identifier for the booking.


customer_id
uuid
NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE


The user who made the booking.


event_id
uuid
NOT NULL, REFERENCES events(id) ON DELETE CASCADE


The event that was booked.


quantity
integer
NOT NULL, CHECK (quantity > 0)
1
Number of tickets booked.


total_price
numeric(10, 2)
NOT NULL


Total price paid for the booking.


stripe_payment_intent_id
text




Stripe payment intent ID for reference.


created_at
timestamptz


now()
Timestamp of the booking.


User Roles and Advanced Access Control with RLS

Row Level Security (RLS) is a fundamental aspect of the application's security architecture. RLS will be enabled on all tables that contain user data, which acts as a powerful, non-negotiable security baseline, ensuring that data access is denied by default.25
Granular RLS policies will be created for each table and for each type of operation (SELECT, INSERT, UPDATE, DELETE). These policies will enforce the business rules at the database level:
Profiles: Any user can view public profile data. However, a user can only update their own profile. New profiles are created automatically via a database trigger when a new user signs up in auth.users, not through direct API INSERT calls.
Events: Anyone can view events that are marked as published (is_published = true). Only authenticated users with the 'organizer' role can create new events. An organizer can only update or delete events where their id matches the organizer_id.
Bookings: A user can only view their own bookings (where customer_id = auth.uid()). An organizer can view all bookings associated with their events.
For optimal performance, all RLS policies will use the (select auth.uid()) pattern. This allows Postgres's query planner to cache the result of the auth.uid() function for the duration of a single query, preventing it from being re-evaluated for every row and thus dramatically improving performance on large tables.26
While a simple role text column in the profiles table is sufficient for the initial 'organizer' vs. 'customer' distinction, this model has limitations for future scalability. A more robust Role-Based Access Control (RBAC) system would involve creating dedicated user_roles and role_permissions tables, which decouples users from permissions.27 This allows for the flexible creation of new roles (e.g., 'admin', 'moderator') by assigning a collection of permissions. This plan acknowledges this advanced pattern and earmarks its implementation as a future enhancement in Part 4, ensuring the platform is built with a clear path toward greater complexity.

Authentication Flow Implementation

The authentication system will be built using Supabase Auth, leveraging its server-side helpers for Next.js.
Supabase Client Setup: Separate Supabase clients will be created for server-side contexts (Server Components, Route Handlers, Server Actions) and client-side contexts (Client Components), following the official Supabase documentation. These will be located in /lib/supabase/server.ts and /lib/supabase/client.ts respectively.28
Middleware for Session Management: A middleware.ts file will be implemented at the project root. Its sole responsibility will be to refresh the user's session cookie if it has expired. It will not be used for route protection, as authorization logic will be handled closer to the data layer.6
Email/Password Authentication: A complete email/password flow will be implemented. This includes sign-up and login forms built with Shadcn/ui components (Form, Input, Button) and validated with Zod on both the client and server.19 The
signup and login Server Actions will call the respective Supabase Auth methods (signUp and signInWithPassword).16 A custom SMTP provider like Resend will be configured to ensure reliable delivery of confirmation emails and password reset links.15 A dedicated
/auth/confirm Route Handler will manage the token exchange to validate a user's email and establish a session.28
Google OAuth Authentication: To provide a frictionless sign-in option, Google OAuth will be integrated. This involves configuring the Google provider in the Supabase dashboard with a Client ID and Secret from the Google Cloud Console.31 A "Sign in with Google" button will trigger a Server Action that calls
supabase.auth.signInWithOAuth({ provider: 'google' }).32 The server-side callback logic will be handled by a generic
/auth/callback Route Handler, which will manage the code-for-session exchange for all OAuth providers.31

Part 3: Core Feature Implementation

This part details the development of the platform's primary features, integrating the foundational architecture, database, and authentication systems established in the previous parts.

Event Creation and Management (Organizer Flow)

This flow enables users with the 'organizer' role to create and manage their events.
Event Creation Form: A user-friendly, potentially multi-step form will be built for creating new events. It will be constructed using a suite of Shadcn/ui components, including Input for text fields like title and location, Textarea for the detailed description, DatePicker for selecting start and end times, and Select for choosing an event category.29 Access to this form will be restricted at the page level; the page's Server Component will verify that the user is authenticated and has the 'organizer' role before rendering the form.
Image Uploads with Supabase Storage: The form will include a file input for the event's banner image. To ensure security and efficiency, validation will be performed on both the client and server. Client-side checks will provide immediate feedback on file type (e.g., image/jpeg, image/png) and size (e.g., < 5MB).34 The file will be uploaded to a private Supabase Storage bucket named
event-images within a Server Action using supabase.storage.from('event-images').upload().34 Files will be namespaced by the organizer's user ID (e.g.,
organizer_id/event_id.png) to prevent naming conflicts and organize assets logically. Corresponding RLS policies will be applied to the storage.objects table to ensure that users can only upload files to their designated folders.35
Server Action for Event Creation: A single, robust Server Action will handle the entire form submission process. It will first validate all incoming form data, including the file upload, against a comprehensive Zod schema.19 The action will then perform an authorization check to re-verify the user's 'organizer' role. Upon successful validation and authorization, the action will upload the image, retrieve its public URL, and insert a new record into the
events table in the database.
Content Moderation (Hate Speech Check): To maintain platform safety, a content moderation system will be implemented to check event titles and descriptions for harmful content. A naive, synchronous API call within the event creation Server Action would negatively impact user experience by increasing latency. Therefore, a more sophisticated, asynchronous approach will be adopted. A Supabase Edge Function, moderate-event-text, will be created.37 This function will be triggered automatically by a database webhook whenever a new row is inserted into the
events table. The function will take the new event's text content and send it to a third-party moderation API, such as Azure AI Content Safety, which provides granular classification of harmful content.38 If the content is flagged, the function will update an
is_flagged boolean column on the event's record. This allows administrators to review and act on flagged content from a separate dashboard without blocking the user's creation flow.

Event Discovery and Viewing (Customer Flow)

This flow focuses on how customers discover and view event listings.
Homepage/Event Listing Page: The main event discovery page (app/page.tsx) will be a Server Component that fetches and displays all published events (is_published = true). The data fetching will occur server-side using the Supabase client, which automatically respects all RLS policies. To ensure good performance and prevent loading excessive data, pagination will be implemented. Events will be displayed in a grid or list using a custom ListingCard component, built with the Shadcn/ui Card component, showcasing the event's image, title, date, location, and price.39
Event Detail Page: A dynamic route at app/events/[id]/page.tsx will serve as the detail page for individual events. This Server Component will fetch the data for a single event based on its ID. The page will display all relevant information, including the full description, organizer details, and an interactive map if a physical location is provided. A prominent "Book Now" button will serve as the primary call-to-action.

Event Booking and Payment Integration with Stripe

This section covers the critical functionality of booking tickets and processing payments using Stripe.
Stripe Setup: The necessary Stripe API keys (publishable and secret) will be configured in the .env.local file.15 For this platform, where events have unique prices, Stripe Prices will be created on-the-fly via the API during the checkout process rather than being pre-configured in the Stripe dashboard.
Checkout Flow: When a user clicks the "Book Now" button, a Server Action is triggered. This action orchestrates the checkout process:
It first verifies that the user is authenticated.
It performs a real-time check to ensure tickets are still available by comparing total_tickets and tickets_sold in the events table.
It then creates a Stripe Checkout session using stripe.checkout.sessions.create().41 This session is configured with
line_items containing the event price and quantity, success_url and cancel_url for redirection, and crucial metadata containing the event_id and customer_id.
Finally, it redirects the user to the secure, Stripe-hosted checkout page.
Stripe Webhook for Fulfillment: The only reliable and secure method for order fulfillment is through Stripe webhooks. Relying on a client-side redirect after payment is insecure and prone to failure. A dedicated API Route Handler at app/api/stripe/webhook/route.ts will be created to listen for events from Stripe.15 This handler will be the single source of truth for successful payments. Its logic will:
Verify the incoming request's signature to ensure it genuinely originated from Stripe.
Specifically listen for the checkout.session.completed event.
Upon receiving this event, extract the event_id and customer_id from the session's metadata.
Perform an atomic database update within a Postgres transaction to ensure data integrity: create a new record in the bookings table and increment the tickets_sold counter on the corresponding events record.
If this is a user's first purchase, it will also create a new Stripe Customer object and store the resulting stripe_customer_id in the user's profiles record for future transactions.

Part 4: Advanced Topics and Production Readiness

This final phase focuses on hardening the application against attacks, optimizing for performance and scale, and adding value-driven features for organizers.

Security Hardening and Review


Login Throttling and CAPTCHA

To mitigate brute-force attacks on the email/password login form, a dynamic and user-friendly rate-limiting strategy will be implemented. Simply presenting a CAPTCHA to every user on every login attempt introduces unnecessary friction.43 A more intelligent system will only challenge suspicious users.
This will be achieved by creating a new database table, failed_login_attempts, to log attempts with ip_address, user_email, and a timestamp. The login Server Action will be modified:
On a failed login attempt, the action will record the failure in the new table.
Before processing a login request, the action will query this table to count recent failures from the same IP address or for the same email.
If the number of failures exceeds a defined threshold (e.g., 3 failed attempts within 5 minutes), the Server Action will return a specific error state indicating that a CAPTCHA is now required.
The client-side login form will conditionally render a CAPTCHA component (such as Google reCAPTCHA or the privacy-focused Friendly Captcha) based on this state received from the server.43
This approach provides robust protection against automated attacks while maintaining a seamless experience for legitimate users.45

Comprehensive Input Validation

A thorough review of all Server Actions and API Route Handlers will be conducted to ensure that Zod validation is applied to every piece of incoming data, not just user-facing forms. This prevents malicious or malformed data from entering the system through any entry point.

RLS Policy Review

A final, exhaustive review of all Row Level Security policies will be performed. This involves testing each policy against both authenticated and anon roles to confirm there are no unintended data leaks or access loopholes.

Performance Optimization and Monitoring


Database Indexing

Based on the application's most common query patterns, database indexes will be strategically added to key columns to accelerate data retrieval. For instance, indexes will be created on foreign key columns like events.organizer_id, events.category_id, and bookings.event_id to speed up joins and lookups.26 The Supabase Performance Advisor, available in the dashboard, will also be utilized to identify slow-running queries and receive automated index recommendations.47

Image Optimization

To ensure fast page loads and reduced bandwidth consumption, a two-pronged image optimization strategy will be employed. First, the Next.js <Image> component will be used for all images served from Supabase Storage. This component automatically handles responsive resizing, lazy loading, and serving images in modern formats like WebP.7 Second, for scenarios like generating thumbnails on the event listing page, Supabase Storage's built-in Image Transformation API will be used for on-the-fly resizing and optimization, further reducing egress and improving performance.48

Caching Strategies

The application will leverage Next.js's powerful built-in caching capabilities. Server-rendered pages, such as the main event listing, will benefit from automatic data caching. To ensure data remains fresh, path-based revalidation (revalidatePath) will be triggered after mutations (e.g., a new event is published), or time-based revalidation will be configured to periodically refresh the cache.7

Logging and Monitoring

Supabase's integrated Log Explorer will be the primary tool for monitoring and debugging. It provides real-time logs for the API gateway, Postgres database queries, and Edge Function executions, offering critical visibility into the application's health and performance.50

Organizer Analytics Dashboard

A dedicated dashboard will be created to provide event organizers with valuable insights into their event performance.
Dashboard Page: A new protected route at app/dashboard will be created. The page will be a Server Component that verifies the user is an authenticated organizer before rendering any content.
Data Visualization: The dashboard will feature key metrics like "Total Revenue," "Tickets Sold," and "Upcoming Events," displayed using Shadcn/ui Card components for a clean and modern look.51 A chart component, such as Recharts integrated with Shadcn/ui, will be used to visualize ticket sales over time, providing a clear graphical representation of trends.53
Analytics Backend (SQL Views): Running complex analytical queries (e.g., aggregations with SUM and GROUP BY) directly on production tables can degrade performance and complicate application logic.54 To address this, the analytical logic will be encapsulated within the database itself using SQL Views. A view named
organizer_event_analytics will be created. This view will pre-join the events and bookings tables and pre-calculate key metrics like total_revenue_per_event and total_tickets_sold_per_event. The dashboard's Server Component will then execute a simple and fast query against this view instead of performing complex aggregations on the raw tables. For applications with very high read traffic or more intensive analytics, this can be further optimized by using a MATERIALIZED VIEW, which stores the pre-calculated results and can be refreshed periodically using a pg_cron job.23 This database-first approach significantly improves performance, enhances security by abstracting the underlying table structure, and simplifies the application-layer code.
Works cited
Next.js documentation - DevDocs, accessed June 19, 2025, https://devdocs.io/nextjs/
supabase/apps/docs/content/guides/getting-started/architecture.mdx at master - GitHub, accessed June 19, 2025, https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/architecture.mdx
Stripe Documentation, accessed June 19, 2025, https://docs.stripe.com/
Tailwind CSS - Rapidly build modern websites without ever leaving your HTML., accessed June 19, 2025, https://tailwindcss.com/
Introduction - Shadcn UI, accessed June 19, 2025, https://ui.shadcn.com/docs
Next.js Authentication Best Practices in 2025 - Francisco Moretti, accessed June 19, 2025, https://www.franciscomoretti.com/blog/modern-nextjs-authentication-best-practices
Next.js Docs, accessed June 19, 2025, https://nextjs.org/docs
Framework guides - Installation - Tailwind CSS, accessed June 19, 2025, https://tailwindcss.com/docs/installation/framework-guides
How to use the Next.js app directory: Complete guide and tutorial - Contentful, accessed June 19, 2025, https://www.contentful.com/blog/next-js-app-directory-guide-tutorial/
The Ultimate Guide to Organizing Your Next.js 15 Project Structure ..., accessed June 19, 2025, https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure
Best Practices for Organizing Your Next.js 15 2025 - DEV Community, accessed June 19, 2025, https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji
Supabase - Draftbit, accessed June 19, 2025, https://docs.draftbit.com/docs/supabase
Supabase Authentication and Authorization in Next.js: Implementation Guide - Permit.io, accessed June 19, 2025, https://www.permit.io/blog/supabase-authentication-and-authorization-in-nextjs-implementation-guide
Supabase Docs, accessed June 19, 2025, https://supabase.com/docs
KolbySisk/next-supabase-stripe-starter: The highest quality ... - GitHub, accessed June 19, 2025, https://github.com/KolbySisk/next-supabase-stripe-starter
Password-based Authentication - Supabase, accessed June 19, 2025, https://supabase.com/ui/docs/nextjs/password-based-auth
Next.js directory organization best practices - Sentry, accessed June 19, 2025, https://sentry.io/answers/next-js-directory-organisation-best-practices/
How Shadcn UI Streamlined Our UI Development - Devōt, accessed June 19, 2025, https://devot.team/blog/shadcn-ui-vs-scss
Next.js form validation on the client and server with Zod - DEV Community, accessed June 19, 2025, https://dev.to/bookercodes/nextjs-form-validation-on-the-client-and-server-with-zod-lbc
form validation, server side? : r/nextjs - Reddit, accessed June 19, 2025, https://www.reddit.com/r/nextjs/comments/1dqpvx1/form_validation_server_side/
Shadcn UI for Beginners: The Ultimate Step-by-Step Tutorial - CodeParrot, accessed June 19, 2025, https://codeparrot.ai/blogs/shadcn-ui-for-beginners-the-ultimate-guide-and-step-by-step-tutorial
Components - shadcn/ui kit for Figma, accessed June 19, 2025, https://www.shadcndesign.com/docs/components
Tables and Data | Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/database/tables
#33 Stripe Integration Guide for Next.js 15 with Supabase - DEV Community, accessed June 19, 2025, https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5
Row Level Security | Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/database/postgres/row-level-security
Troubleshooting | RLS Performance and Best ... - Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
Custom Claims & Role-based Access Control (RBAC) | Supabase ..., accessed June 19, 2025, https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac
Setting up Server-Side Auth for Next.js | Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/auth/server-side/nextjs
React Hook Form - shadcn/ui, accessed June 19, 2025, https://ui.shadcn.com/docs/forms/react-hook-form
How to add Email and Password authentication to Nextjs with ..., accessed June 19, 2025, https://dev.to/thatanjan/how-to-add-email-and-password-authentication-to-nextjs-with-supabase-auth-21oc
Login with Google | Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/auth/social-login/auth-google
How to add Google oAuth in Nextjs with Supabase Auth | Login with ..., accessed June 19, 2025, https://dev.to/thatanjan/how-to-add-google-oauth-in-nextjs-with-supabase-auth-login-with-google-2fcb
How to add booking system to payload ? : r/PayloadCMS - Reddit, accessed June 19, 2025, https://www.reddit.com/r/PayloadCMS/comments/1hcvtl3/how_to_add_booking_system_to_payload/
Complete Guide to File Uploads with Next.js and Supabase Storage, accessed June 19, 2025, https://supalaunch.com/blog/file-upload-nextjs-supabase
Supabase Storage: How to Implement File Upload Properly, accessed June 19, 2025, https://nikofischer.com/supabase-storage-file-upload-guide
Validating the Next.js API inputs with Zod and Typescript | Next.js Supabase SaaS Kit, accessed June 19, 2025, https://makerkit.dev/docs/next-supabase/development/validating-api-input-zod
Supabase Edge Functions - Deploy JavaScript globally in seconds, accessed June 19, 2025, https://supabase.com/edge-functions
Azure Guardrails - Portkey Docs, accessed June 19, 2025, https://portkey.ai/docs/integrations/guardrails/azure-guardrails
Card - shadcn/ui, accessed June 19, 2025, https://ui.shadcn.com/docs/components/card
Shadcn UI Crash Course #2 - Card Components - YouTube, accessed June 19, 2025, https://www.youtube.com/watch?v=sXrwh4I229Q
Stripe Checkout | Checkout Pages for Your Website, accessed June 19, 2025, https://stripe.com/payments/checkout
Next.js + Supabase + Stripe - Tempo Labs, accessed June 19, 2025, https://tempolabsinc.mintlify.app/Next.jsSupabaseStripe
Implement Google reCAPTCHA V2 for Next js Apps - Jscrambler, accessed June 19, 2025, https://jscrambler.com/blog/implementing-google-recaptcha-v2-next-js
Next.js CAPTCHA - Friendly Captcha, accessed June 19, 2025, https://friendlycaptcha.com/integrations/next-js-captcha/
How to make maximum failed login attempt for user to 3 time only after that block it?, accessed June 19, 2025, https://stackoverflow.com/questions/74634312/how-to-make-maximum-failed-login-attempt-for-user-to-3-time-only-after-that-bloc
No Rate Limiting | Tutorial & Examples | Snyk Learn, accessed June 19, 2025, https://learn.snyk.io/lesson/no-rate-limiting/
Troubleshooting | Steps to improve query performance with indexes - Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/troubleshooting/steps-to-improve-query-performance-with-indexes-q8PoC9
Storage Optimizations | Supabase Docs, accessed June 19, 2025, https://supabase.com/docs/guides/storage/production/scaling
Learn Next.js | Next.js by Vercel - The React Framework, accessed June 19, 2025, https://nextjs.org/learn
Logs & Analytics | Supabase Features, accessed June 19, 2025, https://supabase.com/features/logs-analytics
shadcn ui Dashboard Wireframe Example - MockFlow, accessed June 19, 2025, https://mockflow.com/wireframe-examples/shadcn-ui-dashboard-wireframe-example
Examples - Shadcn UI, accessed June 19, 2025, https://ui.shadcn.com/examples/dashboard
How to Use Shadcn UI Chart Component in 3 Minutes - YouTube, accessed June 19, 2025, https://www.youtube.com/watch?v=PVSFGnuI_UA
Can I use Supabase for analytics? - Tinybird, accessed June 19, 2025, https://www.tinybird.co/blog-posts/can-i-use-supabase-for-user-facing-analytics
