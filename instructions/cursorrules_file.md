# .cursorrules

## Project Overview

**Type:** cursorrules_file
**Description:** I am developing a freemium Next.js web application using the BrowserBase Stagehand API. The application will enable users to input natural language session actions such as "goto," "act," and "extract." It supports randomizing session contexts by varying browsers (mobile, tablet, desktop), locations, and user names, while handling login credentials and base domain configurations. Furthermore, it integrates Tailwind CSS with Geist display font and an Indigo-based theme, uses Supabase for authentication and storage, integrates Google and GitHub OAuth for signups, and employs Stripe for payment management transitioning from freemium to a subscription model.
**Primary Goal:** Automate session simulation and logging for SaaS analytics by enabling intuitive natural language inputs, which reduces the time needed for demo setups and provides detailed session analytics.

## Project Structure

### Framework-Specific Routing

**Directory Rules:**

    Next.js 14 (app router): Enforce the use of the `app/` directory with nested route folders.
    Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
    Example 2: (For comparison) "Next.js (Pages Router)" → `pages/[route].tsx` pattern
    Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter`

### Core Directories

**Versioned Structure:**

    `app/`: This directory holds all Next.js 14 App Router based pages including the dashboard, session creation, session logs, and payment management screens.
    Example 1: `app/api` → Next.js 14 API routes with Route Handlers for server-side logic using BrowserBase Stagehand API
    Example 2: `app/session` → Contains session creation and log pages following the versioned structure

### Key Files

**Stack-Versioned Patterns:**

    `app/dashboard/layout.tsx`: Utilized for creating the root layout for the dashboard in Next.js 14.
    Example 1: `app/auth/login/page.tsx` → Manages authentication flows using server actions.
    Example 2: `app/payment/page.tsx` → Handles payment and subscription functions including Stripe integration

## Tech Stack Rules

**Version Enforcement:**

    next@14: App Router is required; using `getInitialProps` is not permitted. All page components must reside within the `app/` directory structure.

## PRD Compliance

**Non-Negotiable:**

    "SessionBurst is a freemium web application built with Next.js designed to enable professionals in SaaS analytics to simulate realistic user interactions and session data for demonstration and testing purposes." This mandates that the project implements a natural language based session creation workflow, detailed session logging with analytics, secure OAuth authentication, and a streamlined transition from a free trial to a subscription model.

## App Flow Integration

**Stack-Aligned Flow:**

    Example: "Next.js 14 Auth Flow → `app/auth/login/page.tsx` uses server actions" for authentication, followed by navigation to `app/dashboard/page.tsx` for session overview, and `app/session/create/page.tsx` for natural language session input and template management. Payment and subscription management reside in `app/payment/page.tsx`, which incorporates Stripe and logs analytics via PostHog.
