# Template schemas

`sites.publish_template` supports 6 templates. Unknown fields are discarded by the canonical validator; use only the fields below.

Supported targets: `name.ton`, `child.name.ton`, `username.t.me`, `child.username.t.me`.

Image fields use a `media/<hash>.<ext>` path returned by `media.upload_image`. Accepted uploads are PNG, JPEG, GIF and WebP up to 8 MiB.

## `links`

Required: `name`, `links` (`[{title,url}]`).

Optional: `bio`, `profileLayout` (`2` or `3`), `avatar`, `accent`, `telegram`, `recipient`, `profileActions`, `visibleSections`, `blocks`, `aboutBlocks`, `theme`.

```json
{
  "name": "Alice",
  "bio": "Building on TON",
  "links": [{ "title": "Project", "url": "https://example.com" }]
}
```

## `blog`

Required: `title`, `date` (`YYYY-MM-DD`), `blocks`.

Optional: `theme`. Block types are paragraph/header/quote (`p`, `h`, `quote` with `s` text runs), image (`img` with media `src`), YouTube (`yt`) and separator (`hr`).

```json
{
  "title": "Hello TON",
  "date": "2026-08-01",
  "blocks": [{ "t": "p", "s": [{ "text": "First post." }] }]
}
```

## `redirect`

Required: HTTPS `destination`.

```json
{
  "destination": "https://example.com/"
}
```

## `token`

Required: `name`, `ticker`, checksum-valid mainnet `address`, media `logo`, `links`.

Optional: `description`, media `banner`, `website`, `channel`, `group`, `theme`.

```json
{
  "name": "USD Tether",
  "ticker": "USDt",
  "address": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  "logo": "media/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png",
  "links": []
}
```

## `sale`

Required: `price`, `currency` (`GRAM` or `USD`), `description`, `telegram`, `textColor`, `backgroundColor`, `highlightColor`.

Optional: media `image`, `cardColor` (defaults to `highlightColor`), `cardOpacity` (integer 0–100, defaults to 10).

```json
{
  "price": "100",
  "currency": "GRAM",
  "description": "Domain for sale",
  "telegram": "alice",
  "textColor": "#17212b",
  "backgroundColor": "#f8fcff",
  "highlightColor": "#2aabee"
}
```

## `tip`

Required: `name`, `description`, checksum-valid mainnet `recipient`, `assets`.

Optional: `language` (defaults to `en`), exactly 3 `amounts` (defaults to `5`, `10`, `25`), media `avatar`, `theme`. Languages: `en`, `ru`, `zh`, `de`, `it`, `es`, `hi`. Asset kinds: `gram`, `usdt`, or `jetton` with `master`, `name`, `symbol`, `decimals`.

```json
{
  "name": "Alice",
  "description": "Support my work",
  "language": "en",
  "recipient": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  "assets": [{ "kind": "gram" }],
  "amounts": ["5", "10", "25"]
}
```

## Shared fields

All colors are 6-digit hex values. If `theme` is provided, all four fields are required:

```json
{
  "textColor": "#111111",
  "backgroundColor": "#ffffff",
  "surfaceColor": "#f5f5f5",
  "accentColor": "#3390ec"
}
```

Safe link schemes are HTTP, HTTPS, Telegram, TON and mailto. Template content is data, never raw HTML.
