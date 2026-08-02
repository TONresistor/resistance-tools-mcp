# Resistance Tools MCP

MCP tools for TON Sites, TON DNS and TON Storage.

## Codex

```sh
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

## Claude Code

```sh
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
```

In Claude Code, run `/mcp`, select `resistance-tools`, and authenticate.

The client opens the wallet authorization page. Select the permissions you want, approve with your wallet, and return to the client.

## Other clients

Add `https://app.resistance.dog/api/mcp` as a Streamable HTTP MCP server. Authentication uses the client's native OAuth flow.

## Documentation

- [Tools](docs/tools.md)
- [Templates](docs/templates.md)
- [Authentication and scopes](docs/auth.md)

## License

MIT
