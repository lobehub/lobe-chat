import { z } from 'zod';

export interface EvaluationRecord {
  answer: string;
  context: string[];
  createdAt: Date;
  groundTruth: string;
  id: number;
  question: string;
}

export const insertEvaluationSchema = z.object({
  ideal: z.string().optional(),

  question: z.string(),

  referenceFiles: z.string().or(z.array(z.string())).optional(),
});

export type InsertEvaluationRecord = z.infer<typeof insertEvaluationSchema>;

export interface RAGEvalEvaluationItem {
  createdAt: Date;
  datasetId: number | null;
  description?: string | null;
  id: number;
  name: string;
  updatedAt: Date;
}

export const insertEvalEvaluationSchema = z.object({
  datasetId: z.number(),
  description: z.string().optional(),
  knowledgeBaseId: z.string(),
  name: z.string(),
});

export type CreateNewEvalEvaluation = z.infer<typeof insertEvalEvaluationSchema>;
