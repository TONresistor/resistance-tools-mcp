# Wallet, access, and audit

Use the live runtime schema when it differs from this bundled reference. Never expose secrets, token material, or unredacted internal payloads.

## Workflow and response rules

Call `auth.status` to distinguish a configured MCP from an authenticated session. Use `wallet.me` before owner-sensitive work, treating `ownerWallet` as the data boundary and `actorWallet` only as the delegated caller. Use access tools for current consent/session state and audit tools for execution evidence.

On `insufficient_scope`, let the user reopen the client's native approval flow and select permissions; do not choose them. If Codex login is required, give only `codex mcp login resistance-tools`.

Revoke only after explicit intent: list access, resolve the exact consent/client, send matching confirmation ids, then list access again. Report authentication, relevant identity/access state, or audit result briefly without tokens or full addresses by default.

### `auth.status`

- **Permission:** public.
- **Input:** none.
- **Use:** Diagnose whether the current MCP session is authenticated.
- **Method:** Call before troubleshooting a protected tool. Read the boolean `authenticated`; a session identifier alone is not authentication.
- **Verify:** This read is the session evidence. Do not infer login from `codex mcp list` or from the server being configured.
- **Report:** Say authenticated or not authenticated. For an unauthenticated Codex session, give only `codex mcp login resistance-tools`.

### `auth.policy`

- **Permission:** public.
- **Input:** none.
- **Use:** Resolve uncertainty about OAuth, permissions, safety controls, limits, retention, templates, or supported targets.
- **Method:** Call once and select only the policy fields relevant to the question.
- **Verify:** Treat the live result as newer than bundled prose about mutable server policy.
- **Report:** State the applicable rule briefly; never dump the complete policy by default.

### `wallet.me`

- **Permission:** `wallet:read`.
- **Input:** none.
- **Use:** Confirm the effective owner, optional actor, client, resource, and allowlists before owner-sensitive work.
- **Method:** Call when identity, delegation, or exact target access could be ambiguous. Use `ownerWallet` as the data boundary and `actorWallet` only as the delegated caller.
- **Verify:** Match the requested target against the returned owner/delegation context and allowlists. Do not replace owner identity with actor identity.
- **Report:** Describe owner versus delegated actor and abbreviate addresses unless the full address is required.

### `mcp.access.list`

- **Permission:** `mcp:read`.
- **Input:** none.
- **Use:** Inspect current consents and redacted active sessions.
- **Method:** Call before revocation or when the user asks which clients retain access.
- **Verify:** Compare consent id, client, actor, expiry, revoked state, and active sessions. An old audit event does not prove current access.
- **Report:** Give the relevant client, consent state, expiry, and session count; summarize large lists.

### `mcp.audit.list`

- **Permission:** `mcp:read`.
- **Input:** optional `limit` from 1 to 100, `method`, `resultStatus`, and ISO-8601 `since`.
- **Use:** Investigate specific recent MCP actions or failures.
- **Method:** Apply the narrowest useful filters and smallest useful limit. Use the exact runtime method name.
- **Verify:** Treat returned events as redacted MCP execution evidence, not proof that an external chain transaction finalized.
- **Report:** State the filters/time window, matching count, and relevant result. Say explicitly when no matching event exists.

### `mcp.audit.summary`

- **Permission:** `mcp:read`.
- **Input:** optional `windowHours` from 1 to 720 and `topMethodsLimit` from 1 to 50.
- **Use:** Get aggregate activity, success/error totals, and top methods over a period.
- **Method:** Choose a window proportional to the question. Use `mcp.audit.list` when the user needs one concrete call.
- **Verify:** Aggregates prove only counts for the returned window, not the outcome of a particular action.
- **Report:** Give the window and key totals; do not present the summary as a per-call trace.

### `mcp.access.revoke_consent`

- **Permission:** `mcp:revoke`.
- **Input:** `consentId` and an identical `confirmConsentId`.
- **Use:** Revoke one consent and its matching tokens after an explicit user request.
- **Method:** Call `mcp.access.list`, resolve the exact consent/client, obtain explicit intent, then send the identical ids.
- **Verify:** Call `mcp.access.list` again and require the consent to be revoked or its matching sessions to be inactive.
- **Report:** State which client/consent was revoked and that matching sessions were invalidated. Never reveal token material.

## Fixed resources

Use these only for a convenient read-only snapshot when the client supports MCP resources:

- `tonsite://wallet` — owner and actor context.
- `tonsite://sites` — owned sites.
- `tonsite://deployments` — deployment history.
- `tonsite://domains` — owned domains.
- `tonsite://bags` — owned Bags.

Prefer the corresponding tool when filters, fresh verification, or a follow-up mutation is required.
