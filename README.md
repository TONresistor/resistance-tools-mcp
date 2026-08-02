# Resistance Tools

Cross-client Agent Skills plus the remote Resistance Tools MCP for TON Sites, TON DNS, Subdomains, TON Storage, wallet access, and manually confirmed transactions.

## Skills

The plugin contains five focused skills:

- `sites` — publish, inspect, roll back, and delete sites;
- `domains` — inspect TON DNS and Subdomain state;
- `storage` — manage Bags and paid providers;
- `wallet` — handle authentication, identity, access, and audit;
- `transactions` — prepare confirmation links and verify the result after wallet confirmation.

Each skill contains the required workflow, result contract, and bundled technical reference for its tools. The live MCP schema remains canonical.

## Plugin packages

- Codex: `.codex-plugin/plugin.json`
- Claude Code: `.claude-plugin/plugin.json`
- Shared Agent Skills: `skills/<name>/SKILL.md`
- Shared remote MCP connection: `.mcp.json`

Installing the repository as a plugin loads both the skills and the MCP dependency in clients that support the corresponding plugin format.

## MCP-only connection

These commands connect the tools only; they do not install the bundled skills.

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

## License

MIT
