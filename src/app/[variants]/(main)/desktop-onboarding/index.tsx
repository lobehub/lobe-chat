'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingContainerWithTheme } from '@/features/DesktopOnboarding/OnboardingContainer';
import {
  getDesktopOnboardingCompleted,
  setDesktopOnboardingCompleted,
} from '@/features/DesktopOnboarding/storage';

const DesktopOnboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (getDesktopOnboardingCompleted()) navigate('/', { replace: true });
  }, [navigate]);

  return (
    <OnboardingContainerWithTheme
      onComplete={() => {
        setDesktopOnboardingCompleted();
        navigate('/', { replace: true });
      }}
    />
  );
};

export default DesktopOnboarding;
