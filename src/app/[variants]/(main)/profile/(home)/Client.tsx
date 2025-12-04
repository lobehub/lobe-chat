'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Skeleton, Spin, Typography, Upload } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { CSSProperties, ReactNode, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { notification } from '@/components/AntdStaticMethods';
import { fetchErrorNotification } from '@/components/Error/fetchErrorNotification';
import { enableAuth } from '@/const/auth';
import UserAvatar from '@/features/User/UserAvatar';
import { requestPasswordReset } from '@/libs/better-auth/auth-client';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';
import { imageToBase64 } from '@/utils/imageToBase64';
import { createUploadImageHandler } from '@/utils/uploadFIle';

import SSOProvidersList from './features/SSOProvidersList';

interface ProfileRowProps {
  action?: ReactNode;
  children: ReactNode;
  label: string;
}

const rowStyle: CSSProperties = {
  minHeight: 48,
  padding: '16px 0',
};

const labelStyle: CSSProperties = {
  flexShrink: 0,
  width: 160,
};

const ProfileRow = memo<ProfileRowProps>(({ label, children, action }) => (
  <Flexbox align="center" gap={24} horizontal justify="space-between" style={rowStyle}>
    <Flexbox align="center" gap={24} horizontal style={{ flex: 1 }}>
      <Typography.Text style={labelStyle}>{label}</Typography.Text>
      <Flexbox style={{ flex: 1 }}>{children}</Flexbox>
    </Flexbox>
    {action && <Flexbox>{action}</Flexbox>}
  </Flexbox>
));

const AvatarRow = memo(() => {
  const { t } = useTranslation('auth');
  const isLogin = useUserStore(authSelectors.isLogin);
  const updateAvatar = useUserStore((s) => s.updateAvatar);
  const [uploading, setUploading] = useState(false);

  const handleUploadAvatar = useCallback(
    createUploadImageHandler(async (avatar) => {
      try {
        setUploading(true);
        const img = new Image();
        img.src = avatar;

        await new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', reject);
        });

        const webpBase64 = imageToBase64({ img, size: 256 });
        await updateAvatar(webpBase64);
        setUploading(false);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        setUploading(false);

        fetchErrorNotification.error({
          errorMessage: error instanceof Error ? error.message : String(error),
          status: 500,
        });
      }
    }),
    [updateAvatar],
  );

  const canUpload = !enableAuth || isLogin;

  return (
    <Flexbox align="center" gap={24} horizontal justify="space-between" style={rowStyle}>
      <Flexbox align="center" gap={24} horizontal style={{ flex: 1 }}>
        <Typography.Text style={labelStyle}>{t('profile.avatar')}</Typography.Text>
        <Flexbox style={{ flex: 1 }}>
          {canUpload ? (
            <Spin indicator={<LoadingOutlined spin />} spinning={uploading}>
              <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
                <UserAvatar clickable size={40} />
              </Upload>
            </Spin>
          ) : (
            <UserAvatar size={40} />
          )}
        </Flexbox>
      </Flexbox>
      {canUpload && (
        <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
          <Typography.Text style={{ cursor: 'pointer', fontSize: 13 }}>
            {t('profile.updateAvatar')}
          </Typography.Text>
        </Upload>
      )}
    </Flexbox>
  );
});

const FullNameRow = memo(() => {
  const { t } = useTranslation('auth');
  const fullName = useUserStore(userProfileSelectors.fullName);
  const updateFullName = useUserStore((s) => s.updateFullName);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setEditValue(fullName || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSave = useCallback(async () => {
    if (!editValue.trim()) return;

    try {
      setSaving(true);
      await updateFullName(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update fullName:', error);
      fetchErrorNotification.error({
        errorMessage: error instanceof Error ? error.message : String(error),
        status: 500,
      });
    } finally {
      setSaving(false);
    }
  }, [editValue, updateFullName]);

  return (
    <Flexbox gap={24} horizontal style={rowStyle}>
      <Typography.Text style={labelStyle}>{t('profile.fullName')}</Typography.Text>
      <Flexbox style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
              key="editing"
              transition={{ duration: 0.2 }}
            >
              <Flexbox gap={12}>
                <Typography.Text strong>{t('profile.fullNameInputHint')}</Typography.Text>
                <Input
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onPressEnter={handleSave}
                  placeholder={t('profile.fullName')}
                  value={editValue}
                />
                <Flexbox gap={8} horizontal justify="flex-end">
                  <Button disabled={saving} onClick={handleCancel} size="small">
                    {t('profile.cancel')}
                  </Button>
                  <Button loading={saving} onClick={handleSave} size="small" type="primary">
                    {t('profile.save')}
                  </Button>
                </Flexbox>
              </Flexbox>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="display"
              transition={{ duration: 0.2 }}
            >
              <Flexbox align="center" horizontal justify="space-between">
                <Typography.Text>{fullName || '--'}</Typography.Text>
                <Typography.Text
                  onClick={handleStartEdit}
                  style={{ cursor: 'pointer', fontSize: 13 }}
                >
                  {t('profile.updateFullName')}
                </Typography.Text>
              </Flexbox>
            </motion.div>
          )}
        </AnimatePresence>
      </Flexbox>
    </Flexbox>
  );
});

