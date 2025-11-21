import { memo } from 'react';

const ReadKnowledge = memo<any>(({ content, loading, state }: any) => {
  // For now, just render the markdown content
  // TODO: Add custom UI for displaying file contents
  return (
    <div>
      {loading ? (
        <div>Reading knowledge...</div>
      ) : (
        <div>
          {state?.filesRead ? (
            <div>
              <div>Read {state.filesRead} files</div>
              {/* TODO: Add custom rendering for file contents */}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

export default ReadKnowledge;
