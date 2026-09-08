# Search mapping history

Each numbered directory is a source-history batch, not an executable SQL migration or an entity
schema version. `0000-initial-search-indexes` contains all initial v1 indexes. Later batches contain
complete physical definitions only for entities that change.

- `mapping.ts` binds the batch ID, entity definitions and analysis settings.
- `fields.ts` owns fixed field presets and shared property fragments for that batch.
- `analysis.ts` owns fixed analysis settings. A later batch can import an unchanged earlier analysis.
- `index.ts` registers all batches and explicitly selects the current batch for each entity.
- `../policy.ts` owns current query and document metadata; `../zodSchema.ts` owns current validation.
- `../mappings.ts` combines current physical definitions and policy for existing consumers.

For a new mapping, add the next numbered directory with a meaningful name, increment each affected
entity's `schemaVersion`, register the batch and update its current pointers. Retain historical fields
even when the current Zod schema removes them. Analysis is still global: changing it requires a new
version for every current entity. Current mapping fields must match the current Zod schema exactly.

Published batches and their fingerprint baselines are append-only by convention and code review.
History tests detect accidental drift and missing registrations; editing both a historical snapshot
and its expected fingerprint can bypass that check. Do not refresh an old baseline to accept a change.

This catalog does not execute migrations or reconstruct old documents with the current builder.
Build, promote, rollback and retire continue through the existing Elasticsearch reindex commands.
