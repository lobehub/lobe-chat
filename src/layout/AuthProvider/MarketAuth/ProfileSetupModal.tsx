'use client';

import { Modal, Text } from '@lobehub/ui';
import { App, Form, Input, Tooltip } from 'antd';
import { CircleHelp } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MARKET_ENDPOINTS } from '@/services/_url';

import { MarketUserProfile } from './types';

interface ProfileSetupModalProps {
  accessToken: string | null;
  /**
   * Default display name to use (typically from OIDC)
   */
  defaultDisplayName?: string;
  /**
   * Whether this is the first-time setup (after initial sign in)
   */
  isFirstTimeSetup?: boolean;
  onClose: () => void;
  /**
   * Callback when profile is successfully updated
   */
  onSuccess?: (profile: MarketUserProfile) => void;
  open: boolean;
  /**
   * Current user profile (for editing existing profile)
   */
  userProfile?: MarketUserProfile | null;
}

interface FormValues {
  description?: string;
  displayName: string;
  userName: string;
}

const ProfileSetupModal = memo<ProfileSetupModalProps>(
  ({
    open,
    onClose,
    onSuccess,
    accessToken,
    defaultDisplayName,
    userProfile,
    isFirstTimeSetup = false,
  }) => {
    const { t } = useTranslation('marketAuth');
    const { message } = App.useApp();
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
      if (open) {
        // For userName default: use existing userName, or generate from displayName
        const existingUserName = userProfile?.userName;
        const existingDisplayName = userProfile?.displayName || defaultDisplayName || '';
        // Generate default userName from displayName (remove invalid chars, lowercase)
        const generatedUserName = existingDisplayName
          .toLowerCase()
          .replaceAll(/[^\w-]/g, '')
          .slice(0, 32);

        form.setFieldsValue({
          description: userProfile?.description || '',
          displayName: existingDisplayName,
          userName: existingUserName || generatedUserName,
        });
      }
    }, [open, userProfile, defaultDisplayName, form]);

    const handleSubmit = useCallback(async () => {
      if (!accessToken) {
        message.error(t('profileSetup.errors.notAuthenticated'));
        return;
      }

      try {
        const values = await form.validateFields();
        setLoading(true);

        const response = await fetch(MARKET_ENDPOINTS.updateUserProfile, {
          body: JSON.stringify({
            displayName: values.displayName,
            meta: values.description ? { description: values.description } : undefined,
            userName: values.userName,
          }),
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === 'username_taken') {
            message.error(t('profileSetup.errors.usernameTaken'));
            return;
          }
          throw new Error(errorData.message || 'Update failed');
        }

        const data = await response.json();
        message.success(t('profileSetup.success'));
        onSuccess?.(data.user);
        onClose();
      } catch (error) {
        console.error('[ProfileSetupModal] Update failed:', error);
        if (error instanceof Error && error.message !== 'Validation failed') {
          message.error(t('profileSetup.errors.updateFailed'));
        }
      } finally {
        setLoading(false);
      }
    }, [accessToken, form, message, onClose, onSuccess, t]);

    const handleCancel = useCallback(() => {
      if (!isFirstTimeSetup) {
        onClose();
      }
    }, [isFirstTimeSetup, onClose]);

    return (
      <Modal
        cancelButtonProps={isFirstTimeSetup ? { style: { display: 'none' } } : undefined}
        cancelText={t('profileSetup.cancel')}
        centered
        closable={!isFirstTimeSetup}
        confirmLoading={loading}
        keyboard={!isFirstTimeSetup}
        maskClosable={!isFirstTimeSetup}
        okText={isFirstTimeSetup ? t('profileSetup.getStarted') : t('profileSetup.save')}
        onCancel={handleCancel}
        onOk={handleSubmit}
        open={open}
        title={isFirstTimeSetup ? t('profileSetup.titleFirstTime') : t('profileSetup.titleEdit')}
        width={440}
      >
        <Text style={{ display: 'block', marginBottom: 24 }} type="secondary">
          {isFirstTimeSetup
            ? t('profileSetup.descriptionFirstTime')
            : t('profileSetup.descriptionEdit')}
        </Text>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t('profileSetup.fields.displayName.label')}
            name="displayName"
            rules={[
              { message: t('profileSetup.fields.displayName.required'), required: true },
              {
                max: 50,
                message: t('profileSetup.fields.displayName.maxLength'),
              },
            ]}
          >
            <Input
              maxLength={50}
              placeholder={t('profileSetup.fields.displayName.placeholder')}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={
              <Flexbox align="center" gap={4} horizontal>
                {t('profileSetup.fields.userName.label')}
                <Tooltip title={t('profileSetup.fields.userName.tooltip')}>
                  <CircleHelp size={14} style={{ cursor: 'help', opacity: 0.5 }} />
                </Tooltip>
              </Flexbox>
            }
            name="userName"
            rules={[
              { message: t('profileSetup.fields.userName.required'), required: true },
              {
                message: t('profileSetup.fields.userName.pattern'),
                pattern: /^[\w-]+$/,
              },
              {
                max: 32,
                message: t('profileSetup.fields.userName.maxLength'),
              },
              {
                message: t('profileSetup.fields.userName.minLength'),
                min: 3,
              },
            ]}
          >
            <Input
              maxLength={32}
              placeholder={t('profileSetup.fields.userName.placeholder')}
              prefix="@"
              showCount
            />
          </Form.Item>

          <Form.Item
            label={t('profileSetup.fields.description.label')}
            name="description"
            rules={[
              {
                max: 200,
                message: t('profileSetup.fields.description.maxLength'),
              },
            ]}
          >
            <Input.TextArea
              maxLength={200}
              placeholder={t('profileSetup.fields.description.placeholder')}
              rows={3}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);

ProfileSetupModal.displayName = 'ProfileSetupModal';

export default ProfileSetupModal;
