import { memo } from 'react';

import MarketList from './MarketList';
import PluginSettings from './PluginSettings';

const AgentPlugin = memo(() => (
  <>
    <MarketList />
    <PluginSettings />
  </>
));

export default AgentPlugin;
