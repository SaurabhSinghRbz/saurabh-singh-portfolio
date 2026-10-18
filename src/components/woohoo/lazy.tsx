"use client";

import dynamic from "next/dynamic";

/* Diagrams load as their own chunks: a case study ships only the diagrams it renders.
 * Server-rendered as before (dynamic keeps SSR), so the HTML and SEO are unchanged. */
export const DigitalActivationDiagram = dynamic(() => import("./DigitalActivationDiagram"));
export const ShipmentFlowDiagram = dynamic(() => import("./ShipmentFlowDiagram"));
export const ReshipmentFlowDiagram = dynamic(() => import("./ReshipmentFlowDiagram"));
export const PhysicalActivationDiagram = dynamic(() => import("./PhysicalActivationDiagram"));
export const CancelFlowDiagram = dynamic(() => import("./CancelFlowDiagram"));
export const WoohooDeployDiagram = dynamic(() => import("./WoohooDeployDiagram"));
