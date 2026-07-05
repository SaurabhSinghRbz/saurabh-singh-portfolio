# Saurabh Singh — Portfolio v2

Repositioned portfolio: **Senior Software Engineer, payments infrastructure**.
Next.js 15 · TypeScript strict · Tailwind CSS 4 · Framer Motion · React Three Fiber.
Light + dark themes ("Pine & Coral" palette), toggle in the nav, OS preference respected.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Content

Everything editable lives in two files:

- `src/content/site.ts` — hero, about, experience, skills, impact metrics, academic projects, education, contact
- `src/content/case-studies.ts` — the four production case studies:
  1. **b2b-queue-consumer** — 500+ TPS queue platform (Node.js, ActiveMQ/Iron.io, MongoDB, Redis, Vue ops console)
  2. **delivery** — email/SMS/WhatsApp/push notification backbone (PostgreSQL, Hasura, Handlebars templates)
  3. **woohoo-card** — Go gift-card lifecycle service (chi, GORM, MySQL r/w split, goroutine pools)
  4. **smoothpay** — solo-built UAE QR-ordering & payments platform (NestJS, Prisma, Stripe, Socket.IO) — live at smoothpay.ai

Figures (500+ TPS, millions of messages/day, client brands) come from real production
work — keep them current, never inflate them.

## Before deploying

1. **Pick one email.** `site.ts` uses `singhsaurabh162000@gmail.com`; the résumé/LinkedIn
   use `singhsaurabh1622000@gmail.com`. Standardize everywhere.
2. **Replace `public/resume.pdf`** with a résumé matching this positioning.
3. **Set the domain** in `site.ts` (used by metadata, sitemap, JSON-LD).
4. **Update LinkedIn** headline/summary to match.

## Design system

- Tokens in `src/app/globals.css`: both themes defined as CSS variables under
  `[data-theme="dark"]` / `[data-theme="light"]`, mapped to Tailwind via `@theme inline`.
- Type: Fraunces (display) · Manrope (body) · JetBrains Mono (data/labels).
- Theme init runs before paint in `layout.tsx` (no flash); toggle persists to localStorage.
- WebGL hero (`src/components/three/`) is lazy-loaded, theme-aware, and disabled
  under `prefers-reduced-motion`.
