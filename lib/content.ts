/**
 * Marketing copy for the public pages.
 *
 * Kept out of the database on purpose: the public pages stay static, render
 * without a network call, and cannot break because Supabase is having a bad
 * day. Service `code` values match the rows in supabase/migrations —
 * keep them in step when you add a service.
 */

/* -------------------------------------------------------------------------
   The reading — one inspection result, drawn as the bar the firm hands over.

   Solid cells are touch time: minutes a member of staff is paid for. Hatched
   cells are wait: minutes the invoice sits in a queue. The whole argument of
   the firm is the distance between the two totals, so the hero states it as a
   measurement rather than as a claim.

   Illustrative, and labelled as such on the page. Widths are derived from
   `minutes`, so editing a step re-draws the bar correctly.
   ------------------------------------------------------------------------- */

export interface ReadingStep {
  kind: "touch" | "wait";
  minutes: number;
  label: string;
}

export const reading = {
  process: "Supplier invoice, arrival to approved",
  steps: [
    { kind: "touch", minutes: 6, label: "Logged from the inbox" },
    { kind: "wait", minutes: 35, label: "Sits until the folder is opened" },
    { kind: "touch", minutes: 18, label: "Coded against the purchase order" },
    { kind: "wait", minutes: 52, label: "Waits on the buyer to confirm price" },
    { kind: "touch", minutes: 22, label: "Corrected and re-sent" },
    { kind: "wait", minutes: 68, label: "Waits in the approver queue" },
    { kind: "touch", minutes: 14, label: "Approved" },
    { kind: "wait", minutes: 30, label: "Waits for the payment file" },
    { kind: "touch", minutes: 20, label: "Scheduled for payment" },
  ] as ReadingStep[],
};

export const readingTotals = (() => {
  const sum = (kind: ReadingStep["kind"]) =>
    reading.steps
      .filter((step) => step.kind === kind)
      .reduce((total, step) => total + step.minutes, 0);
  const touch = sum("touch");
  const elapsed = touch + sum("wait");
  const clock = (minutes: number) =>
    `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  // The single longest wait is what an owner recognises first, so the reading
  // names it rather than leaving the reader to eyeball the widest hatch.
  const longestWait = reading.steps
    .filter((step) => step.kind === "wait")
    .reduce((worst, step) => (step.minutes > worst.minutes ? step : worst));

  return {
    touch,
    elapsed,
    touchLabel: clock(touch),
    elapsedLabel: clock(elapsed),
    waitingShare: Math.round(((elapsed - touch) / elapsed) * 100),
    longestWait,
    longestWaitLabel: clock(longestWait.minutes),
    handoffs: 4,
    steps: reading.steps.length,
  };
})();

/* -------------------------------------------------------------------------
   The inspection — what the two free weeks actually hand over. Kept short
   on purpose: the home page states it, /approach explains it.
   ------------------------------------------------------------------------- */

export interface SpecRow {
  key: string;
  value: string;
  /** The fee line is the one we want read, so it gets the pine. */
  accent?: boolean;
}

export const inspectionSpec: SpecRow[] = [
  {
    key: "The map",
    value:
      "Every step, handoff and wait in one real, recurring process — as it runs, not as the org chart says it runs.",
  },
  {
    key: "The numbers",
    value:
      "Touch time, which is what your staff are paid for, and elapsed time, which is what your customer waits through.",
  },
  {
    key: "The plan",
    value:
      "What to automate first, what we would leave alone, and the hours each item returns.",
  },
  {
    key: "Fee",
    value: "None. The map is yours whether or not we build anything.",
    accent: true,
  },
];

/* -------------------------------------------------------------------------
   Selected work — one line each, and the figure it returned. Names are
   withheld by agreement, so the row carries the process, not the client.
   ------------------------------------------------------------------------- */

export interface WorkItem {
  ref: string;
  title: string;
  body: string;
  figure: string;
  unit: string;
}

export const work: WorkItem[] = [
  {
    ref: "01",
    title: "Marketplace sales into the ERP",
    body: "Orders from every online marketplace post themselves into the ERP, priced and coded. Nothing is rekeyed.",
    figure: "40–50h",
    unit: "a month returned",
  },
  {
    ref: "02",
    title: "Sales reconciled to invoices",
    body: "Every sale matched to its invoice automatically. The accounts team sees the exceptions and nothing else.",
    figure: "100h",
    unit: "a month returned",
  },
  {
    ref: "03",
    title: "Daily sales and variance report",
    body: "Sales, movement and what changed, built every morning before anyone arrives. The monthly pack is gone.",
    figure: "Daily",
    unit: "was monthly, by hand",
  },
  {
    ref: "04",
    title: "Orders out of email, into WhatsApp",
    body: "New orders are read out of the inbox and posted to the operations group the moment they land.",
    figure: "10h",
    unit: "a month returned",
  },
  {
    ref: "05",
    title: "Purchase planning and forecasting",
    body: "Daily sales data drives the forecast, so stock is ordered at the right quantity at the right time.",
    figure: "100–150h",
    unit: "a month returned",
  },
  {
    ref: "06",
    title: "Packing list generator",
    body: "Packing lists build themselves from the ERP for high-volume export runs, in the format each buyer wants.",
    figure: "30h",
    unit: "a month returned",
  },
  {
    ref: "07",
    title: "Pricing analytics",
    body: "Prices set from demand and elasticity rather than habit, and tested statistically before they go live.",
    figure: "+20%",
    unit: "gross profit",
  },
];

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
    title: "Discovery Audit",
    intro:
      "A focused review of how work actually moves through your business, where time and accuracy are being lost, and which AI or automation opportunities justify investment.",
    services: [
      {
        code: "PI-01",
        name: "Process discovery and mapping",
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
        name: "AI and automation opportunity roadmap",
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
    title: "Automation and integration",
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
    title: "Ongoing improvement and support",
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
    title: "Team adoption and enablement",
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
