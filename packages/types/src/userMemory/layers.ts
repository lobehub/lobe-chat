export interface UserMemoryTimestamps {
  accessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMemoryContext extends UserMemoryTimestamps {
  associatedObjects: Record<string, unknown>[] | null;
  associatedSubjects: Record<string, unknown>[] | null;
  currentStatus: string | null;
  description: string | null;
  descriptionVector: number[] | null;
  id: string;
  metadata: Record<string, unknown> | null;
  scoreImpact: number | null;
  scoreUrgency: number | null;
  tags: string[] | null;
  title: string | null;
  titleVector: number[] | null;
  type: string | null;
  userId: string | null;
  userMemoryIds: string[] | null;
}

export interface UserMemoryExperience extends UserMemoryTimestamps {
  action: string | null;
  actionVector: number[] | null;
  id: string;
  keyLearning: string | null;
  keyLearningVector: number[] | null;
  metadata: Record<string, unknown> | null;
  possibleOutcome: string | null;
  reasoning: string | null;
  scoreConfidence: number | null;
  situation: string | null;
  situationVector: number[] | null;
  tags: string[] | null;
  type: string | null;
  userId: string | null;
  userMemoryId: string | null;
}

export interface UserMemoryPreference extends UserMemoryTimestamps {
  conclusionDirectives: string | null;
  conclusionDirectivesVector: number[] | null;
  id: string;
  metadata: Record<string, unknown> | null;
  scorePriority: number | null;
  suggestions: string | null;
  tags: string[] | null;
  type: string | null;
  userId: string | null;
  userMemoryId: string | null;
}
