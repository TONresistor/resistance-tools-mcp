---
name: transactions
description: Prepare and verify every Resistance Tools action that requires manual wallet confirmation. Use for site linking, product payments, DNS record changes, domain mint/bid/release/renewal, Subdomain creation or management, Bag-to-domain linking, paid-provider actions, and any tool result with status requires_user_confirmation or a confirmationUrl.
---

# Transactions

Create a backend-validated confirmation request, give the user its exact HTTPS confirmation link, and verify the resulting product or indexed state after the user confirms. The wallet remains the confirmation surface.

## Required sequence

1. Read the fresh state named for the action in [references/tools.md](references/tools.md).
2. Resolve the exact target and show user-controlled choices such as destination, pricing, provider, or action before preparing the request.
3. Call the exact transaction tool with the runtime schema. Do not construct a signing payload, BoC, or custom-data signature outside the tool.
4. Require `status: requires_user_confirmation`, an HTTPS `confirmationUrl`, `expiresAt`, and the backend summary/amount when returned.
5. Give the confirmation link to the user immediately. Do not call it signed, sent, submitted, confirmed, paid, linked, minted, renewed, or active.
6. Wait until the user says they confirmed. Do not poll unless they ask to wait or the product exposes a genuinely pending operation.
7. Run the mapped read-back tool and report only the state it proves. If indexing is still pending, say so and name the single read that remains pending.

Use state words precisely: `prepared` or `awaiting confirmation` before the wallet acts, `submitted` only when a later operation read proves submission, and `confirmed` only when the mapped read-back proves the result.

## Confirmation boundary

- Preserve `confirmationUrl` exactly as the Markdown link target.
- The returned `operationId` identifies the MCP confirmation request. It is not a DNS, Subdomain, site, payment, or provider-operation id.
- An expired link is unusable. Repeat the fresh preflight and create a new request.
- If the user cancels or the wallet rejects the request, do not claim any mutation.
- Do not add boilerplate saying the agent cannot sign; simply state that confirmation is required.
- Never ask for a seed phrase, private key, proof, signature, bearer token, or wallet export.

## Required response before confirmation

Reply in the user's language and keep only fields returned by the tool:

```text
Transaction ready

Action: <plain-language action>
Target: <domain, site, Bag, collection, or item>
Amount: <backend amount, when returned>
Confirm: [Review and confirm](<exact confirmationUrl>)
Expires: <expiresAt>
```

After confirmation, replace this with the verified product state and its useful link or identifier. Do not repeat the confirmation URL once the read-back proves completion.
