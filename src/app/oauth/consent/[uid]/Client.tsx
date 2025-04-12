'use client';

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
  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Center height="100vh">
        <div className="error">
          <h2>{error.title}</h2>
          <p>{error.message}</p>
        </div>
      </Center>
    );
  }

  return (
    <Center height="100vh">
      <Flexbox className="auth-card" gap={24} padding={32} style={{ maxWidth: 500 }}>
        <h1 className="title">授权请求</h1>
        <p>
          应用 <strong>{clientId}</strong> 请求访问您的 LobeChat 账户
        </p>

        <div className="scopes">
          <p>应用请求以下权限：</p>
          {scopes.map((scope) => (
            <div className="scope" key={scope}>
              {getScopeDescription(scope)}
            </div>
          ))}
        </div>

        <form action="/oauth/consent" method="post">
          <input name="uid" type="hidden" value={uid} />
          <Flexbox gap={12} horizontal justify="flex-end">
            <button className="button secondary" name="consent" type="submit" value="deny">
              拒绝
            </button>
            <button className="button primary" name="consent" type="submit" value="accept">
              授权
            </button>
          </Flexbox>
        </form>
      </Flexbox>

      <style jsx>{`
        .auth-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
        }
        .title {
          font-size: 1.5rem;
          margin: 0 0 16px 0;
        }
        .scopes {
          margin: 16px 0;
          width: 100%;
        }
        .scope {
          background: #f3f4f6;
          padding: 12px;
          margin: 8px 0;
          border-radius: 4px;
        }
        .button {
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .primary {
          background: #000;
          color: white;
          border: none;
        }
        .secondary {
          background: white;
          color: #333;
          border: 1px solid #ddd;
        }
        .error {
          text-align: center;
        }
      `}</style>
    </Center>
  );
};
