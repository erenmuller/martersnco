"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Arrow from "@/components/Arrow";

const work = [
  {
    area: "Finance",
    title: "Reconciliation, without the repetition.",
    before:
      "Every sale matched to its invoice by hand. Every difference investigated one by one.",
    after:
      "A workflow that matches clean transactions automatically and brings only the exceptions to your team.",
    figure: "100",
    unit: "staff hours returned each month",
    input: "Sales & invoices",
    process: "Match & reconcile",
    output: "Exceptions for review",
    kind: "Workflow automation",
  },
  {
    area: "Planning",
    title: "Better purchasing starts with a clearer picture.",
    before:
      "Purchase decisions depended on manually assembled sales files and repeated spreadsheet work.",
    after:
      "A planning tool that turns daily sales data into forecasts and recommended purchase quantities.",
    figure: "100–150",
    unit: "staff hours returned each month",
    input: "Daily sales data",
    process: "Forecast demand",
    output: "Purchase recommendations",
    kind: "Custom planning software",
  },
  {
    area: "Operations",
    title: "From marketplace to ERP, without re-keying.",
    before:
      "Orders from several marketplaces were entered again in the ERP, creating delays and avoidable errors.",
    after:
      "A connected workflow that validates, prices, codes and posts orders into the ERP automatically.",
    figure: "40–50",
    unit: "staff hours returned each month",
    input: "Marketplace orders",
    process: "Validate & price",
    output: "Orders in your ERP",
    kind: "Systems integration",
  },
];

export default function SelectedWork() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const study = work[active];

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % work.length;
    else if (event.key === "ArrowLeft")
      next = (index + work.length - 1) % work.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = work.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="selected-work">
      <div
        className="work-tabs"
        role="tablist"
        aria-label="Explore selected work"
      >
        {work.map((item, index) => (
          <button
            key={item.area}
            type="button"
            role="tab"
            id={`work-tab-${index}`}
            aria-controls="work-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            onKeyDown={(event) => handleKey(event, index)}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            {item.area}
            <Arrow diagonal />
          </button>
        ))}
      </div>
      <div
        id="work-panel"
        role="tabpanel"
        aria-labelledby={`work-tab-${active}`}
        tabIndex={0}
        className="work-panel"
      >
        <div className="work-story" key={`story-${active}`}>
          <span className="studio-label">{study.kind}</span>
          <h3>{study.title}</h3>
          <dl>
            <div>
              <dt>The everyday friction</dt>
              <dd>{study.before}</dd>
            </div>
            <div>
              <dt>What we built</dt>
              <dd>{study.after}</dd>
            </div>
          </dl>
          <Link href="/contact" className="text-link">
            Explore what’s possible for you <Arrow />
          </Link>
        </div>
        <div className="work-illustration" key={`visual-${active}`}>
          <div className="workflow-caption">
            <span>A closer look at the workflow</span>
            <span aria-hidden="true">↗</span>
          </div>
          <div
            className="workflow-diagram"
            aria-label={`${study.input}, then ${study.process}, then ${study.output}`}
          >
            <div className="workflow-node">
              <span className="node-symbol" aria-hidden="true">
                ≡
              </span>
              {study.input}
              <span className="node-dot" />
            </div>
            <div className="workflow-connector" aria-hidden="true">
              <span />
            </div>
            <div className="workflow-node workflow-node-active">
              <span className="node-symbol" aria-hidden="true">
                ✳
              </span>
              {study.process}
              <span className="node-dot" />
            </div>
            <div className="workflow-connector" aria-hidden="true">
              <span />
            </div>
            <div className="workflow-node">
              <span className="node-symbol" aria-hidden="true">
                ✓
              </span>
              {study.output}
              <span className="node-dot" />
            </div>
          </div>
          <div className="work-result">
            <strong>
              {study.figure}
              <span> h</span>
            </strong>
            <span>{study.unit}</span>
          </div>
        </div>
      </div>
      <p className="work-footnote">
        Measured outcomes from delivered projects. What’s possible for your
        business starts with understanding your processes.
      </p>
    </div>
  );
}
