import { Stack } from 'expo-router';
import React from 'react';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AuthLayout;
