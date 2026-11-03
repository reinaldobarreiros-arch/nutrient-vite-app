import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { dwsPlugin } from './server/dwsPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (not only VITE_*) so the DWS key is available to the
  // server without being bundled into the browser code.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      // Serve the Nutrient Web SDK runtime assets (WASM, workers, fonts) from
      // `/nutrient-viewer-lib/` in dev and copy them into `dist/` on build.
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@nutrient-sdk/viewer/dist/nutrient-viewer-lib',
            dest: '.',
            rename: { stripBase: 4 }, // drop node_modules/@nutrient-sdk/viewer/dist
          },
        ],
      }),
      dwsPlugin(env.NUTRIENT_API_KEY),
    ],
  }
})
