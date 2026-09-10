'use client';

import { Button, toast } from '@lobehub/ui/base-ui';
import { Form as AntdForm } from 'antd';
import { Download } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fillOwnerId } from '@/features/AgentSetting/AgentChannel/feishu/fillOwnerId';
import { useAgentStore } from '@/store/agent';

import type { PlatformSettingsFieldExtrasProps } from '../types';

/**
 * Fills "Your Platform User ID" on Feishu / Lark from the app's own info.
 *
 * A Feishu `open_id` is scoped to one application, so no console page can show
 * an operator their own id for this bot — the only other route is DMing the bot
 * `/whoami`. The app's own credentials, however, can read the app's owner,
 * which for a self-built app is normally the person configuring this channel.
 *
 * The lookup runs on its own as soon as the credentials are present and the
 * field is still empty: asking for a click bought nothing, since the value is
 * an opaque `ou_…` string nobody can verify by looking at it.
 *
 * What it deliberately does NOT do is save. This id decides `isOwner`, which
 * is what grants device tools (`local-system` / `remote-device`) access to the
 * operator's own machines — so on an app an admin created for someone else, a
 * silent write would hand that admin those tools. Writing into the visible
 * field instead keeps the value on screen, editable, and behind the operator's
 * own Save. The button stays as the retry path, and is the only one that
 * surfaces an error: an automatic attempt that fails stays quiet, because the
 * operator never asked for it.
 */
const FeishuUserIdExtras = memo<PlatformSettingsFieldExtrasProps>(
  ({ disabled, onFilled, platformId, savedValue }) => {
    const { t: _t } = useTranslation('agent');
    const t = _t as (key: string) => string;

    const form = AntdForm.useFormInstance();
    const applicationId = AntdForm.useWatch('applicationId', form) as string | undefined;
    const appSecret = AntdForm.useWatch(['credentials', 'appSecret'], form) as string | undefined;
    const [loading, setLoading] = useState(false);
    const requestRef = useRef(0);
    useEffect(
      () => () => {
        requestRef.current += 1;
      },
      [disabled, platformId],
    );

    const feishuFetchOwnerId = useAgentStore((s) => s.feishuFetchOwnerId);

    const appId = applicationId?.trim();
    const secret = appSecret?.trim();

    const fetchOwnerId = useCallback(
      async (mode: 'auto' | 'manual') => {
        if (disabled || !appId || !secret) return;

        const request = ++requestRef.current;
        setLoading(true);
        try {
          const owner = await fillOwnerId({
            credentials: {
              appId,
              appSecret: secret,
              platform: platformId === 'lark' ? 'lark' : 'feishu',
            },
            fetchOwner: feishuFetchOwnerId,
            form,
            isCurrent: () => request === requestRef.current,
          });
          if (!owner) return;
          // Mirror the field's own validation/dirty handling: `setFieldValue`
          // neither validates nor notifies, so do both explicitly.
          form.validateFields([['settings', 'userId']]).catch(() => undefined);
          onFilled?.();
          const base = t(
            mode === 'auto'
              ? 'channel.feishu.fetchOwnerIdAutoSuccess'
              : 'channel.feishu.fetchOwnerIdSuccess',
          );
          // The toast is the only thing that tells an operator a value appeared
          // without them asking, so it always fires — including on the
          // automatic path.
          toast.success(owner.name ? `${base} (${owner.name})` : base);
        } catch (error) {
          if (mode === 'auto' || request !== requestRef.current) return;
          const text = error instanceof Error ? error.message : String(error);
          toast.error(`${t('channel.feishu.fetchOwnerIdFailed')}: ${text}`);
        } finally {
          if (request === requestRef.current) setLoading(false);
        }
      },
      [appId, disabled, feishuFetchOwnerId, form, onFilled, platformId, secret, t],
    );

    // Whether the field currently holds a value, which decides whether the
    // retry button is worth showing at all. antd hydrates the form after mount,
    // so an `undefined` watch means "not loaded yet" rather than "empty" — fall
    // back to the saved value during that window so an already-configured bot
    // never flashes a button it doesn't need.
    const watchedUserId = AntdForm.useWatch(['settings', 'userId'], form) as string | undefined;
    const [formHydrated, setFormHydrated] = useState(false);
    useEffect(() => {
      if (watchedUserId !== undefined) setFormHydrated(true);
    }, [watchedUserId]);
    const effectiveUserId = formHydrated
      ? watchedUserId
      : typeof savedValue === 'string'
        ? savedValue
        : undefined;
    const hasUserId = !!effectiveUserId?.trim();

    // The automatic attempt is gated on the SAVED value, never the live one:
    // clearing the field is how an operator revokes owner status (and with it
    // device-tool access), so a lookup keyed on the live value would refill it
    // the instant they emptied it. Re-arms when the credential pair changes, so
    // a corrected secret — or a channel repointed at a different Feishu app,
    // whose `open_id`s are different values entirely — resolves on its own.
    const autoAttemptedKeyRef = useRef<string | null>(null);
    useEffect(() => {
      if (disabled || !appId || !secret) return;
      if (typeof savedValue === 'string' && savedValue.trim()) return;
      const credentialKey = `${appId}\u0000${secret}`;
      if (autoAttemptedKeyRef.current === credentialKey) return;
      autoAttemptedKeyRef.current = credentialKey;
      void fetchOwnerId('auto');
    }, [appId, disabled, fetchOwnerId, savedValue, secret]);

    const handleClick = () => {
      if (!appId || !secret) {
        toast.warning(t('channel.feishu.fetchOwnerIdMissingCredentials'));
        return;
      }
      void fetchOwnerId('manual');
    };

    // Hidden once the field holds a value: in the happy path the lookup already
    // ran on its own and a permanent button is just noise. It comes back
    // whenever the field is empty — the automatic attempt failed and the
    // operator wants the reason, or they cleared the value and changed their
    // mind — and it is the only path that surfaces the error, because an
    // attempt nobody asked for stays quiet.
    if (hasUserId) return null;

    return (
      <Button
        disabled={disabled || !appId || !secret}
        icon={<Download size={14} />}
        loading={loading}
        size="small"
        style={{ alignSelf: 'flex-start', marginBlockEnd: 12, marginInlineStart: 32 }}
        type="default"
        onClick={handleClick}
      >
        {t('channel.feishu.fetchOwnerId')}
      </Button>
    );
  },
);

export default FeishuUserIdExtras;
