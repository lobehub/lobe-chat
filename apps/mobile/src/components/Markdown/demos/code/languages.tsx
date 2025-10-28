import { Markdown } from '@lobehub/ui-rn';

const languagesContent = `## Bash/Shell

\`\`\`bash
#!/bin/bash
echo "Hello, World!"
npm install
npm run build
\`\`\`

## CSS

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}
\`\`\`

## HTML

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
\`\`\`

## SQL

\`\`\`sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
\`\`\`

## Rust

\`\`\`rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
\`\`\`
`;

export default () => {
  return <Markdown>{languagesContent}</Markdown>;
};
