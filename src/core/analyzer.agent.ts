import { generateText, Output } from 'ai';
import { getLLMProvider } from './providers/llm-factory.js';
import { AnalysisResult, AnalysisResultSchema } from './schemas.js';
import { NormalizedFailure } from '../adapters/base-adapter.js';

export async function analyzeTestFailure(failure: NormalizedFailure): Promise<AnalysisResult> {
  // Obtenemos el proveedor de IA configurado dinámicamente (Gemini, OpenAI, Anthropic o GitHub)
  const model = getLLMProvider();

  const systemPrompt = `
You are an expert Senior QA Automation Engineer and Software Architect. 
Your objective is to analyze automated test failures in CI/CD pipelines, identify the precise root cause, and provide a clean, ready-to-implement code fix.
Be technical, direct, and concise.
`;

  const userPrompt = `
Please analyze the following test failure and provide the diagnostic breakdown:

- Test Name: ${failure.testName}
- Error Message: ${failure.errorMessage}
- Stack Trace:
\`\`\`
${failure.stackTrace}
\`\`\`
${failure.logsSnippet ? `- Console Logs / Stderr:\n\`\`\`\n${failure.logsSnippet}\n\`\`\`` : ''}
`;

  // Usamos generateText pasando el parámetro output con el esquema de Zod
  const result = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({
      schema: AnalysisResultSchema,
    }),
  });

  return result.output as AnalysisResult;
}