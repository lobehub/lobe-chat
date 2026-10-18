import { z } from 'zod';

/**
 * A batch plan is a package, not one document: `SKILL.md` (the recipe) plus
 * whatever the main Agent gathered while working out how a unit is done —
 * references, templates, scripts. Every unit loads it as a skill, so a file
 * here is a file the unit can read or run, and the owner reviews it with the
 * plan. These are the shapes a plan may submit it in.
 */

export const MAX_PACKAGE_FILES = 20;
export const MAX_PACKAGE_FILE_CHARS = 64_000;
export const MAX_PACKAGE_CHARS = 256_000;

/**
 * A path inside the package, e.g. `scripts/check.sh` or `references/rules.md`.
 * Relative, no `..`, and never `SKILL.md`, which is the recipe itself.
 */
const packagePath = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[\w.-]+(\/[\w.-]+)*$/, 'A package path is relative, like scripts/check.sh')
  .refine((path) => !path.split('/').includes('..'), 'A package path cannot leave the package')
  .refine(
    (path) => path.toLowerCase() !== 'skill.md',
    'SKILL.md is the recipe itself; submit it as the recipe',
  );

/** Files that ship beside the recipe. Paths are unique; the package stays small enough to load. */
export const planFilesSchema = z
  .array(z.object({ content: z.string().max(MAX_PACKAGE_FILE_CHARS), path: packagePath }).strict())
  .min(1)
  .max(MAX_PACKAGE_FILES)
  .refine(
    (files) => new Set(files.map((file) => file.path)).size === files.length,
    'Each package file needs its own path',
  )
  .refine(
    (files) => files.reduce((sum, file) => sum + file.content.length, 0) <= MAX_PACKAGE_CHARS,
    `A plan package holds at most ${MAX_PACKAGE_CHARS} characters of files`,
  );

/**
 * What a rewritten plan changes in its package: files to add or replace (by
 * path) and paths to drop. Files it does not name stay as they were.
 */
export const planFileEdits = {
  files: planFilesSchema.optional(),
  removeFiles: z.array(packagePath).min(1).max(MAX_PACKAGE_FILES).optional(),
};

export type PlanFile = z.infer<typeof planFilesSchema>[number];
