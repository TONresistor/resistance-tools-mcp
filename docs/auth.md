# Auth

Resistance Tools MCP uses OAuth bearer tokens for protected remote HTTP MCP requests.

## Recommended: Native OAuth

Use your MCP client's remote HTTP OAuth flow.

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

The MCP client discovers OAuth metadata, opens the browser authorization page, stores credentials, refreshes tokens, and sends `Authorization: Bearer <access-token>` on protected MCP requests.

## Optional: Stdio Bridge

The stdio bridge is a fallback for MCP clients that cannot perform native remote HTTP OAuth.

### Browser Wallet

1. Call `auth.device_start`.
2. Open the returned `authorizationUrl`.
3. Connect the wallet and approve the requested scopes.
4. Call `auth.device_complete`.

The bridge stores the resulting access and refresh tokens locally and sends bearer auth automatically when proxying protected calls.

### Controlled Wallet

Use this when the agent controls a wallet and can sign TON proofs itself.

1. Call `auth.wallet_challenge`.
2. Sign the returned `tonProof.payload`.
3. Call `auth.wallet_complete` with:
   - `address`
   - `walletStateInit` or `wallet_state_init`
   - `proof`

The proof is exchanged for a scoped OAuth token.

## Token Storage

Default token store:

```text
~/.resistance-tools-mcp/auth.json
```

Set `RESISTANCE_TOOLS_MCP_TOKEN_STORE` to use another path.

Set `RESISTANCE_TOOLS_MCP_TOKEN` to bypass local storage with an explicit bearer token.
