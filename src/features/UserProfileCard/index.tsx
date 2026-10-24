'use client';

import { Flexbox, Tag, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserProfile } from '@/business/client/hooks/useUserProfile';
import Avatar from '@/components/Avatar';

const AVATAR_SIZE = 80;
const AVATAR_RING = 4;

const styles = stylex.create({
  avatar: {
    borderRadius: '50%',
    boxShadow: `0 0 0 ${AVATAR_RING}px ${cssVar.colorBgElevated}`,
    flex: 'none',
  },
  banner: {
    alignItems: 'center',
    backgroundColor: cssVar.colorFillTertiary,
    display: 'flex',
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerInner: {
    filter: 'blur(44px)',
  },
  body: {
    paddingBlockEnd: 16,
    paddingBlockStart: 12,
    paddingInline: 16,
  },
  container: {
    backgroundColor: cssVar.colorBgElevated,
    overflow: 'hidden',
    width: 300,
  },
  header: {
    marginBlockStart: -(AVATAR_SIZE / 2),
    paddingInline: 16,
    position: 'relative',
  },
  name: {
    color: cssVar.colorText,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  section: {
    backgroundColor: cssVar.colorFillQuaternary,
    borderRadius: 8,
    paddingBlock: 12,
    paddingInline: 12,
  },
  sectionTitle: {
    color: cssVar.colorTextTertiary,
    fontSize: 11,
    fontWeight: 600,
  },
  username: {
    color: cssVar.colorTextSecondary,
    fontSize: 13,
  },
});

const formatJoinedAt = (joinedAt: UserProfile['joinedAt'], locale: string) => {
  if (!joinedAt) return null;
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
};

export interface UserProfileCardProps {
  /** Action area under the profile sections. */
  children?: ReactNode;
  profile: UserProfile;
}

/**
 * Discord-style member card: a blurred-avatar banner, a large round avatar
 * overlapping it, the display name and `@username`, then the workspace role
 * and join date. It only renders what the caller already resolved locally.
 */
const UserProfileCard = memo<UserProfileCardProps>(({ profile, children }) => {
  const { t, i18n } = useTranslation(['common', 'setting']);
  const name = profile.fullName || profile.username || '';
  // Same initials fallback as the list avatars, so the card matches what was hovered.
  const avatar = profile.avatar || undefined;
  const joinedAt = formatJoinedAt(profile.joinedAt, i18n.language);
  const roleLabel = profile.role
    ? t(`workspace.member.roles.${profile.role}` as 'workspace.member.roles.member', {
        defaultValue: profile.role,
        ns: 'setting',
      })
    : null;
  const hasDetails = Boolean(roleLabel || joinedAt);

  return (
    <Flexbox {...stylex.props(styles.container)}>
      <div aria-hidden {...stylex.props(styles.banner)}>
        <Avatar
          avatar={avatar}
          className={stylex.props(styles.bannerInner).className}
          name={name}
          shape={'square'}
          size={400}
        />
      </div>

      <Flexbox gap={12} {...stylex.props(styles.header)}>
        <Avatar
          avatar={avatar}
          className={stylex.props(styles.avatar).className}
          name={name}
          shape={'circle'}
          size={AVATAR_SIZE}
          title={name}
        />
        <Flexbox gap={2}>
          <Text ellipsis {...stylex.props(styles.name)}>
            {name}
          </Text>
          {profile.username && (
            <Text ellipsis {...stylex.props(styles.username)}>
              @{profile.username}
            </Text>
          )}
        </Flexbox>
      </Flexbox>

      <Flexbox gap={12} {...stylex.props(styles.body)}>
        {hasDetails && (
          <Flexbox gap={12} {...stylex.props(styles.section)}>
            {roleLabel && (
              <Flexbox align={'flex-start'} gap={6}>
                <span {...stylex.props(styles.sectionTitle)}>{t('userProfileCard.role')}</span>
                <Tag>{roleLabel}</Tag>
              </Flexbox>
            )}
            {joinedAt && (
              <Flexbox gap={4}>
                <span {...stylex.props(styles.sectionTitle)}>
                  {t('userProfileCard.memberSince')}
                </span>
                <Text fontSize={13}>{joinedAt}</Text>
              </Flexbox>
            )}
          </Flexbox>
        )}
        {children}
      </Flexbox>
    </Flexbox>
  );
});

UserProfileCard.displayName = 'UserProfileCard';

export default UserProfileCard;
