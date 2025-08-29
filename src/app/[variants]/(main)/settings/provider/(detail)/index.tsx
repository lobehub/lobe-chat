import Azure from './azure/page';
import AzureAI from './azureai/page';
import Bedrock from './bedrock/page';
import Cloudflare from './cloudflare/page';
import GitHub from './github/page';
import Ollama from './ollama/page';
import OpenAI from './openai/page';
import VertexAI from './vertexai/page';
import DefaultPage from './[id]/page'

const ProviderDetailPage = (props: {
  id?: string;
}) => {
  const { id } = props;

  switch (id) {
    case 'azure': {
      return <Azure />;
    }
    case 'azureai': {
      return <AzureAI />;
    }
    case 'bedrock': {
      return <Bedrock />;
    }
    case 'cloudflare': {
      return <Cloudflare />;
    }
    case 'github': {
      return <GitHub />;
    }
    case 'ollama': {
      return <Ollama />;
    }
    case 'openai': {
      return <OpenAI />;
    }
    case 'vertexai': {
      return <VertexAI />;
    }
    default: {
      return <DefaultPage params={{id: id}}/>;
    }
  }
};

export default ProviderDetailPage;