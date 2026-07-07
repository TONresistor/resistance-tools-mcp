# Tools

Tool availability depends on the scopes approved during auth.

## Sites

### `sites.publish_files`

Deploy or update a site from explicit files.

```json
{
  "site": "example.ton",
  "files": [
    {
      "path": "index.html",
      "text": "<!doctype html><html><body>Hello</body></html>"
    }
  ]
}
```

Use `contentBase64` instead of `text` for binary files.

Required scope: `sites:write`.

### `sites.publish_template`

Publish a template site.

```json
{
  "site": "example.ton",
  "template": "links",
  "content": {}
}
```

Required scope: `sites:write`.

### `sites.rollback`

Rollback to a retained release.

```json
{
  "site": "example.ton",
  "releaseId": "20260707110000",
  "confirmSite": "example.ton"
}
```

Required scope: `sites:rollback`.

### `sites.delete`

Delete a site deployment.

```json
{
  "site": "example.ton",
  "confirmSite": "example.ton"
}
```

Required scope: `sites:delete`.

## Storage

### `storage.create_bag`

Create and seed a new TON Storage bag.

```json
{
  "name": "site-assets",
  "files": [
    {
      "name": "hello.txt",
      "text": "hello"
    }
  ]
}
```

Use `contentBase64` for binary files.

Required scope: `storage:write`.

### `storage.pin_bag`

Pin/import an existing public bag.

```json
{
  "bagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "name": "mirror"
}
```

Required scope: `storage:write`.

### `storage.delete_bag`

Remove an owned bag reference.

```json
{
  "bagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "confirmBagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

Required scope: `storage:delete`.
