import { z } from 'zod';
// Definimos el contrato estricto de lo que responderá la IA
export const AnalysisResultSchema = z.object({
    rootCause: z.string().describe("Technical explanation of why the test failed."),
    codeSolution: z.string().describe("Corrected code snippet ready to be applied as a fix."),
    confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe("Confidence level in the diagnosis.")
});
