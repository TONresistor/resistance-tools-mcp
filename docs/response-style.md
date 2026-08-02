# Short user responses

Reply in the user's language. Show only fields proven by the tool result or its verification call.

## Site published and linked

```text
Site published

Domain: alice.ton
Gateway: [Open the site](https://alice.ton.resistance.dog/?v=<release>)
TON Site: tonsite://alice.ton
Release: #12
```

## Site published but DNS not linked here

```text
Site published, but the domain is not linked here yet.

Domain: alice.ton
Gateway: [Preview](https://alice.ton.resistance.dog/?v=<release>)
Next step: create the TON DNS confirmation link.
```

Do not call a site `live` unless `sites.list` or `domains.records` proves `live` / `linkedHere: true`.

## Transaction request

```text
Transaction ready

Action: Renew alice.ton
Confirm: [Review in Resistance Tools](<confirmationUrl>)
Expires: <expiresAt>
```

Use `ready` or `awaiting confirmation`, never `sent` or `confirmed` at this stage.
That state is sufficient; do not add boilerplate explaining that the agent cannot sign transactions unless the user asks.

## Bag created or imported

```text
TON Storage Bag ready

BagID: <bagId>
Status: seeding | syncing | offline
Files: <count>, <size>
```

Do not claim paid provider storage is active from a local Bag creation or import.

## Verified destructive action

```text
Site deleted

Target: alice.ton
Verified: no deployment remains
DNS: unchanged
```

## Error or incomplete verification

```text
The action was not completed.

Reason: <plain-language cause>
Next step: <one concrete action>
```

Avoid apologies, raw stack traces, speculative causes, and repeated setup instructions.
