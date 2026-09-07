"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import { pastWork } from "@/lib/past-work";

const work = [
  { ...pastWork[3], area: "Finance" },
  { ...pastWork[4], area: "Planning" },
  { ...pastWork[1], area: "Operations" },
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
          <span className="studio-label">{study.area}</span>
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
          <Link href={`/past-work#${study.id}`} className="text-link">
            See the full before & after <Arrow />
          </Link>
        </div>
        <div className="work-illustration" key={`visual-${active}`}>
          <div className="workflow-caption">
            <span>A closer look at the workflow</span>
            <span aria-hidden="true">↗</span>
          </div>
          <div
            className="workflow-diagram"
            aria-label={`${study.workflow[0]}, then ${study.workflow[1]}, then ${study.workflow[2]}`}
          >
            <div className="workflow-node">
              <span className="node-symbol" aria-hidden="true">
                ≡
              </span>
              {study.workflow[0]}
              <span className="node-dot" />
            </div>
            <div className="workflow-connector" aria-hidden="true">
              <span />
            </div>
            <div className="workflow-node workflow-node-active">
              <span className="node-symbol" aria-hidden="true">
                ✳
              </span>
              {study.workflow[1]}
              <span className="node-dot" />
            </div>
            <div className="workflow-connector" aria-hidden="true">
              <span />
            </div>
            <div className="workflow-node">
              <span className="node-symbol" aria-hidden="true">
                ✓
              </span>
              {study.workflow[2]}
              <span className="node-dot" />
            </div>
          </div>
          <div className="work-result">
            <strong>
              {study.figure}
              <span>{study.suffix && ` ${study.suffix}`}</span>
            </strong>
            <span>{study.unit}</span>
          </div>
        </div>
      </div>
      <p className="work-footnote">
        Outcomes from delivered projects. What’s possible for your
        business starts with understanding your processes.
      </p>
    </div>
  );
}
