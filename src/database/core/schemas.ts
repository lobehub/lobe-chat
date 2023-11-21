// ************************************** //
// ******* Version 1 - 2023-11-14 ******* //
// ************************************** //
// - Initial database schema with `files` table

export const dbSchemaV1 = {
  files: '&id, name, fileType, saveMode',
};

// ************************************** //
// ******* Version 2 - 2023-11-21 ******* //
// ************************************** //
// - Added `sessions` 、`messages` 、`topics` tables
// - Added `createdAt` and `updatedAt` fields to all
export const dbSchemaV2 = {
  files: '&id, name, fileType, saveMode, createdAt, updatedAt',

  messages:
    '&id, type, sessionId, topicId, quotaId, parentId, role, fromModel, favorite, createdAt, updatedAt',
  sessions: '&id, type, pinned, meta.title, meta.description, createdAt, updatedAt',
  topics: '&id, title, favorite, createdAt, updatedAt',
};
