import { z } from 'zod';

/**
 * Identity memory schema
 */
export const IdentityMemorySchema = z.object({
  attributes: z.array(z.string()).describe('Personal attributes, demographics, labels'),
  background: z.string().optional().describe('Background and experience'),
  priorities: z.array(z.string()).optional().describe('Current focusing and life priorities'),
  relationships: z.array(z.string()).optional().describe('Relationships with other people'),
  roles: z.array(z.string()).optional().describe('Roles in various contexts'),
});

export type IdentityMemory = z.infer<typeof IdentityMemorySchema>;
