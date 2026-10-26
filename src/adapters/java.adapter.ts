import * as fs from 'fs/promises';
import { BaseAdapter, NormalizedFailure } from './base-adapter.js';

export class JavaAdapter implements BaseAdapter {
  async parseReport(reportPath: string): Promise<NormalizedFailure[]> {
    try {
      const fileContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(fileContent);
      const failures: NormalizedFailure[] = [];

      // Estructura común esperada en reportes de JUnit/TestSuites en JSON
      const testsuites = report.testsuites || report.suites || [report];

      for (const suite of testsuites) {
        if (suite.testcase || suite.cases) {
          const cases = suite.testcase || suite.cases;
          for (const testCase of cases) {
            if (testCase.failure || testCase.error) {
              const errorInfo = testCase.failure || testCase.error;
              const testName = `${suite.name || 'UnknownSuite'} > ${testCase.name || 'UnknownTest'} (${testCase.classname || ''})`;
              
              const errorMessage = typeof errorInfo === 'string' 
                ? errorInfo 
                : (errorInfo.message || errorInfo._ || 'Unknown Java/JUnit failure');
              
              const stackTrace = typeof errorInfo === 'string'
                ? errorInfo
                : (errorInfo.stackTrace || errorInfo.text || 'No stack trace available');

              failures.push({
                testName,
                errorMessage,
                stackTrace,
              });
            }
          }
        }
      }

      return failures;
    } catch (error: any) {
      throw new Error(`[JavaAdapter] Error leyendo el reporte de Java: ${error.message}`);
    }
  }
}