-- =============================================================================
-- Service catalogue
--
-- This is the *operational* list an admin assigns to clients. The narrative
-- copy on the marketing site lives in lib/content.ts and is deliberately not
-- read from the database, so the public pages stay fully static. Codes match
-- across both — keep them in step when you add a service.
-- =============================================================================

insert into public.services (code, name, summary, category, sort_order) values
  ('PI-01', 'Process audit and mapping',
   'Two to three weeks on site and in your systems, producing a measured map of how work actually moves — steps, handoffs, wait time and cost per run.',
   'process_identification', 10),

  ('PI-02', 'Automation opportunity assessment',
   'A ranked shortlist of what to automate first, each item costed against the hours it returns, with what we would not touch and why.',
   'process_identification', 20),

  ('AU-01', 'Automation build and rollout',
   'We build the automation, run it alongside the manual process until the numbers agree, then cut over.',
   'automation_implementation', 30),

  ('AU-02', 'Systems integration',
   'Connecting the tools you already pay for so data stops being re-keyed between them.',
   'automation_implementation', 40),

  ('WF-01', 'AI workflow programme',
   'An ongoing engagement: a standing review of where the workflow drifts, monthly changes shipped, and a named contact who knows your setup.',
   'workflow_program', 50),

  ('WF-02', 'Managed operations',
   'We monitor and maintain the systems we built, including the model and vendor changes underneath them.',
   'workflow_program', 60),

  ('EB-01', 'Custom application build',
   'Software written for one company because nothing off the shelf fits the process. Delivered with the source, the documentation and the deployment.',
   'enterprise_build', 70),

  ('EB-02', 'Infrastructure build',
   'Data platforms, environments, pipelines and the access controls around them. Built to be handed over, not rented back to you.',
   'enterprise_build', 80),

  ('TE-01', 'Team enablement',
   'Working sessions with the people who will use the system daily, plus written runbooks in your own vocabulary.',
   'enablement', 90),

  ('TE-02', 'Leadership briefing',
   'A half-day with owners and managers on what these tools can and cannot do, and how to judge a proposal from anyone selling them.',
   'enablement', 100)
on conflict (code) do update
  set name       = excluded.name,
      summary    = excluded.summary,
      category   = excluded.category,
      sort_order = excluded.sort_order;
