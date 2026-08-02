# Resistance Tools MCP

Remote MCP for TON Sites, TON DNS, Subdomains, TON Storage, paid providers, and wallet-confirmed transactions.

## Codex

```bash
codex mcp add resistance-tools
codex mcp login resistance-tools
```

## Claude Code

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
```

Run `/mcp`, select `resistance-tools`, and authenticate. The user selects permissions on the wallet approval page.

## Other clients

Add `https://app.resistance.dog/api/mcp` as a Streamable HTTP MCP server and use the client's native OAuth flow.

## Documentation

- [Agent skill](SKILL.md)
- [All 46 tools](docs/tools.md)
- [Core methods](docs/core-methods.md)
- [Site methods](docs/sites-methods.md)
- [DNS methods](docs/dns-methods.md)
- [Subdomain methods](docs/subdomains-methods.md)
- [Storage methods](docs/storage-methods.md)
- [Response style](docs/response-style.md)
- [Templates](docs/templates.md)
- [Authentication and permissions](docs/auth.md)

## License

MIT
