import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import MarkdownRender from '../index';

const mathMarkdown = `# 数学公式示例

本示例展示了Markdown组件对数学公式的支持，基于MathJax渲染引擎。

## 基础数学公式

### 行内公式

在文本中嵌入公式：质能方程 $E = mc^2$ 是物理学中最著名的公式之一。

勾股定理：在直角三角形中，$a^2 + b^2 = c^2$，其中 $c$ 是斜边。

二次方程的解：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### 块级公式

欧拉恒等式：
$$e^{i\\pi} + 1 = 0$$

标准正态分布概率密度函数：
$$f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}$$

## 微积分

### 导数

函数 $f(x) = x^2$ 的导数：
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} = 2x$$

复合函数求导（链式法则）：
$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

### 积分

基本积分：
$$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$

定积分基本定理：
$$\\int_a^b f(x) dx = F(b) - F(a)$$

其中 $F'(x) = f(x)$

高斯积分：
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## 线性代数

### 矩阵

$2 \\times 2$ 矩阵：
$$A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$

矩阵乘法：
$$AB = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix} \\begin{pmatrix} b_{11} & b_{12} \\\\ b_{21} & b_{22} \\end{pmatrix} = \\begin{pmatrix} a_{11}b_{11} + a_{12}b_{21} & a_{11}b_{12} + a_{12}b_{22} \\\\ a_{21}b_{11} + a_{22}b_{21} & a_{21}b_{12} + a_{22}b_{22} \\end{pmatrix}$$

### 行列式

$2 \\times 2$ 矩阵的行列式：
$$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$

$3 \\times 3$ 矩阵的行列式：
$$\\det(A) = \\begin{vmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{vmatrix}$$

## 统计学

### 概率分布

二项分布概率质量函数：
$$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$$

正态分布概率密度函数：
$$f(x|\\mu,\\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$

### 期望和方差

期望值（连续型随机变量）：
$$E[X] = \\int_{-\\infty}^{\\infty} x f(x) dx$$

方差：
$$\\text{Var}(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2$$

## 数论

### 素数定理

小于 $x$ 的素数个数近似为：
$$\\pi(x) \\sim \\frac{x}{\\ln x}$$

### 欧拉函数

欧拉函数 $\\phi(n)$ 表示小于等于 $n$ 且与 $n$ 互质的正整数个数：
$$\\phi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)$$

其中 $p$ 是 $n$ 的所有质因数。

## 复数

### 欧拉公式

$$e^{ix} = \\cos x + i \\sin x$$

### 复数的模

复数 $z = a + bi$ 的模：
$$|z| = \\sqrt{a^2 + b^2}$$

复共轭：
$$\\overline{z} = a - bi$$

## 级数

### 幂级数

泰勒级数：
$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n$$

指数函数的泰勒级数：
$$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$$

### 傅里叶级数

周期函数的傅里叶级数：
$$f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left( a_n \\cos\\left(\\frac{2\\pi nx}{T}\\right) + b_n \\sin\\left(\\frac{2\\pi nx}{T}\\right) \\right)$$

---

*这些数学公式展示了MathJax渲染引擎的强大功能，支持复杂的数学表达式。*`;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  content: {
    padding: 16,
  },
});

export default function MathDemo() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.content}>
        <MarkdownRender content={mathMarkdown} />
      </View>
    </ScrollView>
  );
}
