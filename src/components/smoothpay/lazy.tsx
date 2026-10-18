"use client";

import dynamic from "next/dynamic";

/* Diagrams load as their own chunks: a case study ships only the diagrams it renders.
 * Server-rendered as before (dynamic keeps SSR), so the HTML and SEO are unchanged. */
export const SmoothPayArchitectureDiagram = dynamic(() => import("./SmoothPayArchitectureDiagram"));
export const MerchantOrderFlowDiagram = dynamic(() => import("./MerchantOrderFlowDiagram"));
export const OrderFlowDiagram = dynamic(() => import("./OrderFlowDiagram"));
export const CheckoutFlowDiagram = dynamic(() => import("./CheckoutFlowDiagram"));
export const PaymentLinkDiagram = dynamic(() => import("./PaymentLinkDiagram"));
export const RbacDiagram = dynamic(() => import("./RbacDiagram"));
export const MembershipLifecycleDiagram = dynamic(() => import("./MembershipLifecycleDiagram"));
