export interface SaveMemoryParams {
  details?: string;
  memoryCategory?: string;
  memoryLayer?: string;
  memoryType?: string;
  summary: string;
  title: string;
}

export interface SaveMemoryResult {
  memoryId?: string;
  message: string;
  success: boolean;
}

export interface RetrieveMemoryParams {
  limit?: string;
  memoryCategory?: string;
  memoryType?: string;
  query: string;
}

export interface RetrieveMemoryResult {
  memories: Array<{
    details?: string;
    id: string;
    lastAccessedAt: string;
    memoryCategory?: string;
    memoryType?: string;
    relevanceScore?: number;
    summary: string;
    title: string;
  }>;
}

export interface CategorizeMemoryContextParams {
  associatedObjects?: unknown;
  associatedSubjects?: unknown;
  contextId?: string;
  currentStatus?: string;
  description?: string;
  descriptionVector?: number[];
  extractedLabels?: unknown;
  labels?: unknown;
  scoreImpact?: number;
  scoreUrgency?: number;
  title?: string;
  titleVector?: number[];
  type?: string;
  userMemoryIds: string[];
}

export interface CategorizeMemoryContextResult {
  contextId?: string;
  created?: boolean;
  message: string;
  success: boolean;
}

export interface CategorizeMemoryPreferenceParams {
  conclusionDirectives?: string;
  conclusionDirectivesVector?: number[];
  contextId?: string;
  extractedLabels?: unknown;
  extractedScopes?: unknown;
  labels?: unknown;
  preferenceId?: string;
  scorePriority?: number;
  suggestions?: string;
  type?: string;
  userMemoryId?: string;
}

export interface CategorizeMemoryPreferenceResult {
  message: string;
  preferenceId?: string;
  success: boolean;
  updated?: boolean;
}
