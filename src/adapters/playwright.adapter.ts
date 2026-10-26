import * as fs from 'fs/promises';
import { BaseAdapter, NormalizedFailure } from './base-adapter.js';

export class PlaywrightAdapter implements BaseAdapter {
  async parseReport(reportPath: string): Promise<NormalizedFailure[]> {
    try {
      const fileContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(fileContent);
      const failures: NormalizedFailure[] = [];

      if (report && report.suites) {
        for (const suite of report.suites) {
          this.traverseSuite(suite, failures);
        }
      }

      return failures;
    } catch (error: any) {
      throw new Error(`[PlaywrightAdapter] Error leyendo el reporte: ${error.message}`);
    }
  }

  private traverseSuite(suite: any, failures: NormalizedFailure[]) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        if (spec.tests) {
          for (const test of spec.tests) {
            if (test.results) {
              for (const result of test.results) {
                if (result.status === 'failed' || result.status === 'timedOut') {
                  const error = result.error || {};
                  const testName = `${suite.title} > ${spec.title}`;
                  const errorMessage = error.message || 'Unknown Playwright error';
                  const stackTrace = error.stack || error.snippet || 'No stack trace available';

                  failures.push({
                    testName,
                    errorMessage,
                    stackTrace,
                    logsSnippet: result.stderr?.join('\n') || undefined,
                  });
                }
              }
            }
          }
        }
      }
    }

    if (suite.suites) {
      for (const subSuite of suite.suites) {
        this.traverseSuite(subSuite, failures);
      }
    }
  }
}