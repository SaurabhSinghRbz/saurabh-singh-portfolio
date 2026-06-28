/**
 * Single source of truth for all copy, links, and metrics.
 * Figures (500+ TPS, millions of messages/day, client brands) are from
 * Saurabh's production work — keep them current, never inflate them.
 */

export const site = {
  name: "Saurabh Singh",
  role: "Senior Software Engineer",
  domain: "https://saurabhsingh.dev", // TODO: buy this domain (or set your Vercel URL)
  email: "singhsaurabh162000@gmail.com", // NOTE: résumé/LinkedIn use ...1622000@ — pick ONE and use it everywhere
  location: "Bengaluru, India · IST (UTC+5:30)",
  availability: "Open to senior full-stack, platform & fintech-infrastructure roles",
  github: "https://github.com/SaurabhSinghRbz",
  linkedin: "https://www.linkedin.com/in/saurabhsinghrbz",
  resume: "/resume.pdf",

  hero: {
    headline: "I build the systems that move money.",
    /** Rendered word-by-word; the `accent` part gets the coral italic treatment. */
    headlineParts: [
      { text: "I build the systems that", accent: false },
      { text: "move money.", accent: true },
    ],
    subheadline:
      "Senior Software Engineer at Pine Labs. I design and run the queue, notification and gift-card systems behind brands like Amazon, Flipkart, HDFC and Axis — and I've shipped a full payments platform solo, end to end.",
  },

  proofStrip: [
    "Pine Labs · 2022 — present",
    "500+ TPS queue platform",
    "Millions of messages daily",
    "Go · Node.js · TypeScript",
    "3 live apps shipped solo",
  ],

  impact: [
    {
      value: "500+",
      unit: "TPS",
      label: "sustained throughput",
      detail: "on a card-activation queue platform I built and own end-to-end",
      href: "/work/b2b-queue-consumer",
    },
    {
      value: "Millions",
      unit: "/day",
      label: "messages processed",
      detail: "card processing, activation and scheduled notifications in production",
      href: "/work/b2b-queue-consumer",
    },
    {
      value: "6",
      unit: "brands",
      label: "served in production",
      detail: "Amazon, Flipkart, HDFC, Axis, SBI & FairPrice gift journeys via the Woohoo platform",
      href: "/work/woohoo-card",
    },
    {
      value: "3",
      unit: "apps",
      label: "live, built solo",
      detail: "SmoothPay: payments API, merchant dashboard and customer QR-ordering app",
      href: "/work/smoothpay",
    },
  ],

  about: [
    "I'm a senior software engineer at Pine Labs in Bengaluru. For the last four years I've worked on the infrastructure behind gift cards and payments: a queue platform that processes millions of messages a day at 500+ TPS, the notification service that delivers every email, SMS and WhatsApp message, and the Go service that owns the full gift-card lifecycle — activation, shipping, wallet, PIN reset, block, cancel, reissue.",
    "Outside Pine Labs I built SmoothPay — a multi-tenant QR-ordering and payments platform for the UAE — alone: NestJS API, merchant dashboard, customer app, Stripe with Apple Pay and Google Pay, multicurrency payment links. Three apps, all live.",
    "I came to software sideways — a mechanical-engineering diploma, then 2,200 hours of deliberate retraining. That route left me a habit I've kept: assume nothing is magic, read one layer deeper than the task requires.",
  ],

  experience: [
    {
      role: "Senior Software Engineer",
      org: "Pine Labs (Qwikcilver · Woohoo)",
      period: "Apr 2024 — present",
      points: [
        "Own core backend logic of the gift-card order lifecycle in a Go 1.24 service (chi, GORM, MySQL read/write split, Redis, goroutine worker pools): processing, activation, shipping & reshipping, wallet credit, PIN reset, block / cancel / reissue.",
        "Systems in production behind HDFC, Axis, FairPrice and Woohoo gift storefronts; instrumented with OpenTelemetry, Swagger-documented, shipped via Bitbucket Pipelines.",
      ],
    },
    {
      role: "Software Engineer",
      org: "Pine Labs (Qwikcilver · Woohoo)",
      period: "Nov 2022 — Mar 2024",
      points: [
        "Built and ran the B2B queue-consumer platform (18 months, end-to-end ownership): Node.js, MongoDB, Redis, Iron.io → ActiveMQ, with RBAC, bulk uploads, message tracking, webhooks and a Vue ops console — 500+ TPS, millions of messages daily.",
        "Extended the delivery microservice (~7 months): email / SMS / WhatsApp / push with OTP flows and template management on PostgreSQL + Hasura GraphQL; optimized hot queries and added request tracking.",
      ],
    },
    {
      role: "Full-Stack Engineer — client project",
      org: "SmoothPay · UAE (freelance)",
      period: "Recent · live",
      points: [
        "Designed and built the entire platform solo: NestJS + Prisma multi-tenant API, Socket.IO live order tracking, RBAC for admin & merchant, React customer QR-ordering app and merchant dashboard.",
        "Payments with Stripe — Apple Pay, Google Pay, cards — plus multicurrency payment links payable from any country, Firebase push, and a Google-reviews feedback loop for merchant trust.",
      ],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: ["TypeScript", "JavaScript", "Go", "SQL"],
    },
    {
      group: "Backend",
      items: ["Node.js", "Express", "NestJS", "Go (chi, GORM)", "Prisma", "Hasura GraphQL", "Socket.IO", "REST & Swagger"],
    },
    {
      group: "Data & messaging",
      items: ["PostgreSQL", "MySQL (read/write split)", "MongoDB", "Redis", "ActiveMQ (STOMP)", "Iron.io MQ", "Webhooks", "Cron pipelines"],
    },
    {
      group: "Frontend",
      items: ["React", "Vue", "Next.js", "Vite", "Zustand", "Tailwind CSS", "Framer Motion", "Recharts"],
    },
    {
      group: "Payments & auth",
      items: ["Stripe", "Apple Pay / Google Pay", "Multicurrency links", "JWT / JWKS", "OAuth (Google, Apple)", "KMS encryption", "PII masking"],
    },
    {
      group: "Ops & observability",
      items: ["Docker", "nginx", "PM2", "OpenTelemetry", "New Relic", "Telegraf", "AWS S3/ECR", "SonarQube", "CI/CD pipelines"],
    },
  ],

  principles: [
    {
      title: "Own it like it's yours — because it is.",
      body: "My first major service at Pine Labs had a team of one. I learned to write the design doc, challenge it, build it, and wear the pager for it. I haven't shipped anything I wasn't willing to operate since.",
    },
    {
      title: "Cost is a feature.",
      body: "The cheapest way to say “senior” is a bill you made smaller. Migrating our message broker off per-API-call pricing wasn't glamorous — it was a benchmark and a careful cutover. It paid for itself many times over.",
    },
    {
      title: "AI is leverage, not a substitute for judgment.",
      body: "I use AI agents daily for scaffolding, migration chores, and test coverage — and I keep the architecture, the review, and the accountability. The tools got faster; the standards didn't move.",
    },
  ],

  academics: {
    note: "Built during 2,200+ hours of retraining at Masai School (2021–22). Kept for the record — everyone starts somewhere, and this is where I did.",
    projects: [
      {
        name: "CoSchedule",
        desc: "Task-management app for marketing teams — React, Redux, Node.js, MongoDB, Chakra UI.",
        repo: "https://github.com/SaurabhSinghRbz/coSchedule_Clone",
        demo: "https://coschedule-clone-new.vercel.app/",
      },
      {
        name: "Spotify 2.0",
        desc: "Music player with search & charts — React, Redux Toolkit, Vite, Tailwind, Shazam API.",
        repo: "https://github.com/SaurabhSinghRbz/Spotify2.0-Web-Music-Player",
        demo: "https://premium-spotify.vercel.app/",
      },
      {
        name: "Fitness Club",
        desc: "Exercise library with 1,000+ movements and GIF guides — React, Material UI, Node.js, MongoDB.",
        repo: "https://github.com/SaurabhSinghRbz/fitness-react-project",
        demo: "https://fitness-club-app.netlify.app/",
      },
      {
        name: "India Today",
        desc: "News site rebuild — vanilla JavaScript, DOM manipulation, localStorage.",
        repo: "https://github.com/SaurabhSinghRbz/indiaTodayClone2.0",
        demo: "https://india-today-news.vercel.app/",
      },
      {
        name: "MeanBuy",
        desc: "E-commerce flow with pay-what-you-want pricing — vanilla JavaScript.",
        repo: "https://github.com/SaurabhSinghRbz/project_MeanBuy",
        demo: "https://saurabhsinghrbz.github.io/project_MeanBuy/",
      },
      {
        name: "Tic-Tac-Toe",
        desc: "Classic game with React hooks & routing.",
        repo: "https://github.com/SaurabhSinghRbz/tic-tac-toe",
        demo: "https://tic-tac-toe2-0.netlify.app/",
      },
      {
        name: "Weather Forecast",
        desc: "First REST-API project — vanilla JavaScript.",
        repo: "https://github.com/SaurabhSinghRbz/weatherForecast",
        demo: "https://current-weather.vercel.app/",
      },
    ],
    // Newest first — reorder here (not alphabetically) whenever a new one is issued.
    certifications: [
      {
        name: "Google Cloud Career Launchpad — Computing Foundations",
        issuer: "Google Cloud Skills Boost",
        issued: "Jan 2026",
        credentialId: "6aJO9zLO",
        href: "https://www.skills.google/public_profiles/24b81096-7a62-4cac-8371-8af3be96f9c6",
      },
      {
        name: "JavaScript (Intermediate)",
        issuer: "HackerRank",
        issued: "Sep 2022",
        credentialId: "fac38bf11f09",
        href: "https://www.hackerrank.com/certificates/fac38bf11f09",
      },
      {
        name: "Rest API (Intermediate)",
        issuer: "HackerRank",
        issued: "Sep 2022",
        credentialId: "0c3fd917ca64",
        href: "https://www.hackerrank.com/certificates/0c3fd917ca64",
      },
      {
        name: "React (Basic)",
        issuer: "HackerRank",
        issued: "Sep 2022",
        credentialId: "908cf3f3a1f3",
        href: "https://www.hackerrank.com/certificates/908cf3f3a1f3",
      },
      {
        name: "Problem Solving (Intermediate)",
        issuer: "HackerRank",
        issued: "Jul 2022",
        credentialId: "7a90535d94b1",
        href: "https://www.hackerrank.com/certificates/7a90535d94b1",
      },
      {
        name: "Problem Solving (Basic)",
        issuer: "HackerRank",
        issued: "Jul 2022",
        credentialId: "47be779d564d",
        href: "https://www.hackerrank.com/certificates/47be779d564d",
      },
      {
        name: "JavaScript (Basic)",
        issuer: "HackerRank",
        issued: "Jul 2022",
        credentialId: "1385df6df40e",
        href: "https://www.hackerrank.com/certificates/1385df6df40e",
      },
      {
        name: "Internship on AutoCAD",
        issuer: "Softpro India Computer Technologies (P) Ltd.",
        issued: "Oct 2021",
        credentialId: "Dp4Cz5",
        href: "https://drive.google.com/file/d/193l22Tut4JgDHKVSpLbukTCRq__hL3Fk/view?usp=sharing",
      },
      {
        name: "Course on Computer Concept (CCC)",
        issuer: "NIELIT",
        issued: "Aug 2016",
        credentialId: "GOAB6061E3A44002",
        href: "https://drive.google.com/file/d/1xQxnB_AbswpZEUuw3VOk21mO1l5BCw2_/view?usp=sharing",
      },
    ],
  },

  education: [
    {
      year: "2024 — 2026",
      title: "B.C.A., Information Technology",
      org: "Amrita Vishwa Vidyapeetham",
      note: "In progress, alongside full-time work.",
    },
    {
      year: "2021 — 2022",
      title: "Full-Stack Web Development",
      org: "Masai School, Bengaluru",
      note: "2,200+ hours: 1,200 coding, 1,000 DSA. Comeback Kid & Rising Star awards.",
    },
    {
      year: "2019 — 2022",
      title: "Diploma in Mechanical Engineering",
      org: "Government Polytechnic, Lucknow",
      note: "Engineering fundamentals from the physical world — tolerances and failure modes.",
    },
  ],

  contact: {
    heading: "Let's talk about your hardest reliability problem.",
    body: "The fastest way to reach me is email — I answer within a day.",
  },

  mission: "Build infrastructure people never have to think about — because it never fails them.",
} as const;
