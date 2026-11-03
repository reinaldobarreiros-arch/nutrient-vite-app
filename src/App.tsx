import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { Instance } from '@nutrient-sdk/viewer'
import PdfViewer from './components/PdfViewer'
import type { DwsAction } from './dws'

const SAMPLE_DOCUMENT = `${import.meta.env.BASE_URL}document.pdf`

function App() {
  const [document, setDocument] = useState(SAMPLE_DOCUMENT)
  const [busy, setBusy] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Release the previous object URL when switching documents or unmounting.
  useEffect(() => {
    if (document === SAMPLE_DOCUMENT) return
    return () => URL.revokeObjectURL(document)
  }, [document])

  function openBlob(blob: Blob) {
    setDocument(URL.createObjectURL(blob))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) openBlob(file)
    // Allow picking the same file again.
    event.target.value = ''
  }

  async function handleDwsAction(action: DwsAction, instance: Instance) {
    setBusy(action)
    try {
      // Send the current document, including any annotations made in the viewer.
      const pdf = await instance.exportPDF()
      const response = await fetch(`/api/dws/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: pdf,
      })
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error)
      }
      openBlob(await response.blob())
    } catch (error) {
      alert(`DWS ${action} failed: ${error instanceof Error ? error.message : error}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        hidden
      />
      <PdfViewer
        document={document}
        onOpenFile={() => fileInputRef.current?.click()}
        onDwsAction={handleDwsAction}
      />
      {busy && <div className="busy">Processing with DWS ({busy})…</div>}
    </>
  )
}

export default App
