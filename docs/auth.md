# Authentication and scopes

Resistance Tools MCP uses OAuth bearer tokens. Prefer the MCP client's native remote HTTP OAuth flow.

```bash
codex mcp login resistance-tools
```

The default consent is read-only: `wallet:read sites:read deployments:read dns:read storage:read`.

## Scopes

| Scope | Access |
|---|---|
| `wallet:read` | Read owner, actor and client context |
| `sites:read` | List sites, content and releases |
| `sites:write` | Publish files or templates |
| `sites:rollback` | Roll back a site with exact confirmation |
| `sites:delete` | Delete a site with exact confirmation |
| `deployments:read` | Read deployment history |
| `dns:read` | Read domains and records |
| `dns:prepare_tx` | Prepare an unsigned TON DNS transaction |
| `media:write` | Upload template images |
| `storage:read` | Read TON Storage bags |
| `storage:write` | Create or pin bags |
| `storage:delete` | Delete a bag with exact confirmation |
| `mcp:read` | Read MCP consents, sessions and audit |
| `mcp:revoke` | Revoke a consent with exact confirmation |

If an existing consent lacks `media:write`, start the OAuth login again and explicitly approve that scope. Write and destructive scopes are never added to the default read-only consent.

## Optional stdio bridge

The bridge supports browser wallet approval with `auth.device_start` / `auth.device_complete`, or agent-controlled wallet proof with `auth.wallet_challenge` / `auth.wallet_complete`.

Local tokens are stored in `~/.resistance-tools-mcp/auth.json`. Change the path with `RESISTANCE_TOOLS_MCP_TOKEN_STORE`. Never share the file or its bearer tokens.
