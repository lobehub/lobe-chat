import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import MarkdownRender from '../index';

const mathContent = `# 数学公式演示

## 行内公式
这是一个行内公式示例：$E = mc^2$，爱因斯坦的质能方程。

另一个行内公式：$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$

## 块级公式

### 积分公式
$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

### 矩阵运算
$$\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix} \\begin{pmatrix}
x \\\\
y
\\end{pmatrix} = \\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}$$

### 傅里叶级数
$$f(x) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(nx) + b_n \\sin(nx) \\right)$$

其中系数为：
$$a_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\cos(nx) \\, dx$$

### 复杂公式
$$\\frac{1}{\\sqrt{2\\pi}} \\int_{-\\infty}^{x} e^{-\\frac{t^2}{2}} dt = \\frac{1}{2} \\left(1 + \\text{erf}\\left(\\frac{x}{\\sqrt{2}}\\right)\\right)$$`;

const MathDemo = () => {
  const token = useThemeToken();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: token.colorBgLayout,
      flex: 1,
    },
    content: {
      backgroundColor: token.colorBgContainer,
      flex: 1,
      padding: 16,
    },
    title: {
      color: token.colorText,
      fontSize: 18,
      fontWeight: '600',
      padding: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>数学公式渲染</Text>
      <View style={styles.content}>
        <MarkdownRender content={mathContent} />
      </View>
    </View>
  );
};

export default MathDemo;
