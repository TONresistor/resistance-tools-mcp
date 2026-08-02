# Authentication and scopes

Resistance Tools MCP uses native remote OAuth. The client opens a wallet authorization page where you select the permissions to grant.

```bash
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
```

In Claude Code, run `/mcp`, select `resistance-tools`, and authenticate.

The normal read permissions are selected by default. Writing and destructive permissions are off until you enable them on the approval page.

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

If a tool returns `insufficient_scope`, run OAuth login again and enable the named permission on the approval page.
