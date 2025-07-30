import { Eye, EyeOff } from 'lucide-react-native';
import OpenAI from 'openai';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Button from '@/components/Button';
import { useOpenAIStore } from '@/store/openai';
import { DEFAULT_MODEL } from '@/const/settings';

import { useStyles } from './styles';

const OpenAISettings = () => {
  const { t } = useTranslation(['setting', 'common', 'chat']);
  const { apiKey, proxy, setApiKey, setProxy } = useOpenAIStore();
  const { token, styles } = useStyles();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateSettings = async () => {
    if (!apiKey) {
      Alert.alert(
        t('error', { ns: 'common' }),
        t('openaiSettings.pleaseEnterApiKey', { ns: 'setting' }),
      );
      return;
    }

    setIsValidating(true);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: proxy || 'https://api.openai.com',
        dangerouslyAllowBrowser: true,
      });

      await openai.chat.completions.create({
        max_tokens: 1000,
        messages: [{ content: '你好', role: 'user' }],
        model: DEFAULT_MODEL,
        temperature: 0.7,
      });

      Alert.alert(
        t('success', { ns: 'common' }),
        t('openaiSettings.connectionSuccess', { ns: 'setting' }),
      );
    } catch (error: any) {
      console.error('OpenAI API Error:', error);

      if (error.message?.includes('API key')) {
        Alert.alert(
          t('error', { ns: 'common' }),
          t('openaiSettings.checkApiKey', { ns: 'setting' }),
        );
      } else if (error.message?.includes('network')) {
        Alert.alert(
          t('error', { ns: 'common' }),
          t('openaiSettings.checkProxyAddress', { ns: 'setting' }),
        );
      } else {
        Alert.alert(t('error', { ns: 'common' }), t('regenerateFailed', { ns: 'chat' }));
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: token.colorBgBase }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: token.colorText }]}>
          {t('openaiSettings.apiKey', { ns: 'setting' })}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize="none"
            onChangeText={setApiKey}
            placeholder={t('openaiSettings.apiKeyPlaceholder', { ns: 'setting' })}
            placeholderTextColor={token.colorTextPlaceholder}
            secureTextEntry={!showApiKey}
            style={[
              styles.input,
              styles.inputWithIcon,
              {
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText,
              },
            ]}
            value={apiKey}
          />
          <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeButton}>
            {showApiKey ? (
              <EyeOff color={token.colorTextSecondary} size={20} />
            ) : (
              <Eye color={token.colorTextSecondary} size={20} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: token.colorText }]}>
          {t('openaiSettings.proxyAddress', { ns: 'setting' })}
        </Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setProxy}
          placeholder={t('openaiSettings.proxyPlaceholder', { ns: 'setting' })}
          placeholderTextColor={token.colorTextPlaceholder}
          style={[
            styles.input,
            {
              backgroundColor: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText,
            },
          ]}
          value={proxy}
        />

        <Button
          loading={isValidating}
          onPress={validateSettings}
          size="large"
          style={styles.validateButton}
          type="primary"
        >
          {t('openaiSettings.testConnectivity', { ns: 'setting' })}
        </Button>

        <Text style={[styles.hint, { color: token.colorTextSecondary }]}>
          {t('openaiSettings.connectivityHint', { ns: 'setting' })}
        </Text>
      </View>
    </View>
  );
};

export default OpenAISettings;
