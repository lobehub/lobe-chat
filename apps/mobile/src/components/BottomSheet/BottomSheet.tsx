import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import React, { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionIcon from '../ActionIcon';
import Flexbox from '../Flexbox';
import Text from '../Text';
import { useStyles } from './style';
import type { BottomSheetProps } from './type';

const BottomSheet = memo(
  forwardRef<BottomSheetModal, BottomSheetProps>(
    (
      {
        children,
        title,
        showCloseButton = true,
        onClose,
        open = false,
        snapPoints = ['50%'],
        initialSnapIndex,
        enablePanDownToClose = true,
        enableBackdrop = true,
        backdropComponent,
        containerStyle,
        contentContainerStyle,
        style,
        animationConfigs,
      },
      ref,
    ) => {
      const { styles, theme } = useStyles();
      const bottomSheetRef = useRef<BottomSheetModal>(null);

      // 合并 ref
      useEffect(() => {
        if (ref) {
          if (typeof ref === 'function') {
            ref(bottomSheetRef.current);
          } else {
            ref.current = bottomSheetRef.current;
          }
        }
      }, [ref]);

      // 默认背景遮罩组件
      const renderBackdrop = useCallback(
        (props: any) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            enableTouchThrough={false}
            onAccessibilityEscape={() => onClose?.()}
            onPress={() => onClose?.()}
            style={[styles.backdrop, props.style]}
          />
        ),
        [styles.backdrop],
      );

      // 处理关闭
      const handleClose = useCallback(() => {
        bottomSheetRef.current?.dismiss();
        onClose?.();
      }, [onClose]);

      // 处理变化事件，当完全关闭时触发 onClose
      const handleChange = useCallback(
        (index: number) => {
          if (index === -1) {
            onClose?.();
          }
        },
        [onClose],
      );

      // 根据 open 状态控制显示/隐藏
      useEffect(() => {
        if (!bottomSheetRef.current) return;
        if (open) {
          bottomSheetRef.current.present();
        } else {
          bottomSheetRef.current.dismiss();
        }
      }, [open]);

      useEffect(() => {
        return () => {
          if (!bottomSheetRef.current) return;
          bottomSheetRef.current.dismiss();
        };
      }, [onClose]);

      return (
        <BottomSheetModal
          animationConfigs={animationConfigs}
          backdropComponent={enableBackdrop ? backdropComponent || renderBackdrop : undefined}
          backgroundStyle={[styles.container, containerStyle]}
          enableDynamicSizing={false}
          enablePanDownToClose={enablePanDownToClose}
          handleIndicatorStyle={styles.handleIndicator}
          index={initialSnapIndex}
          onAccessibilityEscape={() => onClose?.()}
          onChange={handleChange}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          style={style}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <Flexbox align="center" horizontal justify={'space-between'} paddingInline={16}>
              <View style={{ height: 32 }} />
              <Flexbox align={'center'} gap={8} horizontal justify={'center'} style={styles.title}>
                {typeof title === 'string' ? (
                  <Text style={styles.titleText} weight={500}>
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </Flexbox>
              {showCloseButton && (
                <ActionIcon
                  color={theme.colorTextDescription}
                  icon={X}
                  onPress={handleClose}
                  pressEffect
                  size={{
                    blockSize: 32,
                    borderRadius: 16,
                    size: 20,
                  }}
                  style={{
                    zIndex: 10,
                  }}
                  variant={'filled'}
                />
              )}
            </Flexbox>
          )}
          {/* Content */}
          <BottomSheetScrollView contentContainerStyle={contentContainerStyle}>
            <SafeAreaView edges={['bottom']} testID="bottom-sheet-container">
              {children}
            </SafeAreaView>
          </BottomSheetScrollView>
        </BottomSheetModal>
      );
    },
  ),
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
