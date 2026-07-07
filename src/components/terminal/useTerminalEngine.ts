/**
 * useTerminalEngine.ts
 * ─────────────────────────────────────────────────────────
 * Custom hook that encapsulates all terminal logic:
 * command parsing, history, tab completion, idle tips,
 * theme switching, and typewriter queue management.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import {
  type OutputLine,
  type TerminalTheme,
  ALL_COMMANDS,
  TERMINAL_THEMES,
  getBootSequence,
  getHelpOutput,
  getAboutOutput,
  getSkillsOutput,
  getExperienceOutput,
  getProjectsOutput,
  getProjectDetail,
  getContactOutput,
  getEducationOutput,
  getArchitectureOutput,
  getMicroservicesOutput,
  getPaymentsOutput,
  getSystemDesignOutput,
  getBackendOutput,
  getFrontendOutput,
  getCloudOutput,
  getDevopsOutput,
  getShowStack,
  getShowMetrics,
  getShowTimeline,
  getShowAchievements,
  getShowTechRadar,
  getShowStrengths,
  getSystemStatus,
  getRecruiterOutput,
  getCtoOutput,
  getArchitectOutput,
  getWhoamiOutput,
  getCoffeeOutput,
  getFortuneOutput,
  getMotivateOutput,
  getSudoHireOutput,
  getSudoMakeRichOutput,
  get42Output,
  getWhoamiSecretOutput,
  getUnlockOutput,
  getNeofetchOutput,
  getLsOutput,
  getPwdOutput,
  getCatOutput,
  searchContent,
  getRandomError,
  getUptimeOutput,
  getFunFactOutput,
  getQuoteOutput,
} from "./terminalData";

/* ================================================================== *
 * TYPES
 * ================================================================== */

export type TerminalState = {
  lines: OutputLine[];
  booted: boolean;
  booting: boolean;
  input: string;
  history: string[];
  histIdx: number;
  currentTheme: TerminalTheme;
  suggestion: string;
  matrixActive: boolean;
  hackActive: boolean;
};

export type TerminalActions = {
  runCommand: (raw: string) => void;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  startBoot: () => void;
};

/* ================================================================== *
 * HOOK
 * ================================================================== */

