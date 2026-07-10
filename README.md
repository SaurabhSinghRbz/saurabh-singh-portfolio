# 🚀 Saurabh Singh — Portfolio

<div align="center">

### Senior Full Stack Engineer • Backend Specialist • Distributed Systems Enthusiast

Building scalable products, payment systems, developer platforms, and high-performance web applications.

🌐 **Live Website:** https://iamsaurabh.in

</div>

---

## Overview

This repository contains the source code for my personal portfolio website.

The goal of this portfolio is not simply to showcase projects, but to demonstrate how I approach software engineering, system design, scalability, reliability, product thinking, and production-grade development.

The portfolio highlights:

* Real-world engineering experience
* Production systems and architecture
* Full-stack development expertise
* Backend and distributed systems engineering
* Payment and fintech solutions
* Technical leadership and ownership
* Performance optimization and scalability

---

## About Me

I'm **Saurabh Singh**, a Full Stack Engineer with 4+ years of experience building and scaling production applications.

My work spans:

* Backend Engineering
* Full Stack Development
* Distributed Systems
* Event-Driven Architecture
* Payment Systems
* API Design
* Cloud Infrastructure
* Performance Optimization
* Developer Experience

I enjoy solving complex engineering challenges and building systems that remain reliable under scale.

---

## Tech Stack

This portfolio is built with:

### Framework & Language

* Next.js 15 (App Router)
* React 19
* TypeScript 5

### Styling & Motion

* Tailwind CSS 4
* Framer Motion
* React Icons

### 3D & Graphics

* Three.js
* React Three Fiber (`@react-three/fiber`)
* Drei (`@react-three/drei`)

### Backend (within Next.js)

* Next.js Route Handlers (serverless API)
* Resend (transactional email for the contact form)
* In-memory rate limiting + origin allowlist on the contact endpoint

### Infrastructure & Analytics

* Vercel (hosting & serverless functions)
* Vercel Analytics & Speed Insights

> For my broader engineering expertise — Go, Node.js, distributed systems,
> payments, message queues, PostgreSQL/Redis, AWS/GCP — see the **About Me**
> section above. Those describe my professional work; this list describes what
> this website itself is built on.

---

## Featured Projects

### SmoothPay

A modern payment platform focused on merchant payments, QR-based transactions, payment orchestration, loyalty programs, cashback engines, reporting systems, and multi-tenant merchant management.

Key Areas:

* Payment Processing
* Merchant Management
* Loyalty Engine
* Event-Driven Workflows
* Multi-Environment Deployment
* Secure Payment Integrations

---

### Notification Platform

A scalable notification delivery system designed for reliability and high throughput.

Features:

* Queue-Based Processing
* Retry Mechanisms
* Failure Recovery
* Delivery Tracking
* Scalable Architecture

---

### Queue Platform

A distributed processing platform designed to handle asynchronous workloads efficiently.

Features:

* Event Processing
* Queue Management
* Horizontal Scalability
* Monitoring & Observability

---

## Engineering Principles

### Ownership

I believe engineers should own problems end-to-end, from architecture discussions to production monitoring.

### Scalability

Systems should be designed for future growth without requiring major rewrites.

### Reliability

Every feature should be built with failure scenarios in mind.

### Simplicity

The best solutions are often the simplest solutions that can scale.

### Continuous Learning

Technology evolves rapidly, and continuous improvement is essential.

---

## Portfolio Features

### Interactive Command Center

A terminal-inspired interface allowing visitors to explore:

* Projects
* Skills
* Experience
* Architecture
* Contact Information
* Fun Commands

### Modern UI/UX

* Responsive Design
* Smooth Animations
* Accessibility Focused
* Performance Optimized
* Mobile Friendly

### SEO Optimized

* Structured Metadata
* Open Graph Tags
* Sitemap
* Semantic HTML
* Search Engine Friendly Architecture

### Secure Contact Form

* Server-side email delivery via Resend (API key never reaches the browser)
* Origin allowlist — only accepts submissions from the site's own domain
* Rate limiting — 5 submissions per 10 minutes per IP, then a cooldown
* Honeypot field and server-side validation to filter bots

---

## Local Development

### Prerequisites

* Node.js 20+
* npm

### Installation

```bash
git clone <repository-url>

cd saurabh-singh-portfolio

npm install
```

### Environment Variables

The contact form sends email through [Resend](https://resend.com). Copy the
example file and fill in your own values:

```bash
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
```

| Variable          | Required | Purpose                                                        |
| ----------------- | -------- | -------------------------------------------------------------- |
| `RESEND_API_KEY`  | Yes      | API key from resend.com — used server-side only, never exposed |
| `MAIL_FROM`       | Yes      | Verified sender, e.g. `Saurabh Singh <hello@iamsaurabh.in>`    |
| `CONTACT_TO`      | No       | Where owner notifications land (defaults to the site email)    |
| `ALLOWED_ORIGINS` | No       | Extra origins allowed to call the contact API (e.g. a preview) |

`.env.local` is gitignored, so your keys never land in the repo.

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run the Production Build

```bash
npm run start
```

---

## Performance Goals

This portfolio is designed with a strong focus on performance:

* Fast Initial Load
* Optimized Assets
* Responsive Interactions
* SEO Best Practices
* Accessibility Standards

Target Metrics:

* Lighthouse Score 95+
* Fast Core Web Vitals
* Minimal Layout Shift
* Excellent Mobile Experience

---

## Future Roadmap

* Architecture Visualization Library
* Engineering Blog
* System Design Vault
* Interactive Architecture Playground
* Project Deep-Dive Articles
* Technical Writing Section
* Open Source Showcase

---

## Connect With Me

🌐 Website: https://iamsaurabh.in

💼 LinkedIn: https://linkedin.com/in/singhsaurabh

🐙 GitHub: https://github.com/singhsaurabh

📧 Email: [hello@iamsaurabh.in](mailto:hello@iamsaurabh.in)

---

## Philosophy

> Great software is not just about writing code.
>
> It is about building reliable systems, solving meaningful problems, creating business value, and continuously improving the engineering experience.

---

## License

© 2026 Saurabh Singh. All Rights Reserved.

This repository is public for reference and portfolio evaluation only. You may
view and learn from the code, but copying, redistributing, deploying, or reusing
the code, design, or content — in whole or in substantial part — is not
permitted without prior written permission. See [LICENSE](LICENSE) for the full
terms. For permission requests: hello@iamsaurabh.in

---

<div align="center">

Built with ❤️ by Saurabh Singh

</div>
