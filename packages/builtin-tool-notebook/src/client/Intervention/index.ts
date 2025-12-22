import { BuiltinIntervention } from '@lobechat/types';

import { NotebookApiName } from '../../types';
import CreateDocumentIntervention from './CreateDocument';

/**
 * Notebook Tool Intervention Components Registry
 *
 * Intervention components allow users to review and modify tool parameters
 * before the tool is executed.
 */
export const NotebookInterventions: Record<string, BuiltinIntervention> = {
  [NotebookApiName.createDocument]: CreateDocumentIntervention as BuiltinIntervention,
};

export { default as CreateDocumentIntervention } from './CreateDocument';
