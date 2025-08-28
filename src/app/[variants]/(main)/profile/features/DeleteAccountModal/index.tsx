'use client';

import { Button, Modal, Typography } from 'antd';
import { useState } from 'react';
import { lambdaClient } from '@/libs/trpc/client';
import { handleAccountDeleted } from '@/utils/account';

const { Title, Paragraph, Text } = Typography;

interface DeleteAccountModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

const DeleteAccountModal = ({ open, onCancel, onConfirm }: DeleteAccountModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await lambdaClient.user.deleteAccount.mutate();
      // Use the unified account deletion handler
      await handleAccountDeleted();
      onConfirm();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setLoading(false);
    }
  };


  return (
    <Modal
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          danger 
          key="confirm" 
          loading={loading} 
          onClick={handleConfirm}
          type="primary"
        >
          确认删除账户
        </Button>,
      ]}
      onCancel={onCancel}
      open={open}
      title={
        <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>
          账户注销：重要须知
        </Title>
      }
      width={600}
    >
      <div style={{ padding: '16px 0' }}>
        <Paragraph>
          在您做出最终决定前，请仔细阅读以下信息。注销账户是一个 <Text strong style={{ color: '#ff4d4f' }}>永久性且不可逆</Text> 的操作。
        </Paragraph>

        <Title level={5}>1. 账户与身份的永久消失</Title>
        <Paragraph>
          • <Text strong>无法恢复</Text>: 一旦注销，您的账户将被永久删除，我们无法为您恢复任何数据。<br />
          • <Text strong>身份失效</Text>: 您将无法再使用当前的邮箱或第三方身份（例如，通过 Google / GitHub 关联的账户）登录或重新注册。
        </Paragraph>

        <Title level={5}>2. 您所有数据的永久清除</Title>
        <Paragraph>
          • <Text strong>个人数据</Text>: 您的个人资料、设置偏好、操作历史等信息将被完全抹除。<br />
          • <Text strong>业务数据</Text>: 您创建的所有内容（例如：项目、文档、上传的文件等）都将被永久删除，请务必提前备份好您需要保留的重要资料。
        </Paragraph>

        <Title level={5}>3. 财务相关的处理</Title>
        <Paragraph>
          • <Text strong>订阅与服务</Text>: 任何有效的订阅计划将立即终止，剩余的服务期限会自动作废。<br />
          • <Text strong>积分与余额</Text>: 账户中所有未使用的积分、代金券或预付余额将全部清零。<br />
          • <Text strong>无退款</Text>: 根据我们的服务条款，针对已终止的订阅和已清零的积分/余额，我们<Text strong>不会提供任何形式的退款或补偿</Text>。
        </Paragraph>

        <Title level={5} style={{ color: '#1890ff' }}>真的要离开我们吗？</Title>
        <Paragraph>
          • 如果您只是不想再接收我们的邮件，可以前往 [邮件设置] 取消订阅。<br />
          • 如果觉得当前套餐不合适，或许可以考虑 [降级套餐] 或暂停订阅。
        </Paragraph>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;