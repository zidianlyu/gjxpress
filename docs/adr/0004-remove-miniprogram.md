# ADR 0004: Remove Mini Program Direction

## Status

Accepted.

## Decision

The WeChat Mini Program direction has been retired. The repository no longer contains or maintains a mini program client.

The active product surface is:

- Public website
- Admin Portal
- NestJS backend API

Frontend clients must call backend APIs for business data and must not access Supabase directly.

## Consequences

- Mini program source, setup notes, login flow, platform credential env, and deployment steps are removed.
- Backend no longer exposes a mini program login endpoint or calls WeChat code exchange APIs.
- Public contact WeChat IDs remain valid marketing/contact information and are not part of the removed technical stack.
