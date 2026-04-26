---
trigger: always_on
---

Web App Project Rules for Mechanical CAD Portfolio

## Tech Stack
- Frontend: Astro (SSG/SSR), TypeScript 5
- UI Components: Shadcn UI, React 19 (Islands), Lucide Icons
- Styling: Tailwind CSS
- Database/CMS: Supabase
- Package Manager: pnpm

## Code Quality
- Folder Structure: Strictly follow /components, /layouts, /lib, /services, and /types
- Atomic Design: Separate atoms (basic UI) from molecules (project cards/galleries)
- Maintainability: Keep functions under 20 lines. Aim for files under 200 lines to ensure single responsibility
- Hydration: Use Astro Islands sparingly. Only hydrate (client:load) components requiring complex interactive state

## Security
- Type Safety: Use strict: true in TS. No any allowed. Define interfaces for all InsForge API responses
- Input Validation: Use Zod to validate all data fetched from InsForge or user inputs before processing
- Secrets: Store API keys and IDs in .env. Never hardcode credentials in the source code
- Sanitization: Sanitize any dynamically rendered content to prevent XSS attacks

## Testing and Resilience
- Unit Tests: Write tests for all utility functions in /lib and data services in /services using Vitest
- Error Handling: Wrap all hydrated React components in Error Boundaries to prevent app crashes
- UX Resilience: Mandatory Skeletons for all asynchronous loading states to match the final layout

## Visual Identity
- Palette: Deep grays, steel blues, and safety orange accents
- UI Details: Clean layouts, technical borders, and monospace fonts for numerical/technical data