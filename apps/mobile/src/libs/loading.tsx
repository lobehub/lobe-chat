import type { FC } from 'react';
import RootSiblings from 'react-native-root-siblings';

import { FullWindowOverlay } from '@/components/FullWindowOverlay';
import LoadingToast from '@/components/LoadingToast';

const LoadingContainer: FC<{
  cancel: () => void;
}> = ({ cancel }) => {
  return (
    <FullWindowOverlay>
      <LoadingToast onCancel={cancel} />
    </FullWindowOverlay>
  );
};

class LoadingStatic {
  start(): { done: () => void };
  // eslint-disable-next-line no-dupe-class-members
  start<T>(promise: Promise<T>): Promise<T>;
  // eslint-disable-next-line no-dupe-class-members
  start<T>(promise?: Promise<T>) {
    const siblings = new RootSiblings(<LoadingContainer cancel={() => siblings.destroy()} />);

    if (promise) {
      promise.finally(() => siblings.destroy());
      return promise;
    } else {
      return {
        done: () => {
          siblings.destroy();
        },
      };
    }
  }
}

export const loading = new LoadingStatic();
