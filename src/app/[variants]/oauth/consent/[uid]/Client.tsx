'use client';

import { Button, Card, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Center, Flexbox } from 'react-layout-kit';

type ClientProps = {
  clientId: string;
  error?: {
    message: string;
    title: string;
  };
  scopes: string[];
  uid: string;
};

const { Title, Text, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  error: css`
    text-align: center;
  `,
  scope: css`
    margin-block: 8px;
    padding: 12px;
    border-radius: 4px;
    background: ${token.colorFillTertiary};
  `,
  scopes: css`
    width: 100%;
    margin-block: 16px;
  `,
}));

/**
 * 获取 Scope 的描述
 */
function getScopeDescription(scope: string): string {
  const descriptions: Record<string, string> = {
    'email': '访问您的电子邮件地址',
    'offline_access': '在您离线时继续访问您的数据',
    'openid': '使用您的 LobeChat 账户进行身份验证',
    'profile': '访问您的基本资料信息（名称、头像等）',
    'sync:read': '读取您的同步数据',
    'sync:write': '写入并更新您的同步数据',
  };

  return descriptions[scope] || scope;
}

export const ConsentClient = ({ uid, clientId, scopes, error }: ClientProps) => {
  const { styles } = useStyles();

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Center height="100vh">
        <div className={styles.error}>
          <Title level={2}>{error.title}</Title>
          <Paragraph>{error.message}</Paragraph>
        </div>
      </Center>
    );
  }

  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Flexbox gap={24}>
          <Title level={3} style={{ margin: 0 }}>
            授权请求
          </Title>
          <Paragraph>
            应用 <Text strong>{clientId}</Text> 请求访问您的 LobeChat 账户
          </Paragraph>

          <div className={styles.scopes}>
            <Paragraph>应用请求以下权限：</Paragraph>
            {scopes.map((scope) => (
              <div className={styles.scope} key={scope}>
                <Text>{getScopeDescription(scope)}</Text>
              </div>
            ))}
          </div>

          <form action="/oidc/consent" method="post">
            <input name="uid" type="hidden" value={uid} />
            <Flexbox gap={12} horizontal justify="flex-end">
              <Button htmlType="submit" name="consent" value="deny">
                拒绝
              </Button>
              <Button htmlType="submit" name="consent" type="primary" value="accept">
                授权
              </Button>
            </Flexbox>
          </form>
        </Flexbox>
      </Card>
    </Center>
  );
};
