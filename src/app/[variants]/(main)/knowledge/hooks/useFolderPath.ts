import { useLocation, useParams } from 'react-router-dom';

/**
 * Hook to extract folder path from URL
 * Supports GitHub-style path-based folder navigation
 *
 * Example URLs:
 * - /knowledge/bases/kb_123 -> { knowledgeBaseId: 'kb_123', folderPath: null, folderSegments: [], currentFolderSlug: null, isInKnowledgeBase: true }
 * - /knowledge/bases/kb_123/folder-1 -> { knowledgeBaseId: 'kb_123', folderPath: 'folder-1', folderSegments: ['folder-1'], currentFolderSlug: 'folder-1', isInKnowledgeBase: true }
 * - /knowledge/bases/kb_123/folder-1/folder-2 -> { knowledgeBaseId: 'kb_123', folderPath: 'folder-1/folder-2', folderSegments: ['folder-1', 'folder-2'], currentFolderSlug: 'folder-2', isInKnowledgeBase: true }
 * - /knowledge -> { knowledgeBaseId: null, folderPath: null, folderSegments: [], currentFolderSlug: null, isInKnowledgeBase: false }
 */
export const useFolderPath = () => {
  const params = useParams<{ '*'?: string, 'id': string; }>();
  const location = useLocation();

  // Extract knowledge base ID from params
  const knowledgeBaseId = params.id || null;

  // Determine if we're in a knowledge base context
  const isInKnowledgeBase = location.pathname.includes('/knowledge/bases/');

  // Extract folder path from the wildcard route
  const wildcardPath = params['*'] || '';

  // Split path into segments and filter out empty strings
  const folderSegments = wildcardPath.split('/').filter((segment) => segment.length > 0);

  const folderPath = folderSegments.length > 0 ? folderSegments.join('/') : null;
  const currentFolderSlug = folderSegments.length > 0 ? folderSegments.at(-1) || null : null;

  return {
    currentFolderSlug,
    folderPath,
    folderSegments,
    isInKnowledgeBase,
    knowledgeBaseId,
  };
};
