/**
 * Marketing copy and the hero trace data.
 *
 * Kept out of the database on purpose: the public pages stay static, render
 * without a network call, and cannot break because Supabase is having a bad
 * day. Service `code` values match the rows in supabase/migrations —
 * keep them in step when you add a service.
 */

export type StepKind = "human" | "wait" | "auto" | "kept";

export interface TraceStep {
  label: string;
  minutes: number;
  kind: StepKind;
}

/**
 * A supplier invoice moving from arrival to paid. Illustrative — this is a
 * standard finance workflow, not a client's numbers. Two measures matter and
 * they are not the same thing: touch time is what staff are paid for, elapsed
 * time is what the supplier experiences.
 */
export const traceBefore: TraceStep[] = [
  { label: "Invoice lands in a shared inbox", minutes: 5, kind: "human" },
  { label: "Saved, renamed, filed to the drive", minutes: 6, kind: "human" },
  { label: "Keyed into the accounting system", minutes: 12, kind: "human" },
  { label: "Matched to a purchase order by hand", minutes: 15, kind: "human" },
  { label: "Waiting on a missing PO reference", minutes: 40, kind: "wait" },
  { label: "Forwarded to a manager", minutes: 4, kind: "human" },
  { label: "Sitting unread", minutes: 80, kind: "wait" },
  { label: "Approved", minutes: 2, kind: "human" },
  { label: "Added to the payment run", minutes: 18, kind: "human" },
  { label: "Bank details checked a second time", minutes: 9, kind: "human" },
  { label: "Marked paid and filed", minutes: 5, kind: "human" },
];

export const traceAfter: TraceStep[] = [
  { label: "Captured, read and matched", minutes: 1, kind: "auto" },
  { label: "Exception queue — 1 invoice in 9", minutes: 6, kind: "kept" },
  { label: "Approved in one tap", minutes: 2, kind: "kept" },
  { label: "Paid and reconciled", minutes: 1, kind: "auto" },
];

export const touchTime = (steps: TraceStep[]) =>
  steps
    .filter((s) => s.kind === "human" || s.kind === "kept")
    .reduce((total, s) => total + s.minutes, 0);

