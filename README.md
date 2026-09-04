# Marters & Co.

Website and private client workspace for Marters & Co., a DIFC-licensed AI and
automation implementation consultancy in Dubai.

The application uses Next.js 15, React 19, TypeScript, Tailwind CSS 4 and
Supabase. Public marketing pages are statically rendered. Supabase provides
email/password authentication, tenant-scoped portal data, the admin data model,
private document storage and contact enquiries. The frontend is intended for
Vercel.

## Requirements

- Node.js 20.9 or newer (the project is currently developed with Node 22)
- npm 10+
- A Supabase project for hosted environments
- Docker-compatible container runtime and the Supabase CLI for local Supabase
  development

## Run the frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. The public pages render without Supabase, but
login, portal, admin and contact persistence require the Supabase variables in
`.env.local`.

Before handing off a change, run:

```bash
npm run lint
npm run typecheck
npm run build
```

`package.json` temporarily overrides Next 15's transitive `postcss` and `sharp`
versions to patched releases. Keep those overrides until a tested 15.5
maintenance patch carries equivalent dependency updates, then remove them and
confirm `npm audit` still reports zero vulnerabilities. A further Next.js
security release is scheduled for 26 August 2026; review and apply its supported
15.5 patch promptly rather than assuming this lockfile remains current.

## Environment variables

Start from `.env.example`. Never commit `.env.local` or a real secret key.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase publishable/legacy anon client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Supabase secret/legacy service-role key; bypasses RLS |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical origin, without a trailing slash |
| `NEXT_PUBLIC_LEGAL_NAME` | Public | Exact registered entity name; blank falls back to `Marters & Co.` |
| `NEXT_PUBLIC_DIFC_LICENCE` | Public | Exact DIFC commercial licence number; leave empty until verified |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Contact address shown on the site |
| `NEXT_PUBLIC_PHONE_DISPLAY` | Public | Human-readable business phone; empty hides phone UI |
| `NEXT_PUBLIC_PHONE_E164` | Public | Matching E.164 phone value such as `+971...`; empty hides phone UI |
| `CONTACT_RATE_LIMIT_SECRET` | Server secret | Key used to digest requester identifiers before rate limiting |
| `EMAIL_PROVIDER` | Server | `console` (default, logs instead of sending) or `resend` |
| `RESEND_API_KEY` | Server secret | Resend API key with sending access; required when `EMAIL_PROVIDER=resend` |
| `EMAIL_FROM` | Server | From header, on a domain verified with the provider |
| `EMAIL_REPLY_TO` | Server | Optional reply-to address |
| `WHATSAPP_PROVIDER` | Server | `console` while OTP is disabled; `meta` only when the feature is launched |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Server secret | Meta Cloud API sender ID |
| `META_WHATSAPP_TOKEN` | Server secret | Meta Cloud API token |
| `META_WHATSAPP_TEMPLATE` | Server | Approved OTP template name |
| `META_WHATSAPP_TEMPLATE_LOCALE` | Server | Approved template locale |

Generate the contact limiter secret with at least 32 random bytes:

```bash
openssl rand -hex 32
```

Use separate Supabase projects and keys for local, preview and production. In
particular, do not put the production service-role key in a Vercel preview.

## Supabase setup

The schema is migration-first. Files in `supabase/migrations` are applied in
lexical order and create:

- profiles and role/tenant helpers;
- clients, the operational service catalogue and client engagements;
- subscriptions, client requests and contact leads;
- a private `client-documents` Storage bucket;
- audit and WhatsApp OTP infrastructure;
- row-level security policies; and
- a service-only fixed-window rate limiter.

### Migration map

