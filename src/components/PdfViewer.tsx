import { useEffect, useRef } from 'react'

type PdfViewerProps = {
  document: string | ArrayBuffer
}

export default function PdfViewer({ document }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let NutrientViewer: typeof import('@nutrient-sdk/viewer').default | undefined

    ;(async () => {
      NutrientViewer = (await import('@nutrient-sdk/viewer')).default
      if (cancelled) return

      // Ensure nothing is mounted (React StrictMode runs effects twice in dev).
      NutrientViewer.unload(container)

      await NutrientViewer.load({
        container,
        document,
        // Where vite.config.ts serves `nutrient-viewer-lib/`.
        baseUrl: `${window.location.origin}${import.meta.env.BASE_URL}`,
        // Without a key the SDK runs in trial mode (watermarked).
        licenseKey: import.meta.env.VITE_NUTRIENT_LICENSE_KEY,
      })
    })().catch((error) => console.error('Failed to load Nutrient viewer', error))

    return () => {
      cancelled = true
      NutrientViewer?.unload(container)
    }
  }, [document])

  // The container must have an explicit size for the viewer to render.
  return <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0 }} />
}