const PasswordRow = memo(() => {
  const { t } = useTranslation('auth');
  const userProfile = useUserStore(userProfileSelectors.userProfile);
  const [sending, setSending] = useState(false);

  const handleChangePassword = useCallback(async () => {
    if (!userProfile?.email) return;

    try {
      setSending(true);
      await requestPasswordReset({
        email: userProfile.email,
        redirectTo: `/reset-password?email=${encodeURIComponent(userProfile.email)}`,
      });
      notification.success({
        message: t('profile.resetPasswordSent'),
      });
    } catch (error) {
      console.error('Failed to send reset password email:', error);
      notification.error({
        message: t('profile.resetPasswordError'),
      });
    } finally {
      setSending(false);
    }
  }, [userProfile?.email, t]);

  return (
    <ProfileRow
      action={
        <Typography.Text
          onClick={sending ? undefined : handleChangePassword}
          style={{
            cursor: sending ? 'default' : 'pointer',
            fontSize: 13,
            opacity: sending ? 0.5 : 1,
          }}
        >
          {t('profile.changePassword')}
        </Typography.Text>
      }
      label={t('profile.password')}
    >
      <Typography.Text>••••••</Typography.Text>
    </ProfileRow>
  );
});

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [isLoginWithNextAuth, isLoginWithBetterAuth] = useUserStore((s) => [
    authSelectors.isLoginWithNextAuth(s),
    authSelectors.isLoginWithBetterAuth(s),
  ]);
  const [username, userProfile, isUserLoaded] = useUserStore((s) => [
    userProfileSelectors.username(s),
    userProfileSelectors.userProfile(s),
    s.isLoaded,
  ]);
  const isEmailPasswordAuth = useUserStore(authSelectors.isEmailPasswordAuth);
  const isLoadedAuthProviders = useUserStore(authSelectors.isLoadedAuthProviders);
  const fetchAuthProviders = useUserStore((s) => s.fetchAuthProviders);

  const isLoginWithAuth = isLoginWithNextAuth || isLoginWithBetterAuth;
  const isLoading = !isUserLoaded || (isLoginWithAuth && !isLoadedAuthProviders);

  useEffect(() => {
    if (isLoginWithAuth) {
      fetchAuthProviders();
    }
  }, [isLoginWithAuth, fetchAuthProviders]);

  const { t } = useTranslation('auth');

  if (isLoading)
    return (
      <Skeleton
        active
        paragraph={{ rows: 6 }}
        style={{ padding: mobile ? 16 : undefined }}
        title={false}
      />
    );

  return (
    <Flexbox gap={0} paddingInline={mobile ? 16 : 0}>
      <Typography.Title level={4} style={{ marginBottom: 32 }}>
        {t('profile.title')}
      </Typography.Title>

      <Divider style={{ marginBlock: 0 }} />

      {/* Avatar Row - Editable */}
      <AvatarRow />

      <Divider style={{ margin: 0 }} />

      {/* Full Name Row - Editable */}
      <FullNameRow />

      <Divider style={{ margin: 0 }} />

      {/* Username Row - Read Only */}
      <ProfileRow label={t('profile.username')}>
        <Typography.Text>{username || '--'}</Typography.Text>
      </ProfileRow>

      <Divider style={{ margin: 0 }} />

      {/* Password Row - Only for Better Auth users with credential login */}
      {isLoginWithBetterAuth && isEmailPasswordAuth && (
        <>
          <PasswordRow />
          <Divider style={{ margin: 0 }} />
        </>
      )}

      {/* Email Row - Read Only */}
      {isLoginWithAuth && userProfile?.email && (
        <>
          <ProfileRow label={t('profile.email')}>
            <Typography.Text>{userProfile.email}</Typography.Text>
          </ProfileRow>
          <Divider style={{ margin: 0 }} />
        </>
      )}

      {/* SSO Providers Row */}
      {isLoginWithAuth && (
        <ProfileRow label={t('profile.sso.providers')}>
          <SSOProvidersList />
        </ProfileRow>
      )}
    </Flexbox>
  );
});

export default Client;
