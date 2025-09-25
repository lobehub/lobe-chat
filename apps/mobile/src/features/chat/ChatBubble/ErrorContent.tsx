import { ChatMessageError } from '@lobechat/types';
import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useProviderName } from '@/hooks/useProviderName';
import { useThemeToken } from '@/theme';

interface ErrorContentProps {
  error: ChatMessageError;
}

const ErrorContent: React.FC<ErrorContentProps> = ({ error }) => {
  const token = useThemeToken();
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
