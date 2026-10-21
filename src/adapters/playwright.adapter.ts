import * as fs from 'fs/promises';
import { TestAdapter, NormalizedFailure } from './base-adapter.js';

// Estructura simplificada del reporte JSON nativo de Playwright
interface PlaywrightReport {
  suites: PlaywrightSuite[];
}

interface PlaywrightSuite {
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
}

interface PlaywrightSpec {
  title: string;
  tests: PlaywrightTest[];
}

interface PlaywrightTest {
  results: PlaywrightResult[];
}

interface PlaywrightResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  error?: {
    message?: string;
    stack?: string;
  };
  stderr?: string[];
}

export class PlaywrightAdapter implements TestAdapter {
  async parseReport(reportPath: string): Promise<NormalizedFailure[]> {
    try {
      const rawData = await fs.readFile(reportPath, 'utf-8');
      const report: PlaywrightReport = JSON.parse(rawData);
      
      const failures: NormalizedFailure[] = [];

      // Función recursiva para recorrer las suites de Playwright
      const extractFailuresFromSuites = (suites: PlaywrightSuite[]) => {
        for (const suite of suites) {
          if (suite.suites) {
            extractFailuresFromSuites(suite.suites);
          }
          if (suite.specs) {
            for (const spec of suite.specs) {
              for (const test of spec.tests) {
                // Buscamos resultados fallidos o con timeout
                const failedResult = test.results.find(
                  (res) => res.status === 'failed' || res.status === 'timedOut'
                );

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
    } catch (error: any) {
      throw new Error(`Failed to parse Playwright report at ${reportPath}: ${error.message}`);
    }
  }
}