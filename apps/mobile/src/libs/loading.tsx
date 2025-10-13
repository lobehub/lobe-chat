import { FullWindowOverlay } from '@lobehub/ui-rn';
import { BlurView } from 'expo-blur';
import { CircleXIcon } from 'lucide-react-native';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import RootSiblings from 'react-native-root-siblings';

import { useTheme } from '@/components/styles';

const LoadingContainer: FC<{
  cancel: () => void;
}> = ({ cancel }) => {
  // eslint-disable-next-line no-undef
  const cancelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const token = useTheme();

  const [showCancelButton, setShowCancelButton] = useState(false);
  useEffect(() => {
    // @ts-ignore
    cancelTimerRef.current = setTimeout(() => {
      setShowCancelButton(true);
    }, 3000);
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
    };
  }, []);

  return (
    <FullWindowOverlay>
      {/* Pressable to prevent the overlay from being clicked */}
      <Pressable
        style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}
      >
        <BlurView style={StyleSheet.absoluteFillObject} tint="systemChromeMaterialDark" />
        <ActivityIndicator size={'large'} />
        {showCancelButton && (
          <View
            style={{
              bottom: 96,
              flexDirection: 'row',
              justifyContent: 'center',
              left: 0,
              position: 'absolute',
              right: 0,
            }}
          >
            <TouchableOpacity onPress={cancel}>
              <View
                style={{
                  borderColor: token.colorBorderBg,
                  borderRadius: 99,
                  borderWidth: 2,
                  padding: 8,
                }}
              >
                <CircleXIcon color={token.colorIcon} height={20} width={20} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
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
