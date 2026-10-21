import * as fs from 'fs/promises';
export class PlaywrightAdapter {
    async parseReport(reportPath) {
        try {
            const rawData = await fs.readFile(reportPath, 'utf-8');
            const report = JSON.parse(rawData);
            const failures = [];
            // Función recursiva para recorrer las suites de Playwright
            const extractFailuresFromSuites = (suites) => {
                for (const suite of suites) {
                    if (suite.suites) {
                        extractFailuresFromSuites(suite.suites);
                    }
                    if (suite.specs) {
                        for (const spec of suite.specs) {
                            for (const test of spec.tests) {
                                // Buscamos resultados fallidos o con timeout
                                const failedResult = test.results.find((res) => res.status === 'failed' || res.status === 'timedOut');
                                if (failedResult) {
                                    failures.push({
                                        testName: spec.title,
                                        errorMessage: failedResult.error?.message || 'Unknown error message',
                                        stackTrace: failedResult.error?.stack || 'No stack trace available',
                                        logsSnippet: failedResult.stderr ? failedResult.stderr.join('\n') : undefined
                                    });
                                }
                            }
                        }
                    }
                }
            };
            if (report.suites) {
                extractFailuresFromSuites(report.suites);
            }
            return failures;
        }
        catch (error) {
            throw new Error(`Failed to parse Playwright report at ${reportPath}: ${error.message}`);
        }
    }
}
