import { useEffect, useState, type ChangeEvent } from 'react'
import PdfViewer from './components/PdfViewer'

const SAMPLE_DOCUMENT = `${import.meta.env.BASE_URL}document.pdf`

function App() {
  const [document, setDocument] = useState(SAMPLE_DOCUMENT)
  const [fileName, setFileName] = useState('document.pdf (sample)')

  // Release the previous object URL when switching documents or unmounting.
  useEffect(() => {
    if (document === SAMPLE_DOCUMENT) return
    return () => URL.revokeObjectURL(document)
  }, [document])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setDocument(URL.createObjectURL(file))
    setFileName(file.name)
    // Allow picking the same file again.
    event.target.value = ''
  }

  return (
    <div className="app">
      <header className="toolbar">
        <label className="open-button">
          Open PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>
        <span className="file-name">{fileName}</span>
      </header>
      <PdfViewer document={document} />
    </div>
  )
}

export default App
