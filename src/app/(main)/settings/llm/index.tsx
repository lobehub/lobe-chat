'use client';

import { Flexbox } from 'react-layout-kit';

import Anthropic from './Anthropic';
import Azure from './Azure';
import Bedrock from './Bedrock';
import Google from './Google';
import Groq from './Groq';
import Minimax from './Minimax';
import Mistral from './Mistral';
import Moonshot from './Moonshot';
import Ollama from './Ollama';
import OpenAI from './OpenAI';
import OpenRouter from './OpenRouter';
import Perplexity from './Perplexity';
import TogetherAI from './TogetherAI';
import ZeroOne from './ZeroOne';
import Zhipu from './Zhipu';
import Footer from './components/Footer';

const Page = () => {
  return (
    <Flexbox gap={24} width={'100%'}>
      <OpenAI />
      <Ollama />
      <Azure />
      <Google />
      <Anthropic />
      <Bedrock />
      <OpenRouter />
      <TogetherAI />
      <Groq />
      <Perplexity />
      <Minimax />
      <Mistral />
      <Moonshot />
      <Zhipu />
      <ZeroOne />
      <Footer />
    </Flexbox>
  );
};

Page.displayName = 'LlmSetting';

export default Page;
