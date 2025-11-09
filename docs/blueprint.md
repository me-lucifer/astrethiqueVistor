# **App Name**: Astrethique Visitor V2

## Core Features:

- Route Navigation: Provides navigation for the /, /discover, /conferences, /how-it-works, /content-hub, /support, /wallet, /appointments, /dashboard, /legal-hub, /pricing, /privacy, /terms routes.
- Session Storage Helpers: Includes helpers for managing session data: getSession(key), setSession(key, val), seedOnce(flagKey, seedFn).
- Language Toggle: EN/FR toggle in the header that defaults to FR if navigator.language starts with 'fr', otherwise defaults to EN. Stores preference in `session.lang`.
- Cookie Consent Banner: Adds a cookie consent banner at the bottom with 'Accept' and 'Manage' options; stores choice in `session.cookies` ('accepted' or 'declined').
- Legal Hub Page: Creates a Legal Hub page with links to Legal Notice, Privacy (GDPR), and Terms pages in the footer navigation.

## Style Guidelines:

- Global theme dark background: #0F0E0C.
- Global theme text color: #F3E9D2.
- Accent color: Gold #D9A441.
- Subtle gold: #C69C6D.
- Success color: #6DD8A0.
- Danger color: #E06C75.
- UI font: 'Poppins', a geometric sans-serif for a precise, contemporary, fashionable, avant-garde look.
- Headings font: 'Raleway', a sans-serif font.
- Rounded corners: 12–16px.
- Soft shadows.
- Hover micro-animations: Scale 1.01.
- Icon set: RemixIcon or Lucide, using a consistent outlined style.