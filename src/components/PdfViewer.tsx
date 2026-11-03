import { useEffect, useRef } from 'react'
import type { Instance, ToolbarItem } from '@nutrient-sdk/viewer'
import { DWS_ACTIONS, type DwsAction } from '../dws'

type PdfViewerProps = {
  document: string
  onOpenFile: () => void
  onDwsAction: (action: DwsAction, instance: Instance) => void
}

export default function PdfViewer({ document, onOpenFile, onDwsAction }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Keep the latest callbacks without reloading the viewer when they change.
  const callbacks = useRef({ onOpenFile, onDwsAction })
  callbacks.current = { onOpenFile, onDwsAction }

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

      let instance: Instance | undefined
      const customItems: ToolbarItem[] = [
        {
          type: 'custom',
          id: 'open-pdf',
          title: 'Open PDF',
          onPress: () => callbacks.current.onOpenFile(),
        },
        ...(Object.entries(DWS_ACTIONS) as [DwsAction, string][]).map(
          ([action, title]): ToolbarItem => ({
            type: 'custom',
            id: `dws-${action}`,
            title,
            dropdownGroup: 'dws',
            onPress: () => instance && callbacks.current.onDwsAction(action, instance),
          }),
        ),
      ]

      instance = await NutrientViewer.load({
        container,
        document,
        // Where vite.config.ts serves `nutrient-viewer-lib/`.
        baseUrl: `${window.location.origin}${import.meta.env.BASE_URL}`,
        // Without a key the SDK runs in trial mode (watermarked).
        licenseKey: import.meta.env.VITE_NUTRIENT_LICENSE_KEY,
        toolbarItems: [...customItems, { type: 'spacer' }, ...NutrientViewer.defaultToolbarItems],
      })
    })().catch((error) => console.error('Failed to load Nutrient viewer', error))

    return () => {
      cancelled = true
      NutrientViewer?.unload(container)
    }
  }, [document])

  // The container must have an explicit size for the viewer to render.
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
