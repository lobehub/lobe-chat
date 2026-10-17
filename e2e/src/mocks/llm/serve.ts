/**
 * Standalone process for the shared E2E LLM mock endpoint; started on demand
 * by `ensureLLMMockServer` (see `./server.ts`).
 */
import { serveLLMMock } from './server';

serveLLMMock();
