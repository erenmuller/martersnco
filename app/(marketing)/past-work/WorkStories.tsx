"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import { pastWork } from "@/lib/past-work";
import s from "./past-work.module.css";

export default function WorkStories() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function openLinkedStory() {
      const story = Array.from(
        listRef.current?.querySelectorAll("details") ?? [],
      ).find((item) => `#${item.id}` === window.location.hash);
      if (story) {
        story.open = true;
        story.scrollIntoView({ block: "start" });
      }
    }
    openLinkedStory();
    window.addEventListener("hashchange", openLinkedStory);
    return () => window.removeEventListener("hashchange", openLinkedStory);
  }, []);

  return (
    <div ref={listRef} className={s.stories}>
      {pastWork.map((work, index) => (
        <details
          id={work.id}
          className={s.story}
          key={work.id}
          open={index === 0}
        >
          <summary>
            <span className={s.number}>{String(index + 1).padStart(2, "0")}</span>
            <span className={s.summaryCopy}>
              <span className={s.category}>
                {work.area}
                {work.illustrative && <span className={s.ideaTag}>Illustrative idea</span>}
              </span>
              <span className={s.title}>{work.title}</span>
              <span className={s.context}>{work.context}</span>
            </span>
            <span className={s.metric}>
              <strong>{work.figure}<small>{work.suffix && ` ${work.suffix}`}</small></strong>
              <span>{work.unit}</span>
            </span>
            <span className={s.toggle} aria-hidden="true">+</span>
          </summary>
          <div className={s.storyBody}>
            <div className={s.comparison}>
              <section className={s.before} aria-label="Before">
                <h3>Before <span>/ The everyday friction</span></h3>
                <p>{work.before}</p>
              </section>
              <section className={s.after} aria-label={work.illustrative ? "Proposed approach" : "After Marters & Co."}>
                <h3>{work.illustrative ? "The idea" : "After"} <span>/ {work.illustrative ? "What we could build" : "Marters & Co."}</span></h3>
                <p>{work.after}</p>
              </section>
            </div>
            <div className={s.workflow}>
              <span className={s.workflowLabel}>{work.illustrative ? "Proposed workflow" : "The workflow"}</span>
              <ol>
                {work.workflow.map((step, i) => (
                  <li key={step}>
                    {i > 0 && <span className={s.flowArrow} aria-hidden="true">→</span>}
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className={s.storyEnd}>
              <p><span aria-hidden="true">↳</span> {work.result}</p>
              <Link href="/contact" className="text-link">Discuss a similar project <Arrow diagonal /></Link>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
