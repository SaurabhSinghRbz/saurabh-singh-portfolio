import type { IconType } from "react-icons";
import {
  SiTypescript,
  SiJavascript,
  SiGo,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiReact,
  SiVuedotjs,
  SiNextdotjs,
  SiVite,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiNginx,
  SiTailwindcss,
  SiPrisma,
  SiStripe,
  SiSocketdotio,
  SiFirebase,
  SiGooglecloud,
  SiFramer,
  SiGraphql,
  SiVuetify,
  SiGooglepay,
  SiApplepay,
  SiJsonwebtokens,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";

/**
 * Maps tech names from content strings to brand icons.
 * Longest-prefix match against lowercase name; unknown techs get a
 * neutral hex node so every chip still renders consistently.
 */
const registry: [string, IconType][] = [
  ["typescript", SiTypescript],
  ["javascript", SiJavascript],
  ["go (chi", SiGo],
  ["go 1", SiGo],
  ["go", SiGo],
  ["node", SiNodedotjs],
  ["express", SiExpress],
  ["nestjs", SiNestjs],
  ["react", SiReact],
  ["vuetify", SiVuetify],
  ["vue", SiVuedotjs],
  ["next", SiNextdotjs],
  ["vite", SiVite],
  ["postgres", SiPostgresql],
  ["mysql", SiMysql],
  ["mongodb", SiMongodb],
  ["redis", SiRedis],
  ["docker", SiDocker],
  ["nginx", SiNginx],
  ["tailwind", SiTailwindcss],
  ["prisma", SiPrisma],
  ["stripe", SiStripe],
  ["socket", SiSocketdotio],
  ["firebase", SiFirebase],
  ["gcp", SiGooglecloud],
  ["google cloud", SiGooglecloud],
  ["framer", SiFramer],
  ["hasura", SiGraphql],
  ["graphql", SiGraphql],
  ["google pay", SiGooglepay],
  ["apple pay", SiApplepay],
  ["jwt", SiJsonwebtokens],
  ["aws", FaAws],
];

function FallbackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function lookupTechIcon(name: string): IconType | null {
  const key = name.toLowerCase();
  for (const [prefix, icon] of registry) {
    if (key.includes(prefix)) return icon;
  }
  return null;
}

export default function TechIcon({ name, className }: { name: string; className?: string }) {
  const Icon = lookupTechIcon(name);
  if (!Icon) return <FallbackIcon className={className} />;
  return <Icon className={className} aria-hidden />;
}
