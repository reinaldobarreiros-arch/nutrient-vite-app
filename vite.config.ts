import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
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
  ],
})
