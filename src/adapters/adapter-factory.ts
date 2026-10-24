import { BaseAdapter } from './base-adapter.js';
import { PlaywrightAdapter } from './playwright.adapter.js';
import { PytestAdapter } from './pytest.adapter.js';

export function getTestAdapter(framework?: string): BaseAdapter {
  const normalizedFramework = (framework || 'playwright').toLowerCase().trim();

  switch (normalizedFramework) {
    case 'playwright':
      return new PlaywrightAdapter();

    case 'pytest':
    case 'python':
      return new PytestAdapter();

    default:
      throw new Error(`[AdapterFactory] Framework no soportado o desconocido: "${framework}"`);
  }
}