import { BaseAdapter } from './base-adapter.js';
import { PlaywrightAdapter } from './playwright.adapter.js';
import { PytestAdapter } from './pytest.adapter.js';
import { JavaAdapter } from './java.adapter.js';
import { CSharpAdapter } from './csharp.adapter.js';

export function getTestAdapter(framework?: string): BaseAdapter {
  const normalizedFramework = (framework || 'playwright').toLowerCase().trim();

  switch (normalizedFramework) {
    case 'playwright':
      return new PlaywrightAdapter();

    case 'pytest':
    case 'python':
      return new PytestAdapter();

    case 'java':
    case 'junit':
    case 'maven':
    case 'gradle':
      return new JavaAdapter();

    case 'csharp':
    case 'dotnet':
    case 'nunit':
    case 'xunit':
      return new CSharpAdapter();

    default:
      throw new Error(`[AdapterFactory] Framework no soportado o desconocido: "${framework}"`);
  }
}