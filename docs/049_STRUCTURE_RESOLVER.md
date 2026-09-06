> **Language:** English · [Deutsch](049_STRUCTURE_RESOLVER_de.md)
> **Development state:** Oluntir 1.3.1 baseline · current branch 2.2.0 BETA

# Structure Resolver

The Structure Resolver reads complete semantic structures from the GrapesJS project model. It extends the existing resolution of individual components and contexts with an immutable structure snapshot for one page or the complete project.

## Purpose

The resolver answers structural questions only:

- Which parent/child relationships exist?
- Which semantic areas and structure kinds were recognized?
- Which roles belong to the recognized nodes?
- Which cardinality constraints apply?
- Which stable Oluntir identities belong to the nodes?

It does not change components, attributes, classes, content or page order.

## Architecture position

```text
Semantic Dictionary
        ↓
Identity Resolver
        ↓
Context Resolver
        ↓
Layout Identities
        ↓
Structure Resolver
        ↓
Semantic Validator
        ↓
Repeat Engine / Shared Content / Export
```

The Structure Resolver contains no framework, editor, export or correction logic. Bootstrap 4 and Bootstrap 5 specifics are not handled in this layer.

## API

The browser API is exposed as `OluntirStructureResolver`:

```javascript
const pageStructure = OluntirStructureResolver.resolvePage(page);
const projectStructure = OluntirStructureResolver.resolveProject(editor);
```

The CommonJS module exports the same functions for automated tests.

### `resolvePage(page)`

Creates a read-only page snapshot containing:

- `schemaVersion`
- `scope: "page"`
- `pageId`
- `roots`
- flat `nodes` list
- `recognizedStructures`
- `semanticAreas`
- `roles`
- `cardinality`

Each structure node contains:

- `identity`
- `pageId`
- `parentIdentity`
- `depth`
- `structuralKind`
- `componentType`
- `role`
- `cardinality`
- `capabilities`
- `children`

### `resolveProject(editor)`

Resolves all pages available through `editor.Pages.getAll()` and returns:

- `schemaVersion`
- `scope: "project"`
- `pageCount`
- `pages`

## Immutability

All returned snapshots, nodes, child lists, capabilities and summaries are protected with `Object.freeze()`. The resolver does not write to the GrapesJS model and performs no persistence.

## Integration status

Version 1.3.1 provides shared structure resolution as an independent core API.
The 2.2.0 BETA branch retains this contract and adds the read-only Source,
translation and behavior pipelines around it; it does not turn this resolver
into a document-mutation service.

## Tests

`tests/test-structure-resolver.js` verifies in particular:

- nested parent/child relationships,
- depth and parent identities,
- structure, area, role and cardinality summaries,
- project resolution across multiple pages,
- immutable results,
- an unchanged GrapesJS component tree after resolution.

The subsequent local application test confirmed normal usage and a working export.
