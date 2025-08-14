'use client';

import { useEffect, useState } from 'react';

type CallbackStatus = 'loading' | 'success' | 'error';

/**
 * Market OIDC 授权回调页面
 * 处理从 OIDC 服务器返回的授权码
 */
const MarketAuthCallbackPage = () => {
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('正在处理授权...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('[MarketAuthCallback] Processing authorization callback');

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('[MarketAuthCallback] Authorization error:', error, errorDescription);
      setStatus('error');
      setMessage(`授权失败: ${errorDescription || error}`);

      // 向父窗口发送错误消息
      if (window.opener) {
        window.opener.postMessage(
          {
            error: errorDescription || error,
            type: 'MARKET_AUTH_ERROR',
          },
          window.location.origin,
        );
      }
      return;
    }

    if (code && state) {
      console.log('[MarketAuthCallback] Authorization successful, code received');
      setStatus('success');
      setMessage('授权成功！正在跳转...');

      // 向父窗口发送成功消息
      if (window.opener) {
        window.opener.postMessage(
          {
            code,
            state,
            type: 'MARKET_AUTH_SUCCESS',
          },
          window.location.origin,
        );
      }

      // 开始倒计时并在3秒后关闭窗口
      let timeLeft = 3;
      setCountdown(timeLeft);

      const countdownTimer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          window.close();
        }
      }, 1000);
    } else {
      console.error('[MarketAuthCallback] Missing code or state parameter');
      setStatus('error');
      setMessage('授权参数缺失');

      if (window.opener) {
        window.opener.postMessage(
          {
            error: 'Missing authorization parameters',
            type: 'MARKET_AUTH_ERROR',
          },
          window.location.origin,
        );
      }
    }
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'success': {
        return '✅';
      }
      case 'error': {
        return '❌';
      }
      default: {
        return '⏳';
      }
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': {
        return '#52c41a';
      }
      case 'error': {
        return '#ff4d4f';
      }
      default: {
        return '#1677ff';
      }
    }
  };

  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        fontFamily: 'Arial, sans-serif',
        height: '100vh',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          padding: '32px',
          textAlign: 'center',
          width: '90%',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}
        >
          {getStatusIcon()}
        </div>

        <h2
          style={{
            color: getStatusColor(),
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 16px 0',
          }}
        >
          {status === 'loading' && 'LobeHub Market 授权'}
          {status === 'success' && '授权成功'}
          {status === 'error' && '授权失败'}
        </h2>

        <p
          style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 20px 0',
          }}
        >
          {message}
        </p>

        {status === 'success' && (
          <div
            style={{
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              color: '#389e0d',
              fontSize: '14px',
              padding: '12px',
            }}
          >
            窗口将在 <strong>{countdown}</strong> 秒后自动关闭
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => window.close()}
            style={{
              backgroundColor: '#ff4d4f',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 16px',
            }}
            type="button"
          >
            关闭窗口
          </button>
        )}
      </div>
    </div>
  );
};

export default MarketAuthCallbackPage;
