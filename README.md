# Resistance Tools MCP

Official MCP server for Resistance Tools: publish sites, manage deployments, prepare DNS actions, and work with TON Storage.

Remote endpoint:

```text
https://app.resistance.dog/api/mcp
```

Agent skill instructions live in [SKILL.md](SKILL.md).

## Recommended Setup

Use the hosted Streamable HTTP MCP server with native OAuth. No MCP token is required.

Codex:

```bash
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp

codex mcp login resistance-tools
```

Claude Code:

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
claude mcp login resistance-tools
```

## Auth

The MCP client handles OAuth:

1. Discovers OAuth metadata from the MCP endpoint.
2. Opens the Resistance Tools authorization page.
3. The user connects a wallet and approves scopes.
4. The client stores and refreshes scoped bearer tokens.
5. Protected tools run with `Authorization: Bearer <token>`.

The remote MCP server does not expose auth bootstrap tools.

## Tools

Sites:

- `sites.publish_files`
- `sites.publish_template`
- `sites.rollback`
- `sites.delete`

Storage:

- `storage.create_bag`
- `storage.pin_bag`
- `storage.delete_bag`

Read tools:

- `sites.list`
- `sites.get_content`
- `deployments.list`
- `domains.list`
- `domains.records`
- `storage.list_bags`
- `storage.bag_details`

See [docs/tools.md](docs/tools.md) for inputs and required scopes.

## Optional Stdio Bridge

Use the npm bridge only when your MCP client does not support remote HTTP OAuth, or when an agent controls a wallet and can sign TON proofs itself.

```bash
npm install -g @resistance/resistance-tools-mcp
```

Example config:

```json
{
  "mcpServers": {
    "resistance-tools-stdio": {
      "command": "resistance-tools-mcp",
      "env": {
        "RESISTANCE_TOOLS_MCP_URL": "https://app.resistance.dog/api/mcp"
      }
    }
  }
}
```

Local bridge auth tools:

- `auth.device_start` / `auth.device_complete`: browser wallet approval.
- `auth.wallet_challenge` / `auth.wallet_complete`: agent-controlled wallet TON proof.
- `auth.device_status` / `auth.device_revoke`: local token status and cleanup.

Tokens are stored in `~/.resistance-tools-mcp/auth.json` by default.

## Environment

- `RESISTANCE_TOOLS_MCP_URL`: remote MCP endpoint.
- `RESISTANCE_TOOLS_OAUTH_ISSUER`: OAuth issuer, defaults to the endpoint origin.
- `RESISTANCE_TOOLS_MCP_RESOURCE`: OAuth resource, defaults to the MCP endpoint.
- `RESISTANCE_TOOLS_MCP_CLIENT_ID`: optional OAuth client id. Defaults to dynamic public client registration.
- `RESISTANCE_TOOLS_MCP_TOKEN_STORE`: local token store path.
- `RESISTANCE_TOOLS_MCP_TOKEN`: explicit bearer token override.

## Development

```bash
npm install
npm run check
npm run pack:dry
```

## Troubleshooting

If Codex reports `OAuth authorization required`, run:

```bash
codex mcp login resistance-tools
```

Then restart the Codex session or start a new thread.

## License

MIT
