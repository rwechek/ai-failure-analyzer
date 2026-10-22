import * as fs from 'fs/promises';
import * as path from 'path';

export interface SourceContext {
  filePath: string;
  lineNumber: number;
  snippet: string;
}

export async function extractSourceContextFromStackTrace(stackTrace: string): Promise<SourceContext | null> {
  try {
    // Regex genérica para detectar rutas de archivos de código (ts, js, mjs, etc.) seguidas de :número_de_línea
    const match = stackTrace.match(/([a-zA-Z0-9_\-\/\.\:\\\s]+?\.(?:ts|js|mjs|py|java|cs)):(\d+)(?::(\d+))?/);

    if (!match) {
      return null;
    }

    const rawPath = match[1].trim();
    const lineNumber = parseInt(match[2], 10);

    // Resolución dinámica de la ruta usando process.cwd() (independiente del SO y del runner de CI/CD)
    let absoluteFilePath: string;
    if (path.isAbsolute(rawPath)) {
      absoluteFilePath = rawPath;
    } else {
      absoluteFilePath = path.resolve(process.cwd(), rawPath);
    }

    // Lectura del archivo fuente local en el workspace
    const fileContent = await fs.readFile(absoluteFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    // Extracción de una ventana de contexto (15 líneas antes y después del fallo)
    const start = Math.max(0, lineNumber - 15);
    const end = Math.min(lines.length, lineNumber + 15);

    const snippetLines = lines.slice(start, end).map((line, index) => {
      const currentLineNum = start + index + 1;
      const isErrorLine = currentLineNum === lineNumber;
      return `${currentLineNum}: ${line}${isErrorLine ? '  <-- [ERROR LINE]' : ''}`;
    });

    const snippet = snippetLines.join('\n');
    const relativePath = path.relative(process.cwd(), absoluteFilePath);

    return {
      filePath: relativePath,
      lineNumber,
      snippet
    };
  } catch (error) {
    // Si el archivo no se localiza en el disco local, retornamos null de manera segura sin romper el flujo
    return null;
  }
}