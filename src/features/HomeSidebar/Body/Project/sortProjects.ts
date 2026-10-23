import type { ProjectListSortBy } from '@/store/global/initialState';

type SortableProject = { createdAt: Date | string; id: string; updatedAt: Date | string };

const time = (value: Date | string) => new Date(value).getTime();

/**
 * Order the sidebar project list for the chosen view. `manual` keeps the
 * server order (the shared `sort_order`); the others put the newest first.
 */
export const sortProjects = <T extends SortableProject>(
  projects: T[],
  sortBy: ProjectListSortBy,
): T[] => {
  if (sortBy === 'manual') return projects;

  return projects.toSorted((a, b) => time(b[sortBy]) - time(a[sortBy]));
};
