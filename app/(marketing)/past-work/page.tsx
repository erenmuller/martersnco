import type { Metadata } from "next";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import { NextConversation, PageIntro, SectionTitle } from "../_components/Editorial";
import WorkStories from "./WorkStories";
import s from "./past-work.module.css";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

const description = "Explore eight past Marters & Co. projects and two illustrative ideas: ERP automation, packing lists, reconciliation, stock forecasting, payroll and practical AI workshops.";

export const metadata: Metadata = pageMetadata({
  title: "Past work & practical ideas",
  description,
  path: "/past-work",
});

export default function PastWorkPage() {
  return (
    <>
      <JsonLd data={breadcrumbs({ name: "Past work", path: "/past-work" })} />
      <PageIntro
        label="Past work / A little inspiration"
        title={<>Less busywork.<br /><span>More possibility.</span></>}
        links={<>
          <a href="#examples" className="btn btn-primary">Explore the 10 examples <span aria-hidden="true">↓</span></a>
          <Link href="/contact" className="text-link">Have something in mind? <Arrow diagonal /></Link>
        </>}
        visual={
          <aside className={s.feature} aria-label="Featured project: automatic packing lists">
            <div className={s.featureTop}><span>From the project notebook</span><span>01 / 10</span></div>
            <span className={s.featureLabel}>Automatic packing lists</span>
            <div className={s.featureMetric}>7<span> hours</span></div>
            <p>Given back to the team.<br />Every export.</p>
            <div className={s.featureBeforeAfter}>
              <div><span>Before</span><p>Invoice by invoice.<br />Cell by cell.</p></div>
              <span aria-hidden="true">→</span>
              <div><span>After M&amp;Co.</span><p>Select invoices.<br />Generate the list.</p></div>
            </div>
            <a href="#packing-lists" className={s.featureLink}>See what changed <Arrow diagonal /></a>
          </aside>
        }
      >
        A packing list that writes itself. Sales that arrive in your ERP each morning.
        A team finding new uses for AI. Explore what a better working day can look like.
      </PageIntro>

      <div className="page">
        <div className={s.collectionNote}>
          <span>08 past projects <span aria-hidden="true">/</span> 02 illustrative ideas</span>
          <p>Client names are kept private. The final two examples are ideas for inspiration.</p>
        </div>
      </div>

      <section className={`page studio-section ${s.collection}`} id="examples" aria-labelledby="examples-heading">
        <SectionTitle label="The collection / Before & after" title={<span id="examples-heading">Small changes.<br /><span className={s.muted}>A different working day.</span></span>}>
          Open an example to see the original process, what changed and the result.
          You might recognise something from your own business.
        </SectionTitle>
        <WorkStories />
        <p className={s.footnote}>Figures describe the individual projects shown, rather than a promised result for every business. Illustrative ideas describe proposed workflows and have no measured client outcomes.</p>
      </section>

      <NextConversation showPastWork={false} label="Your next possibility" title={<>Recognise a task<br />from your own day?</>}>
        Tell us which example caught your eye, or bring us a different challenge.
        We’ll help you explore what could work for your team.
      </NextConversation>
    </>
  );
}
