"use client";

import dynamic from "next/dynamic";

/* Diagrams load as their own chunks: a case study ships only the diagrams it renders.
 * Server-rendered as before (dynamic keeps SSR), so the HTML and SEO are unchanged. */
export const MessageFlowDiagram = dynamic(() => import("./MessageFlowDiagram"));
export const DeployFlowDiagram = dynamic(() => import("./DeployFlowDiagram"));
