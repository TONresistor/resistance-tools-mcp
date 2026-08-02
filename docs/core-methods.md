# Core methods

Use these tools for authentication, identity, access, and audit. Do not expose secrets or confuse the actor wallet with the owner wallet.

### `auth.status`

- **Use:** Diagnose whether the current MCP session is authenticated.
- **Method:** Call with no input before troubleshooting protected tools.
- **Verify:** Read `authenticated`; a session identifier alone is not authentication.
- **Report:** Say connected or not connected. If false, give only `codex mcp login resistance-tools`.

### `auth.policy`

- **Use:** Resolve uncertainty about OAuth flows, safety controls, limits, retention, templates, or supported targets.
- **Method:** Call with no input and select only the fields relevant to the question.
- **Verify:** Treat this live result as newer than static prose about server policy.
- **Report:** State the applicable rule briefly; do not dump the whole policy.

### `wallet.me`

- **Use:** Confirm the effective owner, optional actor, client, resource, and allowlists before owner-sensitive work.
- **Method:** Call before mutations when identity, delegation, or target access could be ambiguous.
- **Verify:** Use `ownerWallet` as the data boundary and `actorWallet` only as the delegated caller.
- **Report:** Describe owner versus delegated actor; abbreviate addresses unless the full value is needed.

### `mcp.access.list`

- **Use:** Inspect current consents and redacted active sessions.
- **Method:** Call before revocation or when the user asks who has access.
- **Verify:** Compare client, actor, expiry, revoked state, and session activity; do not infer access from an old audit event.
- **Report:** Give counts and the relevant client or expiry, not every internal field by default.

### `mcp.audit.list`

- **Use:** Investigate specific recent MCP actions or failures.
- **Method:** Narrow with `method`, `resultStatus`, ISO-8601 `since`, and the smallest useful `limit`.
- **Verify:** Treat events as redacted execution evidence, not proof that an external chain action finalized.
- **Report:** Summarize matching events, time window, and result; state when no event was found.

### `mcp.audit.summary`

- **Use:** Get aggregate activity, success/error counts, and top methods over a period.
- **Method:** Choose `windowHours` and `topMethodsLimit` proportional to the question.
- **Verify:** Use `mcp.audit.list` when a per-call conclusion is required.
- **Report:** Give the window and key totals; do not present aggregates as a specific event trace.

### `mcp.access.revoke_consent`

- **Use:** Revoke one consent and its matching tokens after an explicit user request.
- **Method:** Call `mcp.access.list`, select the exact consent, then send identical `consentId` and `confirmConsentId`.
- **Verify:** Call `mcp.access.list` again and confirm the consent or associated sessions are no longer active.
- **Report:** State which consent/client was revoked and that matching sessions were invalidated; never expose token material.

## Fixed resources

Use resources for a read-only snapshot when the client supports them:

- `tonsite://wallet` — same owner context as `wallet.me`.
- `tonsite://sites` — owned sites snapshot.
- `tonsite://deployments` — deployment history snapshot.
- `tonsite://domains` — owned domains snapshot.
- `tonsite://bags` — owned Bags snapshot.

Prefer the corresponding tool when filters, fresh verification, or a follow-up mutation are needed.
