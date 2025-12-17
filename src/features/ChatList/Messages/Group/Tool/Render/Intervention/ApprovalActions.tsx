import { Button, Dropdown } from '@lobehub/ui';
import { Input, Popover, Space } from 'antd';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';

import { useGroupMessage } from '../../../GroupContext';
import { ApprovalMode } from './index';

interface ApprovalActionsProps {
  apiName: string;
  approvalMode: ApprovalMode;
  identifier: string;
  messageId: string;
  toolCallId: string;
}

const ApprovalActions = memo<ApprovalActionsProps>(
  ({ approvalMode, messageId, identifier, apiName }) => {
    const { t } = useTranslation(['chat', 'common']);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectPopoverOpen, setRejectPopoverOpen] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);

    const { assistantGroupId } = useGroupMessage();
    const [approveToolIntervention, rejectToolIntervention, rejectAndContinueToolIntervention] =
      useChatStore((s) => [
        s.approveToolCalling,
        s.rejectToolCalling,
        s.rejectAndContinueToolCalling,
      ]);
    const addToolToAllowList = useUserStore((s) => s.addToolToAllowList);

    const handleApprove = async (remember?: boolean) => {
      setApproveLoading(true);
      try {
        // 1. Update intervention status
        await approveToolIntervention(messageId, assistantGroupId);

        // 2. If remembered, add to allowList
        if (remember) {
          const toolKey = `${identifier}/${apiName}`;
          await addToolToAllowList(toolKey);
        }
      } finally {
        setApproveLoading(false);
      }
    };

    const handleReject = async (reason?: string) => {
      setRejectLoading(true);
      await rejectToolIntervention(messageId, reason);
      setRejectLoading(false);
      setRejectPopoverOpen(false);
      setRejectReason('');
    };

    const handleRejectAndContinue = async (reason?: string) => {
      setRejectLoading(true);
      await rejectAndContinueToolIntervention(messageId, reason);
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

                <Space>
                  <Button
                    color={'default'}
                    loading={rejectLoading}
                    onClick={() => handleReject(rejectReason)}
                    size="small"
                    variant={'filled'}
                  >
                    {t('tool.intervention.rejectOnly')}
                  </Button>
                  <Button
                    loading={rejectLoading}
                    onClick={() => handleRejectAndContinue(rejectReason)}
                    size="small"
                    type="primary"
                  >
                    {t('tool.intervention.rejectAndContinue')}
                  </Button>
                </Space>
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
          <Button color={'default'} size="small" variant={'filled'}>
            {t('tool.intervention.reject')}
          </Button>
        </Popover>

        {approvalMode === 'allow-list' ? (
          <Space.Compact>
            <Button
              loading={approveLoading}
              onClick={() => handleApprove(true)}
              size="small"
              type="primary"
            >
              {t('tool.intervention.approveAndRemember')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    disabled: approveLoading,
                    key: 'once',
                    label: t('tool.intervention.approveOnce'),
                    onClick: () => handleApprove(false),
                  },
                ],
              }}
            >
              <Button disabled={approveLoading} icon={ChevronDown} size="small" type="primary" />
            </Dropdown>
          </Space.Compact>
        ) : (
          <Button
            loading={approveLoading}
            onClick={() => handleApprove()}
            size="small"
            type="primary"
          >
            {t('tool.intervention.approve')}
          </Button>
        )}
      </Flexbox>
    );
  },
);

export default ApprovalActions;
