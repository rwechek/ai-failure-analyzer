export interface NormalizedFailure {
  testName: string;
  errorMessage: string;
  stackTrace: string;
  logsSnippet?: string;
}

export interface TestAdapter {
  parseReport(reportPath: string): Promise<NormalizedFailure[]>;
}