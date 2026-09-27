# Connection, identity, access and audit

## Connection and recovery

Canonical endpoint: `https://app.resistance.dog/api/mcp`, remote Streamable HTTP with native OAuth. Marketplace: `resistance-tools`; plugin/server: `resistance-tools-mcp`. Use the current client's native connection flow. For Codex login, `codex mcp login resistance-tools-mcp`; for Claude Code, `claude mcp login resistance-tools-mcp`. The user chooses permissions. Do not request wallet keys, proofs, bearer tokens or credential exports.

Installation, ordinary Git-marketplace updates and legacy-alias migration belong in the [repository README](https://github.com/TONresistor/resistance-tools-mcp#readme). Consult that only when setup is the task. Do not reinstall a working plugin for a server-side ownership or permission failure.

Access tokens normally refresh automatically. Current server policy is 15-minute access tokens and 30-day refresh/consent, shortened to 24 hours for sensitive grants; `auth.policy` is authoritative if that changes. Concurrent refresh branches are supported. An absent refresh `resource` is tolerated; an explicit different audience is not.

| Evidence | Next action |
|---|---|
| Missing credentials, expired/revoked consent or `invalid_grant` | Native login/reauthorization for this server |
| `insufficient_scope` | Show the exact required scope and let the user decide whether to add it |
| Target outside an allowlist | Explain the exact denied target; do not broaden the delegation yourself |
| Ownership denial / `not_found` | Check the reader's ownership boundary and the target, not plugin installation |
| `invalid_target` | Check canonical URL/resource; this error alone does not prove an old alias |
| Configured server actually named `resistance-tools` | Consult the README's retired-alias migration |
| MCP startup fails before tools are callable | Report startup as failed; do not claim `auth.status` ran. Inspect only relevant client/config metadata |

A granted scope is capability, not user authorization for every action it enables. Preserve already authorized work; do not ask for permission again merely because it uses a write tool. Keep destructive confirmations tied to the exact requested resource/effect.

### `auth.status`

**Permission:** `public`.

Use for authentication diagnosis. Read `authenticated`; a configured endpoint or transport session ID is not evidence of authentication. When authenticated, the response includes owner/actor, client, scopes and expiry, not credential material. Do not call this as a ritual before every product operation.

### `auth.policy`

**Permission:** `public`.

Use when a current server rule is genuinely needed: supported targets/templates, scopes, limits, confirmations or OAuth policy. Select relevant fields, not the entire JSON. This describes policy, not the particular user's active allowlists.

### `wallet.me`

**Permission:** `wallet:read`.

Use when owner versus delegated actor or effective granted scopes are unclear. The result includes `ownerWallet`, `actorWallet`, `clientId`, `scopes`, `resource` and `grantId`. It does not expose site/domain/Bag allowlist arrays; do not claim to have checked them from this response. Product tools enforce those limits. Owner is the data/signing boundary; actor identifies a delegated caller.

### `mcp.access.list`

**Permission:** `mcp:read`.

For an access-management request, list consents and redacted active sessions. Match the exact client/consent/actor, expiry and revoked state before selecting a revocation. An audit event or an installed plugin does not prove a currently valid grant.

### `mcp.audit.list`

**Permission:** `mcp:read`.

Filter by exact method, result status, ISO `since`, and a proportionate limit within the runtime schema. Events are MCP execution evidence, not blockchain finality. Report the requested window, relevant events/errors and explicit absence of matching evidence; do not expose internal fingerprints as identities.

### `mcp.audit.summary`

**Permission:** `mcp:read`.

Use a requested/proportionate `windowHours` and `topMethodsLimit` for aggregate counts. For a specific call, use the filtered event list instead. Success totals are not proof of one external outcome.

### `mcp.access.revoke_consent`

**Permission:** `mcp:revoke`.

Resolve the exact consent through `access.list`, then pass identical `consentId` and `confirmConsentId` when the user has authorized revoking it. This invalidates its matching tokens and may revoke the current caller. Re-read access if still authorized; if access is lost as expected, report the successful revocation response and that the follow-up read is unavailable instead of forcing a fresh login just to undo that effect.

## Fixed resources

Resources are optional convenience snapshots; tools are more suitable for filtered or exact-target follow-up:

| URI | Scope | Data boundary |
|---|---|---|
| `tonsite://wallet` | `wallet:read` | Owner/actor context, same limitations as wallet.me |
| `tonsite://sites` | `sites:read` | Owned and site-allowlisted sites |
| `tonsite://deployments` | `deployments:read` | Site-allowlisted deployment history |
| `tonsite://domains` | `dns:read` | Owned `.ton` roots only; Usernames use domains.list_usernames |
| `tonsite://bags` | `storage:read` | Owned and Bag-allowlisted Bags |