export function useTerminalEngine(): [TerminalState, TerminalActions] {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [booted, setBooted] = useState(false);
  const [booting, setBooting] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const [matrixActive, setMatrixActive] = useState(false);
  const [hackActive, setHackActive] = useState(false);

  // Theme
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(TERMINAL_THEMES[0]);

  const bootTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("terminal-theme");
      if (saved) {
        const found = TERMINAL_THEMES.find((t) => t.name === saved);
        if (found) setCurrentTheme(found);
      }
    } catch {}
  }, []);

  /* ------------------------------------------------------------------ *
   * TAB COMPLETION
   * ------------------------------------------------------------------ */

  useEffect(() => {
    if (!input.trim()) {
      setSuggestion("");
      return;
    }
    const lower = input.toLowerCase();
    const match = ALL_COMMANDS.find((cmd) => cmd.startsWith(lower) && cmd !== lower);
    setSuggestion(match ? match.slice(input.length) : "");
  }, [input]);

  /* ------------------------------------------------------------------ *
   * BOOT SEQUENCE
   * ------------------------------------------------------------------ */

  const startBoot = useCallback(() => {
    if (booting || booted) return;
    setBooting(true);

    const reduced = typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    const bootLines = getBootSequence();

    if (reduced) {
      setLines(bootLines);
      setBooting(false);
      setBooted(true);
      return;
    }

    // Progressive reveal with delays
    bootLines.forEach((line, i) => {
      const delay = line.delay ?? i * 280;
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (i === bootLines.length - 1) {
          setTimeout(() => {
            setBooting(false);
            setBooted(true);
          }, 400);
        }
      }, delay);
      bootTimeoutsRef.current.push(timeout);
    });
  }, [booting, booted]);

  // Cleanup boot timeouts
  useEffect(() => {
    return () => {
      bootTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * THEME SWITCHING
   * ------------------------------------------------------------------ */

  const switchTheme = useCallback((themeName: string): OutputLine[] => {
    const theme = TERMINAL_THEMES.find((t) => t.name === themeName);
    if (!theme) {
      return [
        { text: "", tone: "muted" },
        { text: `  Unknown theme: '${themeName}'`, tone: "error" },
        { text: `  Available: ${TERMINAL_THEMES.map((t) => t.name).join(", ")}`, tone: "muted" },
        { text: "", tone: "muted" },
      ];
    }

    setCurrentTheme(theme);
    try {
      localStorage.setItem("terminal-theme", theme.name);
    } catch {}

    return [
      { text: "", tone: "muted" },
      { text: `  Theme switched to: ${theme.label}`, tone: "success" },
      { text: `  ${theme.name === "production" ? "Default Pine & Coral restored." : "Looking good."}`, tone: "muted" },
      { text: "", tone: "muted" },
    ];
  }, []);

  /* ------------------------------------------------------------------ *
   * EASTER EGGS
   * ------------------------------------------------------------------ */

  const triggerMatrix = useCallback(() => {
    setMatrixActive(true);
    setTimeout(() => setMatrixActive(false), 4000);
    return [
      { text: "", tone: "muted" as const },
      { text: "  ▸ ENTERING THE MATRIX...", tone: "success" as const },
      { text: "  ▸ Follow the white rabbit.", tone: "ok" as const },
      { text: "  ▸ (Exiting in 4 seconds)", tone: "muted" as const },
      { text: "", tone: "muted" as const },
    ];
  }, []);

  const triggerHack = useCallback((): OutputLine[] => {
    setHackActive(true);
    setTimeout(() => setHackActive(false), 3000);

    const hackLines: string[] = [
      "ACCESS GRANTED ████████████████████",
      "Bypassing firewall...................done",
      "Injecting payload....................done",
      "Exfiltrating data....................lol jk",
      "Just kidding. This is a portfolio. 😄",
      "But seriously, check out 'architecture'.",
    ];

    return [
      { text: "", tone: "muted" },
      ...hackLines.map((l) => ({ text: `  ${l}`, tone: "ok" as const })),
      { text: "", tone: "muted" },
    ];
  }, []);

  /* ------------------------------------------------------------------ *
   * COMMAND EXECUTION
   * ------------------------------------------------------------------ */

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const cmd = trimmed.toLowerCase();
      const echo: OutputLine = { text: `  saurabh@prod:~$ ${trimmed}`, tone: "cmd" };

      // Add to history
      if (trimmed) {
        setHistory((prev) => {
          const filtered = prev.filter((h) => h !== trimmed);
          return [trimmed, ...filtered].slice(0, 50);
        });
      }
      setHistIdx(-1);
      setInput("");
      setSuggestion("");

      // Empty command
      if (!cmd) return;

      // CLEAR
      if (cmd === "clear") {
        setLines([]);
        return;
      }

      // RESUME — show options instead of downloading
      if (cmd === "resume") {
        setLines((prev) => [
          ...prev,
          echo,
          { text: "", tone: "muted" },
          { text: "  📄 Resume found.", tone: "success" },
          { text: "", tone: "muted" },
          { text: "  Options:", tone: "heading" },
          { text: "  ──────────────────────────", tone: "muted" },
          { text: "  [VIEW]      Opens resume in new tab", tone: "info" },
          { text: "  [DOWNLOAD]  Download saurabh_resume.pdf", tone: "info" },
          { text: "  [LINKEDIN]  Open LinkedIn profile", tone: "info" },
          { text: "", tone: "muted" },
        ]);
        // The resume action buttons will be rendered by the chip system
        return;
      }

      // THEME
      if (cmd === "theme") {
        setLines((prev) => [
          ...prev,
          echo,
          { text: "", tone: "muted" },
          { text: "  Available themes:", tone: "heading" },
          ...TERMINAL_THEMES.map((t) => ({
            text: `  • theme ${t.name.padEnd(14)} ${t.label}${t.name === currentTheme.name ? " ← current" : ""}`,
            tone: (t.name === currentTheme.name ? "accent" : "info") as OutputLine["tone"],
          })),
          { text: "", tone: "muted" },
          { text: "  Usage: theme <name>", tone: "muted" },
          { text: "", tone: "muted" },
        ]);
        return;
      }

      if (cmd.startsWith("theme ")) {
        const themeName = cmd.slice(6).trim();
        const result = switchTheme(themeName);
        setLines((prev) => [...prev, echo, ...result]);
        return;
      }

      // SEARCH
      if (cmd.startsWith("search ")) {
        const query = trimmed.slice(7).trim();
        if (!query) {
          setLines((prev) => [
            ...prev,
            echo,
            { text: "  Usage: search <query>", tone: "muted" },
          ]);
          return;
        }
        setLines((prev) => [...prev, echo, ...searchContent(query)]);
        return;
      }

      if (cmd === "search") {
        setLines((prev) => [
          ...prev,
          echo,
          { text: "  Usage: search <query>", tone: "muted" },
          { text: "  Example: search payments, search go, search queue", tone: "muted" },
        ]);
        return;
      }

      // PROJECT commands
      if (cmd.startsWith("project ")) {
        const projectName = cmd.slice(8).trim();
        const detail = getProjectDetail(projectName);
        if (detail) {
          setLines((prev) => [...prev, echo, ...detail]);
        } else {
          setLines((prev) => [
            ...prev,
            echo,
            { text: "", tone: "muted" },
            { text: `  Project '${projectName}' not found.`, tone: "error" },
            { text: "  Available: smoothpay, queue-platform, gift-card-engine, delivery", tone: "muted" },
            { text: "", tone: "muted" },
          ]);
        }
        return;
      }

      // HISTORY
      if (cmd === "history") {
        setLines((prev) => [
          ...prev,
          echo,
          { text: "", tone: "muted" },
          { text: "  Command History:", tone: "heading" },
          ...history.slice(0, 20).map((h, i) => ({
            text: `  ${String(i + 1).padStart(3)}  ${h}`,
            tone: "info" as OutputLine["tone"],
          })),
          { text: "", tone: "muted" },
        ]);
        return;
      }

      // EASTER EGGS
      if (cmd === "matrix") {
        const result = triggerMatrix();
        setLines((prev) => [...prev, echo, ...result]);
        return;
      }

      if (cmd === "hack") {
        const result = triggerHack();
        setLines((prev) => [...prev, echo, ...result]);
        return;
      }

      // MAP all other commands
      const commandMap: Record<string, () => OutputLine[]> = {
        help: getHelpOutput,
        about: getAboutOutput,
        whoami: getWhoamiOutput,
        skills: getSkillsOutput,
        experience: getExperienceOutput,
        projects: getProjectsOutput,
        contact: getContactOutput,
        education: getEducationOutput,
        architecture: getArchitectureOutput,
        microservices: getMicroservicesOutput,
        payments: getPaymentsOutput,
        "system-design": getSystemDesignOutput,
        backend: getBackendOutput,
        frontend: getFrontendOutput,
        cloud: getCloudOutput,
        devops: getDevopsOutput,
        "show stack": getShowStack,
        "show metrics": getShowMetrics,
        "show timeline": getShowTimeline,
        "show achievements": getShowAchievements,
        "show tech-radar": getShowTechRadar,
        "show strengths": getShowStrengths,
        status: getSystemStatus,
        recruiter: getRecruiterOutput,
        cto: getCtoOutput,
        architect: getArchitectOutput,
        "whoami --secret": getWhoamiSecretOutput,
        "42": get42Output,
        unlock: getUnlockOutput,
        neofetch: getNeofetchOutput,
        coffee: getCoffeeOutput,
        fortune: getFortuneOutput,
        motivate: getMotivateOutput,
        "sudo hire saurabh": getSudoHireOutput,
        "sudo make me rich": getSudoMakeRichOutput,
        uptime: getUptimeOutput,
        "fun-fact": getFunFactOutput,
        quote: getQuoteOutput,
        ls: getLsOutput,
        pwd: getPwdOutput,
        cat: getCatOutput,
      };

      // Sudo catch-all
      if (cmd.startsWith("sudo") && !commandMap[cmd]) {
        setLines((prev) => [
          ...prev,
          echo,
          { text: "", tone: "muted" },
          { text: "  Nice try. This system has RBAC — and you're 'guest'.", tone: "error" },
          { text: "  Try: sudo hire saurabh", tone: "muted" },
          { text: "", tone: "muted" },
        ]);
        return;
      }

      const handler = commandMap[cmd];
      if (handler) {
        setLines((prev) => [...prev, echo, ...handler()]);
        return;
      }

      // UNKNOWN COMMAND — witty error
      setLines((prev) => [...prev, echo, ...getRandomError(trimmed)]);
    },
    [history, currentTheme.name, switchTheme, triggerMatrix, triggerHack],
  );

  /* ------------------------------------------------------------------ *
   * KEY HANDLER
   * ------------------------------------------------------------------ */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        runCommand(input);
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (suggestion) {
          setInput((prev) => prev + suggestion);
          setSuggestion("");
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.min(histIdx + 1, history.length - 1);
        if (history[next] !== undefined) {
          setHistIdx(next);
          setInput(history[next]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = histIdx - 1;
        setHistIdx(next < 0 ? -1 : next);
        setInput(next < 0 ? "" : history[next]);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [input, suggestion, histIdx, history, runCommand],
  );

  /* ------------------------------------------------------------------ *
   * RETURN
   * ------------------------------------------------------------------ */

  return [
    {
      lines,
      booted,
      booting,
      input,
      history,
      histIdx,
      currentTheme,
      suggestion,
      matrixActive,
      hackActive,
    },
    {
      runCommand,
      setInput,
      handleKeyDown,
      startBoot,
    },
  ];
}
