# Research Report: Supabase Auth + Google Workspace Integration Architecture

> Vibecode Kit v5.0 — BƯỚC 2 (RESEARCH)
> Topic: Supabase Auth with Google OAuth and Google Workspace integration design for recruitAI-web commercial MVP
> Date: 2026-05-16

---

## Executive Summary

recruitAI-web commercial MVP needs: (1) authentication for HR Manager + Hiring Manager, (2) candidate portal with separate access, (3) Google Drive/Sheets/Calendar/Gmail integrations. Recommended auth model: **Supabase Auth** with Google OAuth for internal HR/HM users, and **magic link / signed token access** for candidates (no candidate account creation required). Google Workspace integrations use **OAuth 2.0 with least-privilege scopes**, scoped per-user via service account or delegation.

---

## Plain Language Summary

**Hai hệ thống auth khác nhau:**

| User | Auth method | Tại sao |
|------|------------|---------|
| HR Manager + Hiring Manager | Supabase Auth + Google OAuth (Sign in with Google) | Đăng nhập familiar, RBAC qua Supabase profiles + RLS, quản lý role dễ |
| Candidate | Magic link hoặc signed token qua email | Không cần tạo account, chỉ cần email để gửi interview invite + access token |

**Cách Google OAuth scopes nên dùng cho recruitAI-web:**

| Integration | Scope tối thiểu | Sensitive? |
|------------|-----------------|-----------|
| Google Drive (CV/JD intake) | `drive.file` | Sensitive — cần verify app |
| Google Sheets (data sync) | `spreadsheets` | Sensitive — cần verify app |
| Google Calendar (interview slots) | `calendar.events` | Sensitive — cần verify app |
| Gmail (candidate emails) | `gmail.send` | Sensitive — cần verify app |

**Insight:** Sensitive scopes yêu cầu Google app verification (1-2 ngày). Restricted scopes (full Drive, full Gmail) cần security assessment — tránh dùng.

**Implications cho recruitAI-web:**
- Current state: no auth → Action: Supabase Auth setup trước, Google OAuth sau
- Current state: all mock data → Action: schema design cần user/candidate tables từ đầu
- Google app verification cần có domain và logo trước khi submit

---

## Research Methodology

- Sources consulted: 5 web fetches (Supabase Auth docs, Supabase RLS docs, Google OAuth scopes, Google OAuth consent, Supabase Google OAuth setup)
- Date range of materials: 2026 official docs
- Key search terms: Supabase Auth Google OAuth Next.js, RLS role-based access patterns, Google OAuth scopes least privilege

---

## Key Findings

### 1. Supabase Auth Architecture

**Auth flow for HR/HM users:**

```
User clicks "Sign in with Google"
  → Supabase redirects to Google OAuth consent
  → Google returns auth code to Supabase
  → Supabase creates/updates auth.users entry
  → Supabase returns JWT (access token) to client
  → Client stores JWT, includes in all Supabase requests
  → RLS policies check auth.jwt() claims
```

**Key Supabase Auth concepts:**

| Concept | Purpose |
|---------|---------|
| `auth.users` | Managed by Supabase, stores identity (email, provider, created_at) |
| `public.profiles` | Custom user table joined to `auth.users` via `auth.users.id = profiles.user_id` |
| `auth.jwt()` | Function in RLS policies to read current user's JWT claims |
| Row Level Security (RLS) | Postgres-level access control, applied per table |

**Profile + roles pattern:**

```sql
-- profiles table with role
create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  role text check (role in ('hr_manager', 'hiring_manager')) not null default 'hiring_manager',
  created_at timestamp with time zone default now()
);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 2. Candidate Access Model

Two viable approaches for candidate portal access:

| Approach | Pros | Cons |
|----------|------|------|
| **Magic link (Supabase email OTP)** | No account creation, familiar UX, Supabase built-in | Email deliverability depends on SMTP config |
| **Signed token (stateless)** | No database write, scalable, offline-capable | Token revocation harder, must implement token generation |

**Recommended for MVP**: Magic link via Supabase Auth's email OTP + link, combined with a `candidates` table that stores candidate info (name, email, job_id, status). Candidate receives magic link → authenticates with Supabase → gets JWT scoped to their candidate record → accesses portal.

**Token format approach** (alternative): Generate a signed JWT (with `jose` library) containing `{ candidate_id, job_id, exp }`, embed in interview invite URL: `/portal/interview/{token}`. No Supabase Auth needed for candidate — token is the auth mechanism. Server verifies token signature before granting access.

**Decision recommendation**: Use **Supabase Auth magic link** for candidates — simpler to implement, leverages existing infrastructure, supports email verification, and integrates cleanly with RLS for candidate-scoped data access.

### 3. Google Workspace Integration Design

**Authentication pattern:**

Internal HR/HM users sign in via Supabase Auth (Google OAuth). The app needs a separate **service account** or **OAuth token** to call Google APIs on behalf of the organization (not per-user):

- **Option A: Domain-wide delegation (recommended for Google Workspace)**: Service account with domain-wide authority to impersonate users. Best for reading all Drive files, managing shared calendars.
- **Option B: Per-user OAuth (simpler, less powerful)**: Each user authorizes access when needed. Requires sensitive scope verification. Good for Calendar per-user access.

**For recruitAI-web**:
- Google Drive: service account with domain-wide delegation to read from specific shared folders (CV intake, JD source)
- Google Sheets: service account or per-user based on whether HR team shares a sheet or each has their own
- Google Calendar: per-user makes sense (each interviewer's availability is personal)
- Gmail: service account sending on behalf of HR team email address

**Least-privilege scope table:**

| API | Recommended Scope | Access Level | Use Case |
|-----|-------------------|--------------|----------|
| Drive | `https://www.googleapis.com/auth/drive.file` | App-created files only | Upload generated posters/designs |
| Drive | `https://www.googleapis.com/auth/drive.readonly` | Read all Drive files | Read CV/JD from intake folders |
| Drive | `https://www.googleapis.com/auth/drive` | Full Drive access | Only if domain-wide delegation + strict folder permissions |
| Sheets | `https://www.googleapis.com/auth/spreadsheets` | Full read/write | HR data sync |
| Calendar | `https://www.googleapis.com/auth/calendar.events` | Create/read events | Interview scheduling |
| Calendar | `https://www.googleapis.com/auth/calendar.readonly` | Read-only | Availability check |
| Gmail | `https://www.googleapis.com/auth/gmail.send` | Send only | Interview invites, reminders |
| Gmail | `https://mail.google.com/` | Full access | Only if absolutely needed (restricted scope) |

