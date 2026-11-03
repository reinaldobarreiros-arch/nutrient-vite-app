import type { IncomingMessage, ServerResponse } from 'node:http'
import { NutrientClient } from '@nutrient-sdk/dws-client-typescript'
import type { Connect, Plugin } from 'vite'
import type { DwsAction } from '../src/dws.ts'

// Operations the browser can request. Each takes the current PDF and returns a new one.
const actions = {
  ocr: (client: NutrientClient, pdf: Uint8Array) => client.ocr(pdf, 'english'),
  flatten: (client: NutrientClient, pdf: Uint8Array) => client.flatten(pdf),
  optimize: (client: NutrientClient, pdf: Uint8Array) => client.optimize(pdf),
  rotate: (client: NutrientClient, pdf: Uint8Array) => client.rotate(pdf, 90),
} satisfies Record<DwsAction, (client: NutrientClient, pdf: Uint8Array) => Promise<{ buffer: Uint8Array }>>

async function readBody(req: IncomingMessage): Promise<Uint8Array> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return new Uint8Array(Buffer.concat(chunks))
}

/**
 * Serves `POST /api/dws/:action` from the Vite dev/preview server and forwards
 * the request to Nutrient DWS Processor. The API key stays on the server.
 */
export function dwsPlugin(apiKey: string | undefined): Plugin {
  const client = apiKey ? new NutrientClient({ apiKey }) : undefined

  const handler: Connect.NextHandleFunction = async (req, res: ServerResponse, next) => {
    const match = req.url?.match(/^\/api\/dws\/(\w+)$/)
    if (!match) return next()
    if (req.method !== 'POST') return sendError(res, 405, 'Use POST')
    if (!client) return sendError(res, 500, 'NUTRIENT_API_KEY is not set in .env.local')

    const action = match[1] as DwsAction
    if (!(action in actions)) return sendError(res, 404, `Unknown action: ${action}`)

    try {
      const result = await actions[action](client, await readBody(req))
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/pdf')
      res.end(Buffer.from(result.buffer))
    } catch (error) {
      console.error(`[dws] ${action} failed`, error)
      sendError(res, 502, error instanceof Error ? error.message : String(error))
    }
  }

  return {
    name: 'nutrient-dws',
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  }
}

function sendError(res: ServerResponse, status: number, message: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: message }))
}
