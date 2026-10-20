import { randomUUID } from 'node:crypto';

import type {
  DecisionAnswers,
  DecisionQuestions,
  DecisionRequest,
  DecisionResponse,
} from '@lobechat/types';
import { z } from 'zod';

import { assertDecisionRequest } from './normalize';
import type { DecisionBackend, DecisionContext } from './types';
import { DecisionError } from './types';

export const OPENROUTER_DECISIONS_BASE_URL = 'https://openrouter.ai';

export interface OpenRouterDecisionBackendOptions {
  apiKey: string;
  baseURL?: string;
  fetch?: typeof fetch;
  /** Decisions model used when the request does not name one, e.g. `typesafe/jev-1.13`. */
  model: string;
}

const responseSchema = z.object({
  answers: z.record(
    z.string(),
    z.looseObject({ type: z.enum(['box', 'choice', 'noul', 'score']) }),
  ),
  id: z.string().optional(),
  model: z.string(),
  provider: z.string().optional(),
  usage: z.object({
    cost: z.number().optional(),
    input_tokens: z.number(),
    output_tokens: z.number(),
  }),
});

const readErrorMessage = async (res: Response) => {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
};

/** Forwards decision requests unchanged to OpenRouter's Decisions API. */
export class OpenRouterDecisionBackend implements DecisionBackend {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly fetchImpl: typeof fetch;
  private readonly model: string;

  constructor({ apiKey, baseURL, fetch: fetchImpl, model }: OpenRouterDecisionBackendOptions) {
    this.apiKey = apiKey;
    this.baseURL = (baseURL ?? OPENROUTER_DECISIONS_BASE_URL).replace(/\/+$/, '');
    this.fetchImpl = fetchImpl ?? fetch;
    this.model = model;
  }

  decide = async <Q extends DecisionQuestions>(
    request: DecisionRequest<Q>,
    ctx: DecisionContext,
  ): Promise<DecisionResponse<Q>> => {
    assertDecisionRequest(request);

    const body = {
      model: request.model ?? this.model,
      questions: request.questions,
      state: request.state,
      ...(request.session_id ? { session_id: request.session_id } : {}),
      ...(request.user ? { user: request.user } : {}),
    };

    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseURL}/api/alpha/decisions`, {
        body: JSON.stringify(body),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: ctx.signal,
      });
    } catch (error) {
      if (ctx.signal?.aborted) throw error;
      throw new DecisionError('backend_error', 'OpenRouter decisions request failed', {
        cause: error,
      });
    }

    if (!res.ok) {
      throw new DecisionError(
        'backend_error',
        `OpenRouter decisions returned ${res.status}: ${await readErrorMessage(res)}`,
      );
    }

    const parsed = responseSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new DecisionError('invalid_output', 'OpenRouter decisions response is malformed', {
        cause: parsed.error,
      });
    }

    const { answers, id, model, provider, usage } = parsed.data;
    for (const [key, question] of Object.entries(request.questions)) {
      if (answers[key]?.type !== question.type) {
        throw new DecisionError(
          'invalid_output',
          `OpenRouter decisions response has no ${question.type} answer for "${key}"`,
        );
      }
    }

    return {
      answers: answers as unknown as DecisionAnswers<Q>,
      backend: 'openrouter',
      id: id ?? `dec-${randomUUID()}`,
      model,
      provider: provider ?? 'openrouter',
      usage,
    };
  };
}