export const elapsedTime = (steps: TraceStep[]) =>
  steps.reduce((total, s) => total + s.minutes, 0);

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}m`;
}

/* -------------------------------------------------------------------------
   Services
   ------------------------------------------------------------------------- */

export interface ServiceCopy {
  code: string;
  name: string;
  lede: string;
  detail: string;
  deliverables: string[];
  duration: string;
}

export interface ServiceGroup {
  slug: string;
  title: string;
  intro: string;
  services: ServiceCopy[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    slug: "identify",
    title: "Finding the work worth automating",
    intro:
      "Most automation projects fail because nobody measured the process first. We start by watching how work actually moves, which is usually not how the org chart says it moves.",
    services: [
      {
        code: "PI-01",
        name: "Process audit and mapping",
        lede: "A measured map of how work moves through your business today.",
        detail:
          "We sit with the people doing the work, follow a real job end to end, and record every step, handoff and wait. You get numbers: touch time, elapsed time, rework rate, and cost per run. Several clients have stopped here, fixed three things by hand, and been better off.",
        deliverables: [
          "Process map per workflow, with timings",
          "Cost per run and annual load",
          "Ranked list of failure points",
        ],
        duration: "2–3 weeks",
      },
      {
        code: "PI-02",
        name: "Automation opportunity assessment",
        lede: "What to automate first, and what to leave alone.",
        detail:
          "Each candidate is costed against the hours it returns and the risk it carries. We are explicit about the ones we would not touch — judgement calls, low-volume exceptions, and anything where a wrong answer is expensive and hard to spot.",
        deliverables: [
          "Ranked shortlist with effort and return",
          "Written case against the items we rejected",
          "Sequenced plan for the first two quarters",
        ],
        duration: "1–2 weeks",
      },
    ],
  },
  {
    slug: "implement",
    title: "Building it and putting it into service",
    intro:
      "Implementation is the part most consultancies hand to someone else. We do it ourselves, and we stay until the new process is the one your team actually uses.",
    services: [
      {
        code: "AU-01",
        name: "Automation build and rollout",
        lede: "Built, run in parallel, then cut over.",
        detail:
          "New automation runs alongside the manual process until the two agree for a full cycle. Only then does the manual version stop. It is slower to launch and it is the reason rollouts do not get reversed a month later.",
        deliverables: [
          "Working automation in your environment",
          "Parallel-run reconciliation report",
          "Runbook and rollback procedure",
        ],
        duration: "4–8 weeks",
      },
      {
        code: "AU-02",
        name: "Systems integration",
        lede: "Stop re-keying the same data between tools you already pay for.",
        detail:
          "Accounting, CRM, inventory, HR, the spreadsheet that runs a department. We connect them properly, with reconciliation and alerting, rather than a script on somebody's laptop.",
        deliverables: [
          "Integrations with monitoring and retries",
          "Field mapping and reconciliation rules",
          "Failure alerts routed to a real person",
        ],
        duration: "3–6 weeks",
      },
    ],
  },
  {
    slug: "programme",
    title: "Keeping it working",
    intro:
      "An automated process is not finished. Suppliers change formats, staff change habits, and the models underneath these tools change every few months.",
    services: [
      {
        code: "WF-01",
        name: "AI workflow programme",
        lede: "A standing engagement rather than a project that ends.",
        detail:
          "A monthly review of where the workflow has drifted, a small batch of changes shipped each cycle, and a named person who already knows your setup. Priced as a subscription so you can plan around it.",
        deliverables: [
          "Monthly review against the original numbers",
          "Shipped changes each cycle",
          "Named contact, no account handovers",
        ],
        duration: "Rolling, monthly",
      },
      {
        code: "WF-02",
        name: "Managed operations",
        lede: "We watch the systems we built and fix them when they break.",
        detail:
          "Monitoring, incident response, and the unglamorous work of keeping up with vendor and model changes underneath your workflow.",
        deliverables: [
          "Monitoring and alerting we answer",
          "Defined response times",
          "Quarterly written service report",
        ],
        duration: "Rolling, monthly",
      },
    ],
  },
  {
    slug: "enterprise",
    title: "Custom software and infrastructure",
    intro:
      "For work where nothing off the shelf fits the process, and adapting the business to the software would be the more expensive mistake.",
    services: [
      {
        code: "EB-01",
        name: "Custom application build",
        lede: "Software written for one company, handed over in full.",
        detail:
          "Scoped, built and delivered with the source code, the documentation and the deployment. You own it. If you stop working with us, nothing switches off.",
        deliverables: [
          "Application, source and deployment",
          "Technical documentation",
          "Handover to your team or ours",
        ],
        duration: "8–20 weeks",
      },
      {
        code: "EB-02",
        name: "Infrastructure build",
        lede: "The platform underneath, built to be handed over.",
        detail:
          "Data platforms, environments, pipelines, access control and audit. Built on infrastructure you hold the accounts for, not rented back to you at a markup.",
        deliverables: [
          "Infrastructure as code, in your accounts",
          "Access control and audit trail",
          "Environment and release process",
        ],
        duration: "6–16 weeks",
      },
    ],
  },
  {
    slug: "people",
    title: "Your team",
    intro:
      "The system is only as good as the confidence of the people running it. This is not an add-on; it is part of every engagement.",
    services: [
      {
        code: "TE-01",
        name: "Team enablement",
        lede: "Working sessions with the people who will use it daily.",
        detail:
          "Hands on the actual system, not slides. Written runbooks in your own vocabulary, so the knowledge does not leave when someone does.",
        deliverables: [
          "Sessions with each affected team",
          "Runbooks in your terminology",
          "A nominated internal owner, trained",
        ],
        duration: "Throughout",
      },
      {
        code: "TE-02",
        name: "Leadership briefing",
        lede: "What these tools can and cannot do, without the pitch.",
        detail:
          "A half-day with owners and managers covering where automation pays, where it does not, and how to read a proposal from anyone selling it — including us.",
        deliverables: [
          "Half-day session",
          "Written summary and question list",
          "Vendor evaluation checklist",
        ],
        duration: "Half day",
      },
    ],
  },
];

/* -------------------------------------------------------------------------
   Approach — a real sequence, so the phases carry ordering information.
   ------------------------------------------------------------------------- */

export interface Phase {
  marker: string;
  title: string;
  body: string;
  output: string;
}

export const phases: Phase[] = [
  {
    marker: "WK 1–3",
    title: "Inspect and map",
    body: "We follow real jobs through your business and measure them, then audit where AI and automation would pay. No recommendations while we are still counting — just what the process costs in touch time, elapsed time and rework. This stage is free.",
    output: "Measured process map",
  },
  {
    marker: "WK 4–5",
    title: "Prove",
    body: "One workflow, chosen for return rather than for how it demos. Built, then run in parallel with the manual process until the two reconcile.",
    output: "One working automation",
  },
  {
    marker: "WK 6–12",
    title: "Build",
    body: "The rest of the shortlist, sequenced so the changes that return the most hours land first. Your team is in the build, not shown it at the end.",
    output: "Workflows in service",
  },
  {
    marker: "ONGOING",
    title: "Hand over",
    body: "Runbooks, training and access. Everything runs on accounts you control. Continue with a programme if it is useful, stop if it is not — nothing switches off either way.",
    output: "Ownership, with the source",
  },
];

/* -------------------------------------------------------------------------
   The journey — what a client actually moves through, in order.

   Markers carry cost and timing rather than a decorative 01/02/03, because
   the first thing a reader wants to know is what the inspection costs and
   how long they are committing to.
   ------------------------------------------------------------------------- */

export interface Stage {
  marker: string;
  title: string;
  body: string;
  output: string;
}

export const journey: Stage[] = [
  {
    marker: "No fee",
    title: "Inspection",
    body: "We sit with the people doing the work and follow real jobs end to end, timing every step, handoff and wait. Nothing is recommended at this stage. We are only establishing what the work costs you today.",
    output: "Measured process map",
  },
  {
    marker: "No fee",
    title: "AI potential audit",
    body: "Against that map we mark where AI and automation would genuinely pay, and where they would not. Judgement calls, low-volume exceptions and anything expensive to get wrong are named as things to leave alone.",
    output: "Ranked shortlist, with the rejections",
  },
  {
    marker: "Week 3",
    title: "The plan",
    body: "A written plan of what to build and in what order, costed, with the office hours each change returns attached to it. It is a finished piece of work on its own — take it in-house or to another firm if you prefer.",
    output: "Costed plan, hours attached",
  },
  {
    marker: "Week 4–12",
    title: "Build",
    body: "Custom tools for your process, not a product you have to bend the business around. Each one runs alongside the manual version until the two agree for a full cycle, and only then does the manual version stop.",
    output: "Tools in service",
  },
  {
    marker: "Ongoing",
    title: "We look after it",
    body: "Monitoring, incident response, and keeping up with the vendor and model changes underneath your workflow. You own the source and the accounts throughout, so nothing switches off if you stop.",
    output: "Nothing left for you to maintain",
  },
];

/* -------------------------------------------------------------------------
   Commitments — the two numbers we are willing to be held to.
   ------------------------------------------------------------------------- */

export const commitments = [
  {
    figure: "Hours",
    title: "Office hours come back",
    body: "Every plan names the hours it returns. After go-live we re-time the same process against the same clock. If the hours are not there, we keep working on it at no further fee until they are.",
  },
  {
    figure: "Errors",
    title: "Error rates go down",
    body: "Re-keyed figures, missed references, wrong bank details. The inspection records today's error rate, and a build is not signed off until the measured rate is lower than the one we started with.",
  },
];

/* -------------------------------------------------------------------------
   Positioning
   ------------------------------------------------------------------------- */

export const principles = [
  {
    title: "The people who scope it are the people who build it",
    body: "No account manager between you and the work, and no junior learning on your project. It is the direct consequence of staying small, and the main reason we do.",
  },
  {
    title: "We measure before we recommend",
    body: "Every proposal we write carries the numbers it was based on. If the measurement says a process is not worth automating, that is what the report says.",
  },
  {
    title: "You own what we build",
    body: "Source code, infrastructure, accounts and documentation are yours from the start. There is no version of this where leaving us costs you the system.",
  },
  {
    title: "A few clients at a time",
    body: "We take on a small number of engagements concurrently. It limits how fast we grow and it is the only way the first point stays true.",
  },
];

export const faqs = [
  {
    q: "What does an engagement cost?",
    a: "A process audit is a fixed fee agreed before we start, typically covering two to three weeks. Implementation is quoted per workflow once the audit tells us what is actually involved. Programmes are a monthly subscription. We do not quote implementation before measuring, because any number given at that stage is a guess.",
  },
  {
    q: "You are a new firm. Why take the risk?",
    a: "Marters & Co. was established in 2026 and is licensed in the DIFC. We are new as a firm, and we would rather say so than imply a history we do not have. What we offer instead is a first engagement that is small, fixed-price and self-contained: the process audit stands on its own and is useful even if you never work with us again.",
  },
  {
    q: "Do we need to replace our current systems?",
    a: "Usually not, and we will say so when that is the case. Most of the return in a small or mid-sized business comes from connecting tools that already exist and removing manual re-entry between them.",
  },
  {
    q: "Will this mean redundancies?",
    a: "That is your decision and not one we make for you. What we can tell you is what the process costs today and what it would cost afterwards. Most SME clients redeploy the hours rather than the people, because the same team was already behind on other work.",
  },
  {
    q: "What happens to our data?",
    a: "It stays in systems you own. We work in your environment and under your access controls, and we sign a mutual NDA before the first working session. Where a workflow sends data to a third-party model provider, we tell you which one, what it receives, and what the alternatives are.",
  },
  {
    q: "Which industries do you work with?",
    a: "Small and mid-sized businesses in the UAE and the wider Gulf, most often in professional services, trading and distribution, logistics, and clinics. The finance, procurement and onboarding processes underneath them are more alike than most owners expect.",
  },
];
