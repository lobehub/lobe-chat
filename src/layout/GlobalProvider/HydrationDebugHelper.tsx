'use client';

import { useEffect } from 'react';

/**
 * HydrationDebugger - 用于调试 React 水合问题的工具类
 */
class HydrationDebugger {
  /**
   * 比较服务端和客户端 HTML 的差异
   * @param serverHtml - 从服务器获取的纯 HTML 字符串
   */
  static debugHydration(serverHtml: string) {
    // 确保这个方法只在浏览器环境中执行
    if (typeof window === 'undefined') {
      console.warn('[HydrationDebugger] debugHydration 只能在客户端调用。');
      return;
    }

    // 格式化函数，使 HTML 更易于比较
    const formatHtml = (html: string): string => {
      const el = document.createElement('div');
      el.innerHTML = html;

      // 简单的格式化逻辑：通过缩进标准化结构
      let formatted = '';
      let indent = '';
      const nodes = el.innerHTML.split(/>\s*</);

      nodes.forEach((node, index, arr) => {
        if (/^\/\w/.test(node)) {
          indent = indent.slice(2);
        }

        let closing = '>';
        // 如果不是自闭合标签或者最后一个节点
        if (node.includes('</') === false && index !== arr.length - 1) {
          closing = '>\n';
        }

        formatted += indent + '<' + node + closing;

        if (/^<?\w[^>]*[^/]$/.test(node)) {
          indent += '  ';
        }
      });

      return formatted.trim();
    };

    console.log('--- 开始水合差异调试 ---');

    // 1. 获取客户端渲染后的 HTML
    const clientBodyHtml = document.body.innerHTML;

    // 2. 为了简化对比，我们只关注 body 内部
    const serverBodyMatch = serverHtml.match(/<body[^>]*>([\S\s]*)<\/body>/);

    if (serverBodyMatch?.[1]) {
      const serverBodyHtml = serverBodyMatch[1];

      if (serverBodyHtml.trim() === clientBodyHtml.trim()) {
        console.log(
          '%c✅ 水合匹配成功！服务器和客户端主体内容一致。',
          'color: green; font-weight: bold;',
        );
      } else {
        console.error('%c❌ 水合不匹配！服务器和客户端主体内容存在差异。', 'color: red; font-weight: bold;');

        // 使用 console.group 来组织输出，方便折叠
        console.groupCollapsed('🔍 服务端 Body HTML (格式化后)');
        console.log(formatHtml(serverBodyHtml));
        console.groupEnd();

        console.groupCollapsed('🔍 客户端 Body HTML (格式化后)');
        console.log(formatHtml(clientBodyHtml));
        console.groupEnd();

        // 尝试找出具体差异点
        this.findDifferences(serverBodyHtml, clientBodyHtml);

        console.log('%c💡 提示: 请使用文本对比工具比较以上两份 HTML 以定位差异点。', 'color: blue;');
      }
    } else {
      console.error('[HydrationDebugger] 无法从服务端 HTML 中提取 <body> 内容。');
    }

    console.log('--- 水合差异调试结束 ---');
  }

  /**
   * 尝试找出具体的差异点
   */
  private static findDifferences(serverHtml: string, clientHtml: string) {
    // 简单的差异检测：比较长度和部分内容
    console.groupCollapsed('📊 差异统计');
    console.log(`服务端 HTML 长度: ${serverHtml.length} 字符`);
    console.log(`客户端 HTML 长度: ${clientHtml.length} 字符`);
    console.log(`差异: ${Math.abs(serverHtml.length - clientHtml.length)} 字符`);

    // 检查常见的水合错误模式
    const patterns = [
      { name: 'localStorage 相关', regex: /localStorage/g },
      { name: 'sessionStorage 相关', regex: /sessionStorage/g },
      { name: 'window 对象访问', regex: /window\./g },
      { name: 'document 对象访问', regex: /document\./g },
      { name: 'data-reactroot 属性', regex: /data-reactroot/g },
      { name: '空白字符差异', regex: /\s+/g },
    ];

    patterns.forEach(({ name, regex }) => {
      const serverMatches = serverHtml.match(regex)?.length || 0;
      const clientMatches = clientHtml.match(regex)?.length || 0;

      if (serverMatches !== clientMatches) {
        console.warn(`⚠️ ${name} 出现次数不一致: 服务端 ${serverMatches}, 客户端 ${clientMatches}`);
      }
    });

    console.groupEnd();
  }
}

/**
 * HydrationDebugHelper - 自动对比服务端和客户端 HTML 的调试组件
 * 仅在开发环境使用
 */
const HydrationDebugHelper = () => {
  useEffect(() => {
    fetch(window.location.href)
      .then((res) => res.text())
      .then((serverHtml) => {
        // 使用 setTimeout 确保在 React 完成水合后再执行比较
        setTimeout(() => {
          HydrationDebugger.debugHydration(serverHtml);
        }, 1000); // 增加延迟以确保水合完成
      })
      .catch((error) => {
        console.error('[HydrationDebugger] 获取服务端 HTML 失败:', error);
      });
  }, []);

  return null; // 这个组件不渲染任何 UI
};

export default HydrationDebugHelper;
