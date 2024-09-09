import { FilterBy, SortBy } from '@/types/discover';

export type SearchParams = { q?: string; sort?: SortBy } & FilterBy;
