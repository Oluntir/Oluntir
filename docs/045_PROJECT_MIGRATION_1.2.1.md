# Project Migration 1.2.1

Opening a 1.2.0 project loads the complete GrapesJS model first. Missing identities are then assigned without changing classes, HTML IDs, content, images, links, Shared Content or includes. The migrated state becomes persistent only on the next explicit or automatic project save.

Migration is idempotent. A second load retains all identities. Duplicate identities caused by copied components are resolved by assigning new IDs to the duplicate subtree.
