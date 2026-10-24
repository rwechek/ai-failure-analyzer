import * as fs from 'fs/promises';
import { BaseAdapter, NormalizedFailure } from './base-adapter.js';

export class CSharpAdapter implements BaseAdapter {
  async parseReport(reportPath: string): Promise<NormalizedFailure[]> {
    try {
      const fileContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(fileContent);
      const failures: NormalizedFailure[] = [];

      // Adaptable a estructuras comunes de reportes de test en .NET (ej. NUnit JSON / VSTest)
      const testResults = report.results || report.testResults || report.Tests || [];

      for (const test of testResults) {
        if (test.outcome === 'Failed' || test.status === 'Failed' || test.result === 'Failed') {
          const testName = test.name || test.FullyQualifiedName || 'Unknown C# Test';
          const output = test.output || test.ErrorMessage || test.stackTrace || {};

          const errorMessage = typeof output === 'string' 
            ? output 
            : (output.message || test.message || 'Unknown .NET failure');

          const stackTrace = typeof output === 'string'
            ? output
            : (output.stackTrace || test.stackTrace || 'No stack trace available');

          failures.push({
            testName,
            errorMessage,
            stackTrace,
            logsSnippet: test.standardOutput || undefined,
          });
        }
      }

      return failures;
    } catch (error: any) {
      throw new Error(`[CSharpAdapter] Error leyendo el reporte de C#: ${error.message}`);
    }
  }
}