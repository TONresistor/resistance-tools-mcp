# Resistance Tools MCP

Official MCP access to Resistance Tools for TON Sites, template media, deployments, TON DNS transaction preparation and TON Storage.

The hosted server exposes **26 remote tools**, **5 fixed resources** and **6 templates**:

```text
https://app.resistance.dog/api/mcp
```

## Setup

Use the hosted Streamable HTTP server with native OAuth.

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

No manual MCP token is needed. The client opens the wallet authorization page and stores scoped OAuth credentials.

## What it supports

- Publish files or the `links`, `blog`, `redirect`, `token`, `sale` and `tip` templates.
- Publish to `name.ton`, `child.name.ton`, `username.t.me` or `child.username.t.me` when owned and authorized.
- Upload PNG, JPEG, GIF or WebP template images up to 8 MiB with `media.upload_image`.
- Read sites, releases, deployments, domains, records and Storage bags.
- Prepare TON DNS transactions for wallet signature.
- Create, pin and delete TON Storage bags.
- Inspect and revoke MCP access with owner-scoped audit records.

See [the complete tool catalog](docs/tools.md), [template schemas](docs/templates.md) and [OAuth scopes](docs/auth.md).

## Resources

- `tonsite://wallet`
- `tonsite://sites`
- `tonsite://deployments`
- `tonsite://domains`
- `tonsite://bags`

## Template media workflow

1. Request `media:write` and call `media.upload_image` with raw file bytes encoded as base64.
2. Use the returned `media/<sha256>.<ext>` path in a template image field.
3. Request `sites:write` and call `sites.publish_template`.

## Optional stdio bridge

Use the bridge only when the client cannot perform remote HTTP OAuth, or when an agent controls a wallet and can sign TON proofs.

```bash
npm install -g @resistance-tools/mcp
```

The bridge adds 6 local auth tools and forwards the 26 remote tools. Tokens are stored in `~/.resistance-tools-mcp/auth.json` by default.

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

Local auth tools: `auth.wallet_challenge`, `auth.wallet_complete`, `auth.device_start`, `auth.device_complete`, `auth.device_status`, `auth.device_revoke`.

## Development

```bash
npm ci
npm test
npm run check
npm run pack:dry
```

`npm run check:live` compares the public endpoint with [catalog/mcp.json](catalog/mcp.json).

## License

MIT
