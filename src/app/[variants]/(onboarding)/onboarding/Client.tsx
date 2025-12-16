'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useUserStore } from '@/store/user';
import { onboardingSelectors } from '@/store/user/selectors';

import FullNameStep from './features/FullNameStep';
import ResponseLanguageStep from './features/ResponseLanguageStep';
import TelemetryStep from './features/TelemetryStep';

const Client = memo(() => {
  const [isUserStateInit, currentStep, goToNextStep, goToPreviousStep] = useUserStore((s) => [
    s.isUserStateInit,
    onboardingSelectors.currentStep(s),
    s.goToNextStep,
    s.goToPreviousStep,
  ]);

  if (!isUserStateInit) {
    return <Loading debugId="Onboarding" />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: {
        return <TelemetryStep onNext={goToNextStep} />;
      }
      case 2: {
        return <FullNameStep onBack={goToPreviousStep} onNext={goToNextStep} />;
      }
      case 3: {
        return <ResponseLanguageStep onBack={goToPreviousStep} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox gap={24} style={{ maxWidth: 480, width: '100%' }}>
      {renderStep()}
    </Flexbox>
  );
});

Client.displayName = 'OnboardingClient';

export default Client;
