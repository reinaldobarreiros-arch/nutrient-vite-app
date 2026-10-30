import PdfViewer from './components/PdfViewer'

function App() {
  return <PdfViewer document={`${import.meta.env.BASE_URL}document.pdf`} />
}

export default App
