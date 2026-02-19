/**
 * OpenAI-compatible LLM abstraction layer
 * Supports any OpenAI-compatible API endpoint
 */

import OpenAI from 'openai';

export interface LLMConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export class LLMClient {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://models.inference.ai.azure.com',
    });
    // Default to gpt-4o model (Azure OpenAI-compatible endpoint)
    this.model = config.model || 'gpt-4o';
  }

  async chat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from LLM');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM API error: ${error.message}`);
      }
      throw new Error('Unknown LLM API error');
    }
  }
}
