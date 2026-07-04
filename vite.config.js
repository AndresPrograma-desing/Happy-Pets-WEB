import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import fs from 'fs'

/**
 * Plugin de Vite que resuelve imports de forma case-insensitive.
 * Esto soluciona el problema de que Windows no distingue mayúsculas/minúsculas
 * pero Linux (Vercel) sí, causando fallos en el build de producción.
 */
function caseInsensitiveResolver() {
  return {
    name: 'vite-plugin-case-insensitive',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.startsWith('.') || !importer) return null;

      const dir = path.dirname(importer);
      const resolved = path.resolve(dir, source);

      // Si el archivo existe exactamente como está, no hacer nada
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.mjs'];
      for (const ext of extensions) {
        if (fs.existsSync(resolved + ext)) return null;
      }

      // Buscar coincidencia case-insensitive en el directorio
      const targetDir = path.dirname(resolved);
      const targetBase = path.basename(resolved);

      if (!fs.existsSync(targetDir)) return null;

      const files = fs.readdirSync(targetDir);

      for (const ext of extensions) {
        const lookFor = (targetBase + ext).toLowerCase();
        const match = files.find(f => f.toLowerCase() === lookFor);
        if (match) {
          return path.join(targetDir, match);
        }
      }

      return null;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    caseInsensitiveResolver(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  optimizeDeps: {
    include: ['docx']
  },
  assetsInclude: ['**/*.mpeg', '**/*.mp3', '**/*.wav',]
})