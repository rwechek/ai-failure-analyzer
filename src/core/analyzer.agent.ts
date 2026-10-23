import { generateObject } from "ai";
import { getLLMProvider } from "./providers/llm-factory.js";
import { AnalysisResult, AnalysisResultSchema } from "./schemas.js";
import { NormalizedFailure } from "../adapters/base-adapter.js";
import { extractSourceContextFromStackTrace } from "./source-reader.js";

export async function analyzeTestFailure(
  failure: NormalizedFailure,
): Promise<AnalysisResult> {
  // 1. Obtenemos el proveedor de IA configurado dinámicamente
  const model = getLLMProvider();

  // 2. Intentamos extraer de forma dinámica el código fuente (POM o clase) usando la traza
  const sourceContext = await extractSourceContextFromStackTrace(
    failure.stackTrace,
  );

  const systemPrompt = `
You are an expert Senior QA Automation Engineer and Software Architect. 
Your objective is to analyze automated test failures in CI/CD pipelines, inspect the provided source code (such as Page Object Models or test files), identify the precise root cause, and provide actionable solutions.

Guidelines:
1. Assess the clarity, completeness, and stack traces of the error logs.
2. Assign an explicit Confidence Level (HIGH, MEDIUM, or LOW):
   - HIGH: Clear assertion failures, explicit timeouts, or distinct stack traces.
   - MEDIUM: Partial context or multi-factor failure indicators.
   - LOW: Ambiguous errors, missing stack traces, opaque promise rejections, or generic script errors.
3. Handle Ambiguity Safely: If the error is cryptic or data is insufficient, do NOT hallucinate a fix. Lower the confidence level to LOW, state the uncertainty under Root Cause, and provide diagnostic or troubleshooting steps instead of a blind code fix.
4. If the root cause is evident, provide a clean, ready-to-implement code fix.

Be technical, direct, and concise.
`;

  // 3. Construimos el prompt enriqueciendo el error con el contexto real del código fuente si está disponible
  let userPrompt = `
Please analyze the following test failure and provide the diagnostic breakdown:

- Test Name: ${failure.testName}
- Error Message: ${failure.errorMessage}
- Stack Trace:
\`\`\`
${failure.stackTrace}
\`\`\`
`;

  if (sourceContext) {
    userPrompt += `
- Source Code Context (${sourceContext.filePath} at line ${sourceContext.lineNumber}):
\`\`\`typescript
${sourceContext.snippet}
\`\`\`
`;
  }

  if (failure.logsSnippet) {
    userPrompt += `
- Console Logs / Stderr:
\`\`\`
${failure.logsSnippet}
\`\`\`
`;
  }

  // 4. Invocamos al modelo de IA con el prompt enriquecido
  const { object } = await generateObject({
    model,
    schema: AnalysisResultSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return object;
}
