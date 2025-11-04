import { ChatMessageError } from '@lobechat/types';
import { AlertTriangle } from 'lucide-react-native';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/components/styles';
import { useProviderName } from '@/hooks/useProviderName';

interface ErrorContentProps {
  error: ChatMessageError;
}

const ErrorContent: FC<ErrorContentProps> = ({ error }) => {
  const token = useTheme();
  const { t } = useTranslation('error');
  const providerName = useProviderName(error.body?.provider);

  const errorMessage =
    t(`response.${error.type}` as any, { provider: providerName }) || error.message;

  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: token.marginXS,
        padding: token.paddingXS,
      }}
    >
      <AlertTriangle color={token.colorWarning} size={16} style={{ marginTop: 2 }} />
      <Text
        style={{
          color: token.colorWarningText,
          flex: 1,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
        }}
      >
        {errorMessage}
      </Text>
    </View>
  );
};

export default ErrorContent;
