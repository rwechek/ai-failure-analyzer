import * as core from '@actions/core';
import { PlaywrightAdapter } from './adapters/playwright.adapter.js';
import { analyzeTestFailure } from './core/analyzer.agent.js';
import { postPRComment } from './github/github.client.js';
async function run() {
    try {
        // Obtenemos la ruta del reporte de Playwright desde los inputs de la GitHub Action (por defecto 'test-results.json')
        const reportPath = core.getInput('report-path') || 'test-results.json';
        core.info(`Reading Playwright report from: ${reportPath}`);
        // 1. Parsear el reporte usando el adaptador
        const adapter = new PlaywrightAdapter();
        const failures = await adapter.parseReport(reportPath);
        if (failures.length === 0) {
            core.info('No test failures detected. Everything looks clean!');
            return;
        }
        core.info(`Detected ${failures.length} test failure(s). Initiating AI analysis...`);
        // 2. Analizar cada fallo con el agente de IA multi-modelo
        for (const failure of failures) {
            core.info(`Analyzing test: ${failure.testName}`);
            const analysis = await analyzeTestFailure(failure);
            // 3. Publicar automáticamente el diagnóstico en el Pull Request
            await postPRComment(analysis);
        }
        core.info('AI Failure Analyzer execution completed successfully.');
    }
    catch (error) {
        core.setFailed(`AI Failure Analyzer failed: ${error.message}`);
    }
}
run();
