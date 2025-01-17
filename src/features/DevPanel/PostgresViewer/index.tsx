import React, { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import DataTable from './DataTable';
import SchemaPanel from './Schema';

// Main Database Panel Component
const DatabasePanel = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');

  return (
    <Flexbox height={'100%'} horizontal>
      <SchemaPanel onTableSelect={setSelectedTable} selectedTable={selectedTable} />
      <DataTable tableName={selectedTable} />
    </Flexbox>
  );
};

export default DatabasePanel;
