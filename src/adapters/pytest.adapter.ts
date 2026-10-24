import * as fs from 'fs/promises';
import { BaseAdapter, NormalizedFailure } from './base-adapter.js';

export class PytestAdapter implements BaseAdapter {
  async parseReport(reportPath: string): Promise<NormalizedFailure[]> {
    try {
      const fileContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(fileContent);
      const failures: NormalizedFailure[] = [];

      if (report && report.tests) {
        for (const test of report.tests) {
          if (test.outcome === 'failed') {
            const testName = test.nodeid || 'Unknown Pytest Test';
            const callInfo = test.call || test.setup || test.teardown || {};
            const crash = callInfo.crash || {};
            
            const errorMessage = crash.message || callInfo.longrepr || 'Unknown Pytest failure';
            const stackTrace = callInfo.longrepr || 'No stack trace available';

            failures.push({
              testName,
              errorMessage,
              stackTrace: typeof stackTrace === 'string' ? stackTrace : JSON.stringify(stackTrace, null, 2),
              logsSnippet: test.stdout || undefined,
            });
          }
        }
      }

      return failures;
    } catch (error: any) {
      throw new Error(`[PytestAdapter] Error leyendo el reporte de pytest: ${error.message}`);
    }
  }
}