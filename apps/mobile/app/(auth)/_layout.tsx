import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const AuthLayout = () => {
  const { t } = useTranslation('auth');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: t('login.title'),
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          headerShown: false,
          title: t('callback.title'),
        }}
      />
    </Stack>
  );
};

export default AuthLayout;
