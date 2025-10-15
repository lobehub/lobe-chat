import { Flexbox, Input } from '@lobehub/ui-rn';
import { useState } from 'react';

const SearchDemo = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Flexbox gap={16}>
      <Input.Search onChangeText={setSearchQuery} placeholder="搜索内容..." value={searchQuery} />
    </Flexbox>
  );
};

export default SearchDemo;
