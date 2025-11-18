/**
 * AI Provider Adapter Interface
 * Supports multiple AI providers (OpenAI, Anthropic, local models, etc.)
 */

export interface AIGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIGenerationResponse {
  text: string;
  model: string;
  tokensUsed?: number;
  finishReason?: string;
}

export interface IAIProviderAdapter {
  generate(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  isAvailable(): boolean;
  getProviderName(): string;
}

/**
 * OpenAI implementation
 */
export class OpenAIAdapter implements IAIProviderAdapter {
  private apiKey: string | undefined;
  private client: any; // OpenAI client instance

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    // Lazy load OpenAI client
    if (!this.client) {
      const { default: OpenAI } = await import('openai');
      this.client = new OpenAI({ apiKey: this.apiKey });
    }

    const completion = await this.client.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        { role: 'user', content: request.prompt },
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 500,
    });

    return {
      text: completion.choices[0].message.content || '',
      model: completion.model,
      tokensUsed: completion.usage?.total_tokens,
      finishReason: completion.choices[0].finish_reason,
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-openai-api-key-here';
  }

  getProviderName(): string {
    return 'OpenAI';
  }
}

/**
 * Template-based fallback (no AI required)
 */
export class TemplateFallbackAdapter implements IAIProviderAdapter {
  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Simple template-based generation
    const template = `Based on the prompt: "${request.prompt}"

This is a template-based response. For AI-generated content, configure an AI provider API key.`;

    return {
      text: template,
      model: 'template-fallback',
      finishReason: 'stop',
    };
  }

  isAvailable(): boolean {
    return true;
  }

  getProviderName(): string {
    return 'Template Fallback';
  }
}

/**
 * Factory to get the appropriate AI adapter
 */
export function getAIAdapter(): IAIProviderAdapter {
  const openai = new OpenAIAdapter();
  if (openai.isAvailable()) {
    return openai;
  }

  return new TemplateFallbackAdapter();
}
