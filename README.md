# Resistance Tools

One cross-client Agent Skill plus the remote Resistance Tools MCP for TON Sites, TON DNS, Subdomains, TON Storage, wallet access, and manually confirmed transactions.

## Names

- Marketplace/source: `resistance-tools`
- Plugin and MCP server: `resistance-tools-mcp`
- Agent Skill: `resistance-tools-skill`

## Agent Skill

The plugin contains one `resistance-tools-skill` skill, invoked as `$resistance-tools-skill`. Its `SKILL.md` defines the shared workflow and loads only the relevant bundled reference for `sites`, `domains`, `storage`, `wallet`, or `transactions`.

Together, those references contain the permission, inputs, method, verification, and required user response for every MCP tool. The live MCP schema remains canonical.

## Plugin packages

- Codex: `.codex-plugin/plugin.json`
- Claude Code: `.claude-plugin/plugin.json`
- Shared Agent Skills: `skills/<name>/SKILL.md`
- Shared remote MCP connection: `.mcp.json`

Installing the repository as a plugin loads both the skills and the MCP dependency in clients that support the corresponding plugin format.

## Install the plugin

The plugin installs the Agent Skill and registers the MCP server together.

### Codex

```bash
codex plugin marketplace add TONresistor/resistance-tools-mcp@main
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

### Claude Code

```bash
claude plugin marketplace add TONresistor/resistance-tools-mcp@main
claude plugin install resistance-tools-mcp@resistance-tools
claude mcp login resistance-tools-mcp
```

The user selects permissions on the wallet approval page.

### Replace 0.2.2 or earlier, or repair `invalid_target`

Use this migration if an earlier Resistance Tools version was installed, if the marketplace already exists from another source, or if an MCP startup error still names `resistance-tools`. It resets both old and partially installed current entries before installing the current names. If an entry is already absent, continue with the remaining commands.

Codex:

```bash
codex mcp logout resistance-tools
codex mcp remove resistance-tools
codex mcp logout resistance-tools-mcp
codex mcp remove resistance-tools-mcp
codex plugin remove resistance-tools@resistance-tools
codex plugin remove resistance-tools-mcp@resistance-tools
codex plugin marketplace remove resistance-tools
codex plugin marketplace add TONresistor/resistance-tools-mcp@main
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

Claude Code:

```bash
claude mcp logout resistance-tools
claude mcp remove resistance-tools
claude mcp logout resistance-tools-mcp
claude mcp remove resistance-tools-mcp
claude plugin uninstall resistance-tools@resistance-tools
claude plugin uninstall resistance-tools-mcp@resistance-tools
claude plugin marketplace remove resistance-tools
claude plugin marketplace add TONresistor/resistance-tools-mcp@main
claude plugin install resistance-tools-mcp@resistance-tools
claude mcp login resistance-tools-mcp
```

### Update 0.2.3 or later

Codex:

```bash
codex plugin marketplace upgrade resistance-tools
codex plugin remove resistance-tools-mcp@resistance-tools
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

Claude Code:

```bash
claude plugin marketplace update resistance-tools
claude plugin update resistance-tools-mcp@resistance-tools
```

## MCP-only connection

These commands connect the tools only; they do not install the bundled skills.

### Codex

```bash
codex mcp add resistance-tools-mcp --url https://app.resistance.dog/api/mcp
codex mcp login resistance-tools-mcp
```

### Claude Code

```bash
claude mcp add --transport http resistance-tools-mcp https://app.resistance.dog/api/mcp
claude mcp login resistance-tools-mcp
```

The user selects permissions on the wallet approval page.

## Other clients

Add `https://app.resistance.dog/api/mcp` as a Streamable HTTP MCP server and use the client's native OAuth flow.

`main` is the stable branch used for installation and releases. Development happens on `dev`.

## License

MIT
