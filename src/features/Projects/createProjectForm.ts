import { PROJECT_IDENTIFIER_REGEX } from '@lobechat/types';
import { kebabCase } from 'es-toolkit';
import { pinyin } from 'pinyin-pro';

const PROJECT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_IDENTIFIER_LENGTH = 4;

export interface CreateProjectDraft {
  identifier: string;
  name: string;
  slug: string;
}

export interface ProjectFieldSuggestions {
  identifier: string;
  slug: string;
}

export const getProjectFieldSuggestions = (name: string): ProjectFieldSuggestions => {
  const normalizedName = name.trim();
  if (!normalizedName) return { identifier: '', slug: '' };

  const transliteratedName = pinyin(normalizedName, {
    nonZh: 'consecutive',
    toneType: 'none',
    type: 'array',
  }).join(' ');
  const slug = kebabCase(transliteratedName).replaceAll(/[^a-z0-9-]/g, '');
  const parts = slug.split('-').filter(Boolean);
  const initials = parts.map((part) => part[0]).join('');
  const compactName = parts.join('');
  const identifierSource = initials.length >= 3 ? initials : compactName;
  const identifier = identifierSource
    .slice(0, PROJECT_IDENTIFIER_LENGTH)
    .padEnd(3, 'x')
    .toUpperCase();

  return { identifier, slug };
};

export const isProjectIdentifierValid = (identifier: string) =>
  PROJECT_IDENTIFIER_REGEX.test(identifier.trim().toUpperCase());

/**
 * Whether an already-loaded project in the active scope claims `identifier`.
 *
 * Identifiers are unique per scope (`projects_identifier_workspace_id_unique`),
 * so the form checks this inline and shows the conflict next to the field. The
 * list is visibility-filtered, so another member's private project can slip
 * past here — the server re-checks and answers `CONFLICT` for that case.
 */
export const isProjectIdentifierTaken = (
  identifier: string,
  projects: readonly { identifier: string }[],
) => {
  const normalized = identifier.trim().toUpperCase();

  return Boolean(normalized) && projects.some((project) => project.identifier === normalized);
};

export const isProjectSlugValid = (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase();
  return !normalizedSlug || PROJECT_SLUG_REGEX.test(normalizedSlug);
};

export const getCreateProjectInput = (draft: CreateProjectDraft) => {
  const identifier = draft.identifier.trim().toUpperCase();
  const name = draft.name.trim();
  const slug = draft.slug.trim().toLowerCase();

  if (!name || !isProjectIdentifierValid(identifier) || !isProjectSlugValid(slug)) {
    return null;
  }

  return { identifier, name, ...(slug ? { slug } : {}) };
};
