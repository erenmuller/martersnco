"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const stages = [
  {
    label: "The busywork",
    title: "Another order. Another round of admin.",
    description:
      "Your team opens emails, reads PDF orders and copies the details by hand.",
  },
  {
    label: "The connection",
    title: "Let the workflow do the sorting.",
    description:
      "AI extracts the client and order details, then brings them together for your team.",
  },
  {
    label: "The better day",
    title: "Ready to review. Time to move on.",
    description:
      "Order details arrive in your team’s WhatsApp group. Your people check them and stay in control.",
  },
];

export default function WorkflowDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      setPlaying(!media.matches);
    };
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (active === 2) setPlaying(false);
      else setActive(active + 1);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [active, playing, visible, reducedMotion]);

  function select(index: number) {
    setActive(index);
    setPlaying(false);
  }

  return (
    <div
      className={styles.demoWrap}
      ref={root}
      data-playing={playing && visible && !reducedMotion}
    >
      <div className={styles.demoSticker}>
        <span aria-hidden="true">↙</span> Here’s what we mean
      </div>
      <div className={styles.demo}>
        <div className={styles.demoHeader}>
          <span>
            <span className={styles.dot} /> A better day, by design
          </span>
          <span className={styles.demoTag}>AI in action</span>
        </div>
        <div
          className={styles.demoScene}
          data-stage={active}
          aria-hidden="true"
        >
          <div className={styles.sceneTop}>
            <span>A familiar task: email orders</span>
            <span>0{active + 1} / 03</span>
          </div>
          <div className={styles.inputCards}>
            <div>
              <span className={styles.fileIcon}>@</span>
              <span>
                New customer order<small>Inbox · 2 attachments</small>
              </span>
              <span className={styles.inputBadge}>1</span>
            </div>
            <div>
              <span className={styles.fileIcon}>PDF</span>
              <span>
                Order details.pdf<small>Client · items · quantities</small>
              </span>
              <span>↗</span>
            </div>
          </div>
          <div className={styles.flowTrack}>
            <span />
          </div>
          <div className={styles.processing}>
            <span className={styles.processingIcon}>✳</span>
            <span>
              {active === 0
                ? "There’s a simpler way"
                : active === 1
                  ? "Reading & organising"
                  : "Details brought together"}
              <small>
                {active === 0
                  ? "Connect the steps with us"
                  : active === 1
                    ? "Client → items → quantities"
                    : "Ready for a human check"}
              </small>
            </span>
            <span>{active === 2 ? "✓" : "↓"}</span>
          </div>
          <div className={styles.flowTrack}>
            <span />
          </div>
          <div className={styles.outputCard}>
            <span className={styles.outputIcon}>✓</span>
            <div>
              <strong>Order ready for your team</strong>
              <span>WhatsApp · review & confirm</span>
            </div>
            <span className={styles.reviewPill}>You’re in control</span>
          </div>
          <div className={styles.sceneNote}>
            {active === 0
              ? "Less copying. Fewer scattered details."
              : active === 1
                ? "Built around the tools you already use."
                : "AI does the admin. Your people make the call."}
          </div>
        </div>
        <div className={styles.demoControls}>
          <div
            role="tablist"
            aria-label="Explore the order workflow"
            className={styles.demoTabs}
            onFocus={() => setPlaying(false)}
          >
            {stages.map((stage, i) => (
              <button
                key={stage.label}
                type="button"
                role="tab"
                id={`demo-tab-${i}`}
                aria-controls="demo-panel"
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                onClick={() => select(i)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (i + 1) % 3
                      : event.key === "ArrowLeft"
                        ? (i + 2) % 3
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    select(next);
                    buttons.current[next]?.focus();
                  }
                }}
              >
                <span>0{i + 1}</span>
                {stage.label}
              </button>
            ))}
          </div>
          <div
            className={styles.demoCaption}
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`demo-tab-${active}`}
            tabIndex={0}
            onFocus={() => setPlaying(false)}
          >
            <h2>{stages[active].title}</h2>
            <p>{stages[active].description}</p>
          </div>
          <div className={styles.demoFooter}>
            <span>Based on our AI inbox workflow</span>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => {
                  if (playing) setPlaying(false);
                  else {
                    setActive(0);
                    setPlaying(true);
                  }
                }}
              >
                {playing ? "Ⅱ Pause" : "↻ Replay"}
                <span className="sr-only"> workflow animation</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.demoFootnote}>
        <span aria-hidden="true">✦</span> Useful AI. With people at the centre.
      </div>
    </div>
  );
}
