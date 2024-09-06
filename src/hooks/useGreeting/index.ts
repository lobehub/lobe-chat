import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { parseGreetingTime } from './greetingTime';

export const useGreeting = () => {
  const { t } = useTranslation('welcome');

  const [greeting, setGreeting] = useState<'morning' | 'noon' | 'afternoon' | 'night'>();

  useEffect(() => {
    setGreeting(parseGreetingTime());
  }, []);

  return greeting && t(`guide.welcome.${greeting}`);
};
