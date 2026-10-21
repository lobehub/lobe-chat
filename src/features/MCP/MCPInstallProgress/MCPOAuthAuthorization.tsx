import { Alert, Button, Flexbox, Text } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';

interface MCPOAuthAuthorizationProps {
  error?: string;
  identifier: string;
}

export const MCPOAuthAuthorization = ({ error, identifier }: MCPOAuthAuthorizationProps) => {
  const { t } = useTranslation('plugin');
  const { allowed: canCreate } = usePermission('create_content');
  const { allowed: canEdit } = usePermission('edit_own_content');
  const authorizeMCPPlugin = useToolStore((s) => s.authorizeMCPPlugin);
  const togglePlugin = useAgentStore((s) => s.togglePlugin);
  const oauthErrors: Record<string, string> = {
    blocked: t('dev.oauthError.blocked'),
    dismissed: t('dev.oauthError.dismissed'),
    failed: t('dev.oauthError.failed'),
    timeout: t('dev.oauthError.timeout'),
  };

  return (
    <Flexbox gap={8} paddingBlock={8}>
      <Text>{t('mcpInstall.AUTHORIZATION_REQUIRED')}</Text>
      {error && <Alert title={oauthErrors[error] ?? error} type={'error'} />}
      <Button
        disabled={!canCreate || !canEdit}
        type={'primary'}
        onClick={async () => {
          if (!canCreate || !canEdit) return;
          if (await authorizeMCPPlugin(identifier)) await togglePlugin(identifier, true);
        }}
      >
        {t('dev.mcp.auth.oauth.authorize')}
      </Button>
    </Flexbox>
  );
};
