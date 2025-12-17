/**
 * Format prompt when no search results found using XML structure
 */
export const promptNoSearchResults = (query: string): string => {
  return `<knowledge_base_search_results query="${query}" totalCount="0">
<instruction>No relevant files found in the knowledge base for this query.</instruction>
<suggestions>
<suggestion>Try rephrasing your question with different keywords</suggestion>
<suggestion>Check if the information exists in the uploaded documents</suggestion>
<suggestion>Ask the user to provide more context or upload relevant documents</suggestion>
</suggestions>
</knowledge_base_search_results>`;
};
