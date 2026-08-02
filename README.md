# Resistance Tools

One cross-client Agent Skill plus the remote Resistance Tools MCP for TON Sites, TON DNS, Subdomains, TON Storage, wallet access, and manually confirmed transactions.

## Agent Skill

The plugin contains one `resistance-tools` skill. Its `SKILL.md` defines the shared workflow and loads only the relevant bundled reference for `sites`, `domains`, `storage`, `wallet`, or `transactions`.

Together, those references contain the permission, inputs, method, verification, and required user response for every MCP tool. The live MCP schema remains canonical.

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
