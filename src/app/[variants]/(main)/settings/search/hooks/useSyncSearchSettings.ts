'use client';

import { type FormInstance } from 'antd';
import { useLayoutEffect } from 'react';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

/**
 * 同步搜索设置到表单
 * 按照 LobeChat 的模式实现状态同步
 */
export const useSyncSearchSettings = (form: FormInstance) => {
  useLayoutEffect(() => {
    // 初始化表单值
    const currentSettings = useUserStore.getState();
    const searchSettings = settingsSelectors.currentSettings(currentSettings);
    form.setFieldsValue(searchSettings);

    // 订阅状态变化
    const unsubscribe = useUserStore.subscribe(settingsSelectors.currentSettings, (settings) => {
      form.setFieldsValue(settings);
    });

    return unsubscribe;
  }, [form]);
};