| Migration | Purpose |
| --- | --- |
| `20260101000000_init.sql` | Core types, tables, tenant helpers, profile trigger and updated-at triggers |
| `20260101000001_rls.sql` | Browser-role grants, row-level policies and the private document bucket |
| `20260101000002_seed_services.sql` | Idempotent operational service-catalogue seed data |
| `20260101000003_security_hardening.sql` | Safe new-user defaults, protected profile fields and service-only contact rate limiting |
| `20260101000004_private_column_access.sql` | Safe read/insert column grants, client request invariants, and assigned inactive-service visibility |
| `20260101000005_document_path_integrity.sql` | Final-path ownership constraint and metadata-backed client Storage reads |

The final column-access migration is intentionally separate and idempotent so
it also closes the exposure on projects that applied earlier migrations before
the restriction was added.

### Option A: local Supabase

The [Supabase CLI workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
requires a Docker-compatible runtime. From the repository root:

```bash
npx supabase init
npx supabase start
npx supabase db reset
```

`supabase init` creates `supabase/config.toml`; commit that generated file after
reviewing it. `db reset` destroys only the local database, then replays all
migrations. Do not add `--linked` unless you intentionally mean to erase a
throwaway remote development project.

The `supabase start` output contains the local API URL, publishable/anon key,
secret/service-role key, Studio URL and local mail viewer URL. Copy the three
keys needed by the app to `.env.local`, and use:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

If the stack is already running, `npx supabase status` prints those values
again. Local Studio normally provides the easiest way to inspect Auth users,
tables and captured development emails.

### Option B: hosted Supabase

Create a project in Supabase, then use the CLI so migration history remains
reproducible:

```bash
npx supabase init
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Review the dry run before applying it. `db push` records applied migrations in
Supabase migration history and only applies pending files. Never run
`supabase db reset --linked` against production.

For a one-off empty project, the SQL editor can execute each migration file in
order, but the CLI is preferred because it records migration state.

After migrations, copy the project URL, publishable/anon key and backend
secret/service-role key from the Supabase dashboard into the matching Vercel
environment.

### Authentication settings

In Supabase Authentication settings:

1. Keep email/password authentication enabled.
2. Disable public user sign-up. Accounts are provisioned by an administrator.
3. Set the production Site URL to the canonical `NEXT_PUBLIC_SITE_URL`.
4. Add only trusted invite/password-recovery callback origins to the redirect
   allow-list: localhost for local development, the production domain, and any
   preview domains that genuinely need private-area testing.
5. Configure a production SMTP provider and review the invite and password
   recovery templates before inviting a client.

Supabase silently falls back to the Site URL when an invite `redirectTo` is not
allow-listed, so test a real invite after changing domains.

#### Onboarding email (invitations)

**The invitation email is sent by this application, not by Supabase.** When an
admin invites a user, `inviteUserAction` calls `auth.admin.generateLink` — which
creates the auth user and returns a one-time token but sends nothing — and then
sends the branded message in `lib/email/onboarding.ts` through the provider in
`lib/email/send.ts`. So the Supabase *Invite user* template is not used and does
not need configuring.

To turn sending on:

1. Create an account at [resend.com](https://resend.com) and add your sending
   domain (Domains → Add Domain). Resend gives you DKIM, SPF and return-path
   DNS records; add them at your registrar and wait for the domain to show as
   **Verified**. Mail sent from an unverified domain is rejected or filed as
   spam.
2. Create an API key under **API keys** with *Sending access* only.
3. Set these in your deployment environment (Vercel → Settings → Environment
   Variables) and in `.env.local` if you want to send from your machine:

   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   EMAIL_FROM="Marters & Co. <hello@martersandco.com>"
   EMAIL_REPLY_TO=hello@martersandco.com   # optional
   ```

   `EMAIL_FROM` must use the domain you verified in step 1.
4. `NEXT_PUBLIC_SITE_URL` must be set to the canonical origin. The invite link
   is built from it, and the invite action refuses to run without it.
5. Add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to the Supabase redirect
   allow-list (Authentication → URL Configuration), plus
   `http://localhost:3000/auth/callback` for local work.
6. Invite yourself at `/admin/users` and complete the flow end to end before
   inviting a client.

Leaving `EMAIL_PROVIDER` unset (or `console`) prints the message and its link
to the server log instead of sending. That is the default, so local development
and preview deploys never mail a real person — and you can still finish an
invite locally by pasting the logged link into the browser. The admin console
says which happened: the confirmation reads "onboarding email sent" or "email
is in console mode".

To use a provider other than Resend, add a class implementing `EmailProvider`
in `lib/email/send.ts` and a case in `selectProvider`. The interface is one
method.

#### What the invited user sees

1. The onboarding email: who it is from, why it arrived, one **Choose your
   password** button, and the same URL in plain text underneath for clients
   that strip buttons.
2. `/auth/callback` verifies the one-time token, establishes the cookie
   session, and forwards to `/welcome`.
3. `/welcome` greets them by name, names their organisation, and takes a
   password (minimum 10 characters, typed twice).
4. They land straight in `/portal` — or `/admin` for an admin — already signed
   in. They are not asked to sign in again with a password they just chose.

Links are one-time and expire. If one is used or lapses, an admin can issue a
fresh one from **Re-send invitation** on the user's row in `/admin/users`. That
control refuses once the account has been signed into, because an invite link
signs its holder straight in and must never be issued for an account already in
use; at that point the correct route is the user resetting their own password
from the sign-in page.

#### Password recovery email links

Recovery mail is still sent by Supabase, because `resetPasswordForEmail` sends
it itself. Two link shapes can come back, and `/auth/callback` handles both:

| Template | Arrives as | Notes |
| --- | --- | --- |
| Stock `{{ .ConfirmationURL }}` | `?code=…` | Carries no `type`. Exchanging it needs the PKCE cookie set in **the same browser** that asked for the reset, so a link requested on a laptop and opened on a phone fails. |
| SSR `token_hash` form (below) | `?token_hash=…&type=recovery` | Self-describing, and works in any browser. **Use this one.** |
| Implicit-flow project | `#access_token=…` | A fragment, invisible to the server. `/auth/callback` forwards to `/auth/complete`, which reads it in the browser and continues. |

In Authentication → Email Templates, make the **Reset password** action link:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">
  Reset password
</a>
```

`resetPasswordForEmail` passes a bare `/auth/callback` as `redirectTo`, with no
query string of its own — the template appends `?token_hash=…` to it, and a
second `?` in the URL would swallow the token. The callback verifies whichever
parameters it gets, establishes the cookie session, and defaults to the
password form, because nothing but invitations and recoveries reaches it.
Recovery signs the user out at the end so they prove the new password; an
invitation does not, because they have just set it.

Also add every callback origin to Authentication → URL Configuration →
Redirect URLs, including `http://localhost:3000/**` for local work. Supabase
silently falls back to the Site URL when `redirectTo` is not allow-listed, so
re-test after changing domains.

For local Supabase, configure the equivalent template in `supabase/config.toml`.
Test a real password reset in every deployed environment — the link is one-time
and expires. Note that some corporate mail scanners follow links before the
recipient does, which burns a one-time token; that is what the "already been
used" message on `/auth/complete` is about.

### Create the first administrator

There is intentionally no metadata shortcut for authorization. Every new Auth
user is created as an active but **unlinked client**, which cannot enter any
tenant portal. Fields supplied in `user_metadata` never determine `role` or
`client_id`.

If a remote project ever ran an earlier copy of the init migration that trusted
authorization metadata, applying the hardening migration protects future users
but cannot identify which existing assignments were legitimate. Audit every
existing `profiles.role` and `profiles.client_id` value before reopening access.

Create the owner user first in Supabase Studio/Dashboard under Authentication
→ Users. Then run the following once in the SQL editor, replacing the email:

```sql
do $$
declare
  target_user_id uuid;
begin
  select id
    into target_user_id
    from auth.users
   where lower(email) = lower('owner@example.com');

  if target_user_id is null then
    raise exception 'Auth user not found';
  end if;

  update public.profiles
     set role = 'admin',
         client_id = null,
         is_active = true
   where id = target_user_id;
end;
$$;
```

Sign out and back in after changing a role. Do not build a public “make me an
admin” RPC, and never authorize from `raw_user_meta_data`/`user_metadata`.

### Create clients and invite users

The normal application flow is:

1. An authenticated admin creates a row in `public.clients`.
2. A server action calls `requireAdmin()` before creating a service-role client.
3. That trusted client calls `auth.admin.generateLink` to create the auth user
   and mint a one-time token, then sends the app's own onboarding email.
   Optional metadata may contain presentation data such as `full_name`, never a
   role or client ID.
4. After the Auth API returns the new user ID, the same trusted flow updates
   `public.profiles.role` and `public.profiles.client_id` explicitly.
5. If profile assignment fails, report the partial invite and make the action
   safe to retry; Auth and database writes are not one transaction.

The equivalent manual bootstrap for a client is:

```sql
insert into public.clients (name, legal_name, status)
values ('Example Trading', 'Example Trading LLC', 'active')
returning id;

-- Create or invite the Auth user in Dashboard/Studio first, then use the IDs:
update public.profiles
   set role = 'client',
       client_id = 'CLIENT_UUID_FROM_ABOVE',
       is_active = true
 where id = 'AUTH_USER_UUID';
```

An unlinked client is redirected with `error=unlinked`; that is a provisioning
state, not a reason to weaken the tenant check.

Browser-authenticated users may update only `full_name` and `phone_e164` on
their profile. Email changes must go through Supabase Auth so `auth.users` stays
authoritative. Role, tenant assignment, active state and WhatsApp verification
are trusted server changes.

### Documents and Storage

Migration `20260101000001_rls.sql` creates a private bucket named
`client-documents`, with a 25 MiB object limit. Object names must use:

```text
<client_id>/<safe-generated-filename>
```

The first path segment is a tenant boundary enforced by Storage RLS. Admins can
upload/update/delete; a client can read only an object in its own prefix that
also has a matching, tenant-owned `public.documents` row. The final-path check
keeps that row's `storage_path` aligned with `client_id`, while metadata-free
orphans remain client-invisible. Serve downloads with an authenticated download
or a short-lived signed URL—never convert the bucket to public.

Do not send a 25 MiB file through a Vercel Server Action: Vercel request bodies
are capped well below the bucket limit (approximately 4.5 MiB). Use a signed
staged direct-upload flow instead:

1. A small server action calls `requireAdmin()`, validates client/document
   metadata, generates a collision-safe
   `_pending/<admin_id>/<generated-filename>` path, and asks Supabase Storage
   for a short-lived signed upload token. The actor ID must come from the
   verified session, never form input.
2. The browser uploads the bytes directly to that pending path with the token.
   Pending objects are never client-readable and never get a
   `public.documents` row.
3. A second action calls `requireAdmin()` again, verifies the pending path
   belongs to that actor plus the stored object's size and content type, then
   moves it to a server-generated `<client_id>/<generated-filename>` final path.
4. Only after the move succeeds, insert the matching `public.documents` row
   and attempt its audit event. The final-path check constraint and Storage
   policy make the object client-readable only when both path and metadata
   agree on the tenant.

Validate extension, declared MIME type and expected size before issuing the
token, then verify the stored object again while finalizing. Generate the final
object name server-side and treat the original filename as display metadata.

Storage moves, metadata inserts and audit writes are separate operations, not
one transaction. On any failed finalization, remove the pending object when
possible. If a move succeeds but metadata creation fails, attempt to remove the
final object; if cleanup also fails, it remains unreadable to clients because
there is no matching metadata row. Periodically reconcile stale `_pending`
objects, final-prefix objects without metadata, and metadata whose object is
missing. Use age thresholds so an in-flight upload is not mistaken for an
orphan.

Before applying `20260101000005_document_path_integrity.sql` to a project with
existing document rows, this legacy-path audit must return zero rows:

```sql
select id, client_id, storage_path
from public.documents
where not starts_with(storage_path, client_id::text || '/');
```

If it returns anything, verify the real Storage object and tenant first, then
move the object and update metadata together during a maintenance window. Do
not merely rewrite the client UUID in metadata. The migration validates every
existing row and intentionally fails rather than accepting an ambiguous path.

### Contact rate limiting

Migration `20260101000003_security_hardening.sql` adds this service-role-only
RPC:

```text
consume_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) -> { allowed boolean, remaining integer, reset_at timestamptz }
```

The server action should derive `p_key_hash` as a lowercase 64-character
HMAC-SHA-256 digest using `CONTACT_RATE_LIMIT_SECRET`. Hash a normalized
requester address plus a scope value; never send a raw IP address or email to
the table. The current contact policy consumes two independent windows: three
attempts per normalized email per hour and ten attempts per trusted requester
IP per hour. For example, the email window is:

```ts
const { data, error } = await admin.rpc("consume_rate_limit", {
  p_scope: "contact:email",
  p_key_hash: keyHash,
  p_limit: 3,
  p_window_seconds: 3600,
}).single();
```

The IP call uses `p_scope: "contact:ip"` with `p_limit: 10`. Require both calls
to allow the submission. Derive the address only from headers set by the trusted
deployment proxy; arbitrary client-supplied forwarding headers are not an
identity boundary.

The counter uses an atomic upsert, so concurrent requests cannot race past the
limit. `PUBLIC`, `anon` and `authenticated` have no execution or table grants;
only a trusted server with the service role can consume a slot.

Schedule periodic cleanup appropriate to traffic, for example weekly:

```sql
delete from public.rate_limits
where window_started_at < now() - interval '7 days';
```

Rate limiting reduces automated abuse; it does not replace Vercel WAF rules or
a challenge such as Cloudflare Turnstile if the form becomes a sustained target.

### WhatsApp OTP is infrastructure-only

WhatsApp OTP is intentionally not active in v1. The migration creates a locked
`otp_challenges` table and `lib/whatsapp.ts` contains console and Meta provider
adapters, code hashing and verification helpers. Nothing in the app should call
them yet.

Keep `WHATSAPP_PROVIDER=console` or unset. Before switching to `meta`, add the
request/verify UI, persistence, expiry/attempt enforcement, replay protection,
rate limits, recovery handling, an approved Meta template and end-to-end tests.
The console provider prints development codes to server logs; never mistake it
for a production second factor.

## Deploy to Vercel

1. Push the repository to a private Git host and import it into Vercel.
2. Use `npm run build` as the build command. No framework override is needed.
3. Add all required environment variables separately to Production and Preview.
   Public `NEXT_PUBLIC_*` values are compiled into the frontend; server secrets
   must never use that prefix.
4. Apply Supabase migrations independently before deploying code that expects
   them. Do not run destructive database setup in the Vercel build.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin, then update Supabase
   Site URL and redirect allow-list to match.
6. Deploy, test login/logout/password recovery, invite one test client, verify
   tenant isolation, upload/download a document, file a request and submit the
   public contact form.

Use a separate Supabase project for previews that need authenticated testing.
Preview code with a production service key can bypass every production RLS
policy and is not an acceptable shortcut.

## Security model

- Middleware is a fast private-route gate; every private page/action must still
  call `requireClient()` or `requireAdmin()` server-side.
- RLS is the tenant row boundary. Client rows are selected through
  `current_client_id()`; admins have explicit policies.
- Column privileges are a second boundary. The `authenticated` role cannot
  select `clients.notes`, `client_services.notes`, `subscriptions.notes` or
  `requests.admin_notes`, including when its JWT profile has the admin role.
  An admin view that genuinely needs those fields must call `requireAdmin()`
  first, then use a server-only service-role client with an explicit projection.
- Browser-authenticated request inserts can supply only `client_id`,
  `created_by`, `subject`, `body` and `priority`. RLS also requires a client
  request to belong to the caller, be authored by the caller, start `open`, and
  have no admin notes or resolution timestamp. Identifiers, workflow state and
  timestamps remain database/admin-owned.
- Anonymous catalogue reads remain active-only. An authenticated client can
  also resolve an inactive service only when it is already assigned to that
  client's engagement, so historical records retain their service details;
  admins can read the full catalogue.
- The service-role/secret key bypasses RLS. It is permitted only after server-side
  authorization, except for narrowly scoped anonymous operations such as a
  validated and rate-limited contact submission.
- New-user metadata is not authorization. New profiles are unlinked by default.
- Profile column grants and a trigger protect role, tenant assignment, active
  status and WhatsApp verification.
- `leads`, `otp_challenges` and `rate_limits` are inaccessible to browser roles.
- The private document bucket uses the client UUID as its first path segment.
- Audit rows are service-role writes. Admin mutations should make a best-effort
  audit write with actor, action, entity and non-secret metadata. Current app
  mutations and their audit insert are separate, non-transactional operations;
  move compliance-critical audit creation into a database RPC or trigger so it
  commits atomically with the operational change.

PostgreSQL rejects `select("*")` when even one selected column lacks privilege;
RLS does not silently remove that column. Portal queries must therefore use
explicit projections drawn from these client-safe grants:

| Table | Authenticated safe-column grant |
| --- | --- |
| `clients` | `id, name, legal_name, status, industry, primary_contact_name, primary_contact_email, created_at, updated_at` |
| `client_services` | `id, client_id, service_id, status, started_on, ended_on, owner_name, created_at, updated_at` |
| `subscriptions` | `id, client_id, plan_name, status, billing_period, amount_minor, currency, started_on, renews_on, cancelled_at, created_at, updated_at` |
| `requests` | `id, client_id, created_by, subject, body, status, priority, created_at, updated_at, resolved_at` |

Nested service-catalogue data remains readable under the existing `services`
policy. Never add an internal note column to a portal projection. Adding a new
client-visible column requires both an explicit query projection and an
intentional column grant in a new migration; private columns stay service-only.

When changing policies, test with at least two client accounts plus one admin.
Prove that each client cannot read, infer or download the other client's data.

## Project map

```text
app/(marketing)        static public pages and contact form
app/(auth)             login, invitation onboarding and recovery routes
app/portal             tenant-scoped client workspace
app/admin              administrator workspace
components             shared UI
lib/auth.ts            server-side role guards
lib/supabase           browser/server/service-role clients and middleware
lib/email              transactional email provider and the onboarding message
lib/types.ts           application row shapes and display maps
lib/whatsapp.ts        dormant WhatsApp OTP provider infrastructure
supabase/migrations    schema, RLS, storage, seed catalogue and hardening
public/llms.txt        AI-readable firm/service summary
```

The public service prose in `lib/content.ts` is intentionally static for
predictable SEO rendering. The `public.services` table is the operational
catalogue assigned to clients. Keep their service codes and names aligned when
changing the offering.

## Launch checklist

- [ ] Set `NEXT_PUBLIC_LEGAL_NAME` and `NEXT_PUBLIC_DIFC_LICENCE` from the
      licence; leave either blank rather than publishing an unverified value.
- [ ] Verify every DIFC claim against the licence.
- [ ] Verify the contact mailbox and configure its SPF, DKIM and DMARC records.
- [ ] Set real phone values together, or leave both phone variables empty.
- [ ] Set the canonical production URL and Supabase redirect allow-list.
- [ ] Disable public Supabase sign-up, and configure its SMTP for password
      recovery (invitations are sent by the app, not by Supabase).
- [ ] Verify a sending domain with the email provider, set `EMAIL_PROVIDER=resend`,
      `RESEND_API_KEY` and `EMAIL_FROM`, then send yourself a real invitation and
      complete it end to end.
- [ ] Before applying migration `00005` to existing data, run the legacy
      document-path audit in **Documents and Storage** and resolve every row it
      returns before constraint validation.
- [ ] Apply every migration and create the first admin with the SQL above.
- [ ] Generate a unique contact rate-limit secret per environment.
- [ ] Confirm contact enquiries appear in the admin queue and rate limiting works.
- [ ] Test invitation, re-sent invitation, password recovery and
      inactive/unlinked account states.
- [ ] Test RLS and document isolation with two distinct client accounts.
- [ ] Run lint, typecheck and production build from a clean install.
- [ ] Apply the announced Next.js security patch after its 26 August 2026
      release, staying on the supported 15.5 maintenance line unless a planned
      major upgrade is tested; then rerun `npm audit`, lint, typecheck and build.
- [ ] Check desktop and small-mobile layouts, keyboard navigation and reduced motion.
- [ ] Add an appropriate privacy notice/retention process before collecting real leads.

## Troubleshooting

`/login?error=unconfigured`

: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing in the
  running environment. Add it and redeploy so public variables are rebuilt.

`/login?error=unlinked`

: Authentication worked, but the profile is not assigned to a client. Complete
  the trusted provisioning step; do not relax RLS or the route guard.

Contact submissions always fail

: Confirm the server has `SUPABASE_SERVICE_ROLE_KEY`, the migrations were
  applied, and the contact rate-limit RPC is callable by `service_role`. Inspect
  server logs without printing the secret or requester digest.

Invitation says "email is in console mode"

: `EMAIL_PROVIDER` is unset or `console`, so nothing was sent. The link was
  printed to the server log and still works — paste it into a browser to finish
  the invite. Set `EMAIL_PROVIDER=resend` to send for real.

Invitation says the email could not be sent

: The user exists and the invite can be re-sent; only the message failed. The
  server log carries the provider's reason, usually an unverified sending
  domain in `EMAIL_FROM` or a missing `RESEND_API_KEY`. Fix it, then use
  **Re-send invitation** on the user's row.

Invitation email arrives in spam

: The sending domain's DKIM and SPF records are missing or not yet propagated.
  Check the domain shows **Verified** with the provider, and that `EMAIL_FROM`
  uses that exact domain.

"NEXT_PUBLIC_SITE_URL is not set" when inviting

: The invitation link is built from that origin, so the action refuses rather
  than mailing a link that points nowhere. Set it and redeploy.

Reset link goes to the site and errors

: Almost always the stock Supabase recovery template. It returns `?code=`,
  which can only be exchanged in the browser that requested the reset — so
  opening the email on a phone, or in Gmail's in-app browser, fails. Switch the
  **Reset password** template to the `token_hash` form above; that flow carries
  no browser state and works anywhere. The server log carries a
  `[auth:callback]` line with Supabase's own reason.

`/login?error=samebrowser`

: The PKCE verifier cookie was not in the browser that opened the link. Same
  cause and same fix as above.

Reset link lands on the site but no token arrives

: The **Reset password** template must append its parameters to a URL that has
  no query string of its own. `{{ .RedirectTo }}` is a bare
  `https://…/auth/callback`; if you have added anything after a `?` to it, the
  `?token_hash=` that follows becomes part of the previous value and the token
  is lost.

Invite links open the wrong domain

: `NEXT_PUBLIC_SITE_URL` is the origin the link is built from — check it first.
  Also add the exact callback origin to Supabase's redirect allow-list.

Local schema is inconsistent

: With the local stack running, `npx supabase db reset` recreates it from the
  committed migrations. This is destructive to local data only. Never append
  `--linked` for a production project.
