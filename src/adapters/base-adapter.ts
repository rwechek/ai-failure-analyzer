export interface NormalizedFailure {
  testName: string;
  errorMessage: string;
  stackTrace: string;
  logsSnippet?: string;
}

export interface BaseAdapter {
  parseReport(reportPath: string): Promise<NormalizedFailure[]> | NormalizedFailure[];
}