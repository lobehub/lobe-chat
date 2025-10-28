import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const data = '# header';

const run = async () => {
  const result = await unified().use(remarkParse).use(remarkRehype).parse(data);
  console.log(JSON.stringify(result, null, 2));
};

run();
