import { generateObject } from 'ai';
import { getLLMProvider } from './providers/llm-factory.js';
import { AnalysisResultSchema } from './schemas.js';
export async function analyzeTestFailure(failure) {
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
    // generateObject compila perfectamente y retorna el objeto tipado mediante el esquema de Zod
    const { object } = await generateObject({
        model,
        schema: AnalysisResultSchema,
        system: systemPrompt,
        prompt: userPrompt,
    });
    return object;
}
