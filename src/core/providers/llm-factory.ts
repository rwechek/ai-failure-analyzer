import { google } from '@ai-sdk/google';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { LanguageModel } from 'ai';

export function getLLMProvider(modelOverride?: string): LanguageModel {
  const provider = (process.env.AI_PROVIDER || 'google').toLowerCase();
  const modelName = modelOverride || process.env.AI_MODEL_NAME;

  switch (provider) {
    case 'openai':
      return openai(modelName || 'gpt-4o');
      
    case 'anthropic':
      return anthropic(modelName || 'claude-3-5-sonnet-20241022');
      
    case 'github':
    case 'copilot': {
      // Soporte para GitHub Models / Endpoints compatibles con OpenAI usando el token de GitHub
      const githubModelProvider = createOpenAI({
        baseURL: process.env.AI_BASE_URL || 'https://models.inference.ai.azure.com', // Endpoint estándar de GitHub Models
        apiKey: process.env.GITHUB_TOKEN || process.env.CUSTOM_AI_API_KEY,
      });
      return githubModelProvider(modelName || 'gpt-4o');
    }
      
    case 'google':
    default:
      return google(modelName || 'gemini-3.5-flash-lite');
  }
}