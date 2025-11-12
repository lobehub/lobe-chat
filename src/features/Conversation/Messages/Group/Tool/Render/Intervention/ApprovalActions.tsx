import { Button, Dropdown } from '@lobehub/ui';
import { Input, Popover, Space } from 'antd';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';

import { ApprovalMode } from './index';

interface ApprovalActionsProps {
  apiName: string;
  approvalMode: ApprovalMode;
  identifier: string;
  messageId: string;
  toolCallId: string;
}

const ApprovalActions = memo<ApprovalActionsProps>(
  ({ approvalMode, messageId, toolCallId, identifier, apiName }) => {
    const { t } = useTranslation(['chat', 'common']);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectPopoverOpen, setRejectPopoverOpen] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);

    const [approveToolIntervention, rejectToolIntervention] = useChatStore((s) => [
      s.approveToolCalling,
      s.rejectToolCalling,
    ]);
    const addToolToAllowList = useUserStore((s) => s.addToolToAllowList);

    const handleApprove = async (remember?: boolean) => {
      // 1. Update intervention status
      await approveToolIntervention(messageId, toolCallId);

      // 2. If remember, add to allowList
      if (remember) {
        const toolKey = `${identifier}/${apiName}`;
        await addToolToAllowList(toolKey);
      }
    };

    const handleReject = async (reason?: string) => {
      setRejectLoading(true);
      await rejectToolIntervention(messageId, reason);
      setRejectLoading(false);
      setRejectPopoverOpen(false);
      setRejectReason('');
    };

    return (
      <Flexbox gap={8} horizontal>
        <Popover
          arrow={false}
          content={
            <Flexbox gap={12} style={{ width: 400 }}>
              <Flexbox align={'center'} horizontal justify={'space-between'}>
                <div>{t('tool.intervention.rejectTitle')}</div>

                <Button
                  loading={rejectLoading}
                  onClick={() => handleReject(rejectReason)}
                  size="small"
                  type="primary"
                >
                  {t('confirm', { ns: 'common' })}
                </Button>
              </Flexbox>
              <Input.TextArea
                autoFocus
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('tool.intervention.rejectReasonPlaceholder')}
                rows={3}
                value={rejectReason}
                variant={'filled'}
              />
            </Flexbox>
          }
          onOpenChange={(open) => {
            if (rejectLoading) return;

            setRejectPopoverOpen(open);
          }}
          open={rejectPopoverOpen}
          placement="bottomRight"
          trigger="click"
        >
          <Button size="small" type="default">
            {t('tool.intervention.reject')}
          </Button>
        </Popover>

        {approvalMode === 'allow-list' ? (
          <Space.Compact>
            <Button onClick={() => handleApprove(true)} size="small" type="primary">
              {t('tool.intervention.approveAndRemember')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'once',
                    label: t('tool.intervention.approveOnce'),
                    onClick: () => handleApprove(false),
                  },
                ],
              }}
            >
              <Button icon={ChevronDown} size="small" type="primary" />
            </Dropdown>
          </Space.Compact>
        ) : (
          <Button onClick={() => handleApprove()} size="small" type="primary">
            {t('tool.intervention.approve')}
          </Button>
        )}
      </Flexbox>
    );
  },
);

export default ApprovalActions;
