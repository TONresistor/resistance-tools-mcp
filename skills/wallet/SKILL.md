---
name: wallet
description: Diagnose Resistance Tools authentication, permissions, wallet identity, delegation, access, sessions, and audit history. Use for login problems, insufficient permissions, owner-versus-actor questions, active MCP consent inspection, audit investigations, policy questions, and explicit consent revocation.
---

# Wallet

Resolve authentication and owner context before protected or owner-sensitive Resistance Tools work. Never request a seed phrase, private key, proof, signature, bearer token, or manually selected permission list.

## Connection and permissions

- Use the hosted MCP endpoint `https://app.resistance.dog/api/mcp` through the client's native remote OAuth flow.
- In Codex, the MCP-only setup is:

  ```bash
  codex mcp add resistance-tools
  codex mcp login resistance-tools
  ```

- If the MCP is already registered, do not add it again. Run only the native login flow.
- The approval page belongs to the user. Let the user select permissions or use its `Approve all` control.
- On `insufficient_scope`, name the missing capability in plain language and ask the user to reopen the native login/approval flow. Do not choose permissions for them.

## Workflow

1. Call `auth.status` to distinguish a configured MCP from an authenticated session.
2. Call `auth.policy` only when the live server policy is relevant; select and report only the needed field.
3. Call `wallet.me` before owner-sensitive work when ownership, delegation, target access, or client identity could be ambiguous.
4. Treat `ownerWallet` as the data boundary and `actorWallet` as the optional delegated caller.
5. Use `mcp.access.list` for current consent/session state, `mcp.audit.summary` for aggregates, and `mcp.audit.list` for specific execution evidence.
6. Revoke only after explicit user intent: list access, select the exact consent, call `mcp.access.revoke_consent` with matching confirmation ids, then list access again.

Read [references/tools.md](references/tools.md) for every core tool's exact input, evidence boundary, and response requirements.

## Required user response

Keep the answer short and in the user's language. State authenticated or not authenticated, the relevant owner/delegated actor relationship, or the exact access/audit result. Never expose tokens or full wallet addresses by default. If login is required in Codex, give only:

```bash
codex mcp login resistance-tools
```
