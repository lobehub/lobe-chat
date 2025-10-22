import { Button } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InteractionManager } from 'react-native';

import Flexbox from '@/components/Flexbox';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

const AddButton = memo(() => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSession = async () => {
    setIsLoading(true);
    try {
      // Create session without auto-switching
      const sessionId = await createSession(undefined, false);

      // Close the Session Drawer
      toggleDrawer();

      // Navigate to the new session after interactions complete
      InteractionManager.runAfterInteractions(() => {
        router.replace({
          params: { session: sessionId },
          pathname: '/chat',
        });
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flexbox flex={1} padding={12}>
      <Button
        block
        icon={Plus}
        loading={isLoading}
        onPress={handleAddSession}
        size={'small'}
        variant={'filled'}
      >
        {t('newAgent')}
      </Button>
    </Flexbox>
  );
});

AddButton.displayName = 'AddButton';

export default AddButton;
