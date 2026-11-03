// DWS Processor operations exposed by the server at `POST /api/dws/:action`
// (see server/dwsPlugin.ts).
export const DWS_ACTIONS = {
  ocr: 'DWS: OCR (English)',
  flatten: 'DWS: Flatten annotations',
  optimize: 'DWS: Compress',
  rotate: 'DWS: Rotate 90°',
} as const

export type DwsAction = keyof typeof DWS_ACTIONS
