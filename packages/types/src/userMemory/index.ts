export * from './layers';
export * from './shared';
export * from './tools';
export interface UserMemoryItem {
  content: string;
  createdAt: Date;
  id: string;
  source?: string | null;
  updatedAt?: Date | null;
  userId: string;
}

export interface UserMemoryContext {
  createdAt: Date;
  currentStatus?: string | null;
  description?: string | null;
  descriptionVector?: number[] | null;
  extractedLabels?: unknown;
  id: string;
  labels?: unknown;
  scoreImpact?: number | null;
  scoreUrgency?: number | null;
  title?: string | null;
  type?: string | null;
  updatedAt?: Date | null;
  userMemoryIds?: unknown;
}

export interface UserMemoryPreference {
  content?: string | null;
  createdAt: Date;
  description?: string | null;
  descriptionVector?: number[] | null;
  extractedLabels?: unknown;
  id: string;
  labels?: unknown;
  updatedAt?: Date | null;
  userMemoryId?: string | null;
}

export interface UserMemoryExperience {
  content?: string | null;
  createdAt: Date;
  description?: string | null;
  descriptionVector?: number[] | null;
  episodicDate?: Date | null;
  extractedLabels?: unknown;
  id: string;
  labels?: unknown;
  updatedAt?: Date | null;
  userMemoryId?: string | null;
}

export * from './identity';
