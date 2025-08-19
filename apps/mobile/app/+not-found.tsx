import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useThemeToken } from '@/theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function NotFoundScreen() {
  const token = useThemeToken();
  const { t } = useTranslation(['error', 'common']);

  return (
    <>
      <Stack.Screen options={{ title: t('page.notFoundTitle', { ns: 'error' }) }} />
      <View style={[styles.container, { backgroundColor: token.colorBgContainer }]}>
        <Text style={[styles.title, { color: token.colorText }]}>
          {t('page.notFoundMessage', { ns: 'error' })}
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: token.colorPrimary }]}>
            {t('navigation.goToHomeScreen', { ns: 'common' })}
          </Text>
        </Link>
      </View>
    </>
  );
}
