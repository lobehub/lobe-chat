import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

import createOneLineRehypePlugin from '../rehypePlugin/createOneLineRehypePlugin';

const rehypePlugin = createOneLineRehypePlugin(ARTIFACT_THINKING_TAG);

export default rehypePlugin;
