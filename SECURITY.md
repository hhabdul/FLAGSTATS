# Security Baseline

This document defines the security baseline for FlagStats. It is intended to align practical implementation decisions with OWASP ASVS, the OWASP Top 10, and secure-by-design principles.

## Assets

- User identities and roles
- Match records, season history, rankings, awards, and progression data
- Admin-only settings and ranking logic
- Future uploaded avatars and team assets
- Supabase credentials, service-role secrets, and auth/session material

## Trust boundaries

- Browser to Next.js application
- Next.js server to Supabase
- Authenticated user to privileged admin/captain functionality
- User-controlled form input to server-side persistence
- Public read views to privileged write actions

## Entry points

- Auth pages and future auth callbacks
- Live match entry flow
- Future server actions and route handlers
- Supabase SQL functions, tables, storage buckets, and jobs

## Secure defaults implemented

- Deny-by-default browser embedding with `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- Strict CSP with self-only script execution
- Referrer minimization, MIME sniffing prevention, disabled high-risk browser permissions
- Private-by-default crawler policy via `robots` metadata
- Supabase schema hardened with RLS, least-privilege helper functions, and data-integrity constraints

## Required production controls before launch

### Authentication

- Use Supabase Auth only; do not implement custom auth
- Require MFA for admin users
- Require recent re-authentication for sensitive admin changes
- Use secure session cookies only
- Do not store bearer tokens in `localStorage`

### Authorization

- Enforce authorization on every server-side data access
- Never trust role claims from the client
- Use Supabase RLS plus server-side checks for privileged workflows
- Do not expose service-role keys to the browser

### Abuse prevention

- Rate limit login, password reset, invite acceptance, comment posting, and match submission
- Add duplicate-submission protection for live match publish
- Alert on repeated auth failures, privilege changes, and admin configuration changes

### Logging

- Log login success/failure, MFA enrollment/challenge, role changes, match publish, recap override, season rollover, and settings changes
- Do not log passwords, tokens, magic links, reset links, raw JWTs, or service-role credentials

## Security tests to run

- Attempt unauthorized reads/writes across users via direct object references
- Verify admins require MFA before privileged actions
- Verify captains cannot change rankings, roles, or seasons outside allowed flows
- Verify CSP blocks inline scripts and third-party script injection
- Verify auth pages do not enumerate valid users
- Verify comments/reactions and future uploads are length/type constrained server-side
- Verify the browser never receives service-role credentials
- Verify audit logs are generated for privileged actions

## Residual risk

- The current repository does not yet implement real backend auth flows, session rotation, MFA challenges, rate limiting, or server-side route handlers. Those controls must be added before handling real users or league data.
