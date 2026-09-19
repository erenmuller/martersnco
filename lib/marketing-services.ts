/** Plain-language services shared by the homepage and services page. */
export const marketingServices = [
  {
    id: "identify",
    title: "Discovery Audit",
    description: "We review your daily work and give you a prioritised plan: what to automate, what it will cost and how much time it could save. The plan is yours to keep.",
    shortDescription: "Find what to automate first, what it will cost and how much time it could save.",
    examples: "Process review · Cost and benefit assessment · Prioritised plan",
    terms: "2–3 weeks · Fixed scope, fixed fee · No obligation to continue",
  },
  {
    id: "implement",
    title: "Automate repetitive tasks",
    description: "We automate data entry, document preparation and routine admin so your team spends less time doing them by hand.",
    shortDescription: "Reduce manual data entry, paperwork and routine admin.",
    examples: "Invoice matching · Payroll files · Packing lists",
  },
  {
    id: "integration",
    title: "Connect your systems",
    description: "We connect your accounting, sales, stock and HR software so information moves between them automatically.",
    shortDescription: "Move data between your accounting, sales, stock and HR software.",
    examples: "Online sales to ERP · Stock updates · Accounting integrations",
  },
  {
    id: "enterprise",
    title: "Build custom software",
    description: "We build apps for the way your business works. You receive the software, source code and accounts.",
    shortDescription: "Get an app built around the way your business works.",
    examples: "Internal tools · Reporting dashboards · Document generators",
  },
  {
    id: "ai-assistants",
    title: "Put AI to work",
    description: "We build AI tools that read documents, find company information and assist with routine decisions. Your staff review the results where needed.",
    shortDescription: "Read documents, find information and handle routine requests with AI.",
    examples: "PDF data extraction · Company knowledge assistants · Email sorting",
  },
  {
    id: "people",
    title: "Staff training",
    description: "We train your staff on the tools they use, with practical exercises and simple instructions they can refer to afterwards.",
    shortDescription: "Help your team use new tools confidently in their daily work.",
    examples: "Software training · AI tool onboarding · Step-by-step guides",
  },
  {
    id: "ai-workshops",
    title: "AI workshops",
    description: "Hands-on sessions for teams and leaders to understand AI, try it on real tasks and identify where it can help the business.",
    shortDescription: "Explore AI with hands-on sessions built around your business.",
    examples: "AI basics · Practical prompting · Leadership briefings",
  },
] as const;

export const discoveryAudit = marketingServices[0];
export const deliveryServices = marketingServices.filter((service) => service.id !== "identify");
