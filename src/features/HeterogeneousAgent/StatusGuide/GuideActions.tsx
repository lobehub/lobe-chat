import { Flexbox } from '@lobehub/ui';
import { Button } from '@lobehub/ui/base-ui';
import { ExternalLink, RotateCcw, Settings2 } from 'lucide-react';

import { openExternalLink } from './openExternalLink';

interface GuideActionsProps {
  docsUrl?: string;
  onOpenSystemTools?: () => void;
  onRetry?: () => void;
  openDocsLabel?: string;
  openSystemToolsLabel?: string;
  retryLabel?: string;
  retryPrimary?: boolean;
  showDocs?: boolean;
}

const GuideActions = ({
  docsUrl,
  onOpenSystemTools,
  onRetry,
  openDocsLabel,
  openSystemToolsLabel,
  retryLabel,
  retryPrimary = false,
  showDocs = false,
}: GuideActionsProps) => {
  const showDocsButton = showDocs && Boolean(docsUrl && openDocsLabel);
  const showSystemToolsButton = Boolean(onOpenSystemTools && openSystemToolsLabel);
  const showRetryButton = Boolean(onRetry && retryLabel);

  if (!showDocsButton && !showSystemToolsButton && !showRetryButton) return null;

  return (
    <Flexbox horizontal gap={8} justify="flex-end" style={{ flexWrap: 'wrap' }}>
      {showRetryButton && (
        <Button
          icon={<RotateCcw size={14} />}
          size="small"
          type={retryPrimary ? 'primary' : undefined}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
      {showSystemToolsButton && (
        <Button icon={<Settings2 size={14} />} size="small" onClick={onOpenSystemTools}>
          {openSystemToolsLabel}
        </Button>
      )}
      {showDocsButton && docsUrl && openDocsLabel && (
        <Button
          icon={<ExternalLink size={14} />}
          size="small"
          type="primary"
          onClick={() => {
            openExternalLink(docsUrl).catch(console.error);
          }}
        >
          {openDocsLabel}
        </Button>
      )}
    </Flexbox>
  );
};

export default GuideActions;