**Critical: Sensitive scope verification process:**

Google requires app verification for sensitive scopes:
1. Configure OAuth consent screen with app name, logo, support email
2. Submit for verification (1-2 business days for basic sensitive scopes)
3. Unverified app warning shown to users until verification is complete
4. For restricted scopes: security assessment required (weeks)

**Recommendation**: Start with `drive.readonly`, `calendar.events`, `gmail.send` — these are sufficient for P0 Google integration needs and have a relatively straightforward verification path.

### 4. RLS Policy Patterns

```sql
-- Profiles: users can only see their own profile
alter table public.profiles enable row level security;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Jobs: accessible to authenticated users (HR/HM roles)
create policy "Authenticated users can view jobs"
  on public.jobs for select
  using (auth.role() = 'authenticated');

-- Candidates: HR can see all, candidates see only their own
create policy "HR can view all candidates"
  on public.candidates for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'hr_manager'
    )
  );

create policy "Candidates can view own record"
  on public.candidates for select
  using (auth.uid() = candidate_user_id);
```

---

## Implementation Recommendations

### Auth Architecture

```text
src/
  lib/
    supabase/
      client.ts      # Browser client (useSupabaseClient)
      server.ts      # Server client for RLS
  services/
    auth.ts          # Auth helper functions
    googleOAuth.ts   # Google OAuth provider setup
  app/
    (auth)/
      login/page.tsx
      callback/route.ts  # OAuth callback handler
    (portal)/              # Candidate portal (separate layout)
      layout.tsx           # Minimal shell, no AppShell
      dashboard/page.tsx
      interview/page.tsx
    (app)/                 # Internal HR/HM workspace
      layout.tsx           # AppShell here
      dashboard/page.tsx
      ...
```

### Database Schema Priority

Core tables needed from day 1:
- `auth.users` (managed)
- `public.profiles` (user_id, email, full_name, role)
- `public.candidates` (id, email, name, job_id, status, portal_token)
- `public.jobs`
- `public.jd_versions`
- `public.audit_events` (all state changes logged here)

---

## Open Questions

1. **Domain-wide delegation vs. per-user OAuth for Google Drive**: If all HR team shares a single "recruiting" Google Workspace account, service account + domain-wide delegation is cleaner. If each recruiter has their own Drive, per-user OAuth is more natural. Recommend clarifying during Vision phase.
2. **Email delivery infrastructure**: Supabase Auth magic link requires SMTP configuration. If email deliverability is a concern (especially for candidate invites), consider integrating with SendGrid or Resend as the email provider.
3. **Multi-tenant organizations**: RRI deferred multi-tenant. If commercial MVP will serve multiple companies, auth model needs org-level isolation from the start.

---

## Vibecode Handoff

### Recommended Next Command
`/vibecode:vision`

### Why This Next
AI/OCR provider direction and auth architecture are now clear from research. Vision can now solidify the commercial MVP scope, architecture decisions, and roadmap with full context from scan, RRI, and both research reports.

### Inputs Prepared
- Auth model: Supabase Auth + Google OAuth for HR/HM, magic link for candidates
- RBAC: profiles table with role enum (hr_manager, hiring_manager) + RLS
- Candidate portal: separate auth scope via candidates table + RLS
- Google scopes: least-privilege set identified (drive.readonly, calendar.events, gmail.send)
- Google verification: sensitive scopes require app verification before production

### Open Questions
- Google domain-wide delegation vs. per-user OAuth (clarify in Vision)
- Email delivery infrastructure (SMTP/SendGrid/Resend)
- Multi-tenant org isolation (deferred or early decision)

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google OAuth Consent Configuration](https://developers.google.com/workspace/guides/configure-oauth-consent)