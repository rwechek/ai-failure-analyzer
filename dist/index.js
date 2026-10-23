// Carga segura de dotenv solo si NO estamos corriendo en GitHub Actions
if (!process.env.GITHUB_ACTIONS) {
    try {
        await import('dotenv/config');
    }
    catch {
        // Si no existe o no está instalado, se ignora silenciosamente en producción
    }
}
import * as core from '@actions/core';
import { PlaywrightAdapter } from './adapters/playwright.adapter.js';
import { analyzeTestFailure } from './core/analyzer.agent.js';
import { postPRComment } from './github/github.client.js';
async function run() {
    try {
        const reportPath = core.getInput('report-path') || 'test-results.json';
        core.info(`Reading Playwright report from: ${reportPath}`);
        const adapter = new PlaywrightAdapter();
        const rawFailures = await adapter.parseReport(reportPath);
        if (rawFailures.length === 0) {
            core.info('No test failures detected. Everything looks clean!');
            return;
        }
        // 🔍 FILTRO DE REINTENTOS Y DUPLICADOS:
        // Agrupamos por 'testName' usando un Map para quedarnos con la instancia única/definitiva 
        // y descartar los reintentos previos del mismo test.
        const uniqueFailuresMap = new Map();
        for (const failure of rawFailures) {
            uniqueFailuresMap.set(failure.testName, failure);
        }
        const failures = Array.from(uniqueFailuresMap.values());
        core.info(`Detected ${rawFailures.length} raw failure(s). Filtered down to ${failures.length} unique test failure(s). Initiating AI analysis...`);
        // Analizar cada fallo único con el agente de IA multi-modelo
        for (const failure of failures) {
            core.info(`Analyzing unique test: ${failure.testName}`);
            const analysis = await analyzeTestFailure(failure);
            await postPRComment(analysis);
        }
        core.info('AI Failure Analyzer execution completed successfully.');
    }
    catch (error) {
        core.setFailed(`AI Failure Analyzer failed: ${error.message}`);
    }
}
run();
