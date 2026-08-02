# Authentication and permissions

Resistance Tools uses the MCP client's native remote OAuth flow. The approval page shows the permissions; the user selects them and confirms with the connected wallet.

## Codex

```bash
codex mcp add resistance-tools
codex mcp login resistance-tools
```

If the server is already added, run only `codex mcp login resistance-tools`.

## Claude Code

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
```

Run `/mcp`, select `resistance-tools`, and authenticate. The approval page offers `Approve all`; once every permission is selected it becomes `Disapprove all`.

## Permissions

| Permission | Access |
|---|---|
| `wallet:read` | Read owner, actor, and client context |
| `sites:read` | List sites, content, and releases |
| `sites:write` | Publish files or templates |
| `sites:rollback` | Roll back a site with exact confirmation |
| `sites:delete` | Delete a site with exact confirmation |
| `deployments:read` | Read deployment history |
| `dns:read` | Read domains, lifecycle, and records |
| `transactions:request` | Create one backend-validated request for manual TON Connect confirmation |
| `storage:read` | Read Bags, compatible providers, previews, quotes, and operations |
| `storage:write` | Create or import Bags |
| `storage:delete` | Delete a Bag with exact confirmation |
| `subdomains:read` | Read Subdomain collections, items, and control state |
| `media:write` | Upload template images |
| `mcp:read` | Read MCP consents, sessions, and audit |
| `mcp:revoke` | Revoke consent with exact confirmation |

The agent must not choose permissions for the user. If a tool returns `insufficient_scope`, run the client's login flow again and let the user enable the required permission on the approval page; do not add the MCP again.
