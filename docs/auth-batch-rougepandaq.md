# Auth Batch Baseline (rougepandaq)

Covers: #394, #395, #396, #397

## 1) Auth Test Matrix Ownership
- API: token lifecycle, reset/verify endpoints, authz decisions.
- Web: form validation, route guards, session UX states.
- Mobile: auth input flows, local session restore, offline/error transitions.
- Service layer: cross-cutting auth orchestration and retry/error contracts.

## 2) Shared Challenge-State Model
- `idle`: no challenge started.
- `issued`: challenge created and pending completion.
- `verified`: challenge solved successfully.
- `expired`: challenge timed out.
- `failed`: challenge rejected or invalid.

## 3) Privacy Review Baseline (Reset Starter)
- Do not include raw tokens in logs or analytics payloads.
- Use generic success/error copy to avoid account enumeration leaks.
- Redact PII fields in emitted operational events.

## 4) Shared Async/Form Outcome Types
- `AsyncStatus`: `idle | loading | success | error`
- `FormOutcome`: `{ status, message?, fieldErrors? }`
- Reuse these across auth views to keep state handling consistent.
