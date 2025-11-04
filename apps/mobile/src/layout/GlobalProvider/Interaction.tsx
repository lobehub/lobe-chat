import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { PortalProvider } from '@gorhom/portal';
import { ToastProvider } from '@lobehub/ui-rn';
import { PropsWithChildren } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';

/**
 * Interaction Provider
 * - ActionSheetProvider: Native action sheet support
 * - PortalProvider: Portal rendering for modals and overlays
 * - RootSiblingParent: Root sibling support for toast and overlays
 * - ToastProvider: Toast notification system
 */
const Interaction = ({ children }: PropsWithChildren) => {
  return (
    <ActionSheetProvider>
      <PortalProvider>
        <RootSiblingParent>
          <ToastProvider>{children}</ToastProvider>
        </RootSiblingParent>
      </PortalProvider>
    </ActionSheetProvider>
  );
};

export default Interaction;
