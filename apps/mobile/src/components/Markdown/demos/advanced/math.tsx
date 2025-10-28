import { Markdown } from '@lobehub/ui-rn';

const mathContent = `This is an inline formula: $E=mc^2$

This is an independent Fourier formula:
$$
f(x) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(nx) + b_n \\sin(nx) \\right)
$$

Terms with integral signs:
$$
a_0 = \\frac{1}{2\\pi} \\int_{-\\pi}^{\\pi} f(x) \\, dx
$$

$$
a_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\, dx \\quad \\text{for} \\quad n \\geq 1
$$

$$
b_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\sin(nx) \\, dx \\quad \\text{for} \\quad n \\geq 1
$$

This is a Taylor formula with a fraction and an extremely long test length:

$$
\\begin{equation}
f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x)
\\end{equation}
$$

This is an inline version of the above formula. Let's see if I'll wrap: $ f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x) $

This is a formula with superscripts and subscripts:
$$
q_1 q_2 = (w_1 w_2 - \\vec{v}_1^T \\vec{v}_2, \\, w_1 \\vec{v}_2 + w_2 \\vec{v}_1 + \\vec{v}_1 \\times \\vec{v}_2)
$$

This is a formula with a tag:
$$
q = a + bi + cj + dk \\tag{1}
$$

| $1$       | $2$       |
| --------- | --------- |
| $|3| = 3$ | $|4| = 4$ |
`;

export default () => {
  return <Markdown>{mathContent}</Markdown>;
};
