---
'@nodecord/core': patch
'@nodecord/djs-adapter': patch
---

## Bug Fixes

### Exception messages now link to a page that exists

Framework exceptions append a documentation link built from their error code. That link pointed at a per-code FAQ page that had never been written, so every exception sent users to a 404. The pages now exist, with one entry per code, and the anchors resolve.

The links also move to the new documentation domain.

Before

```
Class BotModule is not a valid module. Make sure it is decorated with @Module.

For more information, please check the documentation:
https://datzu712.github.io/nodecord/docs/core/faq/exceptions#invalid_module   (404)
```

After

```
Class BotModule is not a valid module. Make sure it is decorated with @Module.

For more information, please check the documentation:
https://nodecord.pages.dev/docs/core/faq/exceptions#invalid_module
```

Every code in `NodecordExceptionCode` and `DjsAdapterErrorCodes` is covered. `INTERNAL_ADAPTER_ERROR` is the exception: it keeps pointing users at the issue tracker instead, since reaching it means the adapter hit a state it does not expect.
